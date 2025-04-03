import { defineEventHandler, readBody, createError } from 'h3';
import { storage } from '../../storage';

// API lấy danh sách thành viên
export default defineEventHandler(async () => {
  try {
    const members = await storage.getMembers();
    return members;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Đã xảy ra lỗi khi lấy danh sách thành viên'
    });
  }
});

// API tạo thành viên mới
export const post = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    if (!body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tên thành viên là bắt buộc'
      });
    }
    
    console.log('Creating member with data:', body);
    
    // Chuẩn bị dữ liệu thành viên
    const memberData: any = {
      name: body.name
    };
    
    // Chỉ thêm qr_code nếu nó được cung cấp
    if (body.qrCode) {
      memberData.qr_code = body.qrCode;
    }
    
    console.log('Prepared member data for database:', memberData);
    const member = await storage.createMember(memberData);
    
    console.log('Created member:', member);
    return member;
  } catch (error) {
    console.error('Error creating member:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Đã xảy ra lỗi khi tạo thành viên mới'
    });
  }
});