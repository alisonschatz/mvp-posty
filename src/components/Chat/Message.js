import React, { useState } from 'react';
import { Bot, User, Eye, Copy, Sparkles, RefreshCw } from 'lucide-react';
import PostPreviewModal from '../ui/PostPreviewModal';

const Message = ({
  message,
  selectedTones,
  generatedContent,
  postImage,
  isEditing,
  conversationData,
  imageDescription,
  onUserResponse,
  onConfirmToneSelection,
  onContentChange,
  onEditToggle,
  onImageEdit,
  onImageUpload,
  onCopyContent,
  onDownloadImage,
  onRestart,
  onSuggestImages,
  onImageSelect
}) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const isAI = message.type === 'ai';

  // Renderizar conteúdo da mensagem com formatação
  const renderMessageContent = () => {
    if (!message.content) return null;
    
    return message.content.split('**').map((part, i) => 
      i % 2 === 0 ? (
        <span key={i} className="leading-relaxed">{part}</span>
      ) : (
        <strong key={i} className="font-semibold">{part}</strong>
      )
    );
  };

  // Renderizar opções de resposta
  const renderOptions = () => {
    if (!message.options || message.generatedPost) return null;

    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {message.options.map((option, i) => (
          <button
            key={i}
            onClick={() => onUserResponse(option, true)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
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
            onClick={onConfirmToneSelection}
            className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-all"
          >
            Confirmar ({selectedTones.length})
          </button>
        )}
      </div>
    );
  };

  // Renderizar post gerado
  const renderGeneratedPost = () => {
    if (!message.generatedPost) return null;

    return (
      <div className="mt-6 border-t pt-4">
        {/* Preview compacto */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-gray-900">Seu post está pronto!</h4>
              <p className="text-sm text-gray-600">
                {conversationData?.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Rede Social'} • {generatedContent?.length || 0} caracteres
              </p>
            </div>
            {postImage && (
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                  <img 
                    src={postImage} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Texto truncado */}
          <div className="text-sm text-gray-800 mb-3">
            {generatedContent && generatedContent.length > 150 
              ? generatedContent.substring(0, 150) + '...'
              : generatedContent || 'Conteúdo do post aparecerá aqui'
            }
          </div>
        </div>
        
        {/* Ações principais */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver Preview
          </button>
          <button
            onClick={onCopyContent}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copiar
          </button>
        </div>

        {/* Ação secundária */}
        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-2 bg-gray-500 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          <Sparkles className="w-4 h-4" />
          Criar Novo Post
        </button>

        {/* Modal de Preview */}
        {showPreviewModal && (
          <PostPreviewModal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            platform={conversationData?.platform}
            content={generatedContent}
            image={postImage}
            isEditing={isEditing}
            conversationData={conversationData}
            imageDescription={imageDescription}
            onContentChange={onContentChange}
            onEditToggle={onEditToggle}
            onImageEdit={onImageEdit}
            onImageUpload={onImageUpload}
            onCopyContent={onCopyContent}
            onDownloadImage={onDownloadImage}
            onRestart={onRestart}
            onImageSelect={onImageSelect}
          />
        )}
      </div>
    );
  };

  // Renderizar ações de erro
  const renderErrorActions = () => {
    if (!message.hasError) return null;

    return (
      <button
        onClick={onRestart}
        className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Tentar novamente
      </button>
    );
  };

  return (
    <div className={`flex gap-4 mb-6 ${isAI ? '' : 'flex-row-reverse'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isAI ? 'bg-orange-500' : 'bg-gray-600'
      }`}>
        {isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
      </div>
      
      {/* Conteúdo da mensagem */}
      <div className={`flex-1 ${isAI ? 'mr-16' : 'ml-16'}`}>
        <div className={`rounded-2xl p-4 ${
          isAI 
            ? 'bg-white shadow-sm border border-gray-100' 
            : 'bg-orange-500 text-white ml-auto max-w-xs'
        }`}>
          <div className="prose prose-sm max-w-none">
            {renderMessageContent()}
          </div>

          {renderGeneratedPost()}
          {renderOptions()}
          {renderErrorActions()}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-400 mt-2 ${isAI ? '' : 'text-right'}`}>
          {isAI ? 'Posty' : 'Você'} • agora
        </div>
      </div>
    </div>
  );
};

export default Message;