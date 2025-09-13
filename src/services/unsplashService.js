// Serviço de integração com Unsplash
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_BASE = 'https://api.unsplash.com';

// Buscar imagens baseadas no conteúdo do post
export const searchImages = async (query, page = 1, perPage = 9) => {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('Chave do Unsplash não configurada, usando imagens placeholder');
      return generatePlaceholderImages(query, perPage);
    }

    const searchQuery = generateSearchQuery(query);
    const response = await fetch(
      `${UNSPLASH_API_BASE}/search/photos?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${perPage}&orientation=squarish`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      images: data.results.map(photo => ({
        id: photo.id,
        urls: {
          thumb: photo.urls.thumb,
          small: photo.urls.small,
          regular: photo.urls.regular,
          full: photo.urls.full
        },
        alt: photo.alt_description || photo.description || searchQuery,
        user: {
          name: photo.user.name,
          username: photo.user.username,
          profile: photo.user.links.html
        },
        downloadUrl: photo.links.download,
        htmlUrl: photo.links.html
      })),
      total: data.total,
      totalPages: data.total_pages
    };
  } catch (error) {
    console.error('Erro ao buscar imagens no Unsplash:', error);
    return generatePlaceholderImages(query, perPage);
  }
};

// Gerar query de busca inteligente baseada no conteúdo
const generateSearchQuery = (content) => {
  // Palavras-chave por categoria
  const keywords = {
    business: ['business', 'office', 'meeting', 'handshake', 'team', 'corporate'],
    technology: ['technology', 'computer', 'smartphone', 'innovation', 'digital'],
    lifestyle: ['lifestyle', 'people', 'happy', 'success', 'motivation'],
    food: ['food', 'restaurant', 'cooking', 'delicious', 'chef'],
    travel: ['travel', 'vacation', 'adventure', 'landscape', 'destination'],
    fitness: ['fitness', 'workout', 'gym', 'health', 'exercise', 'sport'],
    education: ['education', 'learning', 'books', 'student', 'knowledge'],
    nature: ['nature', 'forest', 'mountains', 'ocean', 'landscape'],
    creativity: ['art', 'creative', 'design', 'inspiration', 'colorful'],
    social: ['people', 'community', 'friendship', 'social', 'together']
  };

  const content_lower = content.toLowerCase();
  
  // Detectar categoria baseada no conteúdo
  let detectedCategory = 'lifestyle'; // default
  let maxMatches = 0;
  
  Object.entries(keywords).forEach(([category, words]) => {
    const matches = words.filter(word => content_lower.includes(word)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedCategory = category;
    }
  });

  // Extrair palavras-chave específicas do conteúdo
  const specificKeywords = extractKeywords(content);
  
  // Combinar categoria detectada com palavras específicas
  const categoryKeywords = keywords[detectedCategory];
  const finalQuery = specificKeywords.length > 0 
    ? `${specificKeywords.join(' ')} ${categoryKeywords[0]}` 
    : categoryKeywords[Math.floor(Math.random() * categoryKeywords.length)];

  return finalQuery;
};

// Extrair palavras-chave relevantes do conteúdo
const extractKeywords = (content) => {
  // Palavras irrelevantes a serem ignoradas
  const stopWords = [
    'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das',
    'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem', 'sobre',
    'que', 'quem', 'qual', 'quando', 'onde', 'como', 'por que', 'porque',
    'e', 'ou', 'mas', 'então', 'se', 'caso', 'embora', 'ainda', 'já',
    'muito', 'mais', 'menos', 'bem', 'mal', 'melhor', 'pior', 'grande',
    'pequeno', 'novo', 'velho', 'bom', 'ruim', 'the', 'and', 'or', 'but',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was',
    'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did'
  ];

  // Extrair palavras significativas
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !stopWords.includes(word) &&
      !/^\d+$/.test(word) // Remove números
    );

  // Contar frequência e pegar as mais relevantes
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([word]) => word);
};

// Gerar imagens placeholder quando a API não está disponível
const generatePlaceholderImages = (query, count) => {
  const placeholderTopics = [
    'business-team', 'technology', 'success', 'creativity', 'innovation',
    'marketing', 'social-media', 'growth', 'inspiration', 'motivation'
  ];
  
  const images = [];
  for (let i = 0; i < count; i++) {
    const topic = placeholderTopics[i % placeholderTopics.length];
    const id = `placeholder-${i}`;
    
    images.push({
      id,
      urls: {
        thumb: `https://picsum.photos/150/150?random=${id}`,
        small: `https://picsum.photos/300/300?random=${id}`,
        regular: `https://picsum.photos/600/600?random=${id}`,
        full: `https://picsum.photos/1200/1200?random=${id}`
      },
      alt: `Imagem relacionada a ${query}`,
      user: {
        name: 'Placeholder Image',
        username: 'placeholder',
        profile: '#'
      },
      downloadUrl: `https://picsum.photos/1200/1200?random=${id}`,
      htmlUrl: '#',
      isPlaceholder: true
    });
  }

  return {
    images,
    total: count,
    totalPages: 1
  };
};

// Fazer download de uma imagem (trackear no Unsplash se for real)
export const downloadImage = async (photo) => {
  if (photo.isPlaceholder) {
    // Para placeholders, apenas retorna a URL
    return photo.urls.regular;
  }

  try {
    // Triggerar download tracking no Unsplash
    if (UNSPLASH_ACCESS_KEY && photo.downloadUrl) {
      await fetch(photo.downloadUrl, {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      });
    }
    
    return photo.urls.regular;
  } catch (error) {
    console.error('Erro ao fazer download da imagem:', error);
    return photo.urls.regular;
  }
};

// Sugerir imagens baseadas nos dados da conversa
export const suggestImagesForPost = async (conversationData) => {
  // Construir query baseada no contexto completo
  let searchTerms = [];
  
  // Adicionar palavras do conteúdo principal
  if (conversationData.content) {
    searchTerms.push(conversationData.content);
  }
  
  // Adicionar contexto do objetivo
  if (conversationData.objective) {
    const objectiveKeywords = {
      '💰 Vender produto/serviço': 'product marketing sales business',
      '💬 Aumentar engajamento': 'community social engagement people',
      '📢 Educar audiência': 'education learning knowledge books',
      '✨ Inspirar pessoas': 'inspiration motivation success dreams',
      '🔥 Criar buzz': 'trending viral excitement energy'
    };
    searchTerms.push(objectiveKeywords[conversationData.objective] || '');
  }
  
  // Adicionar contexto da plataforma
  const platformContext = {
    '📸 Instagram': 'aesthetic beautiful lifestyle',
    '👥 Facebook': 'community family friends social',
    '💼 LinkedIn': 'professional business corporate',
    '🐦 Twitter': 'news trending discussion'
  };
  
  if (conversationData.platform) {
    searchTerms.push(platformContext[conversationData.platform] || '');
  }
  
  const finalQuery = searchTerms.join(' ').trim() || 'business success';
  
  return await searchImages(finalQuery, 1, 9);
};