import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
}

export function AuthModal({ isOpen }: AuthModalProps) {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-gray-800">Welcome to Cloud Messenger</DialogTitle>
          <DialogDescription className="text-gray-600">
            Communicate securely with virtual phone numbers over WiFi.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Button className="w-full py-6" onClick={handleLogin}>
            <i className="ri-login-circle-line mr-2 text-xl"></i>
            <span>Log In with Replit</span>
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>By continuing, you agree to our <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
