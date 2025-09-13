// Serviço DALL-E usando imageDescription completa
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Cache para evitar gerar a mesma imagem múltiplas vezes
const imageCache = new Map();

// Gerar imagens com DALL-E usando imageDescription completa
export const generateDalleImages = async (imageDescription, conversationData, count = 2) => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn('Chave da OpenAI não configurada para DALL-E');
      return { images: [], total: 0, totalPages: 0 };
    }

    // Usar imageDescription completa diretamente
    const description = imageDescription || generateSimpleFallback(conversationData);
    
    console.log('📝 Usando imageDescription completa para DALL-E:', description);

    // Criar chave de cache
    const cacheKey = generateCacheKey(description, conversationData);
    
    // Verificar cache
    if (imageCache.has(cacheKey)) {
      console.log('🎨 Usando imagens DALL-E do cache');
      return imageCache.get(cacheKey);
    }

    console.log('🤖 Gerando imagens com DALL-E usando descrição completa...');

    // Usar a imageDescription como prompt, com ajustes mínimos
    const dallePrompt = prepareDescriptionForDalle(description, conversationData);
    
    console.log('🎯 Prompt final para DALL-E:', dallePrompt.substring(0, 200) + '...');

    // Requisição para DALL-E 2
    const requestBody = {
      model: "dall-e-2",
      prompt: dallePrompt,
      n: Math.min(count, 4),
      size: "1024x1024"
    };

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
      console.error('DALL-E API Error:', {
        status: response.status,
        errorData,
        promptLength: dallePrompt.length
      });
      throw new Error(`DALL-E API Error: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    console.log('✅ DALL-E gerou imagens com sucesso');
    
    const images = data.data.map((image, index) => ({
      id: `dalle-${Date.now()}-${index}`,
      urls: {
        thumb: image.url,
        small: image.url,
        regular: image.url,
        full: image.url
      },
      alt: `Imagem gerada por IA: ${description.substring(0, 100)}...`,
      user: {
        name: 'DALL-E (OpenAI)',
        username: 'dalle',
        profile: 'https://openai.com'
      },
      downloadUrl: image.url,
      htmlUrl: image.url,
      source: 'dalle',
      prompt: dallePrompt,
      originalDescription: description
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

// Preparar descrição para DALL-E com ajustes mínimos
const prepareDescriptionForDalle = (imageDescription, conversationData) => {
  const platform = conversationData.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Instagram';
  
  // Usar a descrição completa como base
  let prompt = imageDescription.trim();
  
  // Verificar se já tem restrições básicas
  const hasNoText = /no text/i.test(prompt);
  const hasNoLogos = /no logos/i.test(prompt);
  const hasNoPeople = /no people|no faces/i.test(prompt);
  
  // Adicionar apenas especificações mínimas que faltam
  const platformHints = {
    'Instagram': 'square composition',
    'Facebook': 'horizontal or square format',
    'LinkedIn': 'professional business style',
    'Twitter': 'clear simple composition'
  };
  
  const platformHint = platformHints[platform] || platformHints['Instagram'];
  
  // Adicionar hint da plataforma se houver espaço e não estiver implícito
  if (prompt.length < 900 && !prompt.toLowerCase().includes('square') && !prompt.toLowerCase().includes('format')) {
    prompt += `, ${platformHint}`;
  }
  
  // Adicionar restrições DALL-E apenas se não estiverem presentes
  const restrictions = [];
  if (!hasNoText && prompt.length < 950) restrictions.push('no text overlay');
  if (!hasNoLogos && prompt.length < 970) restrictions.push('no logos');
  if (!hasNoPeople && prompt.length < 990) restrictions.push('no people faces');
  
  if (restrictions.length > 0) {
    prompt += `, ${restrictions.join(', ')}`;
  }
  
  // Garantir limite de 1000 caracteres
  if (prompt.length > 1000) {
    prompt = prompt.substring(0, 997) + '...';
  }
  
  // Validação mínima
  if (prompt.length < 20) {
    prompt = 'modern professional workspace with laptop computer, clean aesthetic, natural lighting, high quality photography';
  }
  
  return prompt;
};

// Gerar fallback simples se não houver imageDescription
const generateSimpleFallback = (conversationData) => {
  const platform = conversationData.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Instagram';
  const objective = conversationData.objective || '';
  
  const fallbackDescriptions = {
    'Vender produto/serviço': 'Clean modern workspace with laptop computer on wooden desk, professional product presentation setup, natural lighting from window, organized business environment with minimalist aesthetic, neutral color palette',
    'Aumentar engajamento': 'Vibrant creative workspace featuring laptop computer, colorful design elements, inspiring atmosphere with natural light, contemporary aesthetic with dynamic composition, engaging visual elements',
    'Educar audiência': 'Organized study workspace with laptop computer, books and learning materials, focused environment with soft lighting, educational setting with warm tones, clean and structured composition',
    'Inspirar pessoas': 'Motivational workspace setup with laptop computer, success elements, bright natural lighting, uplifting atmosphere with clean modern design, aspirational environment with warm colors',
    'Criar buzz': 'Trendy modern workspace with laptop computer, cutting-edge aesthetic, dynamic composition with innovative elements, contemporary design with bold visual appeal'
  };
  
  let description = fallbackDescriptions[objective] || 'Modern professional workspace with laptop computer, clean desk setup, natural lighting, organized environment, contemporary aesthetic';
  
  // Adicionar adaptação da plataforma
  const platformAdaptations = {
    'Instagram': ', square format optimized for social media',
    'Facebook': ', horizontal storytelling format',
    'LinkedIn': ', professional corporate environment',
    'Twitter': ', simple clear composition'
  };
  
  description += platformAdaptations[platform] || platformAdaptations['Instagram'];
  description += ', high quality professional photography';
  
  return description;
};

// Gerar chave de cache
const generateCacheKey = (description, conversationData) => {
  const keyData = {
    description: description?.substring(0, 200),
    platform: conversationData.platform,
    objective: conversationData.objective
  };
  
  try {
    const jsonString = JSON.stringify(keyData);
    const encodedString = encodeURIComponent(jsonString);
    return hashCode(encodedString).toString();
  } catch (error) {
    console.warn('Erro ao gerar cache key:', error);
    return `fallback-${Date.now()}`;
  }
};

// Função de hash
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
  console.log('Cache do DALL-E limpo');
};