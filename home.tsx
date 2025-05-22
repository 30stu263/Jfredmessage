import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatView } from "@/components/ChatView";
import { Contact } from "@shared/schema";
import { useContacts } from "@/hooks/useContacts";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet";

export default function Home() {
  const { user } = useAuth();
  const { contacts } = useContacts();
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);
  const [isMobileViewChat, setIsMobileViewChat] = useState(false);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    // On mobile, show the chat view when a contact is selected
    if (window.innerWidth < 768) {
      setIsMobileViewChat(true);
    }
  };

  const handleBackToContacts = () => {
    setIsMobileViewChat(false);
  };

  return (
    <>
      <Helmet>
        <title>Cloud Messenger</title>
        <meta name="description" content="Communicate securely with virtual phone numbers" />
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      </Helmet>
      
      <div className="h-screen flex flex-col">
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          <div className={`${isMobileViewChat ? 'hidden md:block' : 'block'} md:w-80 xl:w-96 h-full`}>
            <Sidebar
              onContactSelect={handleContactSelect}
              selectedContactId={selectedContact?.id}
            />
          </div>
          
          <div className={`${isMobileViewChat ? 'block' : 'hidden md:flex'} flex-1 h-full`}>
            <ChatView
              selectedContact={selectedContact}
              onBack={handleBackToContacts}
            />
          </div>
        </div>
      </div>
    </>
  );
}
