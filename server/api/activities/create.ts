import { defineEventHandler, readBody, createError } from 'h3';
import { storage } from '../../storage';

// API tạo hoạt động mới và thêm người tham gia
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { activity, participants } = body;
    
    console.log('Creating activity with data:', body);
    
    if (!activity || !activity.name || !activity.amount || !activity.paidById) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dữ liệu hoạt động không hợp lệ',
        message: 'Dữ liệu hoạt động không hợp lệ'
      });
    }
    
    // Kiểm tra xem người trả tiền có tồn tại không
    const payer = await storage.getMember(activity.paidById);
    if (!payer) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Người trả tiền không tồn tại',
        message: 'Người trả tiền không tồn tại'
      });
    }
    
    // Tạo hoạt động mới
    const createdActivity = await storage.createActivity(activity);
    console.log('Created activity:', createdActivity);
    
    // Nếu có danh sách người tham gia, thêm họ vào hoạt động
    if (Array.isArray(participants) && participants.length > 0) {
      for (const participant of participants) {
        const addedParticipant = await storage.addParticipantToActivity({
          activityId: createdActivity.id,
          memberId: participant.memberId,
          weight: participant.weight || 1
        });
        console.log('Added participant:', addedParticipant);
      }
    }
    
    // Lấy thông tin hoạt động đã tạo cùng với danh sách người tham gia
    const participantsList = await storage.getActivityParticipants(createdActivity.id);
    
    return {
      activity: createdActivity,
      participants: participantsList
    };
  } catch (error) {
    console.error('Error creating activity:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Đã xảy ra lỗi khi tạo hoạt động mới',
      message: 'Đã xảy ra lỗi khi tạo hoạt động mới'
    });
  }
});