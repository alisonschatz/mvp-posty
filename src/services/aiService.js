// Integração com GPT-5 e Unsplash
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
        model: "gpt-4o", // Use "gpt-5" quando estiver disponível na sua conta
        messages: [
          {
            role: "system",
            content: "Você é um especialista em marketing digital e criação de conteúdo para redes sociais. Crie posts envolventes, autênticos e otimizados para cada plataforma. IMPORTANTE: Responda APENAS com o texto do post, sem formatação markdown (**, *, #, etc). Use apenas texto limpo, emojis e quebras de linha."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }
    
    const data = await response.json();
    return cleanContent(data.choices[0].message.content);
  } catch (error) {
    console.error('Erro na API OpenAI:', error);
    // Fallback para templates se a API falhar
    return generateFallback(conversationData);
  }
};

// Construir prompt otimizado para GPT
const buildPrompt = (data) => {
  const platformSpecs = {
    '📸 Instagram': {
      maxLength: '2200 caracteres',
      style: 'Visual e inspirador com storytelling',
      hashtags: '5-10 hashtags relevantes e estratégicos',
      emojis: 'Use emojis estrategicamente para destacar pontos importantes',
      format: 'Quebras de linha para facilitar leitura, hooks visuais',
      engagement: 'Perguntas diretas, calls-to-action para salvar/compartilhar'
    },
    '👥 Facebook': {
      maxLength: '2000 caracteres',
      style: 'Conversacional e storytelling, tom mais pessoal',
      hashtags: '2-5 hashtags no máximo, uso moderado',
      emojis: 'Use com moderação, foque na narrativa',
      format: 'Parágrafos bem estruturados, fácil de ler',
      engagement: 'Estimule comentários e discussões'
    },
    '💼 LinkedIn': {
      maxLength: '3000 caracteres',
      style: 'Profissional mas humano, insights valiosos',
      hashtags: '3-5 hashtags estratégicos do setor',
      emojis: 'Poucos emojis profissionais quando apropriado',
      format: 'Estrutura clara com bullet points ou numeração',
      engagement: 'Perguntas que geram networking e discussão profissional'
    },
    '🐦 Twitter': {
      maxLength: '280 caracteres',
      style: 'Conciso, direto e impactante',
      hashtags: '1-3 hashtags principais, máximo eficiência',
      emojis: '1-2 emojis estratégicos se necessário',
      format: 'Texto direto, cada palavra conta',
      engagement: 'Threads se necessário, retweets e respostas'
    }
  };

  const currentPlatform = platformSpecs[data.platform] || platformSpecs['📸 Instagram'];
  const platformName = data.platform.replace(/[📸👥💼🐦]/g, '').trim();

  return `Crie um post altamente engajante para ${platformName} seguindo estas especificações:

BRIEFING DO CLIENTE:
- Objetivo: ${data.objective}
- Público-alvo: ${data.audience}
- Tom de voz: ${data.tone}
- Conteúdo principal: ${data.content}
${data.additional ? `- Instruções especiais: ${data.additional}` : ''}

ESPECIFICAÇÕES DA PLATAFORMA (${platformName}):
- Limite: ${currentPlatform.maxLength}
- Estilo: ${currentPlatform.style}
- Hashtags: ${currentPlatform.hashtags}
- Emojis: ${currentPlatform.emojis}
- Formatação: ${currentPlatform.format}
- Engajamento: ${currentPlatform.engagement}

DIRETRIZES CRÍTICAS:
1. NÃO use formatação markdown (**, *, ##, etc.) - apenas texto limpo
2. Seja autêntico e genuíno, evite clichês de marketing
3. Use gatilhos psicológicos adequados ao objetivo (urgência, exclusividade, prova social, etc.)
4. Inclua call-to-action natural e convincente
5. Adapte perfeitamente ao tom de voz solicitado
6. Otimize para máximo engajamento da plataforma específica
7. Use storytelling quando apropriado
8. Inclua elementos de prova social se relevante

ESTRUTURA SUGERIDA:
- Hook inicial irresistível (primeira frase que para o scroll)
- Desenvolvimento do valor/conteúdo principal
- Conexão emocional com o público-alvo
- Call-to-action estratégico para engajamento
- Hashtags otimizadas (apenas se especificado para a plataforma)

RESULTADO ESPERADO:
Um post que seja impossível de ignorar, gere engajamento real e converta seguidores em ação. Foque na qualidade sobre quantidade de palavras.`;
};

// Limpar conteúdo de markdown e formatações
const cleanContent = (text) => {
  return text
    .replace(/\*\*/g, '') // Remove **
    .replace(/\*/g, '') // Remove *
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/`{1,3}/g, '') // Remove code blocks
    .replace(/---/g, '') // Remove separadores
    .replace(/^\s*[-*+]\s/gm, '') // Remove bullet points markdown
    .trim();
};

// Templates melhorados para fallback
const generateFallback = (data) => {
  const templates = {
    '📸 Instagram': `✨ Você sabia que 90% das pessoas desistem bem na reta final?

${data.content || 'Aqui está uma reflexão importante sobre persistência e sucesso'}

Mas aqui está o segredo que mudou tudo para ${data.audience || 'empreendedores como você'}: consistência supera perfeição.

💡 As 3 coisas que aprendi:
🎯 Foque no progresso, não na perfeição
⚡ Pequenas ações diárias = grandes resultados
🔥 Sua jornada inspira outros

E você? Qual foi sua maior lição esse ano?

Comenta aqui embaixo e salva este post para lembrar depois! 👇

#motivacao #crescimento #mindset #sucesso #inspiracao #foco #disciplina #resultado`,

    '👥 Facebook': `Aconteceu algo que me fez refletir muito...

${data.content || 'Uma experiência recente me ensinou algo valioso sobre persistência'}

Conversando com ${data.audience || 'pessoas incríveis'}, percebi que todos nós passamos pelos mesmos desafios. A diferença está em como escolhemos reagir.

Aqui estão as 3 lições que mudaram minha perspectiva:

→ Problemas são oportunidades disfarçadas
→ O não de hoje pode ser o sim de amanhã  
→ Cada pequeno passo conta mais do que esperamos

O que mais me impressiona é ver como essas mudanças simples podem transformar completamente os resultados.

E vocês? Já passaram por algo assim? Compartilhem suas experiências nos comentários! Adoro ler suas histórias. 💭`,

    '💼 LinkedIn': `Insight importante sobre o mercado atual que preciso compartilhar.

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

    '🐦 Twitter': `🎯 Plot twist: ${data.content || 'A chave do sucesso não é o que você pensa'}

Para ${data.audience || 'empreendedores'}, isso mudou tudo.

A receita? Foco + Consistência + Paciência.

Resultado: 300% mais engajamento em 90 dias.

Thread nos comentários com o passo a passo completo 👇

#marketing #resultados #crescimento`
  };
  
  const selectedTemplate = templates[data.platform] || templates['📸 Instagram'];
  return cleanContent(selectedTemplate);
};