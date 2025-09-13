import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Sparkles, Camera, Palette, Zap, Loader } from 'lucide-react';

// Importações dos serviços atualizados
import { suggestPexelsImages, searchPexelsImages } from '../../services/pexelsService';
import { suggestImagesForPost as suggestUnsplashImages, searchUnsplashImages } from '../../services/unsplashService';
import { generateDalleImages } from '../../services/dalleService';

const ImageSelector = ({ conversationData, generatedContent, onImageSelect, onClose }) => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('photos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Estados para fotos
  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [activeSource, setActiveSource] = useState('all');
  
  // Estados para IA
  const [aiImages, setAiImages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Função para carregar fotos sugeridas baseadas na descrição da imagem
  const loadSuggestedPhotos = useCallback(async () => {
    setPhotosLoading(true);
    try {
      console.log('🔍 Buscando fotos inteligentes baseadas no conteúdo...');
      
      const contextData = {
        ...conversationData,
        generatedContent: generatedContent
      };
      
      const [pexelsResult, unsplashResult] = await Promise.allSettled([
        suggestPexelsImages(contextData),
        suggestUnsplashImages(contextData)
      ]);

      let allPhotos = [];
      
      if (pexelsResult.status === 'fulfilled' && pexelsResult.value.images) {
        allPhotos.push(...pexelsResult.value.images.slice(0, 6));
        console.log('✅ Pexels encontrou', pexelsResult.value.images.length, 'imagens');
      }
      
      if (unsplashResult.status === 'fulfilled' && unsplashResult.value.images) {
        allPhotos.push(...unsplashResult.value.images.slice(0, 3));
        console.log('✅ Unsplash encontrou', unsplashResult.value.images.length, 'imagens');
      }
      
      setPhotos(allPhotos);
      console.log('🎯 Total de fotos carregadas:', allPhotos.length);
      
      if (generatedContent?.imageDescription) {
        console.log('📝 Descrição da imagem utilizada:', generatedContent.imageDescription);
      }
      
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
      setPhotos([]);
    } finally {
      setPhotosLoading(false);
    }
  }, [conversationData, generatedContent]);

  // Carregar fotos iniciais
  useEffect(() => {
    loadSuggestedPhotos();
  }, [loadSuggestedPhotos]);

  // Buscar fotos manualmente
  const searchPhotos = async () => {
    if (!searchQuery.trim()) return;
    
    setPhotosLoading(true);
    try {
      console.log('🔍 Busca manual:', searchQuery);
      
      const [pexelsResult, unsplashResult] = await Promise.allSettled([
        searchPexelsImages(searchQuery, 1, 6),
        searchUnsplashImages(searchQuery, 1, 6)
      ]);

      let searchResults = [];
      
      if (pexelsResult.status === 'fulfilled' && pexelsResult.value.images) {
        searchResults.push(...pexelsResult.value.images);
      }
      
      if (unsplashResult.status === 'fulfilled' && unsplashResult.value.images) {
        searchResults.push(...unsplashResult.value.images);
      }
      
      setPhotos(searchResults);
      console.log('🔍 Resultados da busca manual:', searchResults.length);
    } catch (error) {
      console.error('Erro na busca:', error);
      setPhotos([]);
    } finally {
      setPhotosLoading(false);
    }
  };

  // Gerar imagens com IA
  const generateAI = async () => {
    setAiLoading(true);
    try {
      console.log('🤖 Gerando imagens com DALL-E...');
      const result = await generateDalleImages(
        generatedContent,
        conversationData,
        2
      );
      
      setAiImages(result.images || []);
      console.log('✅ Geradas', result.images?.length || 0, 'imagens com IA');
    } catch (error) {
      console.error('Erro ao gerar IA:', error);
      setAiImages([]);
    } finally {
      setAiLoading(false);
    }
  };

  // Selecionar imagem
  const selectImage = async (image) => {
    setSelectedImage(image);
    try {
      const response = await fetch(image.urls.regular || image.urls.small);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onload = () => {
        onImageSelect(reader.result);
        onClose();
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      onImageSelect(image.urls.regular || image.urls.small);
      onClose();
    } finally {
      setSelectedImage(null);
    }
  };

  // Filtrar fotos por fonte
  const filteredPhotos = photos.filter(photo => {
    if (activeSource === 'all') return true;
    return photo.source === activeSource;
  });

  // Obter badge da fonte
  const getSourceBadge = (source) => {
    const badges = {
      pexels: { text: 'Pexels', color: 'bg-green-500' },
      unsplash: { text: 'Unsplash', color: 'bg-blue-500' },
      dalle: { text: 'DALL-E', color: 'bg-purple-500' }
    };
    return badges[source] || { text: 'Foto', color: 'bg-gray-500' };
  };

  // Handler para Enter key na busca
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchPhotos();
    }
  };

  const isUsingSmartDescription = generatedContent?.imageDescription;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Escolher Imagem</h2>
            {isUsingSmartDescription && (
              <p className="text-sm text-green-600 mt-1">
                ✨ Sugestões baseadas na descrição inteligente do seu post
              </p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'photos'
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-5 h-5 inline mr-2" />
            Fotos Reais (Grátis)
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'ai'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            Gerar com IA (Pago)
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Aba Fotos */}
          {activeTab === 'photos' && (
            <div>
              {/* Busca e filtros */}
              <div className="mb-6">
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Buscar fotos... (ex: negócios, tecnologia)"
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                  </div>
                  <button
                    onClick={searchPhotos}
                    disabled={photosLoading || !searchQuery.trim()}
                    className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {photosLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={loadSuggestedPhotos}
                    disabled={photosLoading}
                    className="bg-gray-500 text-white px-4 py-3 rounded-xl hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Sugestões baseadas no conteúdo"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>

                {/* Filtros de fonte */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveSource('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSource === 'all'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setActiveSource('pexels')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSource === 'pexels'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Camera className="w-4 h-4 inline mr-1" />
                    Pexels
                  </button>
                  <button
                    onClick={() => setActiveSource('unsplash')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSource === 'unsplash'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Palette className="w-4 h-4 inline mr-1" />
                    Unsplash
                  </button>
                </div>
              </div>

              {/* Grid de fotos */}
              <div className="max-h-96 overflow-y-auto">
                {photosLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Loader className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                      <p className="text-gray-600">Buscando fotos...</p>
                    </div>
                  </div>
                ) : filteredPhotos.length === 0 ? (
                  <div className="text-center py-16">
                    <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Nenhuma foto encontrada</p>
                    <button
                      onClick={loadSuggestedPhotos}
                      className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Carregar Sugestões
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredPhotos.map((photo) => {
                      const badge = getSourceBadge(photo.source);
                      return (
                        <div
                          key={photo.id}
                          onClick={() => selectImage(photo)}
                          className="relative group cursor-pointer bg-gray-100 rounded-lg overflow-hidden aspect-square hover:shadow-lg transition-all"
                        >
                          <img
                            src={photo.urls.small || photo.urls.thumb}
                            alt={photo.alt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          
                          {/* Badge */}
                          <div className="absolute top-2 left-2">
                            <span className={`${badge.color} text-white text-xs px-2 py-1 rounded-full`}>
                              {badge.text}
                            </span>
                          </div>

                          {/* Loading */}
                          {selectedImage?.id === photo.id && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <Loader className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}

                          {/* Info hover */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-end">
                            <div className="text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                              <p className="text-sm truncate">{photo.alt}</p>
                              <p className="text-xs opacity-75">por {photo.user?.name}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Aba IA */}
          {activeTab === 'ai' && (
            <div>
              {/* Info e geração */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Imagens Personalizadas com IA</h3>
                  <p className="text-gray-600 mb-4">
                    DALL-E criará imagens únicas baseadas no seu conteúdo.
                    <br />
                    <span className="font-medium text-purple-600">Custo: ~$0.08 por geração (2 imagens)</span>
                  </p>
                  {isUsingSmartDescription && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-green-700">
                        🎯 Descrição inteligente detectada - IA gerará imagens altamente relevantes!
                      </p>
                    </div>
                  )}
                  <button
                    onClick={generateAI}
                    disabled={aiLoading}
                    className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto transition-colors"
                  >
                    {aiLoading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Gerar Imagens (~$0.08)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Grid de imagens IA */}
              <div className="max-h-96 overflow-y-auto">
                {aiLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Loader className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
                      <p className="text-gray-600">Gerando imagens com IA...</p>
                      <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns segundos</p>
                    </div>
                  </div>
                ) : aiImages.length === 0 ? (
                  <div className="text-center py-16">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Nenhuma imagem gerada ainda</p>
                    <p className="text-sm text-gray-400">Clique no botão acima para gerar</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 justify-center max-w-lg mx-auto">
                    {aiImages.map((image) => (
                      <div
                        key={image.id}
                        onClick={() => selectImage(image)}
                        className="relative group cursor-pointer bg-gray-100 rounded-lg overflow-hidden aspect-square hover:shadow-lg transition-all"
                      >
                        <img
                          src={image.urls.regular}
                          alt={image.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        
                        {/* Badge IA */}
                        <div className="absolute top-2 left-2">
                          <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            🤖 IA
                          </span>
                        </div>

                        {/* Loading */}
                        {selectedImage?.id === image.id && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <Loader className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}

                        {/* Info hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-end">
                          <div className="text-white p-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                            <p className="text-sm">✨ Gerada por IA</p>
                            <p className="text-xs opacity-75">Personalizada para seu conteúdo</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>💡 {activeTab === 'photos' ? 'Sugestões otimizadas com base no seu conteúdo' : 'IA cria imagens únicas para seu conteúdo'}</p>
            <div className="flex items-center gap-4 text-xs">
              <span>Powered by</span>
              {activeTab === 'photos' ? (
                <>
                  <span className="text-green-600">Pexels</span>
                  <span className="text-blue-600">Unsplash</span>
                </>
              ) : (
                <span className="text-purple-600">DALL-E</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImageSelector;