export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "FanCommerce API Documentation",
    version: "1.0.0",
    description: `
Dokumentasi Resmi REST API FanCommerce — E-Commerce Modern berbasis Next.js App Router & PostgreSQL.

### Fitur Utama API:
- **Server-Side Rendered (SSR) & Dynamic Data**
- **Katalog Produk & Kategori** (dengan filter pencarian, harga, dan sorting)
- **Sistem Checkout & Riwayat Pesanan**
- **Autentikasi Pengguna & Role-Based Access Control (RBAC)** untuk Pelanggan & Administrator
- **Dashboard Metrik Admin & Manajemen Stok**
- **Dukungan PostgreSQL Connection Pooling & Mock Fallback**

### Autentikasi:
Autentikasi menggunakan session cookie terenkripsi HMAC (\`fc_session\`). 
Untuk menguji endpoint yang membutuhkan hak akses (seperti \`/api/admin/*\`), Anda dapat login terlebih dahulu via endpoint \`/api/auth/login\` atau melalui halaman login aplikasi web.
    `,
    contact: {
      name: "FanCommerce Dev Team",
      url: "http://localhost:3000",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
  ],
  tags: [
    { name: "Health", description: "Pemeriksaan koneksi server dan database PostgreSQL" },
    { name: "Auth", description: "Pendaftaran akun, login, cek profil, dan logout" },
    { name: "Products", description: "Katalog produk, pencarian, detail produk, dan penambahan produk" },
    { name: "Categories", description: "Daftar kategori produk" },
    { name: "Orders", description: "Pembuatan pesanan baru (checkout) dan pelacakan order" },
    { name: "Admin", description: "Statistik omset toko, pengelolaan pesanan, dan penghapusan produk" },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Cek Status Koneksi Database",
        description: "Mengembalikan informasi apakah aplikasi saat ini terhubung langsung ke PostgreSQL lokal atau menggunakan in-memory mock fallback.",
        responses: {
          "200": {
            description: "Koneksi database berhasil dicek",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "connected", enum: ["connected", "disconnected"] },
                    details: { type: "string", example: "PostgreSQL Connected" },
                    mode: { type: "string", example: "PostgreSQL", enum: ["PostgreSQL", "Mock In-Memory Store"] },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "Daftar Seluruh Kategori Produk",
        description: "Mengambil semua kategori yang tersedia di katalog e-commerce.",
        responses: {
          "200": {
            description: "Daftar kategori berhasil diambil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Category" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Daftar Produk dengan Filter & Pencarian",
        description: "Mengambil katalog produk dengan dukungan filter kategori, pencarian keyword, rentang harga, dan sorting.",
        parameters: [
          {
            name: "category",
            in: "query",
            description: "Slug kategori (contoh: elektronik, fashion, sepatu, aksesoris)",
            required: false,
            schema: { type: "string", example: "elektronik" },
          },
          {
            name: "q",
            in: "query",
            description: "Kata kunci pencarian nama atau deskripsi produk",
            required: false,
            schema: { type: "string", example: "headphone" },
          },
          {
            name: "minPrice",
            in: "query",
            description: "Batas harga minimum (IDR)",
            required: false,
            schema: { type: "number", example: 100000 },
          },
          {
            name: "maxPrice",
            in: "query",
            description: "Batas harga maksimum (IDR)",
            required: false,
            schema: { type: "number", example: 5000000 },
          },
          {
            name: "sort",
            in: "query",
            description: "Urutan produk",
            required: false,
            schema: {
              type: "string",
              enum: ["newest", "lowest", "highest", "rating"],
              default: "newest",
            },
          },
        ],
        responses: {
          "200": {
            description: "Katalog produk berhasil diambil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    count: { type: "integer", example: 8 },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Tambah Produk Baru ke Katalog",
        description: "Menambahkan produk baru ke database PostgreSQL / mock store (Admin).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProductDto" },
            },
          },
        },
        responses: {
          "201": {
            description: "Produk berhasil ditambahkan",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Payload data tidak valid atau field wajib belum diisi",
          },
        },
      },
    },

    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Detail Produk berdasarkan Slug atau ID",
        description: "Mengambil data lengkap satu produk beserta spesifikasi.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID produk atau Slug produk",
            schema: { type: "string", example: "sony-wh-1000xm5" },
          },
        ],
        responses: {
          "200": {
            description: "Data produk ditemukan",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Produk tidak ditemukan",
          },
        },
      },
    },

    "/api/orders": {
      get: {
        tags: ["Orders"],
        summary: "Daftar Seluruh Pesanan (Riwayat)",
        description: "Mengambil seluruh transaksi pesanan yang telah dibuat pelanggan.",
        responses: {
          "200": {
            description: "Daftar pesanan berhasil diambil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Order" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Orders"],
        summary: "Buat Pesanan Baru (Checkout)",
        description: "Memproses transaksi checkout pelanggan dan menghasilkan kode pesanan unik (ORD-...).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOrderDto" },
            },
          },
        },
        responses: {
          "201": {
            description: "Pesanan berhasil dibuat",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Order" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validasi gagal (misal keranjang kosong atau form belum lengkap)",
          },
        },
      },
    },

    "/api/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Cek Status & Invoice Pesanan",
        description: "Mengambil rincian detail pesanan dan status pengiriman menggunakan Order Code atau Order ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Kode Pesanan (misal: ORD-20261005-001) atau ID numerik",
            schema: { type: "string", example: "ORD-20261005-001" },
          },
        ],
        responses: {
          "200": {
            description: "Pesanan ditemukan",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Order" },
                  },
                },
              },
            },
          },
          "404": {
            description: "Pesanan tidak ditemukan",
          },
        },
      },
    },

    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Pendaftaran Akun Baru",
        description: "Mendaftarkan pengguna baru dengan role 'customer' atau 'admin'. Password di-hash menggunakan crypto scrypt.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterDto" },
            },
          },
        },
        responses: {
          "201": {
            description: "Registrasi berhasil dan session cookie fc_session diset otomatis",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Email sudah terdaftar atau input tidak valid",
          },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Masuk / Login Akun",
        description: "Verifikasi email & password. Mengembalikan data akun dan memasang cookie session HTTP-only.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginDto" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login berhasil",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Email atau kata sandi salah",
          },
        },
      },
    },

    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Cek Akun Login Saat Ini",
        description: "Membaca cookie session dan mengembalikan profil pengguna yang sedang aktif.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Sesi terverifikasi atau null jika belum login",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    user: {
                      nullable: true,
                      allOf: [{ $ref: "#/components/schemas/User" }],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Keluar / Logout Akun",
        description: "Menghapus cookie autentikasi fc_session dari browser.",
        responses: {
          "200": {
            description: "Berhasil logout",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Berhasil logout." },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Statistik Dashboard Admin Toko",
        description: "Menghitung total pendapatan omset, jumlah pesanan, total stok produk, dan jumlah pelanggan terdaftar.",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Statistik berhasil dihitung",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/AdminStats" },
                  },
                },
              },
            },
          },
          "403": {
            description: "Akses ditolak (hanya untuk akun admin)",
          },
        },
      },
    },

    "/api/admin/orders/{id}": {
      put: {
        tags: ["Admin"],
        summary: "Ubah Status Pesanan",
        description: "Admin memperbarui status transaksi pelanggan (contoh: dari 'Menunggu Pembayaran' ke 'Sedang Dikirim' atau 'Selesai').",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Order Code atau ID pesanan",
            schema: { type: "string", example: "ORD-20261005-001" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateOrderStatusDto" },
            },
          },
        },
        responses: {
          "200": {
            description: "Status pesanan berhasil diperbarui",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Status order berhasil diperbarui." },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/admin/products/{id}": {
      delete: {
        tags: ["Admin"],
        summary: "Hapus Produk dari Database",
        description: "Admin menghapus produk dari inventori katalog.",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID numerik produk yang ingin dihapus",
            schema: { type: "integer", example: 1 },
          },
        ],
        responses: {
          "200": {
            description: "Produk berhasil dihapus",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Produk berhasil dihapus." },
                  },
                },
              },
            },
          },
          "404": {
            description: "Produk tidak ditemukan",
          },
        },
      },
    },

    "/api/admin/db-init": {
      post: {
        tags: ["Admin"],
        summary: "Inisialisasi Tabel & Seed 50 Produk (Cloud / Local)",
        description: "Menjalankan migrasi skema tabel PostgreSQL dan mengisi 50 produk, kategori, serta akun default admin & user.",
        responses: {
          "200": {
            description: "Database berhasil diinisialisasi dan diisi 50 produk",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string" },
                    total_products: { type: "integer", example: 50 },
                    admin_account: { type: "string" },
                    customer_account: { type: "string" },
                  },
                },
              },
            },
          },
          "500": {
            description: "Gagal menghubungkan atau menginisialisasi database",
          },
        },
      },
      get: {
        tags: ["Admin"],
        summary: "Inisialisasi Tabel & Seed 50 Produk (via GET URL)",
        description: "Versi GET untuk kemudahan inisialisasi cloud database langsung dari browser URL.",
        responses: {
          "200": {
            description: "Database berhasil diinisialisasi",
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "fc_session",
        description: "HMAC signed session cookie. Disediakan otomatis setelah /api/auth/login.",
      },
    },
    schemas: {
      Category: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Elektronik & Gadget" },
          slug: { type: "string", example: "elektronik" },
          description: { type: "string", example: "Laptop, smartphone, audio, dan aksesoris teknologi" },
          icon: { type: "string", example: "Laptop" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Sony WH-1000XM5 Wireless Headphones" },
          slug: { type: "string", example: "sony-wh-1000xm5" },
          description: { type: "string", example: "Headphone nirkabel premium dengan peredam kebisingan..." },
          price: { type: "number", example: 4999000 },
          original_price: { type: "number", example: 5999000, nullable: true },
          stock: { type: "integer", example: 15 },
          category_slug: { type: "string", example: "elektronik" },
          category_name: { type: "string", example: "Elektronik & Gadget" },
          image_url: { type: "string", example: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" },
          rating: { type: "number", example: 4.9 },
          review_count: { type: "integer", example: 128 },
          is_featured: { type: "boolean", example: true },
          created_at: { type: "string", format: "date-time" },
        },
      },
      CreateProductDto: {
        type: "object",
        required: ["name", "price", "category_slug", "stock"],
        properties: {
          name: { type: "string", example: "Apple iPad Air M2 11 Inch" },
          price: { type: "number", example: 10999000 },
          category_slug: { type: "string", example: "elektronik" },
          stock: { type: "integer", example: 20 },
          description: { type: "string", example: "Tablet Apple bertenaga chip M2 terbaru..." },
          image_url: { type: "string", example: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800" },
          is_featured: { type: "boolean", example: true },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          product_id: { type: "integer", example: 1 },
          product_name: { type: "string", example: "Sony WH-1000XM5 Wireless Headphones" },
          price: { type: "number", example: 4999000 },
          quantity: { type: "integer", example: 1 },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          order_code: { type: "string", example: "ORD-20261005-001" },
          customer_name: { type: "string", example: "Budi Santoso" },
          customer_email: { type: "string", example: "budi@example.com" },
          customer_phone: { type: "string", example: "081234567890" },
          shipping_address: { type: "string", example: "Jl. Sudirman No. 45, Jakarta Pusat" },
          total_amount: { type: "number", example: 4999000 },
          payment_method: { type: "string", example: "Transfer Bank" },
          status: { type: "string", example: "Diproses Penjual" },
          created_at: { type: "string", format: "date-time" },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderItem" },
          },
        },
      },
      CreateOrderDto: {
        type: "object",
        required: [
          "customer_name",
          "customer_email",
          "customer_phone",
          "shipping_address",
          "payment_method",
          "items",
        ],
        properties: {
          customer_name: { type: "string", example: "Rian Pratama" },
          customer_email: { type: "string", example: "rian@example.com" },
          customer_phone: { type: "string", example: "081987654321" },
          shipping_address: { type: "string", example: "Jl. Gatot Subroto No. 88, Jakarta Selatan" },
          payment_method: { type: "string", example: "Transfer Bank BCA" },
          items: {
            type: "array",
            items: {
              type: "object",
              required: ["product_id", "quantity"],
              properties: {
                product_id: { type: "integer", example: 1 },
                quantity: { type: "integer", example: 2 },
              },
            },
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Administrator Toko" },
          email: { type: "string", example: "admin@fancommerce.com" },
          role: { type: "string", enum: ["customer", "admin"], example: "admin" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      RegisterDto: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "John Doe" },
          email: { type: "string", example: "john@example.com" },
          password: { type: "string", example: "secret123" },
          role: { type: "string", enum: ["customer", "admin"], default: "customer" },
        },
      },
      LoginDto: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "admin@fancommerce.com" },
          password: { type: "string", example: "admin123" },
        },
      },
      AdminStats: {
        type: "object",
        properties: {
          totalRevenue: { type: "number", example: 25480000 },
          totalOrders: { type: "integer", example: 12 },
          totalProducts: { type: "integer", example: 8 },
          totalCustomers: { type: "integer", example: 5 },
        },
      },
      UpdateOrderStatusDto: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: [
              "Menunggu Pembayaran",
              "Diproses Penjual",
              "Sedang Dikirim",
              "Selesai",
              "Dibatalkan",
            ],
            example: "Sedang Dikirim",
          },
        },
      },
    },
  },
};
