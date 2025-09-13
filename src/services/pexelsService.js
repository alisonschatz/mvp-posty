// Serviço Pexels - Otimizado para palavras-chave
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

// Sugerir imagens baseadas em palavras-chave
export const suggestPexelsImages = async (conversationData) => {
  const imageKeywords = conversationData.generatedContent;
  
  // Converter palavras-chave para query de busca
  let searchQuery = '';
  
  if (imageKeywords && typeof imageKeywords === 'string') {
    searchQuery = convertKeywordsToSearchQuery(imageKeywords);
    console.log('🎯 Pexels - Busca baseada em keywords:', searchQuery);
  } else {
    searchQuery = generateFallbackQuery(conversationData);
    console.log('🔄 Pexels - Busca fallback:', searchQuery);
  }
  
  return await searchPexelsImages(searchQuery, 1, 6);
};

// Converter palavras-chave em query de busca otimizada para Pexels
const convertKeywordsToSearchQuery = (keywords) => {
  if (!keywords || typeof keywords !== 'string') {
    return 'business professional';
  }
  
  // Dividir palavras-chave em array
  const keywordArray = keywords
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);
  
  // Mapear keywords para termos específicos do Pexels
  const pexelsKeywordMappings = {
    // Workspace
    'workspace': 'office workspace',
    'office': 'modern office',
    'desk': 'office desk',
    'laptop': 'laptop computer',
    'computer': 'computer work',
    
    // Profissional  
    'professional': 'business professional',
    'business': 'business office',
    'corporate': 'corporate business',
    'meeting': 'business meeting',
    'executive': 'business executive',
    
    // Estilo e design
    'modern': 'modern workspace',
    'clean': 'clean office',
    'organized': 'organized workspace',
    'minimalist': 'minimalist desk',
    'aesthetic': 'aesthetic workspace',
    
    // Objetos específicos
    'coffee': 'coffee workspace',
    'notebook': 'notebook desk',
    'books': 'books study',
    'plants': 'office plants',
    'documents': 'business papers',
    'pen': 'writing desk',
    
    // Iluminação e ambiente
    'natural lighting': 'natural light',
    'bright': 'bright office',
    'window': 'office window',
    'sunlight': 'sunlight office',
    
    // Cores e materiais
    'white': 'white office',
    'wood': 'wooden desk',
    'wooden': 'wood office',
    'green': 'plants office',
    'black': 'modern office',
    
    // Tecnologia
    'technology': 'tech office',
    'digital': 'digital workspace',
    'innovation': 'startup office',
    'startup': 'startup workspace',
    'tech': 'technology office',
    
    // Atividades e setores
    'learning': 'study workspace',
    'education': 'education office',
    'creative': 'creative workspace',
    'design': 'design studio',
    'marketing': 'marketing team',
    'finance': 'finance office',
    'consulting': 'business consulting',
    
    // Sentimentos/mood
    'success': 'business success',
    'motivation': 'motivated workspace',
    'productivity': 'productive office',
    'focus': 'focused work',
    'collaboration': 'team collaboration'
  };
  
  // Mapear keywords para termos melhores
  const mappedTerms = keywordArray.map(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    return pexelsKeywordMappings[lowerKeyword] || keyword;
  });
  
  // Priorizar termos mais específicos e relevantes
  const priorityTerms = mappedTerms.filter(term => 
    term.includes('office') || 
    term.includes('business') || 
    term.includes('workspace') ||
    term.includes('professional')
  );
  
  // Se temos termos prioritários, usar eles primeiro
  if (priorityTerms.length > 0) {
    return priorityTerms.slice(0, 2).join(' ');
  }
  
  // Senão, usar os primeiros termos mapeados
  if (mappedTerms.length > 0) {
    return mappedTerms.slice(0, 2).join(' ');
  }
  
  return 'business professional workspace';
};

// Gerar query de fallback baseada na conversa
const generateFallbackQuery = (conversationData) => {
  const platform = conversationData.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Instagram';
  const objective = conversationData.objective || '';
  const audience = conversationData.audience || '';
  
  // Mapear objetivos para queries específicas do Pexels
  const objectiveQueries = {
    'Vender produto/serviço': 'business presentation sales',
    'Aumentar engajamento': 'social media workspace',
    'Educar audiência': 'education learning office',
    'Inspirar pessoas': 'success motivation business',
    'Criar buzz': 'creative modern workspace'
  };
  
  // Mapear audiências para contextos visuais
  const audienceQueries = {
    'empreendedor': 'startup entrepreneur',
    'profissional': 'business professional',
    'executivo': 'executive office',
    'freelancer': 'freelance workspace',
    'consultor': 'consulting business'
  };
  
  // Mapear plataformas para estilos visuais
  const platformQueries = {
    'Instagram': 'lifestyle business',
    'Facebook': 'social business',
    'LinkedIn': 'professional corporate',
    'Twitter': 'simple business'
  };
  
  let query = objectiveQueries[objective] || 'business office';
  
  // Adicionar contexto da audiência
  for (const [audienceType, audienceQuery] of Object.entries(audienceQueries)) {
    if (audience.toLowerCase().includes(audienceType)) {
      query = audienceQuery + ' ' + query;
      break;
    }
  }
  
  // Adicionar estilo da plataforma
  const platformQuery = platformQueries[platform] || 'business';
  query = `${query} ${platformQuery}`;
  
  return query;
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