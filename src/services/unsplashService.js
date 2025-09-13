// Serviço Unsplash usando searchKeywords
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_BASE = 'https://api.unsplash.com';

// Buscar imagens no Unsplash
export const searchUnsplashImages = async (query, page = 1, perPage = 9) => {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('Chave do Unsplash não configurada');
      return generatePlaceholderImages(query, perPage);
    }

    console.log('🔍 Buscando no Unsplash:', query);

    const response = await fetch(
      `${UNSPLASH_API_BASE}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=squarish&order_by=relevance`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API Error: ${response.status}`);
    }

    const data = await response.json();
    
    const images = data.results.map(photo => ({
      id: `unsplash-${photo.id}`,
      urls: {
        thumb: photo.urls.thumb,
        small: photo.urls.small,
        regular: photo.urls.regular,
        full: photo.urls.full
      },
      alt: photo.alt_description || photo.description || `Foto relacionada a ${query}`,
      user: {
        name: photo.user.name,
        username: photo.user.username,
        profile: photo.user.links.html
      },
      downloadUrl: photo.links.download,
      htmlUrl: photo.links.html,
      source: 'unsplash'
    }));

    console.log('✅ Unsplash encontrou', images.length, 'imagens');

    return {
      images,
      total: data.total,
      totalPages: data.total_pages
    };

  } catch (error) {
    console.error('Erro ao buscar no Unsplash:', error);
    return generatePlaceholderImages(query, perPage);
  }
};

// Sugerir imagens usando searchKeywords
export const suggestImagesForPost = async (conversationData) => {
  // Extrair searchKeywords do conteúdo gerado
  const searchKeywords = conversationData.generatedContent || '';
  
  let searchQuery = '';
  
  if (searchKeywords && typeof searchKeywords === 'string') {
    searchQuery = processSearchKeywords(searchKeywords);
    console.log('🎯 Unsplash - Usando searchKeywords:', searchQuery);
  } else {
    searchQuery = generateFallbackQuery(conversationData);
    console.log('🔄 Unsplash - Query fallback:', searchQuery);
  }
  
  return await searchUnsplashImages(searchQuery, 1, 6);
};

// Processar searchKeywords para query otimizada
const processSearchKeywords = (keywords) => {
  if (!keywords || typeof keywords !== 'string') {
    return 'business professional';
  }
  
  // Limpar e processar keywords
  const cleanKeywords = keywords
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
  
  if (!cleanKeywords) {
    return 'business professional';
  }
  
  // Dividir em palavras e filtrar muito curtas
  const words = cleanKeywords.split(' ').filter(word => word.length > 2);
  
  // Usar até 3 palavras para melhor precisão na busca
  if (words.length <= 3) {
    return words.join(' ');
  }
  
  // Pegar as 3 palavras mais relevantes (primeiras)
  return words.slice(0, 3).join(' ');
};

// Gerar query fallback baseada na conversa
const generateFallbackQuery = (conversationData) => {
  const platform = conversationData.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Instagram';
  const objective = conversationData.objective || '';
  
  // Mapear objetivos para queries Unsplash
  const objectiveQueries = {
    'Vender produto/serviço': 'business presentation professional',
    'Aumentar engajamento': 'creative workspace lifestyle',
    'Educar audiência': 'learning education office',
    'Inspirar pessoas': 'success motivation workspace',
    'Criar buzz': 'modern trendy creative'
  };
  
  // Mapear plataformas para contextos visuais
  const platformQueries = {
    'Instagram': 'aesthetic lifestyle',
    'Facebook': 'authentic social',
    'LinkedIn': 'professional corporate',
    'Twitter': 'simple clean'
  };
  
  const baseQuery = objectiveQueries[objective] || 'business office professional';
  const platformContext = platformQueries[platform] || 'professional';
  
  return `${baseQuery} ${platformContext}`;
};

// Gerar imagens placeholder
const generatePlaceholderImages = (query, count) => {
  console.log('📦 Gerando placeholders para:', query);
  
  const images = Array.from({ length: count }, (_, i) => ({
    id: `placeholder-${Date.now()}-${i}`,
    urls: {
      thumb: `https://picsum.photos/150/150?random=${query}${i}`,
      small: `https://picsum.photos/300/300?random=${query}${i}`,
      regular: `https://picsum.photos/600/600?random=${query}${i}`,
      full: `https://picsum.photos/1200/1200?random=${query}${i}`
    },
    alt: `Imagem placeholder relacionada a ${query}`,
    user: {
      name: 'Placeholder Image',
      username: 'placeholder',
      profile: '#'
    },
    downloadUrl: `https://picsum.photos/1200/1200?random=${query}${i}`,
    htmlUrl: '#',
    source: 'unsplash',
    isPlaceholder: true
  }));

  return {
    images,
    total: count,
    totalPages: 1
  };
};

// Download com tracking
export const downloadUnsplashImage = async (photo) => {
  if (photo.isPlaceholder) {
    return photo.urls.regular;
  }

  try {
    if (UNSPLASH_ACCESS_KEY && photo.downloadUrl) {
      await fetch(photo.downloadUrl, {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      });
    }
    
    return photo.urls.regular;
  } catch (error) {
    console.error('Erro no download:', error);
    return photo.urls.regular;
  }
};