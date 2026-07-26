import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { ChatbotList } from './components/ChatbotList';
import { KnowledgeBaseManager } from './components/KnowledgeBaseManager';
import { WidgetCustomizer } from './components/WidgetCustomizer';
import { InboxView } from './components/InboxView';
import { EmbedCodeModal } from './components/EmbedCodeModal';
import { DemoWebsitePreview } from './components/DemoWebsitePreview';
import { AuthModal } from './components/AuthModal';
import { 
  INITIAL_DEMO_CHATBOT, 
  INITIAL_DEMO_CONVERSATIONS, 
  INITIAL_DEMO_MESSAGES 
} from './lib/mockData';
import { ChatbotConfig, Conversation, Message, TenantUser } from './types';
import { saveChatbot } from './lib/supabase';

export default function App() {
  // Default tenant user for instant interactive preview
  const [user, setUser] = useState<TenantUser | null>({
    uid: 'demo_tenant_1',
    email: 'alex@omnidesk.ai',
    companyName: 'Acme SaaS Corp',
    createdAt: new Date().toISOString(),
    plan: 'pro',
  });

  // State
  const [chatbots, setChatbots] = useState<ChatbotConfig[]>([INITIAL_DEMO_CHATBOT]);
  const [selectedChatbot, setSelectedChatbot] = useState<ChatbotConfig | null>(INITIAL_DEMO_CHATBOT);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_DEMO_CONVERSATIONS);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(INITIAL_DEMO_MESSAGES);

  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Sync selected chatbot changes back to server & list
  const handleUpdateChatbot = (updatedBot: ChatbotConfig) => {
    setSelectedChatbot(updatedBot);
    setChatbots((prev) => prev.map((b) => (b.id === updatedBot.id ? updatedBot : b)));

    // Save to server in-memory & Firestore
    fetch('/api/chatbot/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatbot: updatedBot }),
    }).catch((err) => console.warn('Could not sync chatbot to Express cache:', err));

    saveChatbot(updatedBot).catch((err) => console.warn('Could not sync chatbot to Firestore:', err));
  };

  // Create new chatbot
  const handleCreateChatbot = (newBotData: Partial<ChatbotConfig>) => {
    const newBot: ChatbotConfig = {
      id: 'bot_' + Date.now(),
      tenantId: user?.uid || 'demo_tenant_1',
      name: newBotData.name || 'New AI Bot',
      welcomeMessage: newBotData.welcomeMessage || '👋 Welcome! How can I assist you?',
      primaryColor: newBotData.primaryColor || '#4F46E5',
      position: newBotData.position || 'bottom-right',
      avatarUrl: newBotData.avatarUrl || '',
      suggestedPrompts: newBotData.suggestedPrompts || ['How do I get started?', 'What are your prices?'],
      customSystemPrompt: newBotData.customSystemPrompt || 'You are an AI support assistant.',
      collectUserEmail: true,
      kbUrls: [],
      kbFaqs: [],
      kbDocs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setChatbots((prev) => [...prev, newBot]);
    setSelectedChatbot(newBot);
    handleUpdateChatbot(newBot);
    setActiveTab('knowledge');
  };

  // Inbox Agent Reply
  const handleSendAgentReply = (conversationId: string, text: string) => {
    const agentMsg: Message = {
      id: 'msg_agent_' + Date.now(),
      conversationId,
      chatbotId: selectedChatbot?.id || 'bot_demo_101',
      tenantId: user?.uid || 'demo_tenant_1',
      sender: 'agent',
      text,
      createdAt: new Date().toISOString(),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), agentMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessageText: text,
              lastMessageAt: new Date().toISOString(),
              status: 'open',
            }
          : c
      )
    );
  };

  const handleUpdateConvStatus = (conversationId: string, status: 'open' | 'resolved' | 'transferred') => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, status } : c))
    );
  };

  const unreadConversationsCount = conversations.filter((c) => c.unreadForTenant).length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans flex flex-col">
      {/* Top Header Navigation */}
      <Header
        user={user}
        chatbots={chatbots}
        selectedChatbot={selectedChatbot}
        onSelectChatbot={(bot) => setSelectedChatbot(bot)}
        onCreateChatbot={() => handleCreateChatbot({ name: 'New AI Assistant' })}
        onOpenEmbedModal={() => setShowEmbedModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onSignOut={() => setUser(null)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          unreadCount={unreadConversationsCount}
        />

        {/* Center Main Content Panel */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'overview' && (
            <DashboardOverview
              chatbots={chatbots}
              conversations={conversations}
              selectedChatbot={selectedChatbot}
              onCreateChatbot={() => handleCreateChatbot({ name: 'New Support Assistant' })}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenEmbedModal={() => setShowEmbedModal(true)}
            />
          )}

          {activeTab === 'chatbots' && (
            <ChatbotList
              chatbots={chatbots}
              selectedChatbot={selectedChatbot}
              onSelectChatbot={(bot) => setSelectedChatbot(bot)}
              onCreateChatbot={(data) => handleCreateChatbot(data)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenEmbedModal={() => setShowEmbedModal(true)}
            />
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeBaseManager
              chatbot={selectedChatbot}
              onUpdateChatbot={handleUpdateChatbot}
            />
          )}

          {activeTab === 'customizer' && (
            <WidgetCustomizer
              chatbot={selectedChatbot}
              onUpdateChatbot={handleUpdateChatbot}
            />
          )}

          {activeTab === 'inbox' && (
            <InboxView
              conversations={conversations}
              messagesMap={messagesMap}
              onSendMessage={handleSendAgentReply}
              onUpdateStatus={handleUpdateConvStatus}
            />
          )}

          {activeTab === 'embed' && (
            <div className="bg-[#0f0f0f] p-8 rounded-3xl border border-zinc-800 shadow-xl space-y-6">
              <h1 className="text-2xl font-bold text-white tracking-tight">Embed & Deploy Widget</h1>
              <p className="text-sm text-zinc-400">
                Click below to get the JavaScript embed snippet or integration code for WordPress, Shopify, Webflow, or React.
              </p>
              <button
                onClick={() => setShowEmbedModal(true)}
                className="bg-zinc-100 hover:bg-white text-black font-semibold px-6 py-3 rounded-2xl text-xs uppercase tracking-widest transition shadow-md"
              >
                Open Embed Code Generator
              </button>
            </div>
          )}

          {activeTab === 'demosite' && (
            <DemoWebsitePreview
              chatbot={selectedChatbot}
              onBackToDashboard={() => setActiveTab('overview')}
            />
          )}
        </main>
      </div>

      {/* Embed Modal */}
      {showEmbedModal && (
        <EmbedCodeModal
          chatbot={selectedChatbot}
          onClose={() => setShowEmbedModal(false)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(u) => {
            setUser(u);
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}
