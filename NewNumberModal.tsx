import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useVirtualNumbers } from "@/hooks/useVirtualNumbers";

interface NewNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewNumberModal({ isOpen, onClose }: NewNumberModalProps) {
  const [areaCode, setAreaCode] = useState("+1");
  const [purpose, setPurpose] = useState("Personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedNumber, setGeneratedNumber] = useState("");
  const { toast } = useToast();
  const { addVirtualNumber } = useVirtualNumbers();

  // Generate a random phone number
  const generatePhoneNumber = () => {
    const randomDigits = () => Math.floor(100 + Math.random() * 900).toString();
    const randomEnd = () => Math.floor(1000 + Math.random() * 9000).toString();
    
    let formattedNumber = "";
    
    if (areaCode === "+1") {
      formattedNumber = `+1 (${randomDigits()}) ${randomDigits()}-${randomEnd()}`;
    } else if (areaCode === "+44") {
      formattedNumber = `+44 ${randomDigits()} ${randomDigits()} ${randomEnd()}`;
    } else if (areaCode === "+61") {
      formattedNumber = `+61 ${randomDigits()} ${randomDigits()} ${randomEnd()}`;
    } else if (areaCode === "+33") {
      formattedNumber = `+33 ${randomDigits()} ${randomDigits()} ${randomEnd()}`;
    } else if (areaCode === "+49") {
      formattedNumber = `+49 ${randomDigits()} ${randomDigits()} ${randomEnd()}`;
    }
    
    setGeneratedNumber(formattedNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!generatedNumber) {
      toast({
        title: "No number generated",
        description: "Please generate a virtual number first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await addVirtualNumber({
        phoneNumber: generatedNumber,
        purpose
      });
      
      toast({
        title: "Number added",
        description: `Your new virtual number ${generatedNumber} has been added`,
      });
      
      // Reset form and close modal
      setGeneratedNumber("");
      onClose();
    } catch (error) {
      toast({
        title: "Failed to add number",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate a number when the modal opens or area code changes
  useState(() => {
    if (isOpen) {
      generatePhoneNumber();
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-semibold text-gray-800">Add Virtual Number</DialogTitle>
          <DialogDescription>
            Create a new virtual phone number for messaging
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="areaCode">Area Code</Label>
              <Select
                value={areaCode}
                onValueChange={(value) => {
                  setAreaCode(value);
                  setTimeout(generatePhoneNumber, 0);
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="areaCode">
                  <SelectValue placeholder="Select area code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+1">+1 (US/Canada)</SelectItem>
                  <SelectItem value="+44">+44 (UK)</SelectItem>
                  <SelectItem value="+61">+61 (Australia)</SelectItem>
                  <SelectItem value="+33">+33 (France)</SelectItem>
                  <SelectItem value="+49">+49 (Germany)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select
                value={purpose}
                onValueChange={setPurpose}
                disabled={isSubmitting}
              >
                <SelectTrigger id="purpose">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Dating">Dating</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {generatedNumber && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                <p className="text-sm text-gray-700 mb-2">Your new virtual number:</p>
                <p className="text-xl font-medium text-gray-900">{generatedNumber}</p>
              </div>
            )}
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={generatePhoneNumber}
              disabled={isSubmitting}
            >
              Generate New Number
            </Button>
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
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Adding...
                </>
              ) : (
                "Add Number"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
