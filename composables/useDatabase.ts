import type { Member, Activity, ActivityParticipant } from '../shared/schema';

/**
 * Composable để tương tác với API của cơ sở dữ liệu
 * @returns Các phương thức để tương tác với API
 */
export default function useDatabase() {
  /**
   * Khởi tạo cơ sở dữ liệu
   * @returns Promise<void>
   */
  const setupDatabase = async () => {
    try {
      const response = await fetch('/api/setup-db', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể khởi tạo cơ sở dữ liệu');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error setting up database:', error);
      throw error;
    }
  };
  
  /**
   * Lấy danh sách thành viên
   * @returns Promise<Member[]>
   */
  const fetchMembers = async (): Promise<Member[]> => {
    try {
      const response = await fetch('/api/members');
      
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách thành viên');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  };
  
  /**
   * Tạo thành viên mới
   * @param member Thông tin thành viên
   * @returns Promise<Member>
   */
  const createMember = async (member: Partial<Member>): Promise<Member> => {
    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể tạo thành viên');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  };
  
  /**
   * Cập nhật thông tin thành viên
   * @param id ID của thành viên
   * @param member Thông tin cập nhật
   * @returns Promise<Member>
   */
  const updateMember = async (id: number, member: Partial<Member>): Promise<Member> => {
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể cập nhật thành viên');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating member ${id}:`, error);
      throw error;
    }
  };
  
  /**
   * Xóa thành viên
   * @param id ID của thành viên
   * @returns Promise<boolean>
   */
  const deleteMember = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể xóa thành viên');
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting member ${id}:`, error);
      throw error;
    }
  };
  
  /**
   * Lấy danh sách hoạt động
   * @returns Promise<Activity[]>
   */
  const fetchActivities = async (): Promise<Activity[]> => {
    try {
      const response = await fetch('/api/activities');
      
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách hoạt động');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  };
  
  /**
   * Tạo hoạt động mới
   * @param activity Thông tin hoạt động
   * @returns Promise<Activity>
   */
  const createActivity = async (activity: Partial<Activity>): Promise<Activity> => {
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activity),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể tạo hoạt động');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  };
  
  /**
   * Xóa hoạt động
   * @param id ID của hoạt động
   * @returns Promise<boolean>
   */
  const deleteActivity = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể xóa hoạt động');
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting activity ${id}:`, error);
      throw error;
    }
  };
  
  /**
   * Lấy danh sách người tham gia hoạt động
   * @param activityId ID của hoạt động
   * @returns Promise<ActivityParticipant[]>
   */
  const fetchActivityParticipants = async (activityId: number): Promise<ActivityParticipant[]> => {
    try {
      const response = await fetch(`/api/participants?activityId=${activityId}`);
      
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách người tham gia');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching participants for activity ${activityId}:`, error);
      throw error;
    }
  };
  
  /**
   * Thêm người tham gia vào hoạt động
   * @param participant Thông tin người tham gia
   * @returns Promise<ActivityParticipant>
   */
  const addParticipant = async (participant: Partial<ActivityParticipant>): Promise<ActivityParticipant> => {
    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participant),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể thêm người tham gia');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  };
  
  /**
   * Xóa người tham gia khỏi hoạt động
   * @param activityId ID của hoạt động
   * @param memberId ID của thành viên
   * @returns Promise<boolean>
   */
  const removeParticipant = async (activityId: number, memberId: number): Promise<boolean> => {
    try {
      const response = await fetch('/api/participants/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activityId, memberId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể xóa người tham gia');
      }
      
      return true;
    } catch (error) {
      console.error(`Error removing participant (activity: ${activityId}, member: ${memberId}):`, error);
      throw error;
    }
  };
  
  return {
    setupDatabase,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    fetchActivities,
    createActivity,
    deleteActivity,
    fetchActivityParticipants,
    addParticipant,
    removeParticipant,
  };
}