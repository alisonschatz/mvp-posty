import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
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
        content: "🔮 **Criando sua obra-prima...**\n\nAnalisando suas respostas e criando um post perfeito para você!",
        isGenerating: true
      }]);

      try {
        const result = await generateContent(conversationData);
        
        if (result && typeof result === 'object') {
          const postContent = result.content || '';
          const imgDescription = result.imageDescription || '';
          
          setGeneratedContent(postContent);
          setImageDescription(imgDescription);
          
          console.log('📝 Conteúdo do post:', postContent);
          console.log('🖼️ Descrição da imagem:', imgDescription);
        } else {
          const content = typeof result === 'string' ? result : '';
          setGeneratedContent(content);
          setImageDescription('');
        }
        
        setMessages(prev => [...prev.slice(0, -1), {
          id: Date.now(),
          type: 'ai',
          content: "🎉 **Seu post está pronto!**\n\nOlha só como ficou incrível:",
          generatedPost: true
        }]);
        
        showNotification('Post gerado com sucesso!');
      } catch (error) {
        console.error('Erro ao gerar post:', error);
        setMessages(prev => [...prev.slice(0, -1), {
          id: Date.now(),
          type: 'ai', 
          content: "😅 **Ops!** Algo deu errado... Que tal tentarmos novamente?",
          hasError: true
        }]);
        showNotification('Erro ao gerar post. Tente novamente!');
      } finally {
        setIsGenerating(false);
      }
    }, 2000);
  }, [conversationData, showNotification, simulateTyping]);

  // Handlers de ações
  const handleCopyContent = useCallback(() => {
    navigator.clipboard.writeText(generatedContent);
    showNotification('Conteúdo copiado!');
  }, [generatedContent, showNotification]);

  const handleDownloadImage = useCallback(() => {
    if (postImage) {
      const link = document.createElement('a');
      link.href = postImage;
      link.download = `posty-image-${Date.now()}.jpg`;
      link.click();
      showNotification('Download iniciado!');
    }
  }, [postImage, showNotification]);

  const handleImageSelect = useCallback((imageUrl) => {
    setPostImage(imageUrl);
    setShowImageSelector(false);
    showNotification('Imagem selecionada!');
  }, [showNotification]);

  const restart = useCallback(() => {
    onGoHome();
  }, [onGoHome]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[600px] flex flex-col">
        <ChatHeader onRestart={restart} />
        
        <ChatMessages
          messages={messages}
          isTyping={isTyping}
          selectedTones={selectedTones}
          generatedContent={generatedContent}
          postImage={postImage}
          isEditing={isEditing}
          conversationData={conversationData}
          imageDescription={imageDescription}
          messagesEndRef={messagesEndRef}
          onUserResponse={handleUserResponse}
          onConfirmToneSelection={confirmToneSelection}
          onContentChange={setGeneratedContent}
          onEditToggle={() => setIsEditing(!isEditing)}
          onImageEdit={() => fileInputRef?.current?.click()}
          onImageUpload={() => fileInputRef?.current?.click()}
          onCopyContent={handleCopyContent}
          onDownloadImage={handleDownloadImage}
          onRestart={restart}
          onSuggestImages={() => setShowImageSelector(true)}
          onImageSelect={handleImageSelect}
        />

        <ChatInput
          currentInput={currentInput}
          setCurrentInput={setCurrentInput}
          onSendMessage={(message) => handleUserResponse(message.trim())}
          isTyping={isTyping}
          isGenerating={isGenerating}
          hasGeneratedContent={!!generatedContent}
        />
      </div>

      {/* Image Selector Modal */}
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