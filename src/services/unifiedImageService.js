// Serviço unificado de imagens - Unsplash + Pexels + DALL-E
import { suggestImagesForPost as getUnsplashImages, searchImages as searchUnsplash } from './unsplashService';
import { searchPexelsImages, getCuratedPexelsImages } from './pexelsService';
import { generateDalleImages } from './dalleService';

// Buscar imagens de múltiplas fontes com estratégia inteligente
export const searchAllSources = async (query, conversationData, generatedContent) => {
  console.log('🔍 Buscando imagens em múltiplas fontes para:', query);
  
  try {
    // Executar buscas em paralelo
    const [unsplashResults, pexelsResults, dalleResults] = await Promise.allSettled([
      getUnsplashImages({ ...conversationData, generatedContent }),
      searchPexelsImages(query, 1, 6),
      generateDalleImages(generatedContent || conversationData.content, conversationData, 2)
    ]);

    // Processar resultados
    let allImages = [];
    
    // DALL-E primeiro (mais relevante)
    if (dalleResults.status === 'fulfilled' && dalleResults.value.images.length > 0) {
      allImages.push(...dalleResults.value.images);
      console.log('✅ DALL-E:', dalleResults.value.images.length, 'imagens geradas');
    }
    
    // Pexels (boa qualidade)
    if (pexelsResults.status === 'fulfilled' && pexelsResults.value.images.length > 0) {
      allImages.push(...pexelsResults.value.images.slice(0, 4));
      console.log('✅ Pexels:', pexelsResults.value.images.length, 'imagens encontradas');
    }
    
    // Unsplash (complementar)
    if (unsplashResults.status === 'fulfilled' && unsplashResults.value.images.length > 0) {
      allImages.push(...unsplashResults.value.images.slice(0, 3));
      console.log('✅ Unsplash:', unsplashResults.value.images.length, 'imagens encontradas');
    }

    // Organizar por relevância (DALL-E > Pexels > Unsplash)
    const organizedImages = organizeImagesByRelevance(allImages, query);
    
    return {
      images: organizedImages.slice(0, 9), // Máximo 9 imagens
      total: organizedImages.length,
      totalPages: 1,
      sources: {
        dalle: dalleResults.status === 'fulfilled' ? dalleResults.value.images.length : 0,
        pexels: pexelsResults.status === 'fulfilled' ? pexelsResults.value.images.length : 0,
        unsplash: unsplashResults.status === 'fulfilled' ? unsplashResults.value.images.length : 0
      }
    };
  } catch (error) {
    console.error('Erro ao buscar imagens de múltiplas fontes:', error);
    return { images: [], total: 0, totalPages: 0, sources: {} };
  }
};

// Buscar apenas em uma fonte específica
export const searchSpecificSource = async (source, query, conversationData, generatedContent) => {
  switch (source) {
    case 'dalle':
      return await generateDalleImages(generatedContent || conversationData.content, conversationData, 3);
    
    case 'pexels':
      return await searchPexelsImages(query, 1, 9);
    
    case 'unsplash':
      return await getUnsplashImages({ ...conversationData, generatedContent });
    
    default:
      return await searchAllSources(query, conversationData, generatedContent);
  }
};

// Organizar imagens por relevância e fonte
const organizeImagesByRelevance = (images, query) => {
  // Pontuação por fonte (DALL-E tem prioridade)
  const sourceScores = {
    'dalle': 100,
    'pexels': 80,
    'unsplash': 60
  };

  // Adicionar score baseado na fonte
  const scoredImages = images.map(image => ({
    ...image,
    relevanceScore: sourceScores[image.source] || 50
  }));

  // Ordenar por score (DALL-E primeiro)
  return scoredImages.sort((a, b) => b.relevanceScore - a.relevanceScore);
};

