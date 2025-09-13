// Serviço Unsplash - Otimizado para palavras-chave
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

// Sugerir imagens baseadas em palavras-chave
export const suggestImagesForPost = async (conversationData) => {
  const imageKeywords = conversationData.generatedContent;
  
  // Converter palavras-chave para query de busca
  let searchQuery = '';
  
  if (imageKeywords && typeof imageKeywords === 'string') {
    searchQuery = convertKeywordsToSearchQuery(imageKeywords);
    console.log('🎯 Unsplash - Busca baseada em keywords:', searchQuery);
  } else {
    searchQuery = generateFallbackQuery(conversationData);
    console.log('🔄 Unsplash - Busca fallback:', searchQuery);
  }
  
  return await searchUnsplashImages(searchQuery, 1, 6);
};

// Converter palavras-chave em query de busca otimizada
const convertKeywordsToSearchQuery = (keywords) => {
  if (!keywords || typeof keywords !== 'string') {
    return 'business professional';
  }
  
  // Dividir palavras-chave em array
  const keywordArray = keywords
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);
  
  // Mapear keywords para termos de busca melhores
  const keywordMappings = {
    // Workspace
    'workspace': 'office workspace',
    'office': 'modern office',
    'desk': 'office desk',
    'laptop': 'laptop computer',
    'computer': 'computer workspace',
    
    // Profissional
    'professional': 'business professional',
    'business': 'business office',
    'corporate': 'corporate office',
    'meeting': 'business meeting',
    
    // Estilo
    'modern': 'modern office',
    'clean': 'clean workspace',
    'organized': 'organized desk',
    'minimalist': 'minimalist office',
    
    // Objetos
    'coffee': 'coffee office',
    'notebook': 'notebook work',
    'books': 'books office',
    'plants': 'office plants',
    'documents': 'business documents',
    
    // Iluminação
    'natural lighting': 'natural light office',
    'bright': 'bright office',
    'window': 'office window',
    
    // Cores
    'white': 'white office',
    'wood': 'wooden desk',
    'green': 'green office plants',
    
    // Tecnologia
    'technology': 'technology office',
    'digital': 'digital workspace',
    'innovation': 'innovation office',
    'startup': 'startup office',
    
    // Atividades
    'learning': 'education office',
    'creative': 'creative workspace',
    'design': 'design studio',
    'marketing': 'marketing office'
  };
  
  // Mapear keywords para termos melhores
  const mappedTerms = keywordArray.map(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    return keywordMappings[lowerKeyword] || keyword;
  });
  
  // Pegar os 2-3 termos mais relevantes
  const relevantTerms = mappedTerms.slice(0, 3);
  
  // Se temos termos específicos, usar eles
  if (relevantTerms.length > 0) {
    return relevantTerms.join(' ');
  }
  
  return 'business professional workspace';
};

// Gerar query de fallback baseada na conversa
const generateFallbackQuery = (conversationData) => {
  const platform = conversationData.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Instagram';
  const objective = conversationData.objective || '';
  
  // Mapear objetivos para queries
  const objectiveQueries = {
    'Vender produto/serviço': 'business presentation product',
    'Aumentar engajamento': 'social media lifestyle',
    'Educar audiência': 'education learning workspace',
    'Inspirar pessoas': 'success motivation office',
    'Criar buzz': 'creative modern workspace'
  };
  
  // Mapear plataformas para estilos
  const platformQueries = {
    'Instagram': 'lifestyle aesthetic workspace',
    'Facebook': 'authentic social office',
    'LinkedIn': 'professional business office',
    'Twitter': 'simple clean workspace'
  };
  
  const objectiveQuery = objectiveQueries[objective] || 'business professional';
  const platformQuery = platformQueries[platform] || 'professional office';
  
  return `${objectiveQuery} ${platformQuery}`;
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