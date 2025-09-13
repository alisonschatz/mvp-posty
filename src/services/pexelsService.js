// Serviço de integração com Pexels - Atualizado com busca inteligente
const PEXELS_API_KEY = process.env.REACT_APP_PEXELS_API_KEY;
const PEXELS_API_BASE = 'https://api.pexels.com/v1';

// Buscar imagens no Pexels
export const searchPexelsImages = async (query, page = 1, perPage = 9) => {
  try {
    if (!PEXELS_API_KEY) {
      console.warn('Chave do Pexels não configurada');
      return { images: [], total: 0, totalPages: 0 };
    }

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

// Sugerir imagens baseadas no conteúdo gerado
export const suggestPexelsImages = async (conversationData) => {
  const generatedContent = conversationData.generatedContent;
  
  // Verificar se temos a descrição da imagem do post gerado
  let searchQuery = '';
  
  if (generatedContent && typeof generatedContent === 'object' && generatedContent.imageDescription) {
    // Usar a descrição da imagem como base
    searchQuery = convertImageDescriptionToSearchQuery(generatedContent.imageDescription);
    console.log('🎯 Pexels - Busca baseada na descrição da imagem:', searchQuery);
  } else {
    // Fallback: gerar query baseada no conteúdo textual
    const content = typeof generatedContent === 'string' 
      ? generatedContent 
      : generatedContent?.content || conversationData.content || '';
    searchQuery = generateIntelligentQuery(content, conversationData);
    console.log('🔄 Pexels - Busca baseada no conteúdo textual:', searchQuery);
  }
  
  return await searchPexelsImages(searchQuery, 1, 6);
};

// Converter descrição de imagem para query de busca otimizada para Pexels
const convertImageDescriptionToSearchQuery = (imageDescription) => {
  if (!imageDescription || typeof imageDescription !== 'string') {
    return 'business professional';
  }
  
  // Mapear elementos da descrição para termos de busca otimizados para Pexels
  const keywordMappings = {
    // Workspace e escritório
    'workspace|desk|office|computer|laptop|workstation': 'office workspace',
    'modern|contemporary|clean|minimalist|sleek': 'modern office',
    'professional|business|corporate|executive': 'business professional',
    
    // Objetos específicos
    'coffee|cup|mug|beverage': 'coffee office',
    'notebook|notes|planning|journal|writing': 'notebook work',
    'plants|green|nature|botanical': 'office plants',
    'documents|papers|files|paperwork': 'business documents',
    'books|reading|library|study': 'books office',
    
    // Tecnologia
    'technology|digital|screens|monitors': 'technology office',
    'smartphone|phone|mobile|device': 'smartphone business',
    'innovation|futuristic|tech|startup': 'startup technology',
    
    // Iluminação e atmosfera
    'natural lighting|window|bright|sunlight': 'natural light',
    'warm|cozy|comfortable|inviting': 'cozy workspace',
    'organized|neat|tidy|clean': 'organized desk',
    'creative|artistic|design|inspiration': 'creative workspace',
    
    // Cores e materiais
    'white|light|bright|clean': 'white office',
    'wood|wooden|natural|timber': 'wooden desk',
    'black|dark|contrast|elegant': 'modern desk',
    'glass|transparent|crystal': 'glass office',
    
    // Atividades e contextos
    'meeting|collaboration|team|group': 'business meeting',
    'presentation|display|screen|projector': 'presentation',
    'learning|education|study|training': 'education',
    'finance|money|banking|investment': 'finance business',
    'marketing|advertising|promotion|campaign': 'marketing',
    'leadership|management|executive|boss': 'leadership',
    
    // Setores específicos
    'healthcare|medical|clinic|hospital': 'healthcare professional',
    'legal|law|lawyer|attorney': 'legal office',
    'consulting|advisory|strategy': 'consulting',
    'real estate|property|buildings': 'real estate'
  };
  
  const description_lower = imageDescription.toLowerCase();
  let matchedTerms = [];
  let priorityScore = {};
  
  for (const [patterns, searchTerm] of Object.entries(keywordMappings)) {
    const regex = new RegExp(patterns, 'i');
    if (regex.test(description_lower)) {
      matchedTerms.push(searchTerm);
      // Dar prioridade a termos mais específicos
      priorityScore[searchTerm] = patterns.split('|').length;
    }
  }
  
  // Se encontrou termos específicos, usar os mais relevantes
  if (matchedTerms.length > 0) {
    // Ordenar por especificidade e pegar os 2 primeiros
    const sortedTerms = matchedTerms
      .sort((a, b) => (priorityScore[b] || 0) - (priorityScore[a] || 0))
      .slice(0, 2);
    
    return [...new Set(sortedTerms)].join(' ');
  }
  
  // Fallback: extrair palavras-chave relevantes diretamente
  const businessWords = [
    'workspace', 'office', 'business', 'professional', 'modern', 'clean',
    'desk', 'computer', 'laptop', 'meeting', 'team', 'work', 'corporate',
    'technology', 'digital', 'innovation', 'strategy', 'planning'
  ];
  
  const foundWords = businessWords.filter(word => 
    description_lower.includes(word.toLowerCase())
  );
  
  if (foundWords.length > 0) {
    return foundWords.slice(0, 2).join(' ');
  }
  
  return 'business professional';
};

// Gerar query inteligente baseada no conteúdo textual (fallback)
const generateIntelligentQuery = (content, conversationData) => {
  const businessKeywords = {
    'tecnologia|digital|software|app|sistema': 'technology business',
    'marketing|vendas|cliente|propaganda': 'marketing business',
    'equipe|time|colaboração|teamwork': 'team collaboration',
    'liderança|gestão|CEO|diretor|chefe': 'leadership business',
    'sucesso|crescimento|resultado|meta': 'success business',
    'produtividade|trabalho|escritório|office': 'office productivity',
    'educação|aprendizado|curso|treinamento': 'education business',
    'finanças|investimento|dinheiro|economia': 'finance business',
    'inovação|criatividade|startup|empreendedorismo': 'startup innovation',
    'saúde|medicina|clínica|hospital': 'healthcare professional',
    'advogado|direito|legal|jurídico': 'legal professional',
    'consultoria|estratégia|planejamento': 'consulting business',
    'vendas|comercial|negociação': 'sales business'
  };
  
  const content_lower = content.toLowerCase();
  
  for (const [pattern, term] of Object.entries(businessKeywords)) {
    if (new RegExp(pattern, 'i').test(content_lower)) {
      return term;
    }
  }
  
  // Baseado na plataforma como fallback final
  const platform = conversationData.platform?.replace(/[📸👥💼🐦]/g, '').trim();
  const platformQueries = {
    'Instagram': 'lifestyle business',
    'Facebook': 'social business',
    'LinkedIn': 'professional business',
    'Twitter': 'modern business'
  };
  
  return platformQueries[platform] || 'business professional';
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