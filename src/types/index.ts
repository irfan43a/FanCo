export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number | null;
  stock: number;
  category_slug: string;
  category_name?: string;
  image_url: string;
  rating: number;
  review_count: number;
  is_featured: boolean;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: number;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at?: string;
  items?: OrderItem[];
}

export interface ProductFilterParams {
  category?: string;
  q?: string;
  sort?: "price_asc" | "price_desc" | "rating" | "newest";
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export type UserRole = "customer" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  password_hash?: string;
  created_at?: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
}

