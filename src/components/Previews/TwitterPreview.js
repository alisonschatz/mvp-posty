import React, { useState } from 'react';
import { Heart, MessageCircle, RefreshCw, Share, Camera, Edit3 } from 'lucide-react';

const TwitterPreview = ({ content, image, isEditing, onContentChange, onImageEdit, onImageUpload }) => {
  const [likes, setLikes] = useState(Math.floor(Math.random() * 200) + 30);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-medium">SP</div>
          <div className="flex-1">
            <div className="flex items-center space-x-1">
              <p className="font-medium text-gray-900">Seu Nome</p>
              <p className="text-gray-500">@seuperfil</p>
              <span className="text-gray-500">•</span>
              <p className="text-gray-500 text-sm">2min</p>
            </div>
            
            <div className="mt-2">
              {isEditing ? (
                <textarea 
                  value={content} 
                  onChange={(e) => onContentChange(e.target.value)} 
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-orange-500" 
                />
              ) : (
                <p className="text-gray-900 leading-relaxed whitespace-pre-line">{content}</p>
              )}
            </div>

            {image && (
              <div className="mt-3 relative group">
                <img src={image} alt="Tweet" className="w-full rounded-xl max-h-64 object-cover border border-gray-100" />
                {!isEditing && (
                  <button onClick={onImageEdit} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {!image && !isEditing && (
              <div onClick={onImageUpload} className="mt-3 border border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                <Camera className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Adicionar mídia</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 max-w-xs">
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                <MessageCircle className="w-4 h-4" /><span className="text-sm">12</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
                <RefreshCw className="w-4 h-4" /><span className="text-sm">5</span>
              </button>
              <button 
                onClick={() => { 
                  setIsLiked(!isLiked); 
                  setLikes(prev => isLiked ? prev - 1 : prev + 1); 
                }} 
                className={`flex items-center space-x-2 transition-colors ${
                  isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{likes}</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                <Share className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwitterPreview;