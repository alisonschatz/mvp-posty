import React, { useState } from 'react';
import { X, Edit3, Copy, Download, Sparkles, Image, ArrowLeft } from 'lucide-react';
import PostPreview from '../Previews/PostPreview';
import ImageSelector from './ImageSelector';

const PostPreviewModal = ({
  isOpen,
  onClose,
  platform,
  content,
  image,
  isEditing,
  conversationData,
  imageDescription,
  onContentChange,
  onEditToggle,
  onImageEdit,
  onImageUpload,
  onCopyContent,
  onDownloadImage,
  onRestart,
  onImageSelect
}) => {
  const [currentView, setCurrentView] = useState('preview'); // 'preview' ou 'images'
  const [notification, setNotification] = useState('');

  if (!isOpen) return null;

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleImageSelect = (imageUrl) => {
    onImageSelect(imageUrl);
    setCurrentView('preview');
    showNotification('Imagem adicionada!');
  };

  const handleCopyContent = () => {
    onCopyContent();
    showNotification('Conteúdo copiado!');
  };

  const handleDownloadImage = () => {
    onDownloadImage();
    showNotification('Download iniciado!');
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between p-6 border-b">
      <div className="flex items-center gap-4">
        {currentView === 'images' && (
          <button 
            onClick={() => setCurrentView('preview')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {currentView === 'preview' ? 'Preview do Post' : 'Escolher Imagem'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {platform?.replace(/[📸👥💼🐦]/g, '').trim()} • {
              currentView === 'preview' 
                ? 'Como ficará na rede social' 
                : 'Selecione uma imagem para seu post'
            }
          </p>
        </div>
      </div>
      <button 
        onClick={onClose} 
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Fechar"
      >
        <X className="w-6 h-6 text-gray-400" />
      </button>
    </div>
  );

  const renderPreviewView = () => (
    <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
      
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">✅</span>
            <span>{notification}</span>
          </div>
        </div>
      )}
      
      {/* Preview */}
      <div className="mb-6 flex justify-center">
        <PostPreview
          platform={platform}
          content={content}
          image={image}
          isEditing={isEditing}
          onContentChange={onContentChange}
          onImageEdit={onImageEdit}
          onImageUpload={onImageUpload}
        />
      </div>

      {/* Actions */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Ações</h3>
        
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={onEditToggle}
            className="flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? 'Salvar Edição' : 'Editar Texto'}
          </button>
          <button
            onClick={handleCopyContent}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copiar Texto
          </button>
        </div>

        {/* Image Actions */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <button
            onClick={() => setCurrentView('images')}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Image className="w-4 h-4" />
            {image ? 'Trocar Imagem' : 'Escolher Imagem'}
          </button>
          
          {image && (
            <button
              onClick={handleDownloadImage}
              className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar Imagem
            </button>
          )}
        </div>

        {/* Create New Post */}
        <div className="border-t pt-4">
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Criar Novo Post
          </button>
        </div>
      </div>
    </div>
  );

  const renderImagesView = () => (
    <div className="h-[calc(90vh-100px)]">
      <ImageSelector
        conversationData={conversationData}
        generatedContent={imageDescription}
        onImageSelect={handleImageSelect}
        onClose={() => setCurrentView('preview')}
        isEmbedded={true}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {renderHeader()}

        {/* Content based on current view */}
        {currentView === 'preview' && renderPreviewView()}
        {currentView === 'images' && renderImagesView()}

        {/* Footer com dicas */}
        {currentView === 'preview' && (
          <div className="border-t bg-gray-50 p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                💡 Dica: Use as ações acima para personalizar seu post antes de publicar
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PostPreviewModal;