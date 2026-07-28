export interface TenantUser {
  uid: string;
  email: string;
  companyName: string;
  createdAt: string;
  plan?: 'starter' | 'pro' | 'enterprise';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface KBDocument {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  type?: 'pdf' | 'doc' | 'text' | 'image';
  fileName?: string;
  fileSize?: string;
}

export interface KBUrl {
  id: string;
  url: string;
  status: 'indexed' | 'crawling' | 'failed';
  pageTitle?: string;
  textContent?: string;
  lastCrawledAt?: string;
}

export interface ChatbotConfig {
  id: string;
  tenantId: string;
  name: string;
  welcomeMessage: string;
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  avatarUrl?: string;
  suggestedPrompts: string[];
  customSystemPrompt: string;
  collectUserEmail: boolean;
  kbUrls: KBUrl[];
  kbFaqs: FAQItem[];
  kbDocs: KBDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  chatbotId: string;
  tenantId: string;
  visitorId: string;
  customerName?: string;
  customerEmail?: string;
  status: 'open' | 'resolved' | 'transferred';
  createdAt: string;
  lastMessageAt: string;
  lastMessageText: string;
  unreadForTenant?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  chatbotId: string;
  tenantId: string;
  sender: 'user' | 'bot' | 'agent';
  text: string;
  createdAt: string;
  sources?: string[];
}

export interface AnalyticsSummary {
  totalConversations: number;
  totalMessages: number;
  aiResolutionRate: number;
  leadsCaptured: number;
  avgResponseTimeMs: number;
}
