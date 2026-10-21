import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectionString = (
  process.env.DATABASE_URL ||
  'postgresql://postgres:123456789@localhost:5432/fan_commerce'
).trim().replace(/^["']|["']$/g, '');

async function seed50Products() {
  const pool = new Pool({ connectionString });
  console.log('🚀 Connecting to PostgreSQL to seed 50 products...');

  try {
    // Dynamic import mock-data (transpiled / ts through node or read from mock-data file)
    // We can directly read and parse or write the 50 products array
    const fs = await import('fs');
    const mockDataFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'mock-data.ts'), 'utf8');

    // Extract products using regex or require
    // Let's create an evaluation or import
    const cleanTs = mockDataFile
      .replace(/import\s+[^;]+;/g, '')
      .replace(/:\s*Category\[\]/g, '')
      .replace(/:\s*Product\[\]/g, '')
      .replace(/export\s+const\s+/g, 'const ');

    const fn = new Function(`${cleanTs}; return { initialCategories, initialProducts };`);
    const { initialProducts } = fn();

    console.log(`📦 Loaded ${initialProducts.length} products to seed.`);

    let inserted = 0;
    let updated = 0;

    for (const prod of initialProducts) {
      const res = await pool.query(
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
           is_featured = EXCLUDED.is_featured
         RETURNING (xmax = 0) AS is_insert`,
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

      if (res.rows[0]?.is_insert) {
        inserted++;
      } else {
        updated++;
      }
    }

    const countRes = await pool.query('SELECT COUNT(*) FROM products');
    console.log(`✅ Seeding Complete!`);
    console.log(`   - Total products in PostgreSQL database: ${countRes.rows[0].count}`);
    console.log(`   - New inserted: ${inserted}, Updated: ${updated}`);
  } catch (err) {
    console.error('❌ Error seeding products:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed50Products();
