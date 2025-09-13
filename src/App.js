import React, { useState, useRef } from 'react';
import HomeSection from './components/Home/HomeSection';
import ChatInterface from './components/Chat/ChatInterface';
import Notification from './components/ui/Notification';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' ou 'chat'
  const [notification, setNotification] = useState('');
  const fileInputRef = useRef(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 2000);
  };

  const startChat = () => {
    setCurrentView('chat');
  };

  const goHome = () => {
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <main className="max-w-6xl mx-auto px-6 py-12">
        {currentView === 'home' ? (
          <HomeSection onStartChat={startChat} />
        ) : (
          <ChatInterface 
            onGoHome={goHome}
            showNotification={showNotification}
            fileInputRef={fileInputRef}
          />
        )}
      </main>

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />

      {/* Notification component */}
      <Notification message={notification} />
    </div>
  );
}

export default App;