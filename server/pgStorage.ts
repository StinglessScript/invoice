import { db, members, activities, participants, transactions } from './db';
import { IStorage } from './storage';
import { 
  Activity, 
  ActivityWithParticipants, 
  Member, 
  MemberBalance, 
  Participant, 
  Transaction, 
  TransactionWithMembers,
  InsertMember,
  InsertActivity,
  InsertParticipant,
  InsertTransaction
} from '../shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export class PgStorage implements IStorage {
  constructor() {
    // Khởi tạo các chức năng cần thiết khi khởi động
  }

  // Member operations
  async getMembers(): Promise<Member[]> {
    return await db.select({
      id: members.id,
      name: members.name,
      phone: members.phone,
      qrCode: members.qrCode,
      active: members.active,
      bankCode: members.bankCode,
      bankBin: members.bankBin,
      bankName: members.bankName,
      accountName: members.accountName,
      accountNo: members.accountNo
    }).from(members).where(eq(members.active, true));
  }

  async getMember(id: number): Promise<Member | undefined> {
    const result = await db.select({
      id: members.id,
      name: members.name,
      phone: members.phone,
      qrCode: members.qrCode,
      active: members.active,
      bankCode: members.bankCode,
      bankBin: members.bankBin,
      bankName: members.bankName,
      accountName: members.accountName,
      accountNo: members.accountNo
    }).from(members).where(eq(members.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async searchMembers(query: string): Promise<Member[]> {
    if (!query.trim()) {
      // Khi tìm kiếm không có query, trả về tất cả thành viên kể cả đã ẩn
      return await db.select({
        id: members.id,
        name: members.name,
        phone: members.phone,
        qrCode: members.qrCode,
        active: members.active,
        bankCode: members.bankCode,
        bankBin: members.bankBin,
        bankName: members.bankName,
        accountName: members.accountName,
        accountNo: members.accountNo
      }).from(members);
    }
    
    // Khi có query, tìm kiếm dựa vào tên, không quan tâm đến trạng thái active
    return await db.select({
      id: members.id,
      name: members.name,
      phone: members.phone,
      qrCode: members.qrCode,
      active: members.active,
      bankCode: members.bankCode,
      bankBin: members.bankBin,
      bankName: members.bankName,
      accountName: members.accountName,
      accountNo: members.accountNo
    })
      .from(members)
      .where(
        sql`${members.name} ILIKE ${'%' + query + '%'}`
      );
  }

  async createMember(member: InsertMember): Promise<Member> {
    const result = await db.insert(members).values(member).returning();
    return result[0];
  }
  
  // Hàm mới để xóa tất cả giao dịch liên quan đến một thành viên
  async deleteTransactionsRelatedToMember(id: number): Promise<boolean> {
    try {
      // Xóa tất cả giao dịch mà thành viên này là người gửi
      await db.delete(transactions).where(eq(transactions.fromMemberId, id));
      
      // Xóa tất cả giao dịch mà thành viên này là người nhận
      await db.delete(transactions).where(eq(transactions.toMemberId, id));
      
      return true;
    } catch (error) {
      console.error(`Lỗi khi xóa giao dịch liên quan đến thành viên ${id}:`, error);
      return false;
    }
  }
  
  async deleteMember(id: number): Promise<boolean> {
    try {
      // Kiểm tra xem thành viên có tồn tại không
      const memberExists = await db.select().from(members).where(eq(members.id, id));
      if (memberExists.length === 0) {
        return false;
      }

      // Kiểm tra xem thành viên có là người trả tiền trong hoạt động nào không
      const activityAsPayer = await db.select().from(activities).where(eq(activities.payerId, id));
      if (activityAsPayer.length > 0) {
        // Có các hoạt động phụ thuộc, không thể xóa thành viên này
        console.log(`Không thể xóa thành viên ID ${id} vì là người trả trong ${activityAsPayer.length} hoạt động`);
        return false;
      }
      
      // Thay vì xóa thực sự, chỉ đánh dấu là không hoạt động (xóa mềm)
      const result = await db
        .update(members)
        .set({ active: false })
        .where(eq(members.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error("Error deactivating member:", error);
      return false;
    }
  }
  
  async reactivateMember(id: number): Promise<Member> {
    try {
      // Kiểm tra xem thành viên có tồn tại không
      const memberExists = await db.select().from(members).where(eq(members.id, id));
      if (memberExists.length === 0) {
        throw new Error(`Không tìm thấy thành viên với ID ${id}`);
      }
      
      // Kích hoạt lại thành viên bằng cách đánh dấu active = true
      const result = await db
        .update(members)
        .set({ active: true })
        .where(eq(members.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error(`Không thể kích hoạt lại thành viên với ID ${id}`);
      }
      
      return result[0];
    } catch (error) {
      console.error("Error reactivating member:", error);
      throw error;
    }
  }

  // Activity operations
  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities);
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const result = await db.select().from(activities).where(eq(activities.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(activity).returning();
    return result[0];
  }
  
  async updateActivity(id: number, activity: InsertActivity): Promise<Activity> {
    const result = await db
      .update(activities)
      .set({
        name: activity.name,
        amount: activity.amount,
        payerId: activity.payerId
      })
      .where(eq(activities.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    
    return result[0];
  }

  async deleteActivity(id: number): Promise<boolean> {
    // Đầu tiên, xóa các tham gia liên quan đến hoạt động này
    await this.removeAllParticipantsFromActivity(id);
    
    // Sau đó xóa hoạt động
    const result = await db.delete(activities).where(eq(activities.id, id)).returning();
    return result.length > 0;
  }
  
  async getActivityWithParticipants(id: number): Promise<ActivityWithParticipants | undefined> {
    const activity = await this.getActivity(id);
    if (!activity) return undefined;
    
    const participants = await this.getActivityParticipants(id);
    const payer = await this.getMember(activity.payerId);
    
    if (!payer) return undefined;
    
    return {
      ...activity,
      participants,
      payer
    };
  }

  // Participant operations
  async getActivityParticipants(activityId: number): Promise<Member[]> {
    return await db
      .select({
        id: members.id,
        name: members.name,
        phone: members.phone,
        qrCode: members.qrCode,
        active: members.active,
        bankCode: members.bankCode,
        bankBin: members.bankBin,
        bankName: members.bankName,
        accountName: members.accountName,
        accountNo: members.accountNo
      })
      .from(participants)
      .innerJoin(members, eq(members.id, participants.memberId))
      .where(
        and(
          eq(participants.activityId, activityId),
          eq(members.active, true)
        )
      );
  }

  async addParticipant(participant: InsertParticipant): Promise<Participant> {
    // Kiểm tra nếu tham gia đã tồn tại
    const existing = await db
      .select()
      .from(participants)
      .where(
        and(
          eq(participants.activityId, participant.activityId),
          eq(participants.memberId, participant.memberId)
        )
      );
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    const result = await db.insert(participants).values(participant).returning();
    return result[0];
  }
  
  async removeAllParticipantsFromActivity(activityId: number): Promise<boolean> {
    try {
      await db.delete(participants).where(eq(participants.activityId, activityId));
      return true;
    } catch (error) {
      console.error("Error removing participants:", error);
      return false;
    }
  }

  // Combined operations
  async getActivitiesWithParticipants(): Promise<ActivityWithParticipants[]> {
    const results: ActivityWithParticipants[] = [];
    
    // Lấy tất cả các hoạt động
    const allActivities = await this.getActivities();
    
    // Với mỗi hoạt động, lấy tất cả người tham gia và người trả tiền
    for (const activity of allActivities) {
      const participants = await this.getActivityParticipants(activity.id);
      const payer = await this.getMember(activity.payerId);
      
      if (payer) {
        results.push({
          ...activity,
          participants,
          payer
        });
      }
    }
    
    return results;
  }

  // Balance operations
  async calculateBalances(): Promise<MemberBalance[]> {
    const allMembers = await this.getMembers();
    const activitiesWithData = await this.getActivitiesWithParticipants();
    
    const memberBalances: MemberBalance[] = allMembers.map(member => ({
      memberId: member.id,
      name: member.name,
      phone: member.phone,
      bankCode: member.bankCode,
      bankBin: member.bankBin,
      bankName: member.bankName,
      accountNo: member.accountNo,
      accountName: member.accountName,
      paid: 0,
      shouldPay: 0,
      balance: 0
    }));
    
    // Tính số tiền mỗi người đã trả và nên trả
    for (const activity of activitiesWithData) {
      // Người trả trước tiền
      const payerBalanceIndex = memberBalances.findIndex(mb => mb.memberId === activity.payerId);
      if (payerBalanceIndex !== -1) {
        memberBalances[payerBalanceIndex].paid += activity.amount;
      }
      
      // Tất cả người tham gia sẽ chia đều số tiền
      const participantCount = activity.participants.length;
      if (participantCount > 0) {
        const amountPerPerson = Math.floor(activity.amount / participantCount);
        
        for (const participant of activity.participants) {
          const participantBalanceIndex = memberBalances.findIndex(mb => mb.memberId === participant.id);
          if (participantBalanceIndex !== -1) {
            memberBalances[participantBalanceIndex].shouldPay += amountPerPerson;
          }
        }
      }
    }
    
    // Tính số dư cuối cùng
    for (const balance of memberBalances) {
      balance.balance = balance.paid - balance.shouldPay;
    }
    
    return memberBalances;
  }

  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.id));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  async updateTransactionStatus(id: number, completed: boolean): Promise<Transaction | undefined> {
    const result = await db
      .update(transactions)
      .set({ completed })
      .where(eq(transactions.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async getTransactionsWithMembers(): Promise<TransactionWithMembers[]> {
    const allTransactions = await this.getTransactions();
    const results: TransactionWithMembers[] = [];
    
    for (const transaction of allTransactions) {
      const fromMember = await this.getMember(transaction.fromMemberId);
      const toMember = await this.getMember(transaction.toMemberId);
      
      if (fromMember && toMember) {
        results.push({
          ...transaction,
          fromMember,
          toMember
        });
      }
    }
    
    return results;
  }
}

// Khởi tạo storage và xuất ra
export const storage = new PgStorage();