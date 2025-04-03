import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;
import { 
  members, 
  activities, 
  participants, 
  transactions
} from '../shared/schema.js';

// Tạo pool kết nối
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Khởi tạo drizzle client
export const db = drizzle(pool);

// Xuất các schema để truy vấn trong các route
export { members, activities, participants, transactions };