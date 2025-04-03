import { defineEventHandler, createError } from 'h3';
import { storage } from '../../storage';

// API lấy danh sách người tham gia cho một hoạt động cụ thể
export default defineEventHandler(async (event) => {
  try {
    const activityId = Number(event.context.params?.activityId);
    
    if (isNaN(activityId) || activityId <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID hoạt động không hợp lệ',
        message: 'ID hoạt động không hợp lệ'
      });
    }
    
    // Kiểm tra xem hoạt động có tồn tại không
    const activity = await storage.getActivity(activityId);
    if (!activity) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy hoạt động với ID này',
        message: 'Không tìm thấy hoạt động với ID này'
      });
    }
    
    // Lấy danh sách người tham gia
    const participants = await storage.getActivityParticipants(activityId);
    return participants;
  } catch (error) {
    console.error('Error fetching activity participants:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Đã xảy ra lỗi khi lấy danh sách người tham gia',
      message: 'Đã xảy ra lỗi khi lấy danh sách người tham gia'
    });
  }
});