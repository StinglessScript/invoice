import { defineEventHandler, readBody, createError } from 'h3';
import { storage } from '../../storage';

// API lấy thông tin thành viên theo ID
export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID thành viên không hợp lệ'
    });
  }
  
  try {
    const member = await storage.getMember(id);
    
    if (!member) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy thành viên'
      });
    }
    
    return member;
  } catch (error) {
    console.error(`Error fetching member ${id}:`, error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Đã xảy ra lỗi khi lấy thông tin thành viên'
    });
  }
});

// API cập nhật thông tin thành viên
export const put = defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID thành viên không hợp lệ'
    });
  }
  
  try {
    const body = await readBody(event);
    
    if (Object.keys(body).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dữ liệu cập nhật không hợp lệ'
      });
    }
    
    const updatedMember = await storage.updateMember(id, body);
    
    if (!updatedMember) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy thành viên'
      });
    }
    
    return updatedMember;
  } catch (error) {
    console.error(`Error updating member ${id}:`, error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Đã xảy ra lỗi khi cập nhật thông tin thành viên'
    });
  }
});

// API xóa thành viên
export const del = defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID thành viên không hợp lệ'
    });
  }
  
  try {
    const deleted = await storage.deleteMember(id);
    
    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy thành viên'
      });
    }
    
    return { success: true, message: 'Đã xóa thành viên thành công' };
  } catch (error) {
    console.error(`Error deleting member ${id}:`, error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Đã xảy ra lỗi khi xóa thành viên'
    });
  }
});