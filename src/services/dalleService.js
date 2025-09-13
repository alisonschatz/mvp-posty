// Serviço de integração com DALL-E
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Cache para evitar gerar a mesma imagem múltiplas vezes
const imageCache = new Map();

// Gerar imagens com DALL-E baseadas no conteúdo
export const generateDalleImages = async (content, conversationData, count = 3) => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn('Chave da OpenAI não configurada para DALL-E');
      return { images: [], total: 0, totalPages: 0 };
    }

    // Criar um ID único para cache baseado no conteúdo
    const cacheKey = generateCacheKey(content, conversationData);
    
    // Verificar cache primeiro
    if (imageCache.has(cacheKey)) {
      console.log('🎨 Usando imagens DALL-E do cache');
      return imageCache.get(cacheKey);
    }

    console.log('🤖 Gerando imagens personalizadas com DALL-E...');

    // Gerar prompt otimizado para DALL-E
    const dallePrompt = generateDallePrompt(content, conversationData);
    console.log('🎯 Prompt DALL-E:', dallePrompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-2", // ou "dall-e-2" se preferir
        prompt: dallePrompt,
        n: Math.min(count, 1), // DALL-E 3 gera apenas 1 por vez
        size: "1024x1024",
        quality: "standard", // ou "hd" para maior qualidade
        style: "natural" // ou "vivid" para cores mais vibrantes
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DALL-E API Error: ${response.status} - ${errorData.error?.message}`);
    }

    const data = await response.json();
    
    const images = data.data.map((image, index) => ({
      id: `dalle-${Date.now()}-${index}`,
      urls: {
        thumb: image.url,
        small: image.url,
        regular: image.url,
        full: image.url
      },
      alt: `Imagem gerada por IA: ${dallePrompt.substring(0, 100)}...`,
      user: {
        name: 'DALL-E (OpenAI)',
        username: 'dalle',
        profile: 'https://openai.com'
      },
      downloadUrl: image.url,
      htmlUrl: image.url,
      source: 'dalle',
      prompt: dallePrompt
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

// Gerar prompt otimizado para DALL-E
const generateDallePrompt = (content, conversationData) => {
  const platform = conversationData.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'social media';
  const audience = conversationData.audience || 'professionals';
  const tone = conversationData.tone || 'professional';
  
  // Analisar o conteúdo para extrair conceitos visuais
  const visualConcepts = extractVisualConcepts(content);
  const businessContext = detectBusinessContext(content);
  const emotionalTone = detectEmotionalTone(content);
  
  // Construir prompt estruturado
  let prompt = `Create a professional, high-quality image for ${platform} post. `;
  
  // Adicionar contexto visual principal
  if (visualConcepts.length > 0) {
    prompt += `Focus on: ${visualConcepts.join(', ')}. `;
  }
  
  // Adicionar contexto de negócios
  if (businessContext) {
    prompt += `Business context: ${businessContext}. `;
  }
  
  // Adicionar tom emocional
  if (emotionalTone) {
    prompt += `Emotional tone: ${emotionalTone}. `;
  }
  
  // Adicionar especificações técnicas
  prompt += `Style: modern, clean, professional photography. `;
  prompt += `Lighting: natural, well-lit. `;
  prompt += `Composition: suitable for social media, square format. `;
  prompt += `Colors: professional palette, not oversaturated. `;
  prompt += `Target audience: ${audience}. `;
  
  // Limitações importantes
  prompt += `No text, no logos, no faces of real people, no copyrighted content.`;
  
  return prompt;
};

// Extrair conceitos visuais do conteúdo
const extractVisualConcepts = (content) => {
  const visualMappings = {
    // Tecnologia
    'tecnologia|digital|app|software|sistema|computador|smartphone': ['modern technology', 'digital workspace', 'clean desk setup'],
    'inteligência artificial|IA|machine learning|automação': ['futuristic technology', 'AI concept', 'digital innovation'],
    
    // Negócios
    'reunião|meeting|apresentação|escritório|corporativo': ['business meeting', 'modern office', 'professional workspace'],
    'vendas|marketing|cliente|estratégia': ['business strategy', 'professional presentation', 'marketing concept'],
    'equipe|time|colaboração|teamwork': ['team collaboration', 'group working', 'professional teamwork'],
    
    // Crescimento
    'crescimento|sucesso|resultado|meta|objetivo': ['growth concept', 'success visualization', 'upward trend'],
    'inovação|criatividade|futuro|transformação': ['innovation concept', 'creative thinking', 'future vision'],
    
    // Educação
    'aprendizado|educação|conhecimento|curso|treinamento': ['learning environment', 'education concept', 'knowledge sharing'],
    'desenvolvimento|skill|competência|carreira': ['professional development', 'skill building', 'career growth'],
    
    // Bem-estar
    'produtividade|organização|foco|disciplina': ['organized workspace', 'productivity setup', 'focused environment'],
    'equilíbrio|bem-estar|qualidade de vida': ['work life balance', 'wellness concept', 'peaceful workspace'],
    
    // Finanças
    'investimento|financeiro|dinheiro|economia': ['financial concept', 'investment visualization', 'economic growth'],
    'planejamento|orçamento|análise': ['financial planning', 'data analysis', 'strategic planning']
  };

  const content_lower = content.toLowerCase();
  let concepts = [];
  
  for (const [patterns, visualConcepts] of Object.entries(visualMappings)) {
    const regex = new RegExp(patterns, 'i');
    if (regex.test(content_lower)) {
      concepts.push(...visualConcepts.slice(0, 2)); // Máximo 2 conceitos por categoria
      break; // Usar apenas a primeira correspondência para não sobrecarregar
    }
  }
  
  return concepts.slice(0, 3); // Máximo 3 conceitos totais
};

// Detectar contexto de negócios para DALL-E
const detectBusinessContext = (content) => {
  const businessContexts = {
    'startup|empreendedorismo|founder|CEO': 'startup environment',
    'escritório|office|corporativo|empresa': 'corporate office setting',
    'workshop|treinamento|curso|seminário': 'training or workshop setting',
    'conferência|evento|networking|palestra': 'conference or event setting',
    'remoto|home office|trabalho em casa': 'modern home office',
    'coworking|espaço colaborativo': 'coworking space'
  };

  const content_lower = content.toLowerCase();
  
  for (const [patterns, context] of Object.entries(businessContexts)) {
    const regex = new RegExp(patterns, 'i');
    if (regex.test(content_lower)) {
      return context;
    }
  }
  
  return 'professional business setting';
};

// Detectar tom emocional para DALL-E
const detectEmotionalTone = (content) => {
  const emotionalTones = {
    'motivação|inspiração|energia|entusiasmo': 'energetic and inspiring',
    'calma|tranquilidade|peace|zen|mindfulness': 'calm and peaceful',
    'inovação|criatividade|disruptivo|revolucionário': 'innovative and creative',
    'confiança|determinação|força|poder': 'confident and strong',
    'colaboração|união|juntos|parceria': 'collaborative and united',
    'reflexão|pensamento|análise|estratégia': 'thoughtful and analytical',
    'celebração|sucesso|conquista|vitória': 'celebratory and successful'
  };

  const content_lower = content.toLowerCase();
  
  for (const [patterns, tone] of Object.entries(emotionalTones)) {
    const regex = new RegExp(patterns, 'i');
    if (regex.test(content_lower)) {
      return tone;
    }
  }
  
  return 'professional and positive';
};

// Gerar chave única para cache
const generateCacheKey = (content, conversationData) => {
  const keyData = {
    content: content?.substring(0, 200), // Primeiros 200 caracteres
    platform: conversationData.platform,
    audience: conversationData.audience,
    objective: conversationData.objective
  };
  
  return btoa(JSON.stringify(keyData)).substring(0, 32);
};

// Limpar cache (útil para desenvolvimento)
export const clearDalleCache = () => {
  imageCache.clear();
  console.log('🗑️ Cache do DALL-E limpo');
};