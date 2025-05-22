import {
  users, virtualNumbers, contacts, messages,
  type User, type VirtualNumber, type Contact, type Message,
  type UpsertUser, type InsertVirtualNumber, type InsertContact, type InsertMessage
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfileImage(userId: string, profileImageUrl: string): Promise<User>;
  
  // Virtual Numbers operations
  getVirtualNumbersByUserId(userId: string): Promise<VirtualNumber[]>;
  createVirtualNumber(virtualNumber: InsertVirtualNumber): Promise<VirtualNumber>;
  setDefaultVirtualNumber(userId: string, numberId: string): Promise<void>;
  
  // Contacts operations
  getContactsByUserId(userId: string): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, data: Partial<Contact>): Promise<Contact>;
  deleteContact(id: string): Promise<void>;
  
  // Messages operations
  getMessagesByContactId(userId: string, contactId: string): Promise<Message[]>;
  getLastMessageByContactId(userId: string, contactId: string): Promise<Message | undefined>;
  getUnreadMessageCount(userId: string, contactId: string): Promise<number>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(userId: string, contactId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  // In-memory storage
  private users: Map<string, User>;
  private virtualNumbers: Map<string, VirtualNumber>;
  private contacts: Map<string, Contact>;
  private messages: Map<string, Message>;

  constructor() {
    this.users = new Map();
    this.virtualNumbers = new Map();
    this.contacts = new Map();
    this.messages = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    
    const user: User = {
      ...userData,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(userData.id, user);
    return user;
  }
  
  async updateUserProfileImage(userId: string, profileImageUrl: string): Promise<User> {
    const user = this.users.get(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser: User = {
      ...user,
      profileImageUrl,
      updatedAt: new Date()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Virtual Numbers operations
  async getVirtualNumbersByUserId(userId: string): Promise<VirtualNumber[]> {
    return Array.from(this.virtualNumbers.values()).filter(
      number => number.userId === userId
    );
  }

  async createVirtualNumber(virtualNumber: InsertVirtualNumber): Promise<VirtualNumber> {
    this.virtualNumbers.set(virtualNumber.id, virtualNumber);
    return virtualNumber;
  }

  async setDefaultVirtualNumber(userId: string, numberId: string): Promise<void> {
    // Set all virtual numbers for the user to non-default
    const userNumbers = await this.getVirtualNumbersByUserId(userId);
    
    for (const number of userNumbers) {
      number.isDefault = number.id === numberId;
      this.virtualNumbers.set(number.id, number);
    }
  }

  // Contacts operations
  async getContactsByUserId(userId: string): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(
      contact => contact.userId === userId
    );
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    this.contacts.set(contact.id, contact);
    return contact;
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    const contact = this.contacts.get(id);
    
    if (!contact) {
      throw new Error("Contact not found");
    }
    
    const updatedContact = { ...contact, ...data };
    this.contacts.set(id, updatedContact);
    
    return updatedContact;
  }

  async deleteContact(id: string): Promise<void> {
    this.contacts.delete(id);
  }

  // Messages operations
  async getMessagesByContactId(userId: string, contactId: string): Promise<Message[]> {
    const conversationId = `${userId}-${contactId}`;
    
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async getLastMessageByContactId(userId: string, contactId: string): Promise<Message | undefined> {
    const messages = await this.getMessagesByContactId(userId, contactId);
    
    if (messages.length === 0) {
      return undefined;
    }
    
    return messages[messages.length - 1];
  }

  async getUnreadMessageCount(userId: string, contactId: string): Promise<number> {
    const conversationId = `${userId}-${contactId}`;
    
    return Array.from(this.messages.values())
      .filter(message => 
        message.conversationId === conversationId && 
        message.receiverId === userId && 
        !message.read
      ).length;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    this.messages.set(message.id, message);
    return message;
  }

  async markMessagesAsRead(userId: string, contactId: string): Promise<void> {
    const conversationId = `${userId}-${contactId}`;
    
    Array.from(this.messages.values())
      .filter(message => 
        message.conversationId === conversationId && 
        message.receiverId === userId &&
        !message.read
      )
      .forEach(message => {
        message.read = true;
        this.messages.set(message.id, message);
      });
  }
}

export const storage = new MemStorage();
