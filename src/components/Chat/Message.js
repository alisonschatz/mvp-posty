import React from 'react';
import { Bot, User, Edit3, Copy, Download, Sparkles, RefreshCw, Image } from 'lucide-react';
import PostPreview from '../Previews/PostPreview';

const Message = ({
  message,
  selectedTones,
  generatedContent,
  postImage,
  isEditing,
  conversationData,
  onUserResponse,
  onConfirmToneSelection,
  onContentChange,
  onEditToggle,
  onImageEdit,
  onImageUpload,
  onCopyContent,
  onDownloadImage,
  onRestart,
  onSuggestImages
}) => {
  const isAI = message.type === 'ai';

  const renderMessageContent = () => {
    return message.content.split('**').map((part, i) => 
      i % 2 === 0 ? (
        <span key={i} className="leading-relaxed">{part}</span>
      ) : (
        <strong key={i} className="font-semibold">{part}</strong>
      )
    );
  };

  const renderOptions = () => {
    if (!message.options || message.generatedPost) return null;

    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {message.options.map((option, i) => (
          <button
            key={i}
            onClick={() => onUserResponse(option, true)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
              message.multiSelect && selectedTones.includes(option)
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option}
          </button>
        ))}
        
        {message.multiSelect && selectedTones.length > 0 && (
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

  const renderGeneratedPost = () => {
    if (!message.generatedPost) return null;

    return (
      <div className="mt-6 border-t pt-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3 text-center">
            Preview - {conversationData.platform?.replace(/[📸👥💼🐦]/g, '').trim()}
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <PostPreview
              platform={conversationData.platform}
              content={generatedContent}
              image={postImage}
              isEditing={isEditing}
              onContentChange={onContentChange}
              onImageEdit={onImageEdit}
              onImageUpload={onImageUpload}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={onEditToggle}
            className="flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? 'Salvar' : 'Editar'}
          </button>
          <button
            onClick={onCopyContent}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            <Copy className="w-4 h-4" />
            Copiar
          </button>
          <button
            onClick={onSuggestImages}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <Image className="w-4 h-4" />
            Sugerir Imagens
          </button>
          {postImage && (
            <button
              onClick={onDownloadImage}
              className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Baixar
            </button>
          )}
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 bg-gray-500 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-sm col-span-2"
          >
            <Sparkles className="w-4 h-4" />
            Novo Post
          </button>
        </div>
      </div>
    );
  };

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
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isAI ? 'bg-orange-500' : 'bg-gray-600'
      }`}>
        {isAI ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
      </div>
      
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
        
        <div className={`text-xs text-gray-400 mt-2 ${isAI ? '' : 'text-right'}`}>
          {isAI ? 'Posty' : 'Você'} • agora
        </div>
      </div>
    </div>
  );
};

export default Message;