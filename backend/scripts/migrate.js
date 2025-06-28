const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Load environment-specific config
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';

require('dotenv').config({ 
  path: path.resolve(__dirname, '..', envFile) 
});

const migrationsDir = path.join(__dirname, '../migrations');

console.log(`📂 Environment: ${NODE_ENV}`);
console.log(`📁 Config file: ${envFile}`);
console.log(`🗄️  Target database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  console.log('🔄 Connected to database');

  // Create migrations table if not exists
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get executed migrations
  const [executedMigrations] = await connection.execute(
    'SELECT filename FROM migrations'
  );
  const executed = executedMigrations.map(row => row.filename);

  // Get all migration files
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`📁 Found ${migrationFiles.length} migration files`);

  for (const file of migrationFiles) {
    if (executed.includes(file)) {
      console.log(`⏭️  Skipping ${file} (already executed)`);
      continue;
    }

    console.log(`🔄 Running migration: ${file}`);
    const sqlContent = fs.readFileSync(
      path.join(migrationsDir, file), 
      'utf8'
    );

    try {
      // Split SQL content by semicolons and execute each statement separately
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        if (statement) {
          await connection.execute(statement);
        }
      }
      
      await connection.execute(
        'INSERT INTO migrations (filename) VALUES (?)',
        [file]
      );
      console.log(`✅ Migration ${file} completed`);
    } catch (error) {
      console.error(`❌ Migration ${file} failed:`, error.message);
      process.exit(1);
    }
  }

  await connection.end();
  console.log('🎉 All migrations completed successfully');
}

runMigrations().catch(console.error); 