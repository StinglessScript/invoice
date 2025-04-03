import { defineEventHandler, readBody, createError } from 'h3';
import { storage } from '../../storage';

// API xóa người tham gia khỏi hoạt động
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    if (!body.activityId || !body.memberId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dữ liệu không hợp lệ. Vui lòng cung cấp activityId và memberId'
      });
    }
    
    // Kiểm tra xem hoạt động có tồn tại không
    const activity = await storage.getActivity(body.activityId);
    if (!activity) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy hoạt động'
      });
    }
    
    // Kiểm tra xem thành viên có tồn tại không
    const member = await storage.getMember(body.memberId);
    if (!member) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy thành viên'
      });
    }
    
    // Xóa người tham gia khỏi hoạt động
    const removed = await storage.removeParticipantFromActivity(body.activityId, body.memberId);
    
    if (!removed) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy người tham gia trong hoạt động này'
      });
    }
    
    return { 
      success: true, 
      message: 'Đã xóa người tham gia khỏi hoạt động thành công',
      activityId: body.activityId,
      memberId: body.memberId
    };
  } catch (error) {
    console.error('Error removing participant:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Đã xảy ra lỗi khi xóa người tham gia khỏi hoạt động'
    });
  }
});