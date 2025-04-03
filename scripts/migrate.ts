import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
const { Pool } = pg;
import * as path from 'path';

// Đảm bảo chúng ta có chuỗi kết nối
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL không tồn tại. Vui lòng thiết lập biến môi trường.');
  process.exit(1);
}

// Tạo pool kết nối
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Khởi tạo Drizzle với pool
const db = drizzle(pool);

async function main() {
  console.log('Starting database migration...');
  
  try {
    // Thực hiện migrate
    await migrate(db, { migrationsFolder: path.join(__dirname, '..', 'migrations') });
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Đóng kết nối
    await pool.end();
  }
}

main();