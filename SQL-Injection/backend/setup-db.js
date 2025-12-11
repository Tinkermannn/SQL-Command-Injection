import initSqlJs from 'sql.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    const dbPath = process.env.DB_PATH || './database.db';
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('Removed old database file');
    }

    const SQL = await initSqlJs();
    const db = new SQL.Database();

    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'user',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL,
        stock INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run("INSERT INTO users (username, password, email, role) VALUES ('admin', 'admin123', 'admin@example.com', 'admin')");
    db.run("INSERT INTO users (username, password, email, role) VALUES ('john', 'password123', 'john@example.com', 'user')");
    db.run("INSERT INTO users (username, password, email, role) VALUES ('alice', 'alice456', 'alice@example.com', 'user')");
    db.run("INSERT INTO users (username, password, email, role) VALUES ('bob', 'bob789', 'bob@example.com', 'user')");

    db.run("INSERT INTO products (name, description, price, stock) VALUES ('Laptop', 'High-performance laptop with 16GB RAM', 999.99, 10)");
    db.run("INSERT INTO products (name, description, price, stock) VALUES ('Mouse', 'Wireless ergonomic mouse', 29.99, 50)");
    db.run("INSERT INTO products (name, description, price, stock) VALUES ('Keyboard', 'Mechanical gaming keyboard', 79.99, 25)");
    db.run("INSERT INTO products (name, description, price, stock) VALUES ('Monitor', '27-inch 4K display', 399.99, 15)");
    db.run("INSERT INTO products (name, description, price, stock) VALUES ('Headphones', 'Noise-canceling wireless headphones', 149.99, 30)");
    db.run("INSERT INTO products (name, description, price, stock) VALUES ('Webcam', '1080p HD webcam', 59.99, 40)");

    const data = db.export();
    fs.writeFileSync(dbPath, data);

    console.log('Database setup complete!');
    console.log('\nSample data:');
    console.log('Users:');
    const users = db.exec('SELECT id, username, role FROM users');
    if (users.length > 0) {
      const userRows = users[0].values.map(row => ({
        id: row[0],
        username: row[1],
        role: row[2]
      }));
      console.table(userRows);
    }
    
    console.log('\nProducts:');
    const products = db.exec('SELECT id, name, price FROM products');
    if (products.length > 0) {
      const productRows = products[0].values.map(row => ({
        id: row[0],
        name: row[1],
        price: row[2]
      }));
      console.table(productRows);
    }

    console.log('\nTry these SQL injection payloads:');
    console.log("Login username: admin' OR '1'='1");
    console.log("Login password: anything");
    console.log("Search query: ' OR '1'='1");
    console.log("User ID: 1 OR 1=1");

    db.close();
  } catch (error) {
    console.error('Error setting up database:', error.message);
  }
}

setupDatabase();
