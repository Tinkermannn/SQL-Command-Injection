import initSqlJs from 'sql.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function hashPasswords() {
  try {
    console.log('Hashing passwords in database...');

    const dbPath = process.env.DB_PATH || './database.db';
    
    if (!fs.existsSync(dbPath)) {
      console.log('Database not found. Run "npm run setup" first!');
      process.exit(1);
    }

    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(buffer);

    const result = db.exec('SELECT id, username, password FROM users');
    
    if (result.length === 0 || result[0].values.length === 0) {
      console.log('No users found in database');
      process.exit(1);
    }

    const users = result[0].values;
    console.log(`\nFound ${users.length} users to hash:`);

    for (const [id, username, plainPassword] of users) {
      console.log(`\nProcessing user: ${username}`);
      console.log(`  Original password: ${plainPassword}`);
      
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      console.log(`  Hashed password: ${hashedPassword.substring(0, 30)}...`);
      
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
      console.log(`  Updated successfully`);
    }

    const data = db.export();
    fs.writeFileSync(dbPath, data);

    console.log('\nAll passwords hashed successfully!');
    console.log('\nUpdated credentials for testing:');
    console.log('   Username | Original Password');
    console.log('   ---------|------------------');
    console.log('   admin    | admin123');
    console.log('   john     | password123');
    console.log('   alice    | alice456');
    console.log('   bob      | bob789');
    console.log('\nNote: Passwords are now hashed with bcrypt');
    console.log('Use the ORIGINAL passwords for login testing');

    db.close();
  } catch (error) {
    console.error('Error hashing passwords:', error.message);
    process.exit(1);
  }
}

hashPasswords();