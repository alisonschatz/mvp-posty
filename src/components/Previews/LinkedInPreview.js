import React, { useState } from 'react';
import { ThumbsUp, MessageCircle, Share, MoreHorizontal, Camera, Edit3 } from 'lucide-react';

const LinkedInPreview = ({ content, image, isEditing, onContentChange, onImageEdit, onImageUpload }) => {
  const [likes, setLikes] = useState(Math.floor(Math.random() * 100) + 20);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center p-4">
        <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white font-medium">SP</div>
        <div className="ml-3 flex-1">
          <p className="font-medium text-gray-900">Seu Nome</p>
          <p className="text-sm text-gray-600">Sua Profissão • Empresa</p>
          <div className="flex items-center text-xs text-gray-500 mt-0.5">
            <span>2 min</span><span className="mx-1">•</span><span>🌐</span>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </div>

      <div className="px-4 pb-3">
        {isEditing ? (
          <textarea 
            value={content} 
            onChange={(e) => onContentChange(e.target.value)} 
            className="w-full p-3 border border-gray-200 rounded-lg resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-orange-500" 
          />
        ) : (
          <p className="text-gray-900 leading-relaxed whitespace-pre-line">{content}</p>
        )}
      </div>

      {image ? (
        <div className="relative group">
          <img src={image} alt="Post" className="w-full max-h-64 object-cover" />
          {!isEditing && (
            <button onClick={onImageEdit} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit3 className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : !isEditing && (
        <div onClick={onImageUpload} className="mx-4 mb-3 border border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
          <Camera className="w-6 h-6 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Adicionar mídia</p>
        </div>
      )}

      <div className="border-t border-gray-100">
        <div className="flex items-center px-4 py-2 text-sm text-gray-500">
          <span>{likes} reações • 8 comentários</span>
        </div>
        <div className="border-t border-gray-100 flex">
          <button 
            onClick={() => { 
              setIsLiked(!isLiked); 
              setLikes(prev => isLiked ? prev - 1 : prev + 1); 
            }} 
            className={`flex-1 flex items-center justify-center py-2 transition-colors ${
              isLiked ? 'text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />Curtir
          </button>
          <button className="flex-1 flex items-center justify-center py-2 text-gray-600 hover:bg-gray-50 transition-colors">
            <MessageCircle className="w-4 h-4 mr-2" />Comentar
          </button>
          <button className="flex-1 flex items-center justify-center py-2 text-gray-600 hover:bg-gray-50 transition-colors">
            <Share className="w-4 h-4 mr-2" />Repostar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedInPreview;