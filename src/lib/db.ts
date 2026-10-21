import { Pool } from "pg";
import { Category, Product, Order, OrderItem, ProductFilterParams, User, AdminStats, UserRole } from "@/types";
import { initialCategories, initialProducts } from "./mock-data";
import { hashPassword } from "./auth";

// In-memory fallback state in case PostgreSQL is disconnected/not yet migrated
let inMemoryProducts: Product[] = [...initialProducts];
let inMemoryUsers: User[] = [
  {
    id: 1,
    name: "Administrator Toko",
    email: "admin@fancommerce.com",
    role: "admin",
    password_hash: hashPassword("admin123"),
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Customer Setia",
    email: "user@fancommerce.com",
    role: "customer",
    password_hash: hashPassword("user123"),
    created_at: new Date().toISOString(),
  },
];
let inMemoryOrders: Order[] = [
  {
    id: 1,
    order_code: "ORD-20261005-001",
    customer_name: "Budi Santoso",
    customer_email: "budi@example.com",
    customer_phone: "081234567890",
    shipping_address: "Jl. Sudirman No. 45, Jakarta Pusat",
    total_amount: 4999000,
    payment_method: "Transfer Bank",
    status: "Lunas / Dikirim",
    created_at: new Date().toISOString(),
    items: [
      {
        id: 1,
        product_id: 1,
        product_name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
        price: 4999000,
        quantity: 1,
      },
    ],
  },
];

const dbUrl = (
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "postgresql://postgres:postgres@localhost:5432/fan_commerce"
).trim().replace(/^["']|["']$/g, "");

const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");

// Connection pool singleton
const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Timeout if database unreachable
});

// Test connection state cache
let dbConnected: boolean | null = null;
let lastDbCheck = 0;

export async function checkDbConnection(): Promise<{ connected: boolean; message: string }> {
  const now = Date.now();
  if (dbConnected !== null && now - lastDbCheck < 10000) {
    return {
      connected: dbConnected,
      message: dbConnected ? "PostgreSQL Connected" : "Running on Mock Data (PostgreSQL Offline)",
    };
  }

  try {
    const client = await pool.connect();
    await client.query("SELECT 1;");
    client.release();
    dbConnected = true;
    lastDbCheck = now;
    return { connected: true, message: "PostgreSQL Connected" };
  } catch (err: unknown) {
    dbConnected = false;
    lastDbCheck = now;
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      message: `PostgreSQL offline (${errorMsg}). Menggunakan In-Memory Mock Data.`,
    };
  }
}

export async function query(text: string, params?: (string | number | boolean | null)[]) {
  return pool.query(text, params);
}

// ========================
// REPOSITORY FUNCTIONS (SSR & API)
// ========================

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await pool.query(
      "SELECT id, name, slug, description, icon, created_at FROM categories ORDER BY name ASC"
    );
    if (res.rows.length > 0) return res.rows;
  } catch (err) {
    console.warn("[DB WARNING] Failed to query categories from PostgreSQL, falling back to mock:", err);
  }
  return initialCategories;
}

export async function getProducts(filters: ProductFilterParams = {}): Promise<Product[]> {
  try {
    let sql = `
      SELECT p.id, p.name, p.slug, p.description, p.price, p.original_price, 
             p.stock, p.category_slug, p.image_url, p.rating, p.review_count, 
             p.is_featured, p.created_at, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_slug = c.slug
      WHERE 1=1
    `;
    const params: (string | number | boolean)[] = [];

    if (filters.category) {
      params.push(filters.category);
      sql += ` AND p.category_slug = $${params.length}`;
    }

    if (filters.q) {
      params.push(`%${filters.q}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    if (filters.featured !== undefined) {
      params.push(filters.featured);
      sql += ` AND p.is_featured = $${params.length}`;
    }

    if (filters.minPrice !== undefined) {
      params.push(filters.minPrice);
      sql += ` AND p.price >= $${params.length}`;
    }

    if (filters.maxPrice !== undefined) {
      params.push(filters.maxPrice);
      sql += ` AND p.price <= $${params.length}`;
    }

    if (filters.sort === "price_asc") {
      sql += " ORDER BY p.price ASC";
    } else if (filters.sort === "price_desc") {
      sql += " ORDER BY p.price DESC";
    } else if (filters.sort === "rating") {
      sql += " ORDER BY p.rating DESC";
    } else {
      sql += " ORDER BY p.id DESC";
    }

    const res = await pool.query(sql, params);
    if (res.rows.length > 0) {
      return res.rows.map((row) => ({
        ...row,
        price: Number(row.price),
        original_price: row.original_price ? Number(row.original_price) : null,
        rating: Number(row.rating),
      }));
    }
  } catch (err) {
    console.warn("[DB WARNING] Failed to query products from PostgreSQL, falling back to mock:", err);
  }

  // Fallback to in-memory filter
  let result = [...inMemoryProducts];
  if (filters.category) {
    result = result.filter((p) => p.category_slug === filters.category);
  }
  if (filters.q) {
    const queryLower = filters.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.description.toLowerCase().includes(queryLower)
    );
  }
  if (filters.featured !== undefined) {
    result = result.filter((p) => p.is_featured === filters.featured);
  }
  if (filters.sort === "price_asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (filters.sort === "price_desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (filters.sort === "rating") {
    result.sort((a, b) => b.rating - a.rating);
  }

  return result;
}

export async function getProductByIdOrSlug(idOrSlug: string | number): Promise<Product | null> {
  try {
    const isNumeric = !isNaN(Number(idOrSlug));
    const sql = `
      SELECT p.id, p.name, p.slug, p.description, p.price, p.original_price, 
             p.stock, p.category_slug, p.image_url, p.rating, p.review_count, 
             p.is_featured, p.created_at, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_slug = c.slug
      WHERE ${isNumeric ? "p.id = $1" : "p.slug = $1"}
      LIMIT 1
    `;
    const res = await pool.query(sql, [idOrSlug]);
    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        ...row,
        price: Number(row.price),
        original_price: row.original_price ? Number(row.original_price) : null,
        rating: Number(row.rating),
      };
    }
  } catch (err) {
    console.warn("[DB WARNING] Failed to query product by ID/Slug from PostgreSQL:", err);
  }

  const found = inMemoryProducts.find(
    (p) => String(p.id) === String(idOrSlug) || p.slug === String(idOrSlug)
  );
  return found || null;
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  try {
    const sql = `
      INSERT INTO products (name, slug, description, price, original_price, stock, category_slug, image_url, rating, review_count, is_featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const res = await pool.query(sql, [
      product.name,
      product.slug,
      product.description,
      product.price,
      product.original_price || null,
      product.stock,
      product.category_slug,
      product.image_url,
      product.rating || 5.0,
      product.review_count || 0,
      product.is_featured || false,
    ]);
    const row = res.rows[0];
    return {
      ...row,
      price: Number(row.price),
      original_price: row.original_price ? Number(row.original_price) : null,
      rating: Number(row.rating),
    };
  } catch (err) {
    console.warn("[DB WARNING] Falling back to in-memory product creation:", err);
    const newProduct: Product = {
      ...product,
      id: inMemoryProducts.length + 1,
    };
    inMemoryProducts.push(newProduct);
    return newProduct;
  }
}

export async function createOrder(
  orderData: Omit<Order, "id" | "order_code" | "created_at" | "status">,
  items: { product_id: number; product_name: string; price: number; quantity: number }[]
): Promise<Order> {
  const orderCode = `ORD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
  const status = "Menunggu Pembayaran";

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Insert order
      const orderRes = await client.query(
        `INSERT INTO orders (order_code, customer_name, customer_email, customer_phone, shipping_address, total_amount, payment_method, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          orderCode,
          orderData.customer_name,
          orderData.customer_email,
          orderData.customer_phone,
          orderData.shipping_address,
          orderData.total_amount,
          orderData.payment_method || "Transfer Bank",
          status,
        ]
      );
      const createdOrder = orderRes.rows[0];

      // 2. Insert order items & reduce product stock
      const insertedItems: OrderItem[] = [];
      for (const item of items) {
        const itemRes = await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [createdOrder.id, item.product_id, item.product_name, item.price, item.quantity]
        );
        insertedItems.push(itemRes.rows[0]);

        // Reduce stock
        await client.query(
          `UPDATE products SET stock = GREATEST(stock - $1, 0) WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }

      await client.query("COMMIT");

      return {
        ...createdOrder,
        total_amount: Number(createdOrder.total_amount),
        items: insertedItems,
      };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn("[DB WARNING] Failed to create order in PostgreSQL, falling back to in-memory:", err);
    const newOrder: Order = {
      ...orderData,
      id: inMemoryOrders.length + 1,
      order_code: orderCode,
      status,
      created_at: new Date().toISOString(),
      items: items.map((it, idx) => ({ ...it, id: idx + 1 })),
    };
    inMemoryOrders.unshift(newOrder);

    // Update in-memory stock
    for (const item of items) {
      const prod = inMemoryProducts.find((p) => p.id === item.product_id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    return newOrder;
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const res = await pool.query(
      `SELECT o.*, 
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', oi.id,
                    'product_id', oi.product_id,
                    'product_name', oi.product_name,
                    'price', oi.price,
                    'quantity', oi.quantity
                  )
                ) FILTER (WHERE oi.id IS NOT NULL), '[]'
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.id DESC`
    );
    if (res.rows.length > 0) {
      return res.rows.map((row) => ({
        ...row,
        total_amount: Number(row.total_amount),
      }));
    }
  } catch (err) {
    console.warn("[DB WARNING] Failed to get orders from PostgreSQL, using mock:", err);
  }
  return inMemoryOrders;
}

export async function getOrderByIdOrCode(idOrCode: string | number): Promise<Order | null> {
  try {
    const isNumeric = !isNaN(Number(idOrCode));
    const sql = `
      SELECT o.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'product_id', oi.product_id,
                   'product_name', oi.product_name,
                   'price', oi.price,
                   'quantity', oi.quantity
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), '[]'
             ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE ${isNumeric ? "o.id = $1" : "o.order_code = $1"}
      GROUP BY o.id
      LIMIT 1
    `;
    const res = await pool.query(sql, [idOrCode]);
    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        ...row,
        total_amount: Number(row.total_amount),
      };
    }
  } catch (err) {
    console.warn("[DB WARNING] Failed to get order by ID/Code from PostgreSQL:", err);
  }

  const found = inMemoryOrders.find(
    (o) => String(o.id) === String(idOrCode) || o.order_code === String(idOrCode)
  );
  return found || null;
}

// ========================
// AUTH & USER REPOSITORY
// ========================

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const res = await pool.query(
      "SELECT id, name, email, password_hash, role, created_at FROM users WHERE LOWER(email) = $1 LIMIT 1",
      [normalizedEmail]
    );
    if (res.rows.length > 0) {
      return res.rows[0];
    }
  } catch (err) {
    console.warn("[DB WARNING] Failed to query user by email from PostgreSQL, using mock:", err);
  }

  const found = inMemoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
  return found || null;
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const res = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    if (res.rows.length > 0) {
      return res.rows[0];
    }
  } catch (err) {
    console.warn("[DB WARNING] Failed to query user by ID from PostgreSQL:", err);
  }

  const found = inMemoryUsers.find((u) => u.id === id);
  if (found) {
    const { password_hash, ...safeUser } = found;
    return safeUser as User;
  }
  return null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password_hash: string;
  role?: UserRole;
}): Promise<User> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const role = data.role || "customer";

  try {
    const res = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [data.name.trim(), normalizedEmail, data.password_hash, role]
    );
    return res.rows[0];
  } catch (err) {
    console.warn("[DB WARNING] Failed to insert user in PostgreSQL, using in-memory:", err);
    const newUser: User = {
      id: inMemoryUsers.length + 1,
      name: data.name.trim(),
      email: normalizedEmail,
      role,
      password_hash: data.password_hash,
      created_at: new Date().toISOString(),
    };
    inMemoryUsers.push(newUser);
    const { password_hash, ...safeUser } = newUser;
    return safeUser as User;
  }
}

// ========================
// ADMIN MANAGEMENT REPOSITORY
// ========================

export async function updateOrderStatus(
  orderIdOrCode: string | number,
  status: string
): Promise<Order | null> {
  const isNumeric = !isNaN(Number(orderIdOrCode));
  try {
    const sql = `
      UPDATE orders
      SET status = $1
      WHERE ${isNumeric ? "id = $2" : "order_code = $2"}
      RETURNING *
    `;
    const res = await pool.query(sql, [status, orderIdOrCode]);
    if (res.rows.length > 0) {
      return {
        ...res.rows[0],
        total_amount: Number(res.rows[0].total_amount),
      };
    }
  } catch (err) {
    console.warn("[DB WARNING] Failed to update order status in PostgreSQL:", err);
  }

  const order = inMemoryOrders.find(
    (o) => String(o.id) === String(orderIdOrCode) || o.order_code === String(orderIdOrCode)
  );
  if (order) {
    order.status = status;
    return order;
  }
  return null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  try {
    const res = await pool.query("DELETE FROM products WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  } catch (err) {
    console.warn("[DB WARNING] Failed to delete product in PostgreSQL:", err);
    const index = inMemoryProducts.findIndex((p) => p.id === id);
    if (index > -1) {
      inMemoryProducts.splice(index, 1);
      return true;
    }
    return false;
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const [revRes, ordersRes, prodRes, usersRes, recentRes] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders"),
      pool.query("SELECT COUNT(*) as count FROM orders"),
      pool.query("SELECT COUNT(*) as count FROM products"),
      pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'"),
      pool.query("SELECT * FROM orders ORDER BY id DESC LIMIT 5"),
    ]);

    return {
      totalRevenue: Number(revRes.rows[0]?.total || 0),
      totalOrders: Number(ordersRes.rows[0]?.count || 0),
      totalProducts: Number(prodRes.rows[0]?.count || 0),
      totalCustomers: Number(usersRes.rows[0]?.count || 0),
      recentOrders: recentRes.rows.map((row) => ({
        ...row,
        total_amount: Number(row.total_amount),
      })),
    };
  } catch (err) {
    console.warn("[DB WARNING] Failed to get admin stats from PostgreSQL, using fallback:", err);
  }

  const totalRevenue = inMemoryOrders.reduce((sum, o) => sum + o.total_amount, 0);
  return {
    totalRevenue,
    totalOrders: inMemoryOrders.length,
    totalProducts: inMemoryProducts.length,
    totalCustomers: inMemoryUsers.filter((u) => u.role === "customer").length,
    recentOrders: inMemoryOrders.slice(0, 5),
  };
}

