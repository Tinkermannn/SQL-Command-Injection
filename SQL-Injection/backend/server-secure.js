import express from 'express';
import initSqlJs from 'sql.js';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

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

app.use(helmet());

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.'
  }
});

app.use('/api/', apiLimiter);

function validateUsername(username) {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
}

function validatePassword(password) {
  return password && password.length >= 6 && password.length <= 100;
}

function validateSearchQuery(query) {
  return query && query.length <= 100 && !query.includes('\0');
}

function validateId(id) {
  const numId = parseInt(id, 10);
  return Number.isInteger(numId) && numId > 0 && numId < 1000000;
}

app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    if (!validateUsername(username)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid username format'
      });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password format'
      });
    }
    
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    stmt.bind([username]);
    
    if (stmt.step()) {
      const user = stmt.getAsObject();
      stmt.free();
      
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (passwordMatch) {        
        res.json({
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    } else {
      stmt.free();
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.'
    });
  }
});

app.get('/api/search', (req, res) => {
  try {
    const { query: searchQuery } = req.query;
    
    if (!searchQuery) {
      return res.json({
        success: true,
        results: []
      });
    }
    
    if (!validateSearchQuery(searchQuery)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid search query'
      });
    }
    
    const stmt = db.prepare('SELECT id, name, description, price, stock FROM products WHERE name LIKE ? OR description LIKE ?');
    const searchPattern = `%${searchQuery}%`;
    stmt.bind([searchPattern, searchPattern]);
    
    const products = [];
    while (stmt.step()) {
      products.push(stmt.getAsObject());
    }
    stmt.free();
        
    res.json({
      success: true,
      results: products
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during search'
    });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!validateId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const userId = parseInt(id, 10);
    
    const stmt = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?');
    stmt.bind([userId]);
    
    if (stmt.step()) {
      const user = stmt.getAsObject();
      stmt.free();
            
      res.json({
        success: true,
        user: user
      });
    } else {
      stmt.free();
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
  } catch (error) {
    console.error('User lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    secure: true,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Secure server running on port ${PORT}`);
});