// Sugerir imagens com estratégia híbrida
export const getSmartImageSuggestions = async (conversationData, generatedContent) => {
  console.log('🧠 Gerando sugestões inteligentes de imagens...');
  
  // Analisar conteúdo para determinar melhor estratégia
  const contentAnalysis = analyzeContentForImageStrategy(generatedContent || conversationData.content);
  console.log('📊 Análise do conteúdo:', contentAnalysis);
  
  // Escolher estratégia baseada na análise
  if (contentAnalysis.shouldUseAI) {
    console.log('🤖 Estratégia: Priorizar DALL-E para conteúdo específico');
    return await searchSpecificSource('dalle', contentAnalysis.searchQuery, conversationData, generatedContent);
  } else if (contentAnalysis.isGeneric) {
    console.log('📸 Estratégia: Usar fontes reais para conteúdo genérico');
    const pexelsResults = await searchSpecificSource('pexels', contentAnalysis.searchQuery, conversationData, generatedContent);
    const unsplashResults = await searchSpecificSource('unsplash', contentAnalysis.searchQuery, conversationData, generatedContent);
    
    return {
      images: [...pexelsResults.images.slice(0, 5), ...unsplashResults.images.slice(0, 4)],
      total: pexelsResults.images.length + unsplashResults.images.length,
      totalPages: 1
    };
  } else {
    console.log('🌟 Estratégia: Combinar todas as fontes');
    return await searchAllSources(contentAnalysis.searchQuery, conversationData, generatedContent);
  }
};

// Analisar conteúdo para determinar estratégia de busca
const analyzeContentForImageStrategy = (content) => {
  if (!content) {
    return {
      searchQuery: 'business professional',
      shouldUseAI: false,
      isGeneric: true
    };
  }

  const content_lower = content.toLowerCase();
  
  // Conceitos que se beneficiam de IA generativa
  const aiConcepts = [
    'futuro', 'inovação disruptiva', 'transformação digital', 'revolução',
    'conceito abstrato', 'visualização de dados', 'inteligência artificial',
    'realidade virtual', 'blockchain', 'metaverso', 'cripto'
  ];
  
  // Conceitos genéricos que têm boas fotos reais
  const genericConcepts = [
    'escritório', 'reunião', 'apresentação', 'equipe', 'trabalho',
    'pessoas', 'networking', 'evento', 'conferência', 'treinamento'
  ];
  
  const shouldUseAI = aiConcepts.some(concept => content_lower.includes(concept));
  const isGeneric = genericConcepts.some(concept => content_lower.includes(concept));
  
  // Extrair query baseada no conteúdo
  const searchQuery = extractSearchQuery(content);
  
  return {
    searchQuery,
    shouldUseAI,
    isGeneric,
    hasSpecificConcepts: !isGeneric && !shouldUseAI
  };
};

// Extrair query de busca do conteúdo
const extractSearchQuery = (content) => {
  // Palavras-chave importantes para busca
  const importantWords = [
    'tecnologia', 'negócios', 'marketing', 'vendas', 'equipe', 'liderança',
    'inovação', 'crescimento', 'sucesso', 'produtividade', 'estratégia',
    'educação', 'treinamento', 'desenvolvimento', 'carreira', 'profissional'
  ];
  
  const content_lower = content.toLowerCase();
  const foundWords = importantWords.filter(word => content_lower.includes(word));
  
  if (foundWords.length > 0) {
    return foundWords.slice(0, 2).join(' '); // Máximo 2 palavras
  }
  
  // Fallback para palavras genéricas de negócios
  return 'business professional';
};

// Função principal para o ImageSelector
export const suggestImagesForPost = async (conversationData, generatedContent) => {
  return await getSmartImageSuggestions(conversationData, generatedContent);
};

// Buscar imagens (mantém compatibilidade)
export const searchImages = async (query, page = 1, perPage = 9) => {
  // Priorizar Pexels para buscas manuais
  const pexelsResults = await searchPexelsImages(query, page, Math.ceil(perPage / 2));
  const unsplashResults = await searchUnsplash(query, page, Math.floor(perPage / 2));
  
  return {
    images: [...pexelsResults.images, ...unsplashResults.images],
    total: pexelsResults.total + unsplashResults.total,
    totalPages: Math.max(pexelsResults.totalPages, unsplashResults.totalPages)
  };
};

// Download de imagem (compatível com todas as fontes)
export const downloadImage = async (photo) => {
  try {
    if (photo.source === 'dalle') {
      // DALL-E images podem ser baixadas diretamente
      return photo.urls.regular;
    } else if (photo.source === 'pexels') {
      // Pexels permite download direto
      return photo.downloadUrl;
    } else {
      // Unsplash - usar serviço original
      const { downloadImage: unsplashDownload } = await import('./unsplashService');
      return await unsplashDownload(photo);
    }
  } catch (error) {
    console.error('Erro ao fazer download da imagem:', error);
    return photo.urls.regular;
  }
};