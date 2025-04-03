import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

// Tạo kết nối pool đến PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Tạo đối tượng drizzle để tương tác với cơ sở dữ liệu
export const db = drizzle(pool);