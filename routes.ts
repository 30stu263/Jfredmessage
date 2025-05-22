import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // User profile routes
  app.patch('/api/user/profile-image', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { profileImageUrl } = req.body;
      
      if (!profileImageUrl) {
        return res.status(400).json({ message: "Profile image URL is required" });
      }
      
      const updatedUser = await storage.updateUserProfileImage(userId, profileImageUrl);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile image:", error);
      res.status(500).json({ message: "Failed to update profile image" });
    }
  });

  // Virtual numbers routes
  app.get('/api/virtual-numbers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const numbers = await storage.getVirtualNumbersByUserId(userId);
      res.json(numbers);
    } catch (error) {
      console.error("Error fetching virtual numbers:", error);
      res.status(500).json({ message: "Failed to fetch virtual numbers" });
    }
  });

  app.post('/api/virtual-numbers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { phoneNumber, purpose } = req.body;

      if (!phoneNumber || !purpose) {
        return res.status(400).json({ message: "Phone number and purpose are required" });
      }

      // Check if this is the first number, make it default if so
      const existingNumbers = await storage.getVirtualNumbersByUserId(userId);
      const isDefault = existingNumbers.length === 0;

      const virtualNumber = await storage.createVirtualNumber({
        id: uuidv4(),
        userId,
        phoneNumber,
        purpose,
        isDefault,
        createdAt: new Date(),
      });

      res.status(201).json(virtualNumber);
    } catch (error) {
      console.error("Error creating virtual number:", error);
      res.status(500).json({ message: "Failed to create virtual number" });
    }
  });

  app.post('/api/virtual-numbers/:id/set-default', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      await storage.setDefaultVirtualNumber(userId, id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default virtual number:", error);
      res.status(500).json({ message: "Failed to set default virtual number" });
    }
  });

  // Contacts routes
  app.get('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getContactsByUserId(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, phoneNumber } = req.body;

      if (!name || !phoneNumber) {
        return res.status(400).json({ message: "Name and phone number are required" });
      }

      // Generate random avatar URL from one of these unsplash photos
      const avatarUrls = [
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
      ];
      
      // Generate random status
      const statuses = ["online", "offline", "away"];
      
      const contact = await storage.createContact({
        id: uuidv4(),
        userId,
        name,
        phoneNumber,
        avatarUrl: avatarUrls[Math.floor(Math.random() * avatarUrls.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: new Date(),
      });

      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.patch('/api/contacts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const updateData = req.body;

      const contact = await storage.getContact(id);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      if (contact.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this contact" });
      }

      const updatedContact = await storage.updateContact(id, updateData);
      res.json(updatedContact);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.delete('/api/contacts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;

      const contact = await storage.getContact(id);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      
      if (contact.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this contact" });
      }

      await storage.deleteContact(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting contact:", error);
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Messages routes
  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contactId } = req.query;

      if (!contactId) {
        return res.status(400).json({ message: "Contact ID is required" });
      }

      const messages = await storage.getMessagesByContactId(userId, contactId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(userId, contactId);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get('/api/messages/last/:contactId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contactId } = req.params;

      const lastMessage = await storage.getLastMessageByContactId(userId, contactId);
      const unreadCount = await storage.getUnreadMessageCount(userId, contactId);
      
      res.json({ lastMessage, unreadCount });
    } catch (error) {
      console.error("Error fetching last message:", error);
      res.status(500).json({ message: "Failed to fetch last message" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { text, contactId, imageUrl } = req.body;

      if (!text || !contactId) {
        return res.status(400).json({ message: "Text and contact ID are required" });
      }

      // Create outgoing message
      const outgoingMessage = await storage.createMessage({
        id: uuidv4(),
        conversationId: `${userId}-${contactId}`,
        senderId: userId,
        receiverId: contactId,
        text,
        imageUrl,
        timestamp: new Date(),
        read: false,
      });

      // Simulate a response after a short delay (1-3 seconds)
      setTimeout(async () => {
        try {
          // Get response templates
          const responseTemplates = [
            "Got it, thanks!",
            "Sounds good to me.",
            "I'll get back to you on that.",
            "Thanks for letting me know.",
            "Perfect, that works for me.",
            "I appreciate the update.",
            "Let me think about it.",
            "I'll check my schedule and confirm.",
            "Great! Looking forward to it.",
            "That's interesting. Tell me more."
          ];
          
          // Create incoming message with a random response
          await storage.createMessage({
            id: uuidv4(),
            conversationId: `${userId}-${contactId}`,
            senderId: contactId,
            receiverId: userId,
            text: responseTemplates[Math.floor(Math.random() * responseTemplates.length)],
            timestamp: new Date(Date.now() + 1000),
            read: false,
          });
        } catch (error) {
          console.error("Error creating simulated response:", error);
        }
      }, Math.floor(Math.random() * 2000) + 1000);

      res.status(201).json(outgoingMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
