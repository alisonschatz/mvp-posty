// Serviço de IA com geração de conteúdo e dupla descrição de imagem
export const generateContent = async (conversationData) => {
  try {
    const prompt = buildPrompt(conversationData);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em marketing digital e criação de conteúdo para redes sociais. Crie posts envolventes, autênticos e otimizados para cada plataforma. IMPORTANTE: Responda APENAS com um JSON válido contendo 'content' (texto do post), 'imageDescription' (descrição completa e detalhada para geração de imagem por IA) e 'searchKeywords' (2-5 palavras-chave para busca de imagens). Não inclua formatação markdown."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }
    
    const data = await response.json();
    const rawResponse = data.choices[0].message.content;
    
    try {
      // Limpar e extrair JSON da resposta
      const cleanedResponse = rawResponse.trim();
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        
        // Validar se tem todas as propriedades necessárias
        if (parsedResponse.content && parsedResponse.imageDescription && parsedResponse.searchKeywords) {
          return {
            content: cleanContent(parsedResponse.content),
            imageDescription: parsedResponse.imageDescription.trim(),
            searchKeywords: parsedResponse.searchKeywords
          };
        }
      }
      
      throw new Error('JSON inválido ou propriedades faltando');
    } catch (parseError) {
      console.warn('Resposta não está em JSON válido, usando fallback:', parseError);
      console.log('Raw response:', rawResponse);
      
      // Fallback: extrair conteúdo e gerar descrições
      const fallbackContent = extractContentFromMixedResponse(rawResponse);
      return {
        content: cleanContent(fallbackContent),
        imageDescription: generateFallbackImageDescription(conversationData),
        searchKeywords: generateFallbackKeywords(conversationData)
      };
    }
  } catch (error) {
    console.error('Erro na API OpenAI:', error);
    // Fallback completo se a API falhar
    const fallbackContent = generateFallback(conversationData);
    return {
      content: fallbackContent,
      imageDescription: generateFallbackImageDescription(conversationData),
      searchKeywords: generateFallbackKeywords(conversationData)
    };
  }
};

// Construir prompt otimizado para gerar conteúdo + dupla descrição
const buildPrompt = (data) => {
  const platformSpecs = {
    'Instagram': {
      maxLength: '2200 caracteres',
      style: 'Visual e inspirador com storytelling',
      hashtags: '5-10 hashtags relevantes e estratégicos',
      emojis: 'Use emojis estrategicamente',
      format: 'Quebras de linha para facilitar leitura',
      engagement: 'Perguntas diretas, calls-to-action',
      imageStyle: 'Quadrada, alta qualidade, lifestyle, visualmente atrativa'
    },
    'Facebook': {
      maxLength: '2000 caracteres',
      style: 'Conversacional e storytelling',
      hashtags: '2-5 hashtags moderados',
      emojis: 'Use com moderação',
      format: 'Parágrafos bem estruturados',
      engagement: 'Estimule comentários e discussões',
      imageStyle: 'Storytelling visual, autêntica, horizontal ou quadrada'
    },
    'LinkedIn': {
      maxLength: '3000 caracteres',
      style: 'Profissional mas humano, insights valiosos',
      hashtags: '3-5 hashtags estratégicos do setor',
      emojis: 'Poucos emojis profissionais',
      format: 'Estrutura clara, bullet points',
      engagement: 'Networking e discussão profissional',
      imageStyle: 'Profissional, limpa, corporativa, ambiente de negócios'
    },
    'Twitter': {
      maxLength: '280 caracteres',
      style: 'Conciso, direto e impactante',
      hashtags: '1-3 hashtags principais',
      emojis: '1-2 emojis estratégicos',
      format: 'Texto direto, cada palavra conta',
      engagement: 'Retweets e respostas',
      imageStyle: 'Horizontal, informativa, clara, sem excesso de elementos'
    }
  };

  const platformKey = data.platform.replace(/[📸👥💼🐦]/g, '').trim();
  const currentPlatform = platformSpecs[platformKey] || platformSpecs['Instagram'];

  return `Crie um post altamente engajante para ${platformKey} seguindo estas especificações:

BRIEFING DO CLIENTE:
- Objetivo: ${data.objective}
- Público-alvo: ${data.audience}
- Tom de voz: ${data.tone}
- Conteúdo principal: ${data.content}
${data.additional ? `- Instruções especiais: ${data.additional}` : ''}

ESPECIFICAÇÕES DA PLATAFORMA (${platformKey}):
- Limite: ${currentPlatform.maxLength}
- Estilo: ${currentPlatform.style}
- Hashtags: ${currentPlatform.hashtags}
- Emojis: ${currentPlatform.emojis}
- Formatação: ${currentPlatform.format}
- Engajamento: ${currentPlatform.engagement}
- Estilo da imagem: ${currentPlatform.imageStyle}

DIRETRIZES CRÍTICAS:
1. NÃO use formatação markdown (**, *, ##, etc.) - apenas texto limpo
2. Seja autêntico e genuíno, evite clichês
3. Use gatilhos psicológicos adequados ao objetivo
4. Inclua call-to-action natural e convincente
5. Adapte perfeitamente ao tom de voz solicitado
6. Otimize para máximo engajamento da plataforma

RESPOSTA OBRIGATÓRIA EM JSON:
{
  "content": "Texto completo do post otimizado para a plataforma, incluindo emojis, hashtags e formatação adequada",
  "imageDescription": "Descrição completa e detalhada para geração de imagem por IA. Deve incluir: cenário específico, objetos presentes, estilo fotográfico, iluminação, cores dominantes, atmosfera/mood, composição. Use linguagem descritiva rica para IA de imagem como DALL-E. Exemplo: 'Modern minimalist office workspace with sleek laptop computer and white ceramic coffee cup on clean wooden desk, soft natural lighting streaming through large window, organized environment with small green potted plants, professional photography style with shallow depth of field, warm and productive atmosphere, muted color palette of whites and natural wood tones'",
  "searchKeywords": "2-5 palavras-chave simples e diretas para busca de imagens em bancos como Pexels e Unsplash. Exemplo: 'office workspace modern'"
}

IMPORTANTE: 
- imageDescription deve ser uma descrição rica e completa (50-150 palavras)
- searchKeywords deve conter apenas 2-5 palavras-chave separadas por espaços
- Ambas devem ser relevantes ao conteúdo do post gerado

Crie agora o post completo:`;
};

