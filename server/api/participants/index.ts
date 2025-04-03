import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { storage } from '../../storage';

// API lấy danh sách người tham gia cho một hoạt động
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const activityId = Number(query.activityId);
    
    if (isNaN(activityId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID hoạt động không hợp lệ'
      });
    }
    
    // Kiểm tra xem hoạt động có tồn tại không
    const activity = await storage.getActivity(activityId);
    if (!activity) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy hoạt động'
      });
    }
    
    const participants = await storage.getActivityParticipants(activityId);
    
    // Lấy thêm thông tin về thành viên
    const participantsWithDetails = await Promise.all(
      participants.map(async (participant) => {
        const member = await storage.getMember(participant.memberId);
        return {
          ...participant,
          member
        };
      })
    );
    
    return participantsWithDetails;
  } catch (error) {
    console.error('Error fetching participants:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Đã xảy ra lỗi khi lấy danh sách người tham gia'
    });
  }
});

// API thêm người tham gia vào hoạt động
export const post = defineEventHandler(async (event) => {
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
    
    // Thêm người tham gia
    const participant = await storage.addParticipantToActivity({
      activityId: body.activityId,
      memberId: body.memberId,
      weight: body.weight || 1
    });
    
    return {
      ...participant,
      member
    };
  } catch (error) {
    console.error('Error adding participant:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Đã xảy ra lỗi khi thêm người tham gia'
    });
  }
});