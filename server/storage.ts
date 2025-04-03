import { 
  members, members as membersTable, 
  activities, activities as activitiesTable,
  participants, participants as participantsTable,
  transactions, transactions as transactionsTable,
  type Member, type Activity, type Participant, type Transaction,
  type InsertMember, type InsertActivity, type InsertParticipant, type InsertTransaction,
  type ActivityWithParticipants, type MemberBalance, type TransactionWithMembers 
} from "../shared/schema.js";

export interface IStorage {
  // Member operations
  getMembers(): Promise<Member[]>;
  getMember(id: number): Promise<Member | undefined>;
  searchMembers(query: string): Promise<Member[]>;
  createMember(member: InsertMember): Promise<Member>;
  deleteMember(id: number): Promise<boolean>;
  reactivateMember(id: number): Promise<Member>;
  deleteTransactionsRelatedToMember(id: number): Promise<boolean>;
  
  // Activity operations
  getActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: InsertActivity): Promise<Activity>;
  deleteActivity(id: number): Promise<boolean>;
  getActivityWithParticipants(id: number): Promise<ActivityWithParticipants | undefined>;
  
  // Participant operations
  getActivityParticipants(activityId: number): Promise<Member[]>;
  addParticipant(participant: InsertParticipant): Promise<Participant>;
  removeAllParticipantsFromActivity(activityId: number): Promise<boolean>;
  
  // Combined operations
  getActivitiesWithParticipants(): Promise<ActivityWithParticipants[]>;
  
  // Balance operations
  calculateBalances(): Promise<MemberBalance[]>;
  
  // Transaction operations
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, completed: boolean): Promise<Transaction | undefined>;
  getTransactionsWithMembers(): Promise<TransactionWithMembers[]>;
}

export class MemStorage implements IStorage {
  private members: Map<number, Member>;
  private activities: Map<number, Activity>;
  private participants: Map<number, Participant>;
  private transactions: Map<number, Transaction>;
  
  private memberCurrentId: number;
  private activityCurrentId: number;
  private participantCurrentId: number;
  private transactionCurrentId: number;

  constructor() {
    this.members = new Map();
    this.activities = new Map();
    this.participants = new Map();
    this.transactions = new Map();
    
    this.memberCurrentId = 1;
    this.activityCurrentId = 1;
    this.participantCurrentId = 1;
    this.transactionCurrentId = 1;
  }

  // Member operations
  async getMembers(): Promise<Member[]> {
    return Array.from(this.members.values()).filter(member => member.active !== false);
  }