// Extrair conteúdo de resposta mista (quando não é JSON puro)
const extractContentFromMixedResponse = (rawResponse) => {
  try {
    // Tentar encontrar JSON dentro da resposta
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.content) {
        return parsed.content;
      }
    }
    
    // Se não encontrou JSON, usar resposta limpa
    return rawResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/^\s*\{.*?"content":\s*"/i, '')
      .replace(/",\s*"imageDescription":.*$/i, '')
      .trim();
  } catch (error) {
    return rawResponse.trim();
  }
};

// Limpar conteúdo de markdown
const cleanContent = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/---/g, '')
    .replace(/^\s*[-*+]\s/gm, '')
    .trim();
};

// Gerar descrição completa de fallback para DALL-E
const generateFallbackImageDescription = (data) => {
  const platform = data.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Instagram';
  const objective = data.objective || '';
  const audience = data.audience || '';
  
  // Descrições base por objetivo
  const objectiveDescriptions = {
    'Vender produto/serviço': 'Clean modern workspace showcasing product presentation setup with professional lighting, organized desk environment featuring laptop computer and business materials, minimalist aesthetic with neutral color palette, commercial photography style with high-quality finish',
    'Aumentar engajamento': 'Vibrant creative workspace with dynamic composition, laptop computer surrounded by colorful design elements, inspiring environment with natural lighting, contemporary aesthetic with bold accent colors, lifestyle photography capturing energy and creativity',
    'Educar audiência': 'Organized study workspace featuring open books, laptop computer, and learning materials arranged on clean desk, soft natural lighting creating focused atmosphere, educational setting with warm color tones, professional documentation style',
    'Inspirar pessoas': 'Motivational workspace setup with laptop, success symbols, and inspiring elements, bright natural lighting creating uplifting atmosphere, aspirational environment with clean modern design, empowering mood with warm golden tones',
    'Criar buzz': 'Trendy modern workspace with contemporary design elements, laptop computer as focal point, cutting-edge aesthetic with dynamic composition, innovative environment with bold visual elements, stylish photography with vibrant energy'
  };
  
  let description = objectiveDescriptions[objective] || 'Modern professional workspace with laptop computer, clean desk setup, natural lighting, organized environment, contemporary business setting with neutral color palette';
  
  // Adaptar por plataforma
  const platformAdaptations = {
    'Instagram': ', square format composition optimized for social media, aesthetic and lifestyle focused with Instagram-worthy appeal',
    'Facebook': ', horizontal or square format with authentic storytelling elements, relatable and engaging visual narrative',
    'LinkedIn': ', professional corporate environment with business-oriented composition, authoritative and trustworthy atmosphere',
    'Twitter': ', simple clear composition that works well at small sizes, informative and easily readable visual elements'
  };
  
  description += platformAdaptations[platform] || platformAdaptations['Instagram'];
  
  // Adicionar especificações técnicas
  description += ', high-quality professional photography, no text overlay, no logos, no people faces visible, modern aesthetic with clean composition';
  
  return description;
};

