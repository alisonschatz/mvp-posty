// Integração com GPT-4 e geração de conteúdo + descrição de imagem
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
            content: "Você é um especialista em marketing digital e criação de conteúdo para redes sociais. Crie posts envolventes, autênticos e otimizados para cada plataforma. IMPORTANTE: Responda APENAS com um JSON válido contendo 'content' (texto do post) e 'imageDescription' (descrição detalhada da imagem ideal). Não inclua formatação markdown no conteúdo."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1500,
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
      // Tentar fazer parse do JSON
      const parsedResponse = JSON.parse(rawResponse);
      return {
        content: cleanContent(parsedResponse.content),
        imageDescription: parsedResponse.imageDescription
      };
    } catch (parseError) {
      console.warn('Resposta não está em JSON, usando fallback:', parseError);
      // Fallback se não for JSON válido
      return {
        content: cleanContent(rawResponse),
        imageDescription: generateFallbackImageDescription(conversationData)
      };
    }
  } catch (error) {
    console.error('Erro na API OpenAI:', error);
    // Fallback para templates se a API falhar
    const fallbackContent = generateFallback(conversationData);
    return {
      content: fallbackContent,
      imageDescription: generateFallbackImageDescription(conversationData)
    };
  }
};

// Construir prompt otimizado para GPT com geração de descrição de imagem
const buildPrompt = (data) => {
  const platformSpecs = {
    'Instagram': {
      maxLength: '2200 caracteres',
      style: 'Visual e inspirador com storytelling',
      hashtags: '5-10 hashtags relevantes e estratégicos',
      emojis: 'Use emojis estrategicamente para destacar pontos importantes',
      format: 'Quebras de linha para facilitar leitura, hooks visuais',
      engagement: 'Perguntas diretas, calls-to-action para salvar/compartilhar',
      imageStyle: 'Quadrada (1:1), alta qualidade, visualmente atrativa, lifestyle'
    },
    'Facebook': {
      maxLength: '2000 caracteres',
      style: 'Conversacional e storytelling, tom mais pessoal',
      hashtags: '2-5 hashtags no máximo, uso moderado',
      emojis: 'Use com moderação, foque na narrativa',
      format: 'Parágrafos bem estruturados, fácil de ler',
      engagement: 'Estimule comentários e discussões',
      imageStyle: 'Horizontal ou quadrada, storytelling visual, autêntica'
    },
    'LinkedIn': {
      maxLength: '3000 caracteres',
      style: 'Profissional mas humano, insights valiosos',
      hashtags: '3-5 hashtags estratégicos do setor',
      emojis: 'Poucos emojis profissionais quando apropriado',
      format: 'Estrutura clara com bullet points ou numeração',
      engagement: 'Perguntas que geram networking e discussão profissional',
      imageStyle: 'Profissional, limpa, corporativa, horizontal preferível'
    },
    'Twitter': {
      maxLength: '280 caracteres',
      style: 'Conciso, direto e impactante',
      hashtags: '1-3 hashtags principais, máximo eficiência',
      emojis: '1-2 emojis estratégicos se necessário',
      format: 'Texto direto, cada palavra conta',
      engagement: 'Threads se necessário, retweets e respostas',
      imageStyle: 'Horizontal, informativa, clara, sem muito texto'
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
2. Seja autêntico e genuíno, evite clichês de marketing
3. Use gatilhos psicológicos adequados ao objetivo
4. Inclua call-to-action natural e convincente
5. Adapte perfeitamente ao tom de voz solicitado
6. Otimize para máximo engajamento da plataforma específica

RESPOSTA OBRIGATÓRIA EM JSON:
{
  "content": "Texto completo do post otimizado para a plataforma, incluindo emojis, hashtags e formatação adequada",
  "imageDescription": "Descrição detalhada e específica da imagem ideal para este post. Deve descrever: cenário, pessoas (sem rostos específicos), objetos, cores dominantes, estilo fotográfico, mood/atmosfera, e elementos visuais que complementem perfeitamente o conteúdo. Use linguagem descritiva e específica para IA de geração de imagens."
}

EXEMPLO DE imageDescription:
"Professional workspace with modern laptop, coffee cup, and notebook on clean white desk. Soft natural lighting from window. Minimalist style with plants in background. Warm, productive atmosphere. No people visible, focus on organized workspace setup. Colors: whites, light wood, green plants."

Crie agora o post e a descrição da imagem ideal:`;
};

// Limpar conteúdo de markdown e formatações
const cleanContent = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '') // Remove **
    .replace(/\*/g, '') // Remove *
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/`{1,3}/g, '') // Remove code blocks
    .replace(/---/g, '') // Remove separadores
    .replace(/^\s*[-*+]\s/gm, '') // Remove bullet points markdown
    .trim();
};

// Gerar descrição de imagem de fallback
const generateFallbackImageDescription = (data) => {
  const platform = data.platform?.replace(/[📸👥💼🐦]/g, '').trim() || 'Instagram';
  const audience = data.audience || 'professionals';
  const objective = data.objective || '';
  
  // Mapear objetivos para estilos visuais
  const objectiveToVisual = {
    'Vender produto/serviço': 'Product showcase with professional lighting, clean background, modern aesthetic',
    'Aumentar engajamento': 'Vibrant, eye-catching scene with dynamic composition, bright colors',
    'Educar audiência': 'Clean, organized workspace or learning environment, professional setup',
    'Inspirar pessoas': 'Uplifting scene with natural lighting, aspirational mood, motivational atmosphere',
    'Criar buzz': 'Dynamic, trending aesthetic with bold colors and modern composition'
  };
  
  const baseDescription = objectiveToVisual[objective] || 'Professional business setting with clean, modern aesthetic';
  
  // Adaptar por plataforma
  const platformAdaptations = {
    'Instagram': 'Square format, lifestyle photography style, Instagram-worthy composition',
    'Facebook': 'Authentic, relatable scene that tells a story, horizontal or square format',
    'LinkedIn': 'Professional corporate environment, business setting, clean and authoritative',
    'Twitter': 'Clear, simple composition that works at small sizes, horizontal format'
  };
  
  const platformStyle = platformAdaptations[platform] || platformAdaptations['Instagram'];
  
  return `${baseDescription}. ${platformStyle}. Target audience: ${audience}. Natural lighting, high quality, no text overlay, no people's faces, professional photography style.`;
};

// Templates melhorados para fallback
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