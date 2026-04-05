const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'mysql-service',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'rootpass',
  database: process.env.DB_NAME || 'shopdb',
  waitForConnections: true,
};

let pool;
async function getPool() {
  if (!pool) pool = mysql.createPool(dbConfig);
  return pool;
}

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'products' }));

app.get('/products', async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/products', async (req, res) => {
  const { name, price } = req.body;
  try {
    const db = await getPool();
    const [result] = await db.query(
      'INSERT INTO products (name, price) VALUES (?, ?)', [name, price]
    );
    res.status(201).json({ id: result.insertId, name, price });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const db = await getPool();
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3001, () => console.log('Products service running on port 3001'));

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const packageDef = protoLoader.loadSync(path.join(__dirname, 'proto/product.proto'));
const grpcObject = grpc.loadPackageDefinition(packageDef);
const ProductService = grpcObject.product.ProductService;

const grpcServer = new grpc.Server();
grpcServer.addService(ProductService.service, {
  getProduct: async (call, callback) => {
    try {
      const db = await getPool();
      const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [call.request.id]);
      if (!rows.length) return callback(null, { found: false });
      const p = rows[0];
      callback(null, { id: p.id, name: p.name, price: parseFloat(p.price), found: true });
    } catch (e) {
      callback(e);
    }
  }
});
grpcServer.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('gRPC server running on port 50051');
});