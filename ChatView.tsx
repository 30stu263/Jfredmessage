import { useState, useRef, useEffect } from "react";
import { Contact, Message } from "@shared/schema";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { ChatMessage, DateSeparator, TypingIndicator } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "@/hooks/useMessages";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { VoiceMessageRecorder } from "@/components/VoiceMessageRecorder";
import { 
  Image, 
  Smile, 
  Send, 
  Paperclip, 
  X,
  Phone, 
  Video, 
  Info
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface ChatViewProps {
  selectedContact?: Contact;
  onBack: () => void;
}

export function ChatView({ selectedContact, onBack }: ChatViewProps) {
  const { user } = useAuth();
  const { messages, sendMessage, isLoadingMessages, isTyping } = useMessages(selectedContact?.id);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if ((!messageText.trim() && !imagePreview) || !selectedContact) return;
    
    sendMessage({
      text: messageText || "📷 Image", // Use a placeholder text for image-only messages
      contactId: selectedContact.id,
      imageUrl: imagePreview
    });
    
    // Reset state
    setMessageText("");
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc)",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedImage(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleVoiceMessageSend = async (audioBlob: Blob) => {
    if (!selectedContact) return;
    
    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      
      await sendMessage({
        text: "🎤 Voice message",
        contactId: selectedContact.id,
        audioUrl: base64data,
        messageType: "audio"
      });
    };
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    // In a real app, you would call an API to delete the message
    toast({
      title: "Message deleted",
      description: "The message has been removed",
    });
  };

  // Empty state when no contact is selected
  if (!selectedContact) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="bg-primary-50 p-6 rounded-full inline-block mb-6">
            <i className="ri-message-3-line text-5xl text-primary-600"></i>
          </div>
          <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-3">Start a conversation</h2>
          <p className="text-gray-600 mb-8">Select a contact to start messaging or create a new conversation.</p>
          <Button className="px-5 py-3 flex items-center justify-center mx-auto">
            <i className="ri-add-line mr-2"></i>
            <span>New Message</span>
          </Button>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  
  messages.forEach(message => {
    const date = new Date(message.timestamp);
    const dateStr = format(date, "yyyy-MM-dd");
    
    if (!groupedMessages[dateStr]) {
      groupedMessages[dateStr] = [];
    }
    
    groupedMessages[dateStr].push(message);
  });

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button className="md:hidden p-2 mr-2 rounded-full hover:bg-gray-100" onClick={onBack}>
            <i className="ri-arrow-left-line text-gray-600"></i>
          </button>
          <AvatarWithStatus
            src={selectedContact.avatarUrl}
            alt={selectedContact.name}
            status={selectedContact.status as any}
          />
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{selectedContact.name}</h3>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">{selectedContact.phoneNumber}</span>
              <span className="inline-block w-2 h-2 bg-success rounded-full ml-2"></span>
              <span className="text-xs text-gray-500 ml-1">
                {selectedContact.status === "online" ? "Online" : 
                 selectedContact.status === "away" ? "Away" : "Offline"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <i className="ri-phone-line text-gray-600 text-xl"></i>
          </Button>
          <Button variant="ghost" size="icon">
            <i className="ri-vidicon-line text-gray-600 text-xl"></i>
          </Button>
          <Button variant="ghost" size="icon">
            <i className="ri-information-line text-gray-600 text-xl"></i>
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 chat-bg scrollbar-hide">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <div className="text-center">
              <i className="ri-chat-new-line text-5xl mb-2"></i>
              <p>No messages yet. Start a conversation!</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateStr, dateMessages]) => {
            const messageDate = new Date(dateStr);
            let dateLabel = format(messageDate, "MMMM d, yyyy");
            
            if (isToday(messageDate)) {
              dateLabel = "Today";
            } else if (isYesterday(messageDate)) {
              dateLabel = "Yesterday";
            }
            
            return (
              <div key={dateStr}>
                <DateSeparator date={messageDate} />
                
                {dateMessages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isOutgoing={message.senderId === user?.id}
                    contactAvatar={selectedContact.avatarUrl}
                    contactName={selectedContact.name}
                  />
                ))}
              </div>
            );
          })
        )}
        
        {isTyping && <TypingIndicator contactAvatar={selectedContact.avatarUrl} contactName={selectedContact.name} />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="bg-gray-50 border-t border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Image attached</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full"
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative w-24 h-24 rounded-md overflow-hidden">
            <img 
              src={imagePreview} 
              alt="Selected" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
      
      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        {isRecordingVoice ? (
          <div className="flex items-center justify-between">
            <VoiceMessageRecorder 
              onSendVoiceMessage={handleVoiceMessageSend}
              isSubmitting={false}
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsRecordingVoice(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Smile className="h-5 w-5 text-gray-600" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="grid grid-cols-8 gap-2">
                  {["😊", "😂", "❤️", "👍", "🔥", "🎉", "😢", "😡",
                    "🤔", "👀", "🙏", "👏", "🥳", "😍", "🤮", "👋"].map(emoji => (
                    <button
                      key={emoji}
                      className="text-xl hover:bg-gray-100 p-1 rounded transition-colors"
                      onClick={() => setMessageText(prev => prev + emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover open={isAttachmentMenuOpen} onOpenChange={setIsAttachmentMenuOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Paperclip className="h-5 w-5 text-gray-600" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="flex flex-col space-y-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsAttachmentMenuOpen(false);
                    }}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    Image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </div>
              </PopoverContent>
            </Popover>
            
            <div className="flex-1 relative">
              <Textarea
                placeholder="Type a message..."
                className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 resize-none"
                rows={1}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  minHeight: "42px",
                  maxHeight: "120px"
                }}
              />
            </div>
            
            {messageText.trim() || imagePreview ? (
              <Button 
                className="ml-2 p-3 rounded-full" 
                onClick={handleSendMessage}
              >
                <Send className="h-5 w-5" />
              </Button>
            ) : (
              <div className="ml-2">
                <VoiceMessageRecorder 
                  onSendVoiceMessage={handleVoiceMessageSend}
                  isSubmitting={false}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
