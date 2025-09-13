import React from 'react';

const Notification = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2">
      <div className="flex items-center space-x-2">
        <span className="text-lg">✅</span>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Notification;