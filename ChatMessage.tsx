import { AvatarWithStatus, UserStatus } from "@/components/ui/avatar-with-status";
import { Message } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";
import { MessageReaction } from "@/components/MessageReaction";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckCheck, Check, Clock, MoreVertical, Mic } from "lucide-react";
import { AudioMessage } from "@/components/AudioMessage";

interface ChatMessageProps {
  message: Message;
  isOutgoing: boolean;
  contactAvatar?: string;
  contactName?: string;
  contactId?: string;
  onDelete?: (messageId: string) => void;
}

export function ChatMessage({ 
  message, 
  isOutgoing, 
  contactAvatar, 
  contactName,
  contactId,
  onDelete 
}: ChatMessageProps) {
  const [showOptions, setShowOptions] = useState(false);
  
  // Parse message timestamp
  const timestamp = new Date(message.timestamp);
  
  // Get delivery status icon
  const getDeliveryStatus = () => {
    if (isOutgoing) {
      if (message.read) {
        return <CheckCheck className="w-4 h-4 text-success" />; // Read
      } else if (message.delivered) {
        return <CheckCheck className="w-4 h-4 text-gray-400" />; // Delivered
      } else if (message.sent) {
        return <Check className="w-4 h-4 text-gray-400" />; // Sent
      } else {
        return <Clock className="w-4 h-4 text-gray-400" />; // Sending
      }
    }
    return null;
  };

  if (isOutgoing) {
    return (
      <div className="group flex flex-row-reverse mb-4 relative">
        <div className="max-w-xs sm:max-w-md">
          <div 
            className="relative bg-primary-600 message-bubble-outgoing shadow-sm p-3 rounded-lg"
            onMouseEnter={() => setShowOptions(true)}
            onMouseLeave={() => setShowOptions(false)}
          >
            {message.imageUrl && (
              <img 
                src={message.imageUrl} 
                alt="Message attachment" 
                className="w-full h-auto rounded mb-2" 
              />
            )}
            
            {message.audioUrl && (
              <div className="mb-2 bg-primary-700 rounded p-1">
                <AudioMessage audioUrl={message.audioUrl} />
              </div>
            )}
            
            {/* Display text only if it's not an auto-generated message for media */}
            {(!message.audioUrl || !message.text.startsWith("🎤")) && 
             (!message.imageUrl || !message.text.startsWith("📷")) && (
              <p className="text-white">{message.text}</p>
            )}
            
            {/* Reaction display */}
            {message.reaction && (
              <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
                <div className="bg-white rounded-full p-1 shadow-md">
                  <span className="text-sm">{message.reaction}</span>
                </div>
              </div>
            )}
            
            {/* Message options */}
            {showOptions && contactId && (
              <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <div className="flex flex-col space-y-1">
                      <Button variant="ghost" size="sm" className="justify-start" onClick={() => onDelete?.(message.id)}>
                        Delete Message
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          
          <div className="flex justify-end items-center mt-1 space-x-1">
            {contactId && <MessageReaction messageId={message.id} contactId={contactId} existingReaction={message.reaction} />}
            <span className="text-xs text-gray-500">
              {format(timestamp, "h:mm a")}
            </span>
            {getDeliveryStatus()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex mb-4 relative">
      {contactAvatar && (
        <AvatarWithStatus
          src={contactAvatar}
          alt={contactName || "Contact"}
          status={"online" as UserStatus}
          size="sm"
        />
      )}
      <div className="max-w-xs sm:max-w-md">
        <div 
          className="relative bg-white message-bubble-incoming shadow-sm p-3 rounded-lg"
          onMouseEnter={() => setShowOptions(true)}
          onMouseLeave={() => setShowOptions(false)}
        >
          {message.imageUrl && (
            <img 
              src={message.imageUrl} 
              alt="Message attachment" 
              className="w-full h-auto rounded mb-2" 
            />
          )}
          
          {message.audioUrl && (
            <div className="mb-2 bg-gray-100 rounded p-1">
              <AudioMessage audioUrl={message.audioUrl} />
            </div>
          )}
          
          {/* Display text only if it's not an auto-generated message for media */}
          {(!message.audioUrl || !message.text.startsWith("🎤")) && 
           (!message.imageUrl || !message.text.startsWith("📷")) && (
            <p className="text-gray-800">{message.text}</p>
          )}
          
          {/* Reaction display */}
          {message.reaction && (
            <div className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4">
              <div className="bg-white rounded-full p-1 shadow-md">
                <span className="text-sm">{message.reaction}</span>
              </div>
            </div>
          )}
          
          {/* Message options */}
          {showOptions && contactId && (
            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="flex flex-col space-y-1">
                    <Button variant="ghost" size="sm" className="justify-start" onClick={() => onDelete?.(message.id)}>
                      Delete Message
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        
        <div className="flex items-center mt-1 space-x-1 ml-2">
          {contactId && <MessageReaction messageId={message.id} contactId={contactId} existingReaction={message.reaction} />}
          <span className="text-xs text-gray-500">
            {format(timestamp, "h:mm a")}
          </span>
        </div>
      </div>
    </div>
  );
}

export function DateSeparator({ date }: { date: Date }) {
  return (
    <div className="flex justify-center my-4">
      <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
        {format(date, "MMMM d, yyyy")}
      </span>
    </div>
  );
}

export function TypingIndicator({ contactAvatar, contactName }: { contactAvatar: string, contactName: string }) {
  return (
    <div className="flex mb-4">
      <AvatarWithStatus
        src={contactAvatar}
        alt={contactName}
        status={"online" as UserStatus}
        size="sm"
      />
      <div className="bg-white message-bubble-incoming shadow-sm py-3 px-5 rounded-lg inline-flex">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
    </div>
  );
}
