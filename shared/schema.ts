import { pgTable, serial, text, integer, timestamp, doublePrecision } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Định nghĩa bảng Members (thành viên)
export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  qrCode: text('qr_code'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Định nghĩa bảng Activities (các hoạt động/chi tiêu)
export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  amount: doublePrecision('amount').notNull(),
  paidById: integer('paid_by_id').references(() => members.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Định nghĩa bảng ActivityParticipants (người tham gia vào các hoạt động)
export const activityParticipants = pgTable('activity_participants', {
  id: serial('id').primaryKey(),
  activityId: integer('activity_id').references(() => activities.id).notNull(),
  memberId: integer('member_id').references(() => members.id).notNull(),
  weight: doublePrecision('weight').default(1).notNull() // Trọng số tham gia (mặc định là 1)
});

// Định nghĩa các mối quan hệ giữa các bảng
export const membersRelations = relations(members, ({ many }) => ({
  paidActivities: many(activities),
  participatedActivities: many(activityParticipants)
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  paidBy: one(members, {
    fields: [activities.paidById],
    references: [members.id]
  }),
  participants: many(activityParticipants)
}));

export const activityParticipantsRelations = relations(activityParticipants, ({ one }) => ({
  activity: one(activities, {
    fields: [activityParticipants.activityId],
    references: [activities.id]
  }),
  member: one(members, {
    fields: [activityParticipants.memberId],
    references: [members.id]
  })
}));

// Định nghĩa các kiểu dữ liệu
export type Member = typeof members.$inferSelect;
export type InsertMember = typeof members.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

export type ActivityParticipant = typeof activityParticipants.$inferSelect;
export type InsertActivityParticipant = typeof activityParticipants.$inferInsert;