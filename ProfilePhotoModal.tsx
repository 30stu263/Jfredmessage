import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Pre-defined avatar options for user to choose from
const avatarOptions = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
];

export function ProfilePhotoModal({ isOpen, onClose }: ProfilePhotoModalProps) {
  const { user } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(user?.profileImageUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("gallery");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setImageUrl(user?.profileImageUrl || null);
      setSelectedAvatar(null);
      setCustomUrlInput("");
      setUploadedFile(null);
      setUploadPreview(null);
    }
  }, [isOpen, user]);

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    setImageUrl(avatarUrl);
    // Clear other selections
    setUploadPreview(null);
    setUploadedFile(null);
    setCustomUrlInput("");
  };

  const handleCustomUrlSubmit = () => {
    if (!customUrlInput.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a valid image URL",
        variant: "destructive"
      });
      return;
    }
    
    setImageUrl(customUrlInput);
    setSelectedAvatar(null);
    // Clear other selections
    setUploadPreview(null);
    setUploadedFile(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
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

    setUploadedFile(file);
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadPreview(event.target?.result as string);
      setImageUrl(event.target?.result as string);
      // Clear other selections
      setSelectedAvatar(null);
      setCustomUrlInput("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageUrl) {
      toast({
        title: "No image selected",
        description: "Please select or upload a profile image",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      let finalImageUrl = imageUrl;
      
      // If it's a file upload, we need to handle it specially
      if (uploadedFile && uploadPreview) {
        // We're using the Data URL directly for simplicity in this app
        // In a production app, you'd upload to a server
        finalImageUrl = uploadPreview;
      }
      
      // Update user profile image
      await apiRequest("PATCH", "/api/user/profile-image", { profileImageUrl: finalImageUrl });
      
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully"
      });
      
      // Invalidate user data in cache to refresh it
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      onClose();
    } catch (error) {
      toast({
        title: "Failed to update profile photo",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-semibold text-gray-800">Change Profile Photo</DialogTitle>
          <DialogDescription>
            Choose a new profile photo from our gallery, upload from your computer, or enter a URL
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Current/Preview Avatar */}
          <div className="flex justify-center mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={uploadPreview || imageUrl || ""} alt="Profile" className="object-cover" />
              <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </div>
          
          <Tabs defaultValue="gallery" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gallery" className="space-y-4">
              {/* Avatar Gallery */}
              <div className="grid grid-cols-3 gap-3">
                {avatarOptions.map((avatar, index) => (
                  <div 
                    key={index} 
                    className={`cursor-pointer rounded-md overflow-hidden border-2 ${selectedAvatar === avatar ? 'border-primary-600' : 'border-gray-200'}`}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    <img src={avatar} alt={`Avatar option ${index + 1}`} className="w-full h-auto aspect-square object-cover" />
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              {/* File Upload */}
              <div className="space-y-4">
                <Label htmlFor="profile-upload" className="block text-sm font-medium text-gray-700">
                  Upload from your computer
                </Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                  <div className="flex flex-col items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Click to select or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  {uploadPreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">{uploadedFile?.name}</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4">
              {/* Custom URL Input */}
              <div className="space-y-2">
                <Label htmlFor="image-url" className="block text-sm font-medium text-gray-700">
                  Enter image URL
                </Label>
                <div className="flex space-x-2">
                  <input
                    id="image-url"
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/image.jpg"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={handleCustomUrlSubmit}>
                    Set
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Updating...
              </>
            ) : (
              "Update Photo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}