import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ImageSelector from '../ui/ImageSelector';
import { conversationFlow } from '../../utils/conversationFlow';
import { generateContent } from '../../services/aiService';

const ChatInterface = ({ onGoHome, showNotification, fileInputRef }) => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTones, setSelectedTones] = useState([]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationData, setConversationData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(scrollToBottom, [messages]);

  // Função de upload de imagem
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

  // Configurar o file input
  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = handleImageUpload;
    }
  }, [fileInputRef, handleImageUpload]);

  // Inicializar chat
  useEffect(() => {
    simulateTyping(() => {
      setMessages([{ id: Date.now(), ...conversationFlow[0] }]);
    }, 500);
  }, []);

  const simulateTyping = (callback, delay = 800) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleUserResponse = (response, isOption = false) => {
    const newUserMessage = { id: Date.now(), type: 'user', content: response };
    const currentQuestion = conversationFlow[currentStep];
    
    const newData = { ...conversationData };
    if (currentQuestion) {
      newData[currentQuestion.id] = response;
      setConversationData(newData);
    }

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
  };

  const confirmToneSelection = () => {
    if (selectedTones.length > 0) {
      const response = `Selecionei: ${selectedTones.join(', ')}`;
      const newUserMessage = { id: Date.now(), type: 'user', content: response };
      setMessages(prev => [...prev, newUserMessage]);
      proceedToNextStep();
    }
  };

  const proceedToNextStep = () => {
    const nextStep = currentStep + 1;
    
    if (nextStep >= conversationFlow.length) {
      generatePost();
      return;
    }

    setCurrentStep(nextStep);
    
    simulateTyping(() => {
      const nextMessage = { id: Date.now(), ...conversationFlow[nextStep] };
      setMessages(prev => [...prev, nextMessage]);
    });
  };

  const generatePost = async () => {
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
        
        // Separar corretamente o conteúdo e a descrição
        if (result && typeof result === 'object') {
          const postContent = result.content || '';
          const imgDescription = result.imageDescription || '';
          
          // Armazenar separadamente
          setGeneratedContent(postContent);
          setImageDescription(imgDescription);
          
          console.log('📝 Conteúdo do post:', postContent);
          console.log('🖼️ Descrição da imagem:', imgDescription);
        } else {
          // Fallback se não for objeto
          const content = typeof result === 'string' ? result : '';
          setGeneratedContent(content);
          setImageDescription('');
        }
        
        setMessages(prev => [...prev.slice(0, -1), {
          id: Date.now(),
          type: 'ai',
          content: "🎉 **Seu post está pronto!**\n\nOlha só como ficou incrível:",
          generatedPost: true // Sinaliza que tem post gerado
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
  };

  const restart = () => {
    onGoHome();
  };

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
          messagesEndRef={messagesEndRef}
          onUserResponse={handleUserResponse}
          onConfirmToneSelection={confirmToneSelection}
          onContentChange={setGeneratedContent}
          onEditToggle={() => setIsEditing(!isEditing)}
          onImageEdit={() => fileInputRef.current?.click()}
          onImageUpload={() => fileInputRef.current?.click()}
          onCopyContent={() => {
            navigator.clipboard.writeText(generatedContent);
            showNotification('Conteúdo copiado!');
          }}
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
          onSuggestImages={() => setShowImageSelector(true)}
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
          generatedContent={imageDescription} // Passa APENAS a descrição da imagem
          onImageSelect={(imageUrl) => {
            setPostImage(imageUrl);
            showNotification('Imagem adicionada!');
            setShowImageSelector(false);
          }}
          onClose={() => setShowImageSelector(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface;