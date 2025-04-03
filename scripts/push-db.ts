import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import * as schema from '../shared/schema.js';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';

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
const db = drizzle(pool, { schema });

async function main() {
  console.log('Pushing schema to database...');
  
  try {
    // Kiểm tra kết nối
    await db.execute(sql`SELECT 1`);
    
    // Tạo các bảng
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        qr_code TEXT
      );
      
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        amount INTEGER NOT NULL,
        payer_id INTEGER NOT NULL,
        FOREIGN KEY (payer_id) REFERENCES members(id)
      );
      
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        activity_id INTEGER NOT NULL,
        member_id INTEGER NOT NULL,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(id),
        UNIQUE(activity_id, member_id)
      );
      
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        from_member_id INTEGER NOT NULL,
        to_member_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        FOREIGN KEY (from_member_id) REFERENCES members(id),
        FOREIGN KEY (to_member_id) REFERENCES members(id)
      );
    `);
    
    console.log('Schema pushed successfully!');
  } catch (error) {
    console.error('Schema push failed:', error);
    process.exit(1);
  } finally {
    // Đóng kết nối
    await pool.end();
  }
}

main();