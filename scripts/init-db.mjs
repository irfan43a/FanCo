import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool, Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const rawConnectionString = (
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  'postgresql://postgres:postgres@localhost:5432/fan_commerce'
).trim().replace(/^["']|["']$/g, '');

const connectionString = rawConnectionString;
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
const sslConfig = isLocal ? false : { rejectUnauthorized: false };

console.log('🚀 Starting Database Initialization...');
console.log('Target Connection:', connectionString);

async function ensureDatabaseExists() {
  let targetDb = 'fan_commerce';
  let defaultUrl = connectionString;

  const match = connectionString.match(/^(postgresql|postgres):\/\/([^:]+):?([^@]*)@([^:\/]+):?(\d*)\/(.+)$/);
  if (match) {
    const [, proto, user, pass, host, port, db] = match;
    targetDb = db;
    defaultUrl = `${proto}://${user}${pass ? `:${pass}` : ''}@${host}:${port || 5432}/postgres`;
  }
  
  console.log(`📡 Checking if database '${targetDb}' exists...`);
  const client = new Client({ connectionString: defaultUrl, ssl: sslConfig });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb]
    );

    if (res.rowCount === 0) {
      console.log(`✨ Creating database '${targetDb}'...`);
      await client.query(`CREATE DATABASE "${targetDb}";`);
      console.log(`✅ Database '${targetDb}' created successfully.`);
    } else {
      console.log(`ℹ️ Database '${targetDb}' already exists.`);
    }
  } catch (err) {
    console.warn(`⚠️ Note: Could not auto-create database via 'postgres' catalog: ${err.message}`);
    console.warn('Will try connecting directly to target database...');
  } finally {
    await client.end().catch(() => {});
  }
}

async function runMigrationsAndSeed() {
  const pool = new Pool({ connectionString, ssl: sslConfig });

  try {
    console.log('🔌 Connecting to target database...');
    const schemaSqlPath = path.join(__dirname, '..', 'src', 'lib', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');

    console.log('🔨 Executing schema tables and indexes...');
    await pool.query(schemaSql);
    console.log('✅ Schema tables verified/created.');

    // 1. Seed Categories
    const categoriesCount = await pool.query('SELECT COUNT(*) FROM categories');
    if (parseInt(categoriesCount.rows[0].count) === 0) {
      console.log('🌱 Seeding initial categories...');
      const categories = [
        { name: 'Elektronik & Gadget', slug: 'elektronik', description: 'Laptop, smartphone, audio, dan aksesoris teknologi terkini', icon: 'Laptop' },
        { name: 'Fashion & Pakaian', slug: 'fashion', description: 'Koleksi pakaian pria dan wanita trendi berkualitas tinggi', icon: 'Shirt' },
        { name: 'Sepatu & Sneakers', slug: 'sepatu', description: 'Sepatu lari, sneakers casual, dan formal dari brand ternama', icon: 'Footprints' },
        { name: 'Aksesoris & Jam', slug: 'aksesoris', description: 'Jam tangan pintar, tas ransel, dan kacamata elegan', icon: 'Watch' }
      ];

      for (const cat of categories) {
        await pool.query(
          `INSERT INTO categories (name, slug, description, icon) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING`,
          [cat.name, cat.slug, cat.description, cat.icon]
        );
      }
      console.log('✅ Categories seeded.');
    } else {
      console.log(`ℹ️ Categories table already contains ${categoriesCount.rows[0].count} entries.`);
    }

    // 2. Seed Products
    const productsCount = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productsCount.rows[0].count) === 0) {
      console.log('🌱 Seeding initial products...');
      const mockDataFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'mock-data.ts'), 'utf8');
      const cleanTs = mockDataFile
        .replace(/import\s+[^;]+;/g, '')
        .replace(/:\s*Category\[\]/g, '')
        .replace(/:\s*Product\[\]/g, '')
        .replace(/export\s+const\s+/g, 'const ');
      const fn = new Function(`${cleanTs}; return { initialProducts };`);
      const { initialProducts: products } = fn();

      for (const prod of products) {
        await pool.query(
          `INSERT INTO products 
           (name, slug, description, price, original_price, stock, category_slug, image_url, rating, review_count, is_featured) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (slug) DO NOTHING`,
          [
            prod.name,
            prod.slug,
            prod.description,
            prod.price,
            prod.original_price,
            prod.stock,
            prod.category_slug,
            prod.image_url,
            prod.rating,
            prod.review_count,
            prod.is_featured,
          ]
        );
      }
      console.log(`✅ ${products.length} Products seeded successfully.`);
    } else {
      console.log(`ℹ️ Products table already contains ${productsCount.rows[0].count} entries.`);
    }

    // 3. Seed Users
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCount.rows[0].count) === 0) {
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
      console.log('✅ Default users seeded:');
      console.log('   - Admin: admin@fancommerce.com (password: admin123)');
      console.log('   - User:  user@fancommerce.com  (password: user123)');
    } else {
      console.log(`ℹ️ Users table already contains ${usersCount.rows[0].count} entries.`);
    }

    console.log('🎉 Database initialization and seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

async function main() {
  try {
    await ensureDatabaseExists();
    await runMigrationsAndSeed();
  } catch (err) {
    console.error('Database setup halted:', err.message);
    process.exit(1);
  }
}

main();
