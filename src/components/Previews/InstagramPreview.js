import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal, Camera, Edit3 } from 'lucide-react';

const InstagramPreview = ({ content, image, isEditing, onContentChange, onImageEdit, onImageUpload }) => {
  const [likes, setLikes] = useState(Math.floor(Math.random() * 500) + 100);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center p-4 border-b border-gray-50">
        <div className="w-8 h-8 bg-gradient-to-tr from-purple-400 via-pink-400 to-orange-400 rounded-full p-0.5">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-tr from-purple-400 via-pink-400 to-orange-400 rounded-full"></div>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className="font-medium text-sm text-gray-900">seu_perfil</p>
          <p className="text-xs text-gray-500">2 min</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </div>

      <div className="relative bg-gray-50" style={{aspectRatio: '1/1'}}>
        {image ? (
          <div className="relative group h-full">
            <img src={image} alt="Post" className="w-full h-full object-cover" />
            {!isEditing && (
              <button onClick={onImageEdit} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="w-3 h-3" />
              </button>
            )}
          </div>
        ) : (
          <div onClick={onImageUpload} className="h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
            <Camera className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">Adicionar foto</p>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Heart 
              className={`w-6 h-6 cursor-pointer ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
              onClick={() => {
                setIsLiked(!isLiked);
                setLikes(prev => isLiked ? prev - 1 : prev + 1);
              }}
            />
            <MessageCircle className="w-6 h-6 text-gray-700" />
            <Share className="w-6 h-6 text-gray-700" />
          </div>
          <Bookmark className="w-6 h-6 text-gray-700" />
        </div>
        
        <p className="font-medium text-sm text-gray-900 mb-2">{likes.toLocaleString()} curtidas</p>
        
        <div className="text-sm text-gray-900">
          <span className="font-medium">seu_perfil</span>{' '}
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full mt-2 p-2 border border-gray-200 rounded-lg resize-none min-h-[80px] text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          ) : (
            <span className="whitespace-pre-line">{content}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstagramPreview;