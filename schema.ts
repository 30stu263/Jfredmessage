import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Virtual phone numbers for users
export const virtualNumbers = pgTable("virtual_numbers", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  phoneNumber: varchar("phone_number").notNull(),
  purpose: varchar("purpose").notNull(), // Personal, Business, Dating, etc.
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contacts
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  phoneNumber: varchar("phone_number").notNull(),
  avatarUrl: varchar("avatar_url"),
  status: varchar("status").default("offline"), // online, offline, away
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().notNull(),
  conversationId: varchar("conversation_id").notNull(), // Format: userId-contactId
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  text: text("text").notNull(),
  imageUrl: varchar("image_url"),
  audioUrl: varchar("audio_url"), // For voice messages
  timestamp: timestamp("timestamp").defaultNow(),
  read: boolean("read").default(false),
  sent: boolean("sent").default(true),
  delivered: boolean("delivered").default(false),
  reaction: varchar("reaction"), // Emoji reaction
  messageType: varchar("message_type").default("text"), // text, image, audio, etc.
});

// Insert and Select types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertVirtualNumber = typeof virtualNumbers.$inferInsert;
export type VirtualNumber = typeof virtualNumbers.$inferSelect;

export type InsertContact = typeof contacts.$inferInsert;
export type Contact = typeof contacts.$inferSelect;

export type InsertMessage = typeof messages.$inferInsert;
export type Message = typeof messages.$inferSelect;

// Insert Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertVirtualNumberSchema = createInsertSchema(virtualNumbers);
export const insertContactSchema = createInsertSchema(contacts);
export const insertMessageSchema = createInsertSchema(messages);
