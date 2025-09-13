import React, { useState, useEffect } from 'react';
import { X, Search, Download, ExternalLink, RefreshCw, Loader } from 'lucide-react';
import { suggestImagesForPost, searchImages, downloadImage } from '../../services/unsplashService';

const ImageSelector = ({ conversationData, onImageSelect, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searching, setSearching] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Carregar sugestões iniciais baseadas na conversa
  useEffect(() => {
    loadInitialSuggestions();
  }, [conversationData]);

  const loadInitialSuggestions = async () => {
    setLoading(true);
    try {
      const result = await suggestImagesForPost(conversationData);
      setImages(result.images);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query = searchQuery, page = 1) => {
    if (!query.trim()) return;
    
    setSearching(true);
    try {
      const result = await searchImages(query, page, 9);
      if (page === 1) {
        setImages(result.images);
      } else {
        setImages(prev => [...prev, ...result.images]);
      }
      setTotalPages(result.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !searching) {
      handleSearch(searchQuery, currentPage + 1);
    }
  };

  const handleImageSelect = async (image) => {
    setSelectedImage(image);
    try {
      const imageUrl = await downloadImage(image);
      
      // Converter para blob/base64 para usar no preview
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = () => {
        onImageSelect(reader.result);
        onClose();
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      // Fallback: usar URL diretamente
      onImageSelect(image.urls.regular);
      onClose();
    } finally {
      setSelectedImage(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      handleSearch(searchQuery, 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Escolher Imagem</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Search bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Buscar imagens... (ex: negócios, tecnologia, pessoas)"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => handleSearch(searchQuery, 1)}
              disabled={searching || !searchQuery.trim()}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {searching ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Buscar
            </button>
            <button
              onClick={loadInitialSuggestions}
              disabled={loading}
              className="bg-gray-500 text-white px-4 py-3 rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50"
              title="Sugestões baseadas no seu post"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">Carregando sugestões para seu post...</p>
              </div>
            </div>
          ) : (
            <>
              {images.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Nenhuma imagem encontrada</p>
                  <button
                    onClick={loadInitialSuggestions}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Ver Sugestões
                  </button>
                </div>
              ) : (
                <>
                  {/* Grid de imagens */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="relative group cursor-pointer bg-gray-100 rounded-lg overflow-hidden aspect-square"
                        onClick={() => handleImageSelect(image)}
                      >
                        <img
                          src={image.urls.small}
                          alt={image.alt}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                        
                        {/* Overlay com informações */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-end">
                          <div className="text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-sm font-medium truncate">{image.alt}</p>
                            {!image.isPlaceholder && (
                              <p className="text-xs opacity-75">por {image.user.name}</p>
                            )}
                          </div>
                        </div>

                        {/* Loading overlay quando selecionando */}
                        {selectedImage?.id === image.id && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <Loader className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}

                        {/* Ícone de download */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white rounded-full p-1.5 shadow-lg">
                            <Download className="w-4 h-4 text-gray-700" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botão carregar mais */}
                  {currentPage < totalPages && (
                    <div className="text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={searching}
                        className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                      >
                        {searching ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <RefreshCw className="w-5 h-5" />
                        )}
                        Carregar Mais
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              💡 <strong>Dica:</strong> Use palavras-chave específicas para melhores resultados
            </p>
            <div className="flex items-center gap-2">
              <span>Powered by</span>
              <a 
                href="https://unsplash.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
              >
                Unsplash <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSelector;