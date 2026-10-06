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
  'postgresql://postgres:postgres@localhost:5432/fan_commerce'
).trim().replace(/^["']|["']$/g, '');

const connectionString = rawConnectionString;

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
  const client = new Client({ connectionString: defaultUrl });

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
  const pool = new Pool({ connectionString });

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
      const products = [
        {
          name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
          slug: 'sony-wh-1000xm5',
          description: 'Headphone nirkabel premium dengan peredam kebisingan industri terdepan, 2 prosesor, 8 mikrofon, dan audio resolusi tinggi. Daya tahan baterai hingga 30 jam dengan pengisian cepat.',
          price: 4999000,
          original_price: 5999000,
          stock: 15,
          category_slug: 'elektronik',
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          rating: 4.9,
          review_count: 128,
          is_featured: true,
        },
        {
          name: 'Mechanical Keyboard Keychron K2 Pro Wireless',
          slug: 'keychron-k2-pro',
          description: 'Keyboard mekanis 75% nirkabel QMK/VIA yang dapat diprogram ulang, switch hot-swappable RGB, koneksi Bluetooth 5.1 & kabel Type-C untuk Mac & Windows.',
          price: 1650000,
          original_price: 1850000,
          stock: 22,
          category_slug: 'elektronik',
          image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
          rating: 4.8,
          review_count: 89,
          is_featured: true,
        },
        {
          name: 'Jaket Bomber Kulit Sintetis Premium Urban Edition',
          slug: 'jaket-bomber-kulit-premium',
          description: 'Jaket bomber pria bergaya modern dengan material faux leather tahan air, lapisan dalam katun sejuk, resleting YKK metalik kuat, cocok untuk harian dan touring.',
          price: 489000,
          original_price: 650000,
          stock: 30,
          category_slug: 'fashion',
          image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
          rating: 4.7,
          review_count: 64,
          is_featured: true,
        },
        {
          name: 'Kemeja Flannel Tartan Casual Oversized',
          slug: 'kemeja-flannel-tartan-casual',
          description: 'Kemeja flannel bermotif kotak-kotak klasik dengan kain katun wol lembut 100%. Potongan relaxed fit modern nyaman untuk aktivitas kasual santai maupun semi formal.',
          price: 249000,
          original_price: 320000,
          stock: 45,
          category_slug: 'fashion',
          image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
          rating: 4.6,
          review_count: 42,
          is_featured: false,
        },
        {
          name: 'Sneakers Nike Air Max Pulse Low-Top Sports',
          slug: 'nike-air-max-pulse',
          description: 'Sneakers gaya hidup perkotaan yang menggabungkan bantal udara Air Max responsif dengan tekstil bernapas dan aksen kulit sintetis untuk kenyamanan seharian penuh.',
          price: 2199000,
          original_price: 2499000,
          stock: 12,
          category_slug: 'sepatu',
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
          rating: 4.9,
          review_count: 210,
          is_featured: true,
        },
        {
          name: 'Sepatu Lari Ultralight Breathable Running Shoes',
          slug: 'sepatu-lari-ultralight',
          description: 'Sepatu lari super ringan dengan sol bantalan EVA berkepadatan tinggi, rajutan mesh sirkulasi udara optimal, serta grip anti-selip untuk rute aspal maupun treadmill.',
          price: 589000,
          original_price: 750000,
          stock: 25,
          category_slug: 'sepatu',
          image_url: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&auto=format&fit=crop&q=80',
          rating: 4.5,
          review_count: 38,
          is_featured: false,
        },
        {
          name: 'Smartwatch AMOLED Sports & Health Tracker Pro',
          slug: 'smartwatch-amoled-pro',
          description: 'Jam tangan pintar dengan layar HD AMOLED 1.43 inci, pemantau detak jantung & SpO2 real-time, 120+ mode olahraga, baterai tahan 14 hari dan tahan air IP68.',
          price: 1299000,
          original_price: 1599000,
          stock: 18,
          category_slug: 'aksesoris',
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
          rating: 4.8,
          review_count: 95,
          is_featured: true,
        },
        {
          name: 'Ransel Laptop Anti Maling Waterproof 25L',
          slug: 'ransel-laptop-waterproof-25l',
          description: 'Tas ransel komuter ergonomis dengan kompartemen laptop hingga 16 inci, port charging USB eksternal, bahan oxford tahan gores dan anti air, serta resleting tersembunyi.',
          price: 369000,
          original_price: 499000,
          stock: 40,
          category_slug: 'aksesoris',
          image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
          rating: 4.7,
          review_count: 53,
          is_featured: false,
        },
      ];

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
      console.log('✅ Products seeded successfully.');
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
