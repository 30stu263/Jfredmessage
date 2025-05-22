import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Message } from "@shared/schema";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useMessages(contactId?: string) {
  const { user } = useAuth();
  const [isTyping, setIsTyping] = useState(false);

  // Fetch messages for the selected contact
  const { 
    data: messages = [], 
    isLoading: isLoadingMessages,
    refetch
  } = useQuery<Message[]>({
    queryKey: ["/api/messages", contactId],
    enabled: !!contactId,
  });

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!contactId) return;

    const interval = setInterval(() => {
      refetch();
    }, 3000);

    return () => clearInterval(interval);
  }, [contactId, refetch]);

  // Show typing indicator occasionally for realistic effect
  useEffect(() => {
    if (!contactId) return;

    const randomInterval = Math.floor(Math.random() * 15000) + 5000; // 5-20 seconds
    
    const typingTimeout = setTimeout(() => {
      if (Math.random() > 0.5) { // 50% chance to show typing
        setIsTyping(true);
        
        // Stop typing after 1-3 seconds
        setTimeout(() => {
          setIsTyping(false);
        }, Math.floor(Math.random() * 2000) + 1000);
      }
    }, randomInterval);

    return () => clearTimeout(typingTimeout);
  }, [contactId, messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { 
      text: string; 
      contactId: string; 
      imageUrl?: string;
      audioUrl?: string;
      messageType?: "text" | "image" | "audio"; 
    }) => {
      const res = await apiRequest("POST", "/api/messages", data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", variables.contactId] });
      // Also invalidate the contacts list to update last message preview
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      // Invalidate the last messages map
      queryClient.invalidateQueries({ queryKey: ["/api/messages/last-all"] });
    },
  });

  // Create a map to store last messages for contacts
  const lastMessagesMap = useQuery<Record<string, { lastMessage?: Message; unreadCount: number }>>({
    queryKey: ["/api/messages/last-all"],
    enabled: !!user,
  });

  // Function to get last message for a contact (used in sidebar)
  const getLastMessageForContact = (contactId: string) => {
    // If we're viewing this contact, use the fetched messages
    if (contactId === contactId && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      return {
        text: lastMsg.text,
        timestamp: new Date(lastMsg.timestamp),
        unreadCount: lastMsg.senderId !== user?.id && !lastMsg.read ? 1 : 0
      };
    }
    
    // Otherwise, use the map to get last message
    const contactLastMessage = lastMessagesMap.data?.[contactId];
    
    if (contactLastMessage?.lastMessage) {
      return {
        text: contactLastMessage.lastMessage.text,
        timestamp: new Date(contactLastMessage.lastMessage.timestamp),
        unreadCount: contactLastMessage.unreadCount
      };
    }
    
    return undefined;
  };

  return {
    messages,
    isLoadingMessages,
    isTyping,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    getLastMessageForContact,
  };
}
