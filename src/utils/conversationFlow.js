// Fluxo da conversa com a IA
export const conversationFlow = [
  {
    id: 'welcome',
    type: 'ai',
    content: "Olá! 👋 Sou o assistente do Posty e estou aqui para te ajudar a criar posts incríveis!\n\nVamos começar? Só me diga: **qual é a vibe do seu post hoje?**",
    options: [
      "💰 Vender produto/serviço",
      "💬 Aumentar engajamento", 
      "📢 Educar audiência",
      "✨ Inspirar pessoas",
      "🔥 Criar buzz"
    ]
  },
  {
    id: 'platform',
    type: 'ai',
    content: "Perfeito! **Para qual rede social você quer criar esse post?**",
    options: [
      "📸 Instagram",
      "👥 Facebook", 
      "💼 LinkedIn",
      "🐦 Twitter"
    ]
  },
  {
    id: 'audience',
    type: 'ai',
    content: "Ótima escolha! **Agora me fala: quem é seu público-alvo?**\n\nPor exemplo: *\"Empreendedores de 25-40 anos interessados em produtividade\"*"
  },
  {
    id: 'tone',
    type: 'ai',
    content: "Entendi seu público! **Que tom de voz você quer usar?** Pode escolher mais de um:",
    options: [
      "😎 Descontraído",
      "🔥 Motivacional",
      "💡 Criativo", 
      "👑 Confiante",
      "❤️ Empático",
      "⚡ Urgente",
      "🤝 Próximo"
    ],
    multiSelect: true
  },
  {
    id: 'content',
    type: 'ai',
    content: "Show! **Agora me conta sobre o que você quer falar no post.**\n\nPode ser sobre seu produto, uma reflexão, uma dica... Quanto mais detalhes, melhor será o resultado!"
  },
  {
    id: 'additional',
    type: 'ai',
    content: "Quase pronto! **Tem alguma instrução especial?** Algo específico que você gostaria de incluir?",
    options: ["Pular essa etapa", "Tenho instruções específicas"]
  },
  {
    id: 'generate',
    type: 'ai',
    content: "🎉 **Perfeito! Tenho tudo que preciso.**\n\nVou criar um post incrível para você agora. Preparado?",
    options: ["Vamos lá! 🚀"]
  }
];