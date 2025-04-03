import { db } from "../db";
import { activities, members, activityParticipants } from "../../shared/schema";
import { defineEventHandler, createError } from "h3";

/**
 * API endpoint để thiết lập cơ sở dữ liệu
 * Tạo các bảng cần thiết trong PostgreSQL nếu chúng chưa tồn tại
 */
export default defineEventHandler(async (event) => {
  try {
    // Tạo các bảng trong cơ sở dữ liệu sử dụng Drizzle schema
    await db.execute(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        qr_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        amount DOUBLE PRECISION NOT NULL,
        paid_by_id INTEGER NOT NULL REFERENCES members(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS activity_participants (
        id SERIAL PRIMARY KEY,
        activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        weight DOUBLE PRECISION DEFAULT 1 NOT NULL,
        UNIQUE(activity_id, member_id)
      );
    `);
    
    return {
      success: true,
      message: "Cơ sở dữ liệu đã được thiết lập thành công"
    };
  } catch (error) {
    console.error("Error setting up database:", error);
    
    // Trả về lỗi
    throw createError({
      statusCode: 500,
      statusMessage: "Không thể thiết lập cơ sở dữ liệu",
      data: error
    });
  }
});