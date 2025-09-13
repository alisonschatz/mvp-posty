// Serviço Unsplash - Fotos profissionais gratuitas com busca inteligente
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_BASE = 'https://api.unsplash.com';

// Buscar imagens no Unsplash
export const searchUnsplashImages = async (query, page = 1, perPage = 9) => {
  try {
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('⚠️ Chave do Unsplash não configurada');
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
    console.error('❌ Erro ao buscar no Unsplash:', error);
    return generatePlaceholderImages(query, perPage);
  }
};

// Sugerir imagens baseadas no conteúdo gerado
export const suggestImagesForPost = async (conversationData) => {
  const generatedContent = conversationData.generatedContent;
  
  // Verificar se temos a descrição da imagem do post gerado
  let searchQuery = '';
  
  if (generatedContent && typeof generatedContent === 'object' && generatedContent.imageDescription) {
    // Usar a descrição da imagem como base
    searchQuery = convertImageDescriptionToSearchQuery(generatedContent.imageDescription);
    console.log('🎯 Busca baseada na descrição da imagem:', searchQuery);
  } else {
    // Fallback: gerar query baseada no conteúdo textual
    const content = typeof generatedContent === 'string' 
      ? generatedContent 
      : generatedContent?.content || conversationData.content || '';
    searchQuery = generateIntelligentQuery(content, conversationData);
    console.log('🔄 Busca baseada no conteúdo textual:', searchQuery);
  }
  
  return await searchUnsplashImages(searchQuery, 1, 6);
};

// Converter descrição de imagem para query de busca otimizada
const convertImageDescriptionToSearchQuery = (imageDescription) => {
  if (!imageDescription || typeof imageDescription !== 'string') {
    return 'business professional';
  }
  
  // Extrair palavras-chave principais da descrição
  const keywordMappings = {
    // Workspace
    'workspace|desk|office|computer|laptop': 'workspace office',
    'modern|contemporary|clean|minimalist': 'modern workspace',
    'professional|business|corporate': 'professional business',
    
    // Objetos específicos
    'coffee|cup|mug': 'coffee workspace',
    'notebook|notes|planning': 'notebook planning',
    'plants|green|nature': 'office plants',
    'documents|papers|files': 'business documents',
    
    // Iluminação e atmosfera
    'natural lighting|window|bright': 'natural light office',
    'warm|cozy|comfortable': 'cozy workspace',
    'organized|neat|tidy': 'organized office',
    
    // Tecnologia
    'technology|digital|screens': 'technology office',
    'smartphone|phone|mobile': 'mobile technology',
    'innovation|futuristic': 'innovation technology',
    
    // Cores e estética
    'white|light|bright': 'bright office',
    'wood|wooden|natural': 'wooden desk office',
    'black|dark|contrast': 'modern office',
    
    // Atividades
    'meeting|collaboration|team': 'business meeting',
    'presentation|display|screen': 'business presentation',
    'creative|design|art': 'creative workspace',
    'learning|education|study': 'study workspace'
  };
  
  const description_lower = imageDescription.toLowerCase();
  let matchedTerms = [];
  
  for (const [patterns, searchTerm] of Object.entries(keywordMappings)) {
    const regex = new RegExp(patterns, 'i');
    if (regex.test(description_lower)) {
      matchedTerms.push(searchTerm);
    }
  }
  
  // Se encontrou termos específicos, usar os mais relevantes
  if (matchedTerms.length > 0) {
    // Remover duplicatas e pegar os 2 primeiros
    const uniqueTerms = [...new Set(matchedTerms)].slice(0, 2);
    return uniqueTerms.join(' ');
  }
  
  // Fallback: extrair palavras-chave diretamente
  const importantWords = imageDescription
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .split(' ')
    .filter(word => word.length > 3) // Palavras com mais de 3 caracteres
    .filter(word => !['with', 'and', 'the', 'for', 'that', 'this', 'from', 'they', 'have', 'been', 'their', 'said', 'each', 'which', 'she', 'do', 'how', 'her', 'has', 'him'].includes(word)); // Remove stop words
  
  // Pegar as 3 primeiras palavras relevantes
  const keywords = importantWords.slice(0, 3).join(' ');
  
  return keywords || 'business professional';
};

// Gerar query inteligente baseada no conteúdo textual (fallback)
const generateIntelligentQuery = (content, conversationData) => {
  const businessKeywords = {
    'tecnologia|digital|software': 'technology business',
    'marketing|vendas|cliente': 'marketing team',
    'equipe|time|colaboração': 'team collaboration',
    'liderança|gestão|CEO': 'leadership business',
    'sucesso|crescimento': 'success achievement',
    'produtividade|trabalho': 'productivity workspace',
    'educação|aprendizado': 'education learning',
    'finanças|investimento': 'finance business'
  };
  
  const content_lower = content.toLowerCase();
  
  for (const [pattern, term] of Object.entries(businessKeywords)) {
    if (new RegExp(pattern, 'i').test(content_lower)) {
      return term;
    }
  }
  
  return 'business professional';
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
    console.error('❌ Erro no download:', error);
    return photo.urls.regular;
  }
};