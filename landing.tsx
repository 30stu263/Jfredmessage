import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <>
      <Helmet>
        <title>Welcome to Cloud Messenger</title>
        <meta name="description" content="Communicate securely with virtual phone numbers over WiFi" />
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="container mx-auto px-4 py-12">
          <header className="flex justify-between items-center mb-16">
            <div className="flex items-center">
              <div className="bg-primary-600 text-white p-2 rounded-lg mr-2">
                <i className="ri-message-3-fill text-xl"></i>
              </div>
              <h1 className="text-2xl font-heading font-bold text-gray-900">Cloud Messenger</h1>
            </div>
            <Button onClick={handleLogin}>Log In</Button>
          </header>
          
          <main className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 leading-tight">
                Message securely with virtual phone numbers
              </h2>
              <p className="text-xl text-gray-600">
                Create unlimited virtual phone numbers and connect with anyone without sharing your real contact information.
              </p>
              <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
                <Button size="lg" className="text-lg" onClick={handleLogin}>
                  <i className="ri-login-circle-line mr-2"></i>
                  Get Started
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="bg-primary-600 text-white p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <i className="ri-message-3-fill text-xl"></i>
                    </div>
                    <h3 className="font-medium">Cloud Messenger</h3>
                  </div>
                </div>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden mr-3">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium">Sarah Johnson</h4>
                      <p className="text-xs text-gray-500">+1 (555) 123-4567 · Online</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 h-64 overflow-y-auto">
                  <div className="flex mb-4">
                    <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                      <p>Hey there! How's it going?</p>
                    </div>
                  </div>
                  <div className="flex justify-end mb-4">
                    <div className="bg-primary-600 text-white rounded-lg p-3 max-w-xs shadow-sm">
                      <p>I'm doing great! Just trying out this new messaging app.</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                      <p>It's amazing! I love that we can use virtual numbers.</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex">
                    <input type="text" placeholder="Type a message..." className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-r-lg">
                      <i className="ri-send-plane-fill"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
          
          <div className="mt-24 text-center">
            <h3 className="text-2xl font-heading font-semibold text-gray-900 mb-8">Key Features</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-phone-line text-primary-600 text-xl"></i>
                </div>
                <h4 className="text-xl font-medium mb-2">Virtual Numbers</h4>
                <p className="text-gray-600">Create multiple virtual phone numbers for different purposes</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-lock-line text-primary-600 text-xl"></i>
                </div>
                <h4 className="text-xl font-medium mb-2">Secure Messaging</h4>
                <p className="text-gray-600">End-to-end encryption keeps your conversations private</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-wifi-line text-primary-600 text-xl"></i>
                </div>
                <h4 className="text-xl font-medium mb-2">WiFi Based</h4>
                <p className="text-gray-600">Use anywhere with an internet connection, no carrier required</p>
              </div>
            </div>
          </div>
        </div>
        
        <footer className="mt-24 bg-gray-50 py-8 border-t border-gray-200">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>© 2023 Cloud Messenger. All rights reserved.</p>
            <div className="mt-4">
              <a href="#" className="text-gray-600 hover:text-primary-600 mx-2">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-primary-600 mx-2">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-primary-600 mx-2">Contact Us</a>
            </div>
          </div>
        </footer>
      </div>
      
      <AuthModal isOpen={false} />
    </>
  );
}
