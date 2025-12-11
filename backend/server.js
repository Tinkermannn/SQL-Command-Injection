import express from 'express';
import initSqlJs from 'sql.js';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();

let db;
const SQL = await initSqlJs();
const dbPath = process.env.DB_PATH || './database.db';

if (fs.existsSync(dbPath)) {
  const buffer = fs.readFileSync(dbPath);
  db = new SQL.Database(buffer);
} else {
  console.log('Database not found. Run "npm run setup" first!');
  process.exit(1);
}

function saveDatabase() {
  const data = db.export();
  fs.writeFileSync(dbPath, data);
}

process.on('exit', saveDatabase);
process.on('SIGINT', () => {
  saveDatabase();
  process.exit();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vulnerable Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  try {
    const result = db.exec(query);
    
    if (result.length > 0 && result[0].values.length > 0) {
      const columns = result[0].columns;
      const row = result[0].values[0];
      const user = {};
      columns.forEach((col, i) => user[col] = row[i]);
      
      res.json({
        success: true,
        message: 'Login successful',
        user: user
      });
    } else {
      res.json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

// Vulnerable Search
app.get('/api/search', (req, res) => {
  const { query: searchQuery } = req.query;
  
  const query = `SELECT * FROM products WHERE name LIKE '%${searchQuery}%' OR description LIKE '%${searchQuery}%'`;
    
  try {
    const result = db.exec(query);
    const products = [];
    
    if (result.length > 0 && result[0].values.length > 0) {
      const columns = result[0].columns;
      result[0].values.forEach(row => {
        const product = {};
        columns.forEach((col, i) => product[col] = row[i]);
        products.push(product);
      });
    }
    
    res.json({
      success: true,
      results: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  const query = `SELECT * FROM users WHERE id = ${id}`;
  
  try {
    const result = db.exec(query);
    
    if (result.length > 0 && result[0].values.length > 0) {
      const columns = result[0].columns;
      const rows = result[0].values;
      
      if (rows.length > 1) {
        const users = [];
        rows.forEach(row => {
          const user = {};
          columns.forEach((col, i) => user[col] = row[i]);
          users.push(user);
        });
                
        res.json({
          success: true,
          users: users,
          count: users.length,
          message: `Found ${users.length} users`
        });
      } else {
        const row = rows[0];
        const user = {};
        columns.forEach((col, i) => user[col] = row[i]);
        
        res.json({
          success: true,
          user: user
        });
      }
    } else {
      res.json({
        success: true,
        user: null,
        message: 'User not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', vulnerable: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Vulnerable server running on port ${PORT}`);
});
