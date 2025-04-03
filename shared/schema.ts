import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"), // Không còn bắt buộc
  qrCode: text("qr_code"),
  active: boolean("active").default(true),
  
  // Thêm thông tin ngân hàng
  bankCode: text("bank_code"),        // Mã ngân hàng
  bankBin: text("bank_bin"),          // Mã BIN ngân hàng
  bankName: text("bank_name"),        // Tên ngân hàng
  accountName: text("account_name"),  // Tên chủ tài khoản 
  accountNo: text("account_no"),      // Số tài khoản
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  payerId: integer("payer_id").notNull(),
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull(),
  memberId: integer("member_id").notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  fromMemberId: integer("from_member_id").notNull(),
  toMemberId: integer("to_member_id").notNull(),
  amount: integer("amount").notNull(),
  completed: boolean("completed").default(false),
});

export const insertMemberSchema = createInsertSchema(members).pick({
  name: true,
  phone: true,
  qrCode: true,
  active: true,
  bankCode: true,
  bankBin: true,
  bankName: true,
  accountName: true,
  accountNo: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  name: true,
  amount: true,
  payerId: true,
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  activityId: true,
  memberId: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  fromMemberId: true,
  toMemberId: true,
  amount: true,
  completed: true,
});

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Member = typeof members.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

// Extended types for use in the application
export type ActivityWithParticipants = Activity & {
  participants: Member[];
  payer: Member;
};

export type MemberBalance = {
  memberId: number;
  name: string;
  phone: string | null;
  bankCode: string | null; 
  bankBin: string | null;
  bankName: string | null;
  accountNo: string | null;
  accountName: string | null;
  paid: number;
  shouldPay: number;
  balance: number;
};

export type TransactionWithMembers = Transaction & {
  fromMember: Member;
  toMember: Member;
};