// Gerar keywords de fallback para busca
const generateFallbackKeywords = (data) => {
  const platform = data.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Instagram';
  const objective = data.objective || '';
  
  // Keywords base por objetivo
  const objectiveKeywords = {
    'Vender produto/serviço': 'business presentation',
    'Aumentar engajamento': 'creative workspace',
    'Educar audiência': 'study learning',
    'Inspirar pessoas': 'success motivation',
    'Criar buzz': 'modern trendy'
  };
  
  // Keywords por plataforma
  const platformKeywords = {
    'Instagram': 'lifestyle aesthetic',
    'Facebook': 'social authentic',
    'LinkedIn': 'professional corporate',
    'Twitter': 'simple clean'
  };
  
  const baseKeywords = objectiveKeywords[objective] || 'business office';
  const platformWords = platformKeywords[platform] || 'professional';
  
  return `${baseKeywords} ${platformWords}`;
};

// Templates de fallback
const generateFallback = (data) => {
  const templates = {
    'Instagram': `Você sabia que 90% das pessoas desistem bem na reta final?

${data.content || 'Aqui está uma reflexão importante sobre persistência e sucesso'}

Mas aqui está o segredo que mudou tudo para ${data.audience || 'empreendedores como você'}: consistência supera perfeição.

As 3 coisas que aprendi:
🎯 Foque no progresso, não na perfeição
⚡ Pequenas ações diárias = grandes resultados
🔥 Sua jornada inspira outros

E você? Qual foi sua maior lição esse ano?

Comenta aqui embaixo e salva este post para lembrar depois!

#motivacao #crescimento #mindset #sucesso #inspiracao #foco #disciplina #resultado`,

    'Facebook': `Aconteceu algo que me fez refletir muito...

${data.content || 'Uma experiência recente me ensinou algo valioso sobre persistência'}

Conversando com ${data.audience || 'pessoas incríveis'}, percebi que todos nós passamos pelos mesmos desafios. A diferença está em como escolhemos reagir.

Aqui estão as 3 lições que mudaram minha perspectiva:

→ Problemas são oportunidades disfarçadas
→ O não de hoje pode ser o sim de amanhã  
→ Cada pequeno passo conta mais do que esperamos

O que mais me impressiona é ver como essas mudanças simples podem transformar completamente os resultados.

E vocês? Já passaram por algo assim? Compartilhem suas experiências nos comentários! Adoro ler suas histórias.`,

    'LinkedIn': `Insight importante sobre o mercado atual que preciso compartilhar.

${data.content || 'Uma tendência que observei trabalhando com diferentes empresas'}

Trabalhando diretamente com ${data.audience || 'profissionais e empresas'}, observei um padrão interessante que poucos estão discutindo.

Principais descobertas:

• A diferenciação real está na execução, não na estratégia
• Relacionamentos superam qualquer tática de vendas  
• Consistência gera mais valor que campanhas pontuais
• Autenticidade é o novo ROI

O resultado tem sido crescimento sustentável e parcerias duradouras com clientes que realmente valorizam nosso trabalho.

Como vocês têm equilibrado inovação e consistência em suas estratégias? Gostaria de ouvir suas experiências.

#estrategia #crescimento #relacionamentos #resultados #inovacao`,

    'Twitter': `Plot twist: ${data.content || 'A chave do sucesso não é o que você pensa'}

Para ${data.audience || 'empreendedores'}, isso mudou tudo.

A receita? Foco + Consistência + Paciência.

Resultado: 300% mais engajamento em 90 dias.

Thread nos comentários com o passo a passo completo

#marketing #resultados #crescimento`
  };
  
  const platformKey = data.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Instagram';
  const selectedTemplate = templates[platformKey] || templates['Instagram'];
  return cleanContent(selectedTemplate);
};