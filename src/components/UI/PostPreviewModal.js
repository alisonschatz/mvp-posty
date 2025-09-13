import React from 'react';
import { X, Edit3, Copy, Download, Sparkles, Image, RefreshCw } from 'lucide-react';
import PostPreview from '../Previews/PostPreview';

const PostPreviewModal = ({
  isOpen,
  onClose,
  platform,
  content,
  image,
  isEditing,
  onContentChange,
  onEditToggle,
  onImageEdit,
  onImageUpload,
  onCopyContent,
  onDownloadImage,
  onRestart,
  onSuggestImages
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Preview do Post</h2>
            <p className="text-sm text-gray-600 mt-1">
              {platform?.replace(/[📸👥💼🐦]/g, '').trim()} • Como ficará na rede social
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          
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
                onClick={onCopyContent}
                className="flex items-center justify-center gap-2 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copiar Texto
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              <button
                onClick={onSuggestImages}
                className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Image className="w-4 h-4" />
                Escolher/Gerar Imagens
              </button>
              
              {image && (
                <button
                  onClick={onDownloadImage}
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

        {/* Footer com dicas */}
        <div className="border-t bg-gray-50 p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              💡 Dica: O preview mostra como seu post aparecerá na rede social
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PostPreviewModal;