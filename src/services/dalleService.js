// Serviço de integração com DALL-E - Corrigido para DALL-E 2
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Cache para evitar gerar a mesma imagem múltiplas vezes
const imageCache = new Map();

// Gerar imagens com DALL-E baseadas na descrição do conteúdo
export const generateDalleImages = async (generatedPost, conversationData, count = 2) => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn('Chave da OpenAI não configurada para DALL-E');
      return { images: [], total: 0, totalPages: 0 };
    }

    // Extrair descrição da imagem do post gerado (se disponível)
    let imageDescription = '';
    
    if (generatedPost && typeof generatedPost === 'object' && generatedPost.imageDescription) {
      imageDescription = generatedPost.imageDescription;
      console.log('📝 Usando descrição da imagem do conteúdo gerado');
    } else {
      const content = typeof generatedPost === 'string' ? generatedPost : generatedPost?.content || '';
      imageDescription = generateImageDescriptionFromContent(content, conversationData);
      console.log('🔄 Descrição gerada como fallback');
    }

    // Criar um ID único para cache baseado na descrição
    const cacheKey = generateCacheKey(imageDescription, conversationData);
    
    // Verificar cache primeiro
    if (imageCache.has(cacheKey)) {
      console.log('🎨 Usando imagens DALL-E do cache');
      return imageCache.get(cacheKey);
    }

    console.log('🤖 Gerando imagens personalizadas com DALL-E...');

    // Gerar prompt otimizado para DALL-E baseado na descrição
    const dallePrompt = buildOptimizedDallePrompt(imageDescription, conversationData);
    
    // Validar prompt
    if (!dallePrompt || dallePrompt.trim().length === 0) {
      throw new Error('Prompt vazio gerado para DALL-E');
    }
    
    console.log('🎯 Prompt DALL-E:', dallePrompt.substring(0, 150) + '...');

    // Requisição para DALL-E 2 (parâmetros corretos)
    const requestBody = {
      model: "dall-e-2",
      prompt: dallePrompt,
      n: Math.min(count, 4),
      size: "1024x1024"
    };

    console.log('📤 Enviando requisição para DALL-E:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DALL-E API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        requestBody
      });
      throw new Error(`DALL-E API Error: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    console.log('✅ DALL-E respondeu com sucesso:', data);
    
    const images = data.data.map((image, index) => ({
      id: `dalle-${Date.now()}-${index}`,
      urls: {
        thumb: image.url,
        small: image.url,
        regular: image.url,
        full: image.url
      },
      alt: `Imagem gerada por IA: ${imageDescription.substring(0, 100)}...`,
      user: {
        name: 'DALL-E (OpenAI)',
        username: 'dalle',
        profile: 'https://openai.com'
      },
      downloadUrl: image.url,
      htmlUrl: image.url,
      source: 'dalle',
      prompt: dallePrompt,
      originalDescription: imageDescription
    }));

    const result = {
      images,
      total: images.length,
      totalPages: 1
    };

    // Salvar no cache
    imageCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Erro ao gerar imagens com DALL-E:', error);
    return { images: [], total: 0, totalPages: 0 };
  }
};

// Construir prompt otimizado para DALL-E baseado na descrição
const buildOptimizedDallePrompt = (imageDescription, conversationData) => {
  const platform = conversationData.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'social media';
  
  // Limpar e validar a descrição
  let cleanDescription = imageDescription || 'professional business workspace';
  cleanDescription = cleanDescription.trim();
  
  // Remover caracteres problemáticos que podem causar erro na API
  cleanDescription = cleanDescription.replace(/[^\w\s,.-]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Especificações por plataforma
  const platformSpecs = {
    'Instagram': 'square format, vibrant photography',
    'Facebook': 'authentic storytelling visual',
    'LinkedIn': 'professional business setting',
    'Twitter': 'clear simple composition'
  };
  
  const platformSpec = platformSpecs[platform] || platformSpecs['Instagram'];
  
  // Construir prompt de forma conservadora
  let optimizedPrompt = cleanDescription;
  
  // Adicionar especificações apenas se houver espaço
  if (optimizedPrompt.length < 850) {
    optimizedPrompt += `, ${platformSpec}`;
  }
  
  if (optimizedPrompt.length < 900) {
    optimizedPrompt += ', professional photography, high quality';
  }
  
  if (optimizedPrompt.length < 950) {
    optimizedPrompt += ', no text, no logos';
  }
  
  // Garantir limite de 1000 caracteres
  if (optimizedPrompt.length > 1000) {
    optimizedPrompt = optimizedPrompt.substring(0, 997) + '...';
  }
  
  // Validação final - garantir prompt mínimo
  if (optimizedPrompt.length < 10) {
    optimizedPrompt = 'professional business workspace with laptop and modern design';
  }
  
  return optimizedPrompt;
};

// Gerar descrição de imagem baseada no conteúdo (fallback)
const generateImageDescriptionFromContent = (content, conversationData) => {
  const platform = conversationData.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Instagram';
  const audience = conversationData.audience || 'professionals';
  const objective = conversationData.objective || '';
  
  // Analisar o conteúdo para extrair conceitos visuais
  const visualConcepts = extractVisualConceptsFromText(content);
  const businessContext = detectBusinessContextFromText(content);
  
  // Construir descrição base
  let description = '';
  
  if (visualConcepts.length > 0) {
    description += `${visualConcepts.join(', ')}. `;
  }
  
  if (businessContext) {
    description += `${businessContext}. `;
  } else {
    description += 'Modern professional environment. ';
  }
  
  // Especificações por objetivo
  const objectiveVisuals = {
    'Vender produto/serviço': 'clean product showcase',
    'Aumentar engajamento': 'vibrant dynamic composition',
    'Educar audiência': 'organized workspace with materials',
    'Inspirar pessoas': 'uplifting natural lighting',
    'Criar buzz': 'trendy contemporary style'
  };
  
  if (objective && objectiveVisuals[objective]) {
    description += objectiveVisuals[objective] + '. ';
  }
  
  description += 'Professional photography, modern aesthetic';
  
  return description;
};

// Extrair conceitos visuais do texto
const extractVisualConceptsFromText = (content) => {
  if (!content) return [];
  
  const visualMappings = {
    'tecnologia|digital|software': ['laptop computer', 'modern workspace'],
    'marketing|vendas|estratégia': ['business presentation', 'professional office'],
    'equipe|colaboração': ['team workspace', 'meeting room'],
    'crescimento|sucesso': ['upward trending', 'achievement'],
    'produtividade|organização': ['organized desk', 'clean workspace'],
    'educação|aprendizado': ['learning materials', 'study environment']
  };

  const content_lower = content.toLowerCase();
  let concepts = [];
  
  for (const [patterns, visualConcepts] of Object.entries(visualMappings)) {
    const regex = new RegExp(patterns, 'i');
    if (regex.test(content_lower)) {
      concepts.push(...visualConcepts);
      break;
    }
  }
  
  return concepts.slice(0, 2);
};

// Detectar contexto de negócios do texto
const detectBusinessContextFromText = (content) => {
  if (!content) return '';
  
  const businessContexts = {
    'startup|empreendedorismo': 'startup office environment',
    'escritório|corporativo': 'corporate office setting',
    'vendas|comercial': 'sales meeting environment',
    'criativo|design': 'creative workspace'
  };

  const content_lower = content.toLowerCase();
  
  for (const [patterns, context] of Object.entries(businessContexts)) {
    const regex = new RegExp(patterns, 'i');
    if (regex.test(content_lower)) {
      return context;
    }
  }
  
  return '';
};

// Gerar chave única para cache
const generateCacheKey = (imageDescription, conversationData) => {
  const keyData = {
    description: imageDescription?.substring(0, 200),
    platform: conversationData.platform,
    audience: conversationData.audience,
    objective: conversationData.objective
  };
  
  try {
    const jsonString = JSON.stringify(keyData);
    const encodedString = encodeURIComponent(jsonString);
    return hashCode(encodedString).toString();
  } catch (error) {
    console.warn('Erro ao gerar cache key, usando fallback:', error);
    return `fallback-${Date.now()}`;
  }
};

// Função de hash simples
const hashCode = (str) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Limpar cache
export const clearDalleCache = () => {
  imageCache.clear();
  console.log('🗑️ Cache do DALL-E limpo');
};