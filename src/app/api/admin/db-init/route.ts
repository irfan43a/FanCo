import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { initialCategories, initialProducts } from "@/lib/mock-data";
import { hashPassword } from "@/lib/auth";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    original_price NUMERIC(12, 2),
    stock INT NOT NULL DEFAULT 10,
    category_slug VARCHAR(100) REFERENCES categories(slug) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    rating NUMERIC(2, 1) DEFAULT 4.8,
    review_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Transfer Bank',
    status VARCHAR(50) DEFAULT 'Menunggu Pembayaran',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(order_code);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

async function handleInit() {
  try {
    // 1. Create Tables
    await query(SCHEMA_SQL);

    // 2. Seed Categories
    for (const cat of initialCategories) {
      await query(
        `INSERT INTO categories (name, slug, description, icon) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.description || null, cat.icon || null]
      );
    }

    // 3. Seed 50 Products
    for (const prod of initialProducts) {
      await query(
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

    // 4. Seed Default Users
    const defaultUsers = [
      {
        name: "Administrator Toko",
        email: "admin@fancommerce.com",
        password_hash: hashPassword("admin123"),
        role: "admin",
      },
      {
        name: "Customer Setia",
        email: "user@fancommerce.com",
        password_hash: hashPassword("user123"),
        role: "customer",
      },
    ];

    for (const u of defaultUsers) {
      await query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [u.name, u.email, u.password_hash, u.role]
      );
    }

    const prodCount = await query("SELECT COUNT(*) FROM products");

    return NextResponse.json({
      success: true,
      message: "Database tables and 50 products initialized successfully!",
      total_products: Number(prodCount.rows[0]?.count || 0),
      admin_account: "admin@fancommerce.com / admin123",
      customer_account: "user@fancommerce.com / user123",
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Failed to initialize database:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Database initialization failed: ${errorMsg}`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return handleInit();
}

export async function POST() {
  return handleInit();
}
