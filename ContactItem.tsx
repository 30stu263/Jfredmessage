import { UserStatus, AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { Contact } from "@shared/schema";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface ContactItemProps {
  contact: Contact;
  lastMessage?: {
    text: string;
    timestamp: Date;
    unreadCount: number;
  };
  onClick: () => void;
  isActive: boolean;
}

export function ContactItem({ contact, lastMessage, onClick, isActive }: ContactItemProps) {
  return (
    <div 
      className={`hover:bg-gray-50 transition cursor-pointer ${isActive ? 'bg-gray-50' : ''}`} 
      onClick={onClick}
    >
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <AvatarWithStatus
          src={contact.avatarUrl}
          alt={contact.name}
          status={contact.status as UserStatus}
          size="lg"
        />
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">{contact.name}</h4>
            {lastMessage && (
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: false })}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 truncate w-44">
              {lastMessage ? lastMessage.text : "No messages yet"}
            </p>
            {lastMessage && lastMessage.unreadCount > 0 && (
              <span className="bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {lastMessage.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
