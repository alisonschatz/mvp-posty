import React from 'react';
import { Bot, X } from 'lucide-react';

const ChatHeader = ({ onRestart }) => {
  return (
    <div className="border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Assistente Posty</h3>
          <p className="text-sm text-gray-500">Criando posts incríveis</p>
        </div>
      </div>
      <button
        onClick={onRestart}
        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ChatHeader;