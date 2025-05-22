import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MessageReactionProps {
  messageId: string;
  contactId: string;
  existingReaction?: string;
}

const reactions = ["👍", "❤️", "😂", "😮", "😢", "👏"];

export function MessageReaction({ messageId, contactId, existingReaction }: MessageReactionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleReactionSelect = async (reaction: string) => {
    try {
      setIsSubmitting(true);
      setIsOpen(false);
      
      // If clicking the same reaction, remove it (toggle behavior)
      const action = existingReaction === reaction ? "remove" : "add";
      
      await apiRequest("POST", "/api/messages/reaction", { 
        messageId, 
        reaction: action === "remove" ? null : reaction
      });
      
      // Invalidate queries to refresh the message list
      queryClient.invalidateQueries({ queryKey: ["/api/messages", contactId] });
      
    } catch (error) {
      toast({
        title: "Failed to add reaction",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-6 w-6 rounded-full ${existingReaction ? 'bg-gray-100' : ''}`}
          disabled={isSubmitting}
        >
          {existingReaction || "😊"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="flex space-x-2 px-1">
          {reactions.map((reaction) => (
            <button
              key={reaction}
              className="text-xl hover:scale-125 transition-transform p-1 focus:outline-none"
              onClick={() => handleReactionSelect(reaction)}
              disabled={isSubmitting}
            >
              {reaction}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}