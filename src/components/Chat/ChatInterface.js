import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, User, X, Send, Eye, Copy, Sparkles, Image, Edit3 } from 'lucide-react';
import PostPreviewModal from '../UI/PostPreviewModal';
import ImageSelector from '../UI/ImageSelector';
import { conversationFlow } from '../../utils/conversationFlow';
import { generateContent } from '../../services/aiService';

const ChatInterface = ({ onGoHome, showNotification, fileInputRef }) => {
  // Estados principais
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTones, setSelectedTones] = useState([]);
  
  // Estados do post gerado
  const [generatedContent, setGeneratedContent] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [postImage, setPostImage] = useState(null);
  
  // Estados de interface
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  
  // Estados da conversa
  const [conversationData, setConversationData] = useState({});
  
  const messagesEndRef = useRef(null);

  // Auto scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Upload de imagem
  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPostImage(e.target.result);
        showNotification('Imagem adicionada!');
      };
      reader.readAsDataURL(file);
    }
  }, [showNotification]);

  // Configurar file input
  useEffect(() => {
    if (fileInputRef?.current) {
      fileInputRef.current.onchange = handleImageUpload;
    }
  }, [fileInputRef, handleImageUpload]);

  // Inicializar chat
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([{ id: Date.now(), ...conversationFlow[0] }]);
      }, 800);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Simular digitação
  const simulateTyping = useCallback((callback, delay = 800) => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
    return timer;
  }, []);

  // Processar resposta do usuário
  const handleUserResponse = useCallback((response, isOption = false) => {
    const newUserMessage = { 
      id: Date.now(), 
      type: 'user', 
      content: response 
    };
    const currentQuestion = conversationFlow[currentStep];
    
    // Atualizar dados da conversa
    const newData = { ...conversationData };
    if (currentQuestion) {
      newData[currentQuestion.id] = response;
      setConversationData(newData);
    }

    // Lidar com seleção múltipla de tons
    if (currentQuestion?.id === 'tone' && currentQuestion.multiSelect) {
      if (!isOption) {
        setMessages(prev => [...prev, newUserMessage]);
        proceedToNextStep();
      } else {
        const toneText = response;
        let newTones = selectedTones.includes(toneText) 
          ? selectedTones.filter(t => t !== toneText)
          : [...selectedTones, toneText];
        setSelectedTones(newTones);
        newData[currentQuestion.id] = newTones.join(', ');
        setConversationData(newData);
        return;
      }
    } else {
      setMessages(prev => [...prev, newUserMessage]);
      if (currentQuestion?.id === 'additional' && response === "Pular essa etapa") {
        newData[currentQuestion.id] = '';
        setConversationData(newData);
      }
      proceedToNextStep();
    }
    
    setCurrentInput('');
  }, [conversationData, currentStep, selectedTones]);

  // Confirmar seleção de tons
  const confirmToneSelection = useCallback(() => {
    if (selectedTones.length > 0) {
      const response = `Selecionei: ${selectedTones.join(', ')}`;
      const newUserMessage = { 
        id: Date.now(), 
        type: 'user', 
        content: response 
      };
      setMessages(prev => [...prev, newUserMessage]);
      proceedToNextStep();
    }
  }, [selectedTones]);

  // Avançar para próximo passo
  const proceedToNextStep = useCallback(() => {
    const nextStep = currentStep + 1;
    
    if (nextStep >= conversationFlow.length) {
      generatePost();
      return;
    }

    setCurrentStep(nextStep);
    
    simulateTyping(() => {
      const nextMessage = { 
        id: Date.now(), 
        ...conversationFlow[nextStep] 
      };
      setMessages(prev => [...prev, nextMessage]);
    });
  }, [currentStep, simulateTyping]);

  // Gerar post
  const generatePost = useCallback(async () => {
    setIsGenerating(true);
    
    simulateTyping(async () => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        content: "Criando sua obra-prima...\n\nAnalisando suas respostas e criando um post perfeito para você!",
        isGenerating: true
      }]);

      try {
        const result = await generateContent(conversationData);
        
        if (result && typeof result === 'object') {
          const postContent = result.content || '';
          const imgDescription = result.imageDescription || '';
          
          setGeneratedContent(postContent);
          setImageDescription(imgDescription);
        } else {
          const content = typeof result === 'string' ? result : '';
          setGeneratedContent(content);
          setImageDescription('');
        }
        
        setMessages(prev => [...prev.slice(0, -1), {
          id: Date.now(),
          type: 'ai',
          content: "Seu post está pronto!\n\nOlha só como ficou incrível:",
          generatedPost: true
        }]);
        
        showNotification('Post gerado com sucesso!');
      } catch (error) {
        console.error('Erro ao gerar post:', error);
        setMessages(prev => [...prev.slice(0, -1), {
          id: Date.now(),
          type: 'ai', 
          content: "Ops! Algo deu errado... Que tal tentarmos novamente?",
          hasError: true
        }]);
        showNotification('Erro ao gerar post. Tente novamente!');
      } finally {
        setIsGenerating(false);
      }
    }, 2000);
  }, [conversationData, showNotification, simulateTyping]);

  // Handlers
  const handleCopyContent = useCallback(() => {
    navigator.clipboard.writeText(generatedContent);
    showNotification('Conteúdo copiado!');
  }, [generatedContent, showNotification]);

  const handleImageSelect = useCallback((imageUrl) => {
    setPostImage(imageUrl);
    setShowImageSelector(false);
    showNotification('Imagem selecionada!');
  }, [showNotification]);

  const restart = useCallback(() => {
    onGoHome();
  }, [onGoHome]);

  // Renderizar mensagem individual
  const renderMessage = (message) => {
    const isAI = message.type === 'ai';
    
    return (
      <div key={message.id} className={`flex gap-2 mb-3 ${!isAI ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isAI ? 'bg-orange-500' : 'bg-gray-600'
        }`}>
          {isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
        </div>
        
        {/* Conteúdo */}
        <div className={`flex-1 min-w-0 ${!isAI ? 'mr-2' : ''}`}>
          <div className={`p-3 rounded-2xl ${
            isAI 
              ? 'bg-white shadow-sm border border-gray-100' 
              : 'bg-orange-500 text-white max-w-[85%] ml-auto'
          }`}>
            {/* Texto da mensagem */}
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content.split('**').map((part, i) => 
                i % 2 === 0 ? (
                  <span key={i}>{part}</span>
                ) : (
                  <strong key={i} className="font-semibold">{part}</strong>
                )
              )}
            </div>

            {/* Opções de resposta */}
            {message.options && !message.generatedPost && (
              <div className="mt-3 flex flex-wrap gap-1">
                {message.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleUserResponse(option, true)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                      message.multiSelect && selectedTones?.includes(option)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
                
                {message.multiSelect && selectedTones?.length > 0 && (
                  <button
                    onClick={confirmToneSelection}
                    className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-medium hover:bg-orange-600 transition-all"
                  >
                    Confirmar ({selectedTones.length})
                  </button>
                )}
              </div>
            )}

            {/* Post gerado */}
            {message.generatedPost && generatedContent && (
              <div className="mt-4 border-t pt-4">
                {/* Preview compacto */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">Post pronto!</p>
                      <p className="text-xs text-gray-600">
                        {conversationData?.platform?.replace(/[📸👥💼🐦]/g, '').trim()} • {generatedContent.length} chars
                      </p>
                    </div>
                    {postImage && (
                      <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden ml-2 flex-shrink-0">
                        <img src={postImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  
                  {/* Texto truncado */}
                  <div className="text-xs text-gray-800 line-clamp-3">
                    {generatedContent.length > 120 
                      ? generatedContent.substring(0, 120) + '...'
                      : generatedContent
                    }
                  </div>
                </div>
                
                {/* Ações */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowPreviewModal(true)}
                      className="flex items-center justify-center gap-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                    <button
                      onClick={handleCopyContent}
                      className="flex items-center justify-center gap-1 bg-orange-500 text-white py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors text-xs"
                    >
                      <Copy className="w-3 h-3" />
                      Copiar
                    </button>
                  </div>
                  
                  <button
                    onClick={restart}
                    className="w-full flex items-center justify-center gap-1 bg-gray-500 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    Novo Post
                  </button>
                </div>
              </div>
            )}

            {/* Ações de erro */}
            {message.hasError && (
              <button
                onClick={restart}
                className="mt-3 bg-orange-500 text-white py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1 text-xs"
              >
                <Sparkles className="w-3 h-3" />
                Tentar novamente
              </button>
            )}
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-gray-400 mt-1 ${!isAI ? 'text-right' : ''}`}>
            {isAI ? 'Posty' : 'Você'} • agora
          </div>
        </div>
      </div>
    );
  };

  // Indicador de digitação
  const renderTypingIndicator = () => (
    <div className="flex gap-2 mb-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Assistente Posty</h3>
            <p className="text-xs text-gray-500">Criando posts incríveis</p>
          </div>
        </div>
        <button
          onClick={restart}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 pb-safe">
        {messages.map(renderMessage)}
        
        {isTyping && renderTypingIndicator()}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isGenerating && !generatedContent && (
        <div className="bg-white border-t border-gray-200 p-3 pb-safe flex-shrink-0">
          <div className="flex gap-2 items-end">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && currentInput.trim() && handleUserResponse(currentInput.trim())}
              placeholder="Digite sua resposta..."
              className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm min-w-0"
              disabled={isTyping}
            />
            <button
              onClick={() => currentInput.trim() && handleUserResponse(currentInput.trim())}
              disabled={!currentInput.trim() || isTyping}
              className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showPreviewModal && (
        <PostPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          platform={conversationData.platform}
          content={generatedContent}
          image={postImage}
          isEditing={isEditing}
          conversationData={conversationData}
          imageDescription={imageDescription}
          onContentChange={setGeneratedContent}
          onEditToggle={() => setIsEditing(!isEditing)}
          onImageEdit={() => fileInputRef?.current?.click()}
          onImageUpload={() => fileInputRef?.current?.click()}
          onCopyContent={handleCopyContent}
          onDownloadImage={() => {
            if (postImage) {
              const link = document.createElement('a');
              link.href = postImage;
              link.download = `posty-image-${Date.now()}.jpg`;
              link.click();
              showNotification('Download iniciado!');
            }
          }}
          onRestart={restart}
          onImageSelect={handleImageSelect}
        />
      )}

      {showImageSelector && (
        <ImageSelector
          conversationData={conversationData}
          generatedContent={imageDescription}
          onImageSelect={handleImageSelect}
          onClose={() => setShowImageSelector(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface;