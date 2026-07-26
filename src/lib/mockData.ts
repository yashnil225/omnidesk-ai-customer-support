import { ChatbotConfig, Conversation, Message } from '../types';

export const INITIAL_DEMO_CHATBOT: ChatbotConfig = {
  id: 'bot_demo_101',
  tenantId: 'demo_tenant_1',
  name: 'OmniSupport Concierge',
  welcomeMessage: '👋 Hello! Welcome to OmniDesk. How can I help you today?',
  primaryColor: '#4F46E5', // Indigo
  position: 'bottom-right',
  avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200',
  suggestedPrompts: [
    'What features are included in the Pro Plan?',
    'How do I embed the chat widget on my website?',
    'What are your support hours and SLAs?',
    'Can I train the bot with custom PDFs?'
  ],
  customSystemPrompt: `You are OmniSupport Concierge, a friendly, knowledgeable, and professional AI customer support representative for OmniDesk SaaS.
Your primary objective is to assist visitors with questions about pricing, integrations, features, technical support, and account setup.
Always maintain a polite, concise, and reassuring tone.
If you are unsure of an answer or if the query requires human billing intervention, politely offer to collect their email so a human agent can follow up.`,
  collectUserEmail: true,
  kbUrls: [
    {
      id: 'url_1',
      url: 'https://omnidesk.ai/docs/getting-started',
      status: 'indexed',
      pageTitle: 'Getting Started with OmniDesk Widget Integration',
      textContent: 'OmniDesk lets you embed AI chatbots onto WordPress, Shopify, Webflow, and React apps using a single JS snippet. Widgets support real-time streaming, custom branding, and automated lead capture.',
      lastCrawledAt: new Date().toISOString()
    },
    {
      id: 'url_2',
      url: 'https://omnidesk.ai/pricing',
      status: 'indexed',
      pageTitle: 'OmniDesk Pricing & Plans',
      textContent: 'Starter Plan: $29/mo (1 chatbot, 1,000 chats/mo). Pro Plan: $79/mo (5 chatbots, 10,000 chats/mo, PDF training, custom domain). Enterprise Plan: $249/mo (Unlimited chatbots, priority human handoff, custom SLAs).',
      lastCrawledAt: new Date().toISOString()
    }
  ],
  kbFaqs: [
    {
      id: 'faq_1',
      question: 'How do I install the chatbot widget on my website?',
      answer: 'Simply copy the generated 1-line JavaScript snippet from your Dashboard under Embed & Share tab, then paste it before the closing </body> tag of your HTML, WordPress, Shopify, or Webflow site.',
      category: 'Installation'
    },
    {
      id: 'faq_2',
      question: 'Can I train the AI on my company documents and PDFs?',
      answer: 'Yes! Navigate to Knowledge Base tab in your chatbot editor. You can upload PDF files, plain text documents, import website URLs, or manually add Q&A pairs.',
      category: 'Training'
    },
    {
      id: 'faq_3',
      question: 'How does human agent handoff work?',
      answer: 'If a customer asks to speak with a human or if the AI flags an issue, the conversation is marked as "Transferred" in your Inbox tab, notifying your agent team in real-time.',
      category: 'Support'
    }
  ],
  kbDocs: [
    {
      id: 'doc_1',
      title: 'Company Return & Refund Policy',
      content: 'We offer a 30-day money-back guarantee for all subscription plans. Refund requests submitted within 30 days of purchase are processed within 3-5 business days without hassle.',
      updatedAt: new Date().toISOString(),
      type: 'doc'
    },
    {
      id: 'doc_2',
      title: 'Security & Data Privacy Specification',
      content: 'All chat logs and uploaded documents are encrypted at rest using AES-256 and in transit via TLS 1.3. We do not use customer proprietary data to train foundation models.',
      updatedAt: new Date().toISOString(),
      type: 'pdf'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const INITIAL_DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1001',
    chatbotId: 'bot_demo_101',
    tenantId: 'demo_tenant_1',
    visitorId: 'vis_99182',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@acme.io',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastMessageAt: new Date(Date.now() - 300000).toISOString(),
    lastMessageText: 'Can I connect this with our Shopify store?',
    unreadForTenant: true
  },
  {
    id: 'conv_1002',
    chatbotId: 'bot_demo_101',
    tenantId: 'demo_tenant_1',
    visitorId: 'vis_88219',
    customerName: 'Marcus Vance',
    customerEmail: 'mvance@techcorp.com',
    status: 'resolved',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    lastMessageAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    lastMessageText: 'Thank you, that solved my issue!',
    unreadForTenant: false
  },
  {
    id: 'conv_1003',
    chatbotId: 'bot_demo_101',
    tenantId: 'demo_tenant_1',
    visitorId: 'vis_77312',
    customerName: 'David Lee',
    customerEmail: 'david@startup.co',
    status: 'transferred',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    lastMessageAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    lastMessageText: 'I need custom enterprise SLA terms and SOC2 compliance documents.',
    unreadForTenant: true
  }
];

export const INITIAL_DEMO_MESSAGES: Record<string, Message[]> = {
  conv_1001: [
    {
      id: 'msg_1',
      conversationId: 'conv_1001',
      chatbotId: 'bot_demo_101',
      tenantId: 'demo_tenant_1',
      sender: 'bot',
      text: '👋 Hello! Welcome to OmniDesk. How can I help you today?',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'msg_2',
      conversationId: 'conv_1001',
      chatbotId: 'bot_demo_101',
      tenantId: 'demo_tenant_1',
      sender: 'user',
      text: 'Can I connect this with our Shopify store?',
      createdAt: new Date(Date.now() - 300000).toISOString()
    }
  ],
  conv_1002: [
    {
      id: 'msg_3',
      conversationId: 'conv_1002',
      chatbotId: 'bot_demo_101',
      tenantId: 'demo_tenant_1',
      sender: 'bot',
      text: '👋 Hello! Welcome to OmniDesk. How can I help you today?',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'msg_4',
      conversationId: 'conv_1002',
      chatbotId: 'bot_demo_101',
      tenantId: 'demo_tenant_1',
      sender: 'user',
      text: 'What are your support hours?',
      createdAt: new Date(Date.now() - 3600000 * 23).toISOString()
    },
    {
      id: 'msg_5',
      conversationId: 'conv_1002',
      chatbotId: 'bot_demo_101',
      tenantId: 'demo_tenant_1',
      sender: 'bot',
      text: 'Our AI Concierge is available 24/7! Human agent live support is active Monday through Friday from 8:00 AM to 8:00 PM EST.',
      createdAt: new Date(Date.now() - 3600000 * 22).toISOString()
    },
    {
      id: 'msg_6',
      conversationId: 'conv_1002',
      chatbotId: 'bot_demo_101',
      tenantId: 'demo_tenant_1',
      sender: 'user',
      text: 'Thank you, that solved my issue!',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    }
  ]
};
