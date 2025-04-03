import { members, activities, activityParticipants } from '../shared/schema';
import { db } from './db';
import { eq, and } from 'drizzle-orm';
import type { Member, InsertMember, Activity, InsertActivity, ActivityParticipant, InsertActivityParticipant } from '../shared/schema';

// Định nghĩa interface cho tầng lưu trữ
export interface IStorage {
  // Quản lý thành viên
  getMember(id: number): Promise<Member | undefined>;
  getMemberByName(name: string): Promise<Member | undefined>;
  getMembers(): Promise<Member[]>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, member: Partial<InsertMember>): Promise<Member | undefined>;
  deleteMember(id: number): Promise<boolean>;

  // Quản lý hoạt động
  getActivity(id: number): Promise<Activity | undefined>;
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  deleteActivity(id: number): Promise<boolean>;

  // Quản lý người tham gia hoạt động
  getActivityParticipants(activityId: number): Promise<ActivityParticipant[]>;
  addParticipantToActivity(participant: InsertActivityParticipant): Promise<ActivityParticipant>;
  removeParticipantFromActivity(activityId: number, memberId: number): Promise<boolean>;
}

// Triển khai tầng lưu trữ sử dụng PostgreSQL
export class DatabaseStorage implements IStorage {
  // Quản lý thành viên
  async getMember(id: number): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  }

  async getMemberByName(name: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.name, name));
    return member;
  }

  async getMembers(): Promise<Member[]> {
    return await db.select().from(members);
  }

  async createMember(member: InsertMember): Promise<Member> {
    try {
      console.log('DatabaseStorage.createMember - Input:', member);
      const [createdMember] = await db.insert(members).values(member).returning();
      console.log('DatabaseStorage.createMember - Result:', createdMember);
      return createdMember;
    } catch (error) {
      console.error('DatabaseStorage.createMember - Error:', error);
      throw error;
    }
  }

  async updateMember(id: number, memberUpdate: Partial<InsertMember>): Promise<Member | undefined> {
    const [updatedMember] = await db
      .update(members)
      .set({ ...memberUpdate, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning();
    return updatedMember;
  }

  async deleteMember(id: number): Promise<boolean> {
    const [deletedMember] = await db.delete(members).where(eq(members.id, id)).returning();
    return !!deletedMember;
  }

  // Quản lý hoạt động
  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [createdActivity] = await db.insert(activities).values(activity).returning();
    return createdActivity;
  }

  async deleteActivity(id: number): Promise<boolean> {
    // Xóa tất cả các bản ghi tham gia trước
    await db.delete(activityParticipants).where(eq(activityParticipants.activityId, id));
    // Sau đó xóa hoạt động
    const [deletedActivity] = await db.delete(activities).where(eq(activities.id, id)).returning();
    return !!deletedActivity;
  }

  // Quản lý người tham gia hoạt động
  async getActivityParticipants(activityId: number): Promise<ActivityParticipant[]> {
    return await db
      .select()
      .from(activityParticipants)
      .where(eq(activityParticipants.activityId, activityId));
  }

  async addParticipantToActivity(participant: InsertActivityParticipant): Promise<ActivityParticipant> {
    const [createdParticipant] = await db
      .insert(activityParticipants)
      .values(participant)
      .returning();
    return createdParticipant;
  }

  async removeParticipantFromActivity(activityId: number, memberId: number): Promise<boolean> {
    const [deletedParticipant] = await db
      .delete(activityParticipants)
      .where(
        and(
          eq(activityParticipants.activityId, activityId),
          eq(activityParticipants.memberId, memberId)
        )
      )
      .returning();
    return !!deletedParticipant;
  }
}

// Xuất ra instance của lớp DatabaseStorage
export const storage = new DatabaseStorage();