import { useState, useEffect } from "react";
import { Contact, VirtualNumber } from "@shared/schema";
import { AvatarWithStatus } from "@/components/ui/avatar-with-status";
import { ContactItem } from "@/components/ContactItem";
import { useContacts } from "@/hooks/useContacts";
import { useAuth } from "@/hooks/useAuth";
import { useVirtualNumbers } from "@/hooks/useVirtualNumbers";
import { useMessages } from "@/hooks/useMessages";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddContactModal } from "@/components/AddContactModal";
import { NewNumberModal } from "@/components/NewNumberModal";
import { ProfilePhotoModal } from "@/components/ProfilePhotoModal";

interface SidebarProps {
  onContactSelect: (contact: Contact) => void;
  selectedContactId?: string;
}

export function Sidebar({ onContactSelect, selectedContactId }: SidebarProps) {
  const { user } = useAuth();
  const { contacts, isLoading: contactsLoading } = useContacts();
  const { activeNumber, virtualNumbers, isLoading: numbersLoading } = useVirtualNumbers();
  const { getLastMessageForContact } = useMessages();
  const [activeTab, setActiveTab] = useState<"chats" | "contacts" | "numbers">("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isNewNumberModalOpen, setIsNewNumberModalOpen] = useState(false);
  const [isProfilePhotoModalOpen, setIsProfilePhotoModalOpen] = useState(false);

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery)
  );

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="w-full md:w-80 xl:w-96 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* User Profile Header */}
      <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative group cursor-pointer" onClick={() => setIsProfilePhotoModalOpen(true)}>
            <AvatarWithStatus
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330"}
              alt={user?.firstName || "User"}
              status="online"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100">
              <i className="ri-camera-line text-white text-sm"></i>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">
              {user?.firstName || "User"} {user?.lastName || ""}
            </h3>
            <div className="flex items-center">
              <span className="text-xs text-gray-500">{activeNumber?.phoneNumber || "No number"}</span>
              <span className="inline-block w-2 h-2 bg-success rounded-full ml-2"></span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsAddContactModalOpen(true)}
            aria-label="Add Contact"
          >
            <i className="ri-add-line text-gray-600 text-xl"></i>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            aria-label="Logout"
          >
            <i className="ri-logout-box-line text-gray-600 text-xl"></i>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <Input
            type="text"
            placeholder="Search conversations"
            className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          className={`flex-1 py-3 text-sm font-medium ${activeTab === "chats" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("chats")}
        >
          Chats
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium ${activeTab === "contacts" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("contacts")}
        >
          Contacts
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium ${activeTab === "numbers" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("numbers")}
          // Open new number modal when clicked
          onDoubleClick={() => setIsNewNumberModalOpen(true)}
        >
          Numbers
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {activeTab === "chats" && (
          <>
            {contactsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map(contact => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  lastMessage={getLastMessageForContact(contact.id)}
                  onClick={() => onContactSelect(contact)}
                  isActive={contact.id === selectedContactId}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="ri-chat-3-line text-4xl mb-2"></i>
                <p>No conversations yet</p>
              </div>
            )}
          </>
        )}

        {activeTab === "contacts" && (
          <>
            {contactsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : filteredContacts.length > 0 ? (
              filteredContacts.map(contact => (
                <div key={contact.id} className="flex items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => onContactSelect(contact)}>
                  <AvatarWithStatus
                    src={contact.avatarUrl}
                    alt={contact.name}
                    status={contact.status as any}
                    size="md"
                  />
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">{contact.name}</h4>
                    <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="ri-contacts-line text-4xl mb-2"></i>
                <p>No contacts found</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setIsAddContactModalOpen(true)}
                >
                  Add Contact
                </Button>
              </div>
            )}
          </>
        )}

        {activeTab === "numbers" && (
          <>
            {numbersLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : virtualNumbers.length > 0 ? (
              <>
                <div className="p-4">
                  <Button 
                    className="w-full"
                    onClick={() => setIsNewNumberModalOpen(true)}
                  >
                    <i className="ri-add-line mr-2"></i>
                    Add New Number
                  </Button>
                </div>
                {virtualNumbers.map(number => (
                  <div key={number.id} className="flex items-center px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <i className="ri-phone-line text-primary-600"></i>
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="font-medium text-gray-900">{number.phoneNumber}</h4>
                      <p className="text-sm text-gray-500">{number.purpose}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="ri-phone-line text-4xl mb-2"></i>
                <p>No virtual numbers yet</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setIsNewNumberModalOpen(true)}
                >
                  Add Number
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-3">
          <button 
            className={`flex flex-col items-center ${activeTab === "chats" ? "text-primary-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("chats")}
          >
            <i className="ri-message-3-line text-xl"></i>
            <span className="text-xs mt-1">Chats</span>
          </button>
          <button 
            className={`flex flex-col items-center ${activeTab === "contacts" ? "text-primary-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("contacts")}
          >
            <i className="ri-contacts-line text-xl"></i>
            <span className="text-xs mt-1">Contacts</span>
          </button>
          <button 
            className={`flex flex-col items-center ${activeTab === "numbers" ? "text-primary-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("numbers")}
          >
            <i className="ri-phone-line text-xl"></i>
            <span className="text-xs mt-1">Numbers</span>
          </button>
          <button 
            className="flex flex-col items-center text-gray-500"
            onClick={handleLogout}
          >
            <i className="ri-logout-box-line text-xl"></i>
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddContactModal 
        isOpen={isAddContactModalOpen} 
        onClose={() => setIsAddContactModalOpen(false)} 
      />
      
      <NewNumberModal 
        isOpen={isNewNumberModalOpen} 
        onClose={() => setIsNewNumberModalOpen(false)} 
      />
      
      <ProfilePhotoModal
        isOpen={isProfilePhotoModalOpen}
        onClose={() => setIsProfilePhotoModalOpen(false)}
      />
    </div>
  );
}
