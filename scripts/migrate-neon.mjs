import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = 'postgresql://neondb_owner:npg_KkUyzla8t7oC@ep-autumn-flower-a1u2iu4w-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function migrateNeon() {
  const pool = new Pool({ connectionString: url });
  console.log('🚀 Connecting to Neon PostgreSQL to migrate and seed 50 products...');

  try {
    // 1. Run Schema DDL
    const schemaSqlPath = path.join(__dirname, '..', 'src', 'lib', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');

    console.log('🔨 Executing schema tables and indexes in Neon...');
    await pool.query(schemaSql);
    console.log('✅ Schema tables verified/created in Neon.');

    // 2. Load and seed categories
    const mockDataFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'mock-data.ts'), 'utf8');
    const cleanTs = mockDataFile
      .replace(/import\s+[^;]+;/g, '')
      .replace(/:\s*Category\[\]/g, '')
      .replace(/:\s*Product\[\]/g, '')
      .replace(/export\s+const\s+/g, 'const ');

    const fn = new Function(`${cleanTs}; return { initialCategories, initialProducts };`);
    const { initialCategories, initialProducts } = fn();

    console.log('🌱 Seeding categories...');
    for (const cat of initialCategories) {
      await pool.query(
        `INSERT INTO categories (name, slug, description, icon) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (slug) DO UPDATE SET 
           name = EXCLUDED.name, 
           description = EXCLUDED.description, 
           icon = EXCLUDED.icon`,
        [cat.name, cat.slug, cat.description || null, cat.icon || null]
      );
    }
    console.log('✅ Categories seeded.');

    // 3. Seed 50 Products
    console.log(`🌱 Seeding ${initialProducts.length} products...`);
    for (const prod of initialProducts) {
      await pool.query(
        `INSERT INTO products 
         (name, slug, description, price, original_price, stock, category_slug, image_url, rating, review_count, is_featured) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           price = EXCLUDED.price,
           original_price = EXCLUDED.original_price,
           stock = EXCLUDED.stock,
           category_slug = EXCLUDED.category_slug,
           image_url = EXCLUDED.image_url,
           rating = EXCLUDED.rating,
           review_count = EXCLUDED.review_count,
           is_featured = EXCLUDED.is_featured`,
        [
          prod.name,
          prod.slug,
          prod.description,
          prod.price,
          prod.original_price || null,
          prod.stock,
          prod.category_slug,
          prod.image_url,
          prod.rating,
          prod.review_count,
          prod.is_featured,
        ]
      );
    }
    console.log('✅ 50 Products seeded.');

    // 4. Seed Default Users
    console.log('🌱 Seeding default users (admin & customer)...');
    const crypto = await import('crypto');
    function hashPassword(password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const derivedKey = crypto.scryptSync(password, salt, 64);
      return `${salt}:${derivedKey.toString('hex')}`;
    }

    const defaultUsers = [
      {
        name: 'Administrator Toko',
        email: 'admin@fancommerce.com',
        password_hash: hashPassword('admin123'),
        role: 'admin',
      },
      {
        name: 'Customer Setia',
        email: 'user@fancommerce.com',
        password_hash: hashPassword('user123'),
        role: 'customer',
      },
    ];

    for (const u of defaultUsers) {
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [u.name, u.email, u.password_hash, u.role]
      );
    }
    console.log('✅ Default users seeded.');

    const catCount = await pool.query('SELECT COUNT(*) FROM categories');
    const prodCount = await pool.query('SELECT COUNT(*) FROM products');
    const userCount = await pool.query('SELECT COUNT(*) FROM users');

    console.log('\n🎉 SUCCESS! Neon Database fully initialized:');
    console.log(`   - Categories: ${catCount.rows[0].count}`);
    console.log(`   - Products:   ${prodCount.rows[0].count}`);
    console.log(`   - Users:      ${userCount.rows[0].count}`);
    console.log('   - Admin:      admin@fancommerce.com (pass: admin123)');
    console.log('   - Customer:   user@fancommerce.com  (pass: user123)');
  } catch (err) {
    console.error('❌ Error during Neon migration:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateNeon();