  async getMember(id: number): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async searchMembers(query: string): Promise<Member[]> {
    if (!query) {
      // Nếu không có query, trả về tất cả thành viên (kể cả đã bị ẩn)
      return Array.from(this.members.values());
    }
    
    const lowercaseQuery = query.toLowerCase();
    // Tìm kiếm dựa trên tên, không quan tâm trạng thái active
    return Array.from(this.members.values()).filter(
      (member) => member.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = this.memberCurrentId++;
    const member: Member = { 
      id, 
      name: insertMember.name, 
      phone: insertMember.phone || null, 
      qrCode: insertMember.qrCode || null,
      active: insertMember.active !== undefined ? insertMember.active : true,
      bankCode: insertMember.bankCode || null,
      bankBin: insertMember.bankBin || null,
      bankName: insertMember.bankName || null,
      accountName: insertMember.accountName || null,
      accountNo: insertMember.accountNo || null
    };
    this.members.set(id, member);
    return member;
  }
  
  async deleteTransactionsRelatedToMember(id: number): Promise<boolean> {
    try {
      // Lấy danh sách tất cả giao dịch
      const transactions = Array.from(this.transactions.entries());
      
      // Xóa các giao dịch liên quan đến thành viên
      for (const [transactionId, transaction] of transactions) {
        if (transaction.fromMemberId === id || transaction.toMemberId === id) {
          this.transactions.delete(transactionId);
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Lỗi khi xóa giao dịch liên quan đến thành viên ${id}:`, error);
      return false;
    }
  }
  
  async deleteMember(id: number): Promise<boolean> {
    // Kiểm tra member có tồn tại không
    const member = this.members.get(id);
    if (!member) {
      return false;
    }
    
    // Thay vì xóa thành viên, chỉ đánh dấu là không hoạt động (xóa mềm)
    const updatedMember = {
      ...member,
      active: false
    };
    
    // Cập nhật member với trạng thái active = false
    this.members.set(id, updatedMember);
    return true;
  }
  
  async reactivateMember(id: number): Promise<Member> {
    // Kiểm tra member có tồn tại không
    const member = this.members.get(id);
    if (!member) {
      throw new Error(`Không tìm thấy thành viên với ID ${id}`);
    }
    
    // Kích hoạt lại thành viên bằng cách đánh dấu active = true
    const updatedMember = {
      ...member,
      active: true
    };
    
    // Cập nhật member với trạng thái active = true
    this.members.set(id, updatedMember);
    return updatedMember;
  }

  // Activity operations
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityCurrentId++;
    const activity: Activity = { 
      id, 
      name: insertActivity.name,
      amount: insertActivity.amount,
      payerId: insertActivity.payerId
    };
    this.activities.set(id, activity);
    return activity;
  }

  async updateActivity(id: number, insertActivity: InsertActivity): Promise<Activity> {
    const activity = this.activities.get(id);
    if (!activity) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    
    const updatedActivity: Activity = { 
      ...activity,
      name: insertActivity.name,
      amount: insertActivity.amount,
      payerId: insertActivity.payerId
    };
    
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteActivity(id: number): Promise<boolean> {
    // Delete participants first
    await this.removeAllParticipantsFromActivity(id);
    
    return this.activities.delete(id);
  }
  
  async getActivityWithParticipants(id: number): Promise<ActivityWithParticipants | undefined> {
    const activity = await this.getActivity(id);
    if (!activity) return undefined;
    
    const participants = await this.getActivityParticipants(id);
    const payer = this.members.get(activity.payerId);
    
    if (!payer) return undefined;
    
    return {
      ...activity,
      participants,
      payer
    };
  }

  // Participant operations
  async getActivityParticipants(activityId: number): Promise<Member[]> {
    const participantEntries = Array.from(this.participants.values())
      .filter(p => p.activityId === activityId);
    
    return participantEntries
      .map(p => this.members.get(p.memberId)!)
      .filter(member => member && member.active !== false);
  }

  async addParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.participantCurrentId++;
    const participant: Participant = { ...insertParticipant, id };
    this.participants.set(id, participant);
    return participant;
  }
  
  async removeAllParticipantsFromActivity(activityId: number): Promise<boolean> {
    const participants = Array.from(this.participants.entries());
    let removed = false;
    
    for (const [participantId, participant] of participants) {
      if (participant.activityId === activityId) {
        this.participants.delete(participantId);
        removed = true;
      }
    }
    
    return removed;
  }

  // Combined operations
  async getActivitiesWithParticipants(): Promise<ActivityWithParticipants[]> {
    const activities = await this.getActivities();
    const result: ActivityWithParticipants[] = [];
    
    for (const activity of activities) {
      const participants = await this.getActivityParticipants(activity.id);
      const payer = this.members.get(activity.payerId);
      
      if (payer) {
        result.push({
          ...activity,
          participants,
          payer
        });
      }
    }
    
    return result;
  }

  // Balance operations
  async calculateBalances(): Promise<MemberBalance[]> {
    const members = await this.getMembers();
    const activitiesWithParticipants = await this.getActivitiesWithParticipants();
    
    const balances: MemberBalance[] = members.map(member => ({
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
    
    // Calculate what each member paid and should pay
    for (const activity of activitiesWithParticipants) {
      // Add to payer's paid amount
      const payerBalance = balances.find(b => b.memberId === activity.payerId);
      if (payerBalance) {
        payerBalance.paid += activity.amount;
      }
      
      // Calculate each participant's share
      const perPersonAmount = activity.participants.length > 0 
        ? Math.floor(activity.amount / activity.participants.length) 
        : 0;
      
      for (const participant of activity.participants) {
        const participantBalance = balances.find(b => b.memberId === participant.id);
        if (participantBalance) {
          participantBalance.shouldPay += perPersonAmount;
        }
      }
    }
    
    // Calculate final balance
    for (const balance of balances) {
      balance.balance = balance.paid - balance.shouldPay;
    }
    
    return balances;
  }

  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionCurrentId++;
    // Đảm bảo completed luôn là boolean
    let completed: boolean = false;
    if (typeof insertTransaction.completed === 'boolean') {
      completed = insertTransaction.completed;
    }
    
    const transaction: Transaction = { 
      id, 
      amount: insertTransaction.amount,
      fromMemberId: insertTransaction.fromMemberId,
      toMemberId: insertTransaction.toMemberId,
      completed
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(id: number, completed: boolean): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction: Transaction = { ...transaction, completed };
    this.transactions.set(id, updatedTransaction);
    
    return updatedTransaction;
  }

  async getTransactionsWithMembers(): Promise<TransactionWithMembers[]> {
    const transactions = await this.getTransactions();
    return transactions.map(transaction => {
      const fromMember = this.members.get(transaction.fromMemberId);
      const toMember = this.members.get(transaction.toMemberId);
      
      if (!fromMember || !toMember) {
        throw new Error(`Member not found for transaction ${transaction.id}`);
      }
      
      return {
        ...transaction,
        fromMember,
        toMember
      };
    });
  }
}

export const storage = new MemStorage();
