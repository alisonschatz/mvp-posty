// Serviço de integração com DALL-E - Usa imageDescription diretamente
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Cache para evitar gerar a mesma imagem múltiplas vezes
const imageCache = new Map();

// Gerar imagens com DALL-E baseadas na imageDescription
export const generateDalleImages = async (imageDescription, conversationData, count = 2) => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn('Chave da OpenAI não configurada para DALL-E');
      return { images: [], total: 0, totalPages: 0 };
    }

    // Usar imageDescription diretamente como foi gerada pela IA
    const description = imageDescription || generateFallbackDescription(conversationData);

    console.log('📝 ImageDescription para DALL-E:', description);

    // Criar um ID único para cache
    const cacheKey = generateCacheKey(description, conversationData);
    
    // Verificar cache primeiro
    if (imageCache.has(cacheKey)) {
      console.log('🎨 Usando imagens DALL-E do cache');
      return imageCache.get(cacheKey);
    }

    console.log('🤖 Gerando imagens personalizadas com DALL-E...');

    // Usar a imageDescription como prompt principal, apenas com pequenos ajustes
    const dallePrompt = buildDallePrompt(description, conversationData);
    
    console.log('🎯 Prompt final para DALL-E:', dallePrompt);

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
        prompt: dallePrompt.substring(0, 100)
      });
      throw new Error(`DALL-E API Error: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
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

// Construir prompt para DALL-E usando a imageDescription diretamente
const buildDallePrompt = (imageDescription, conversationData) => {
  const platform = conversationData.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Instagram';
  
  // Usar a descrição da imagem como base principal
  let prompt = imageDescription.trim();
  
  // Adicionar apenas especificações técnicas mínimas baseadas na plataforma
  const platformSpecs = {
    'Instagram': ', square format',
    'Facebook': ', social media format',
    'LinkedIn': ', professional style',
    'Twitter': ', clear composition'
  };
  
  const platformSpec = platformSpecs[platform] || platformSpecs['Instagram'];
  
  // Adicionar especificação da plataforma se houver espaço
  if (prompt.length < 950) {
    prompt += platformSpec;
  }
  
  // Adicionar restrições básicas do DALL-E se houver espaço
  if (prompt.length < 970) {
    prompt += ', no text, no logos';
  }
  
  // Garantir limite de 1000 caracteres
  if (prompt.length > 1000) {
    prompt = prompt.substring(0, 997) + '...';
  }
  
  // Validação mínima
  if (prompt.length < 10) {
    prompt = 'professional office workspace with modern design';
  }
  
  return prompt;
};

// Gerar descrição de fallback apenas se não houver imageDescription
const generateFallbackDescription = (conversationData) => {
  const platform = conversationData.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Instagram';
  const objective = conversationData.objective || '';
  
  // Descrições básicas por objetivo
  const objectiveDescriptions = {
    'Vender produto/serviço': 'Clean modern workspace with product display, professional lighting, organized desk setup',
    'Aumentar engajamento': 'Vibrant creative workspace with laptop, colorful elements, inspiring environment',
    'Educar audiência': 'Organized study workspace with books, laptop, learning materials, natural lighting',
    'Inspirar pessoas': 'Motivational workspace with success symbols, bright lighting, uplifting atmosphere',
    'Criar buzz': 'Trendy modern workspace with creative elements, contemporary design, dynamic composition'
  };
  
  let description = objectiveDescriptions[objective] || 'Modern professional workspace with laptop and clean design';
  
  // Adaptar por plataforma
  const platformAdaptations = {
    'Instagram': ', aesthetic and lifestyle focused',
    'Facebook': ', authentic and relatable',
    'LinkedIn': ', corporate and professional',
    'Twitter': ', simple and clear'
  };
  
  description += platformAdaptations[platform] || platformAdaptations['Instagram'];
  
  return description;
};

// Gerar chave única para cache
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
  console.log('Cache do DALL-E limpo');
};