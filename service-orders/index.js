const express = require('express');
const mysql = require('mysql2/promise');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const app = express();
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'mysql-service',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'rootpass',
  database: process.env.DB_NAME || 'shopdb',
};

const packageDef = protoLoader.loadSync(
  path.join(__dirname, 'proto/product.proto'),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);
const grpcObject = grpc.loadPackageDefinition(packageDef);
const ProductService = grpcObject.product.ProductService;

const grpcClient = new ProductService(
  `${process.env.PRODUCTS_GRPC_HOST || 'products-service'}:50051`,
  grpc.credentials.createInsecure()
);

let pool;
async function getPool() {
  if (!pool) pool = mysql.createPool(dbConfig);
  return pool;
}

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'orders' }));

app.get('/orders', async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/orders', (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id || !quantity) {
    return res.status(400).json({ error: 'product_id and quantity are required' });
  }

  grpcClient.getProduct({ id: parseInt(product_id) }, async (err, product) => {
    if (err) {
      console.error('gRPC error:', err.message);
      return res.status(500).json({ error: 'Could not reach products service via gRPC' });
    }
    if (!product.found) {
      return res.status(404).json({ error: 'Product not found' });
    }

    try {
      const db = await getPool();
      const total = product.price * quantity;
      const [result] = await db.query(
        'INSERT INTO orders (product_id, product_name, quantity, total_price) VALUES (?, ?, ?, ?)',
        [product_id, product.name, quantity, total]
      );
      res.status(201).json({
        id: result.insertId,
        product: { id: product.id, name: product.name, price: product.price },
        quantity: parseInt(quantity),
        total: total,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
});

app.listen(3002, () => console.log('Orders service running on port 3002'));