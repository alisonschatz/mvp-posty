// Serviço Pexels usando searchKeywords
const PEXELS_API_KEY = process.env.REACT_APP_PEXELS_API_KEY;
const PEXELS_API_BASE = 'https://api.pexels.com/v1';

// Buscar imagens no Pexels
export const searchPexelsImages = async (query, page = 1, perPage = 9) => {
  try {
    if (!PEXELS_API_KEY) {
      console.warn('Chave do Pexels não configurada');
      return { images: [], total: 0, totalPages: 0 };
    }

    console.log('🔍 Buscando no Pexels:', query);

    const response = await fetch(
      `${PEXELS_API_BASE}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=square`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      images: data.photos.map(photo => ({
        id: `pexels-${photo.id}`,
        urls: {
          thumb: photo.src.small,
          small: photo.src.medium,
          regular: photo.src.large,
          full: photo.src.original
        },
        alt: photo.alt || query,
        user: {
          name: photo.photographer,
          username: photo.photographer,
          profile: photo.photographer_url
        },
        downloadUrl: photo.src.original,
        htmlUrl: photo.url,
        source: 'pexels'
      })),
      total: data.total_results,
      totalPages: Math.ceil(data.total_results / perPage)
    };
  } catch (error) {
    console.error('Erro ao buscar imagens no Pexels:', error);
    return { images: [], total: 0, totalPages: 0 };
  }
};

// Sugerir imagens usando searchKeywords
export const suggestPexelsImages = async (conversationData) => {
  // Extrair searchKeywords do conteúdo gerado
  const searchKeywords = conversationData.generatedContent || '';
  
  let searchQuery = '';
  
  if (searchKeywords && typeof searchKeywords === 'string') {
    searchQuery = processSearchKeywords(searchKeywords);
    console.log('🎯 Pexels - Usando searchKeywords:', searchQuery);
  } else {
    searchQuery = generateFallbackQuery(conversationData);
    console.log('🔄 Pexels - Query fallback:', searchQuery);
  }
  
  return await searchPexelsImages(searchQuery, 1, 6);
};

// Processar searchKeywords para query otimizada
const processSearchKeywords = (keywords) => {
  if (!keywords || typeof keywords !== 'string') {
    return 'business office';
  }
  
  // Limpar e dividir keywords
  const cleanKeywords = keywords
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
  
  // Se está vazio após limpeza
  if (!cleanKeywords) {
    return 'business office';
  }
  
  // Dividir em palavras individuais
  const wordArray = cleanKeywords.split(' ').filter(word => word.length > 2);
  
  // Se tem poucas palavras, usar todas
  if (wordArray.length <= 3) {
    return wordArray.join(' ');
  }
  
  // Se tem muitas palavras, pegar as 3 primeiras
  return wordArray.slice(0, 3).join(' ');
};

// Gerar query fallback baseada na conversa
const generateFallbackQuery = (conversationData) => {
  const platform = conversationData.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Instagram';
  const objective = conversationData.objective || '';
  
  // Mapear objetivos para queries Pexels
  const objectiveQueries = {
    'Vender produto/serviço': 'business presentation',
    'Aumentar engajamento': 'creative workspace',
    'Educar audiência': 'learning office',
    'Inspirar pessoas': 'success workspace',
    'Criar buzz': 'modern trendy'
  };
  
  // Mapear plataformas para estilos
  const platformQueries = {
    'Instagram': 'lifestyle aesthetic',
    'Facebook': 'social authentic',
    'LinkedIn': 'professional corporate',
    'Twitter': 'simple clean'
  };
  
  const baseQuery = objectiveQueries[objective] || 'business office';
  const platformQuery = platformQueries[platform] || 'professional';
  
  return `${baseQuery} ${platformQuery}`;
};

// Buscar imagens curadas do Pexels
export const getCuratedPexelsImages = async (page = 1, perPage = 9) => {
  try {
    if (!PEXELS_API_KEY) {
      console.warn('Chave do Pexels não configurada');
      return { images: [], total: 0, totalPages: 0 };
    }

    const response = await fetch(
      `${PEXELS_API_BASE}/curated?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      images: data.photos.map(photo => ({
        id: `pexels-${photo.id}`,
        urls: {
          thumb: photo.src.small,
          small: photo.src.medium,
          regular: photo.src.large,
          full: photo.src.original
        },
        alt: photo.alt || 'Curated image',
        user: {
          name: photo.photographer,
          username: photo.photographer,
          profile: photo.photographer_url
        },
        downloadUrl: photo.src.original,
        htmlUrl: photo.url,
        source: 'pexels'
      })),
      total: data.total_results,
      totalPages: Math.ceil(data.total_results / perPage)
    };
  } catch (error) {
    console.error('Erro ao buscar imagens curadas do Pexels:', error);
    return { images: [], total: 0, totalPages: 0 };
  }
};