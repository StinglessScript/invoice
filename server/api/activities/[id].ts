import { defineEventHandler, createError } from 'h3';
import { storage } from '../../storage';

// API lấy thông tin hoạt động theo ID
export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID hoạt động không hợp lệ'
    });
  }
  
  try {
    const activity = await storage.getActivity(id);
    
    if (!activity) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy hoạt động'
      });
    }
    
    // Lấy danh sách người tham gia
    const participants = await storage.getActivityParticipants(id);
    
    // Lấy thông tin người trả tiền
    const payer = await storage.getMember(activity.paidById);
    
    return {
      activity,
      payer,
      participants
    };
  } catch (error) {
    console.error(`Error fetching activity ${id}:`, error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Đã xảy ra lỗi khi lấy thông tin hoạt động'
    });
  }
});

// API xóa hoạt động
export const del = defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID hoạt động không hợp lệ'
    });
  }
  
  try {
    const deleted = await storage.deleteActivity(id);
    
    if (!deleted) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy hoạt động'
      });
    }
    
    return { success: true, message: 'Đã xóa hoạt động thành công' };
  } catch (error) {
    console.error(`Error deleting activity ${id}:`, error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Đã xảy ra lỗi khi xóa hoạt động'
    });
  }
});