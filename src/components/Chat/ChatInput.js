import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ 
  currentInput, 
  setCurrentInput, 
  onSendMessage, 
  isTyping, 
  isGenerating, 
  hasGeneratedContent 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      onSendMessage(currentInput);
    }
  };

  const handleSend = () => {
    if (currentInput.trim()) {
      onSendMessage(currentInput);
    }
  };

  // Não mostrar input se estiver gerando ou já tiver conteúdo gerado
  if (isGenerating || hasGeneratedContent) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex gap-3 items-end">
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua resposta..."
          className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          disabled={isTyping}
        />
        <button
          onClick={handleSend}
          disabled={!currentInput.trim() || isTyping}
          className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;