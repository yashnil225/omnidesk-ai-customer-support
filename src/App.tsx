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
import { ChatbotConfig, Conversation, Message, TenantUser } from './types';
import {
  supabase,
  saveChatbot,
  getTenantChatbots,
  getConversations,
  getMessages,
  saveMessage,
  updateConversationStatus,
  fetchUserProfile,
  deleteChatbot,
  getPersistentSession,
  savePersistentSession,
  clearPersistentSession,
  signOutUser,
} from './lib/supabase';

export default function App() {
  // State with persistent session initialization
  const [user, setUser] = useState<TenantUser | null>(() => getPersistentSession());
  const [isLoading, setIsLoading] = useState(!getPersistentSession());
  
  const [chatbots, setChatbots] = useState<ChatbotConfig[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState<ChatbotConfig | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});

  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  // Real authentication & Persistent Data Fetching
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profileUser = await fetchUserProfile(session.user);
        setUser(profileUser);
        savePersistentSession(profileUser);
      } else {
        const savedUser = getPersistentSession();
        if (savedUser) {
          setUser(savedUser);
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        clearPersistentSession();
        setUser(null);
        setChatbots([]);
        setConversations([]);
        setMessagesMap({});
        setSelectedChatbot(null);
      } else if (session?.user) {
        const profileUser = await fetchUserProfile(session.user);
        setUser(profileUser);
        savePersistentSession(profileUser);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadTenantData(user.uid);
    }
  }, [user]);

  // Realtime Subscription
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('realtime_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `tenant_id=eq.${user.uid}` },
        (payload) => {
          const newMsg = payload.new as any;
          const mappedMsg: Message = {
            id: newMsg.id,
            conversationId: newMsg.conversation_id,
            chatbotId: newMsg.chatbot_id,
            tenantId: newMsg.tenant_id,
            sender: newMsg.sender,
            text: newMsg.text,
            createdAt: newMsg.created_at,
          };
          
          setMessagesMap((prev) => {
            const currentMsgs = prev[mappedMsg.conversationId] || [];
            if (currentMsgs.some((m) => m.id === mappedMsg.id)) return prev;
            return { ...prev, [mappedMsg.conversationId]: [...currentMsgs, mappedMsg] };
          });
          
          if (mappedMsg.sender === 'user') {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === mappedMsg.conversationId
                  ? { ...c, lastMessageText: mappedMsg.text, lastMessageAt: mappedMsg.createdAt, status: 'open', unreadForTenant: true }
                  : c
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadTenantData = async (tenantId: string) => {
    const bots = await getTenantChatbots(tenantId);
    setChatbots(bots);
    if (bots.length > 0 && !selectedChatbot) {
      setSelectedChatbot(bots[0]);
    }
    
    const convs = await getConversations(tenantId);
    setConversations(convs);

    // Fetch messages for all conversations
    const msgsMap: Record<string, Message[]> = {};
    for (const c of convs) {
      const msgs = await getMessages(c.id);
      msgsMap[c.id] = msgs;
    }
    setMessagesMap(msgsMap);
  };

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

  const handleDeleteChatbot = async (chatbotId: string) => {
    if (window.confirm("Are you sure you want to delete this chatbot? This is not recoverable.")) {
      setChatbots((prev) => prev.filter((b) => b.id !== chatbotId));
      if (selectedChatbot?.id === chatbotId) {
        setSelectedChatbot(null);
      }
      await deleteChatbot(chatbotId);
    }
  };

  // Inbox Agent Reply
  const handleSendAgentReply = async (conversationId: string, text: string) => {
    if (!user) return;
    const now = new Date().toISOString();
    const agentMsg: Message = {
      id: 'msg_agent_' + Date.now(),
      conversationId,
      chatbotId: selectedChatbot?.id || '',
      tenantId: user.uid,
      sender: 'agent',
      text,
      createdAt: now,
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
              lastMessageAt: now,
              status: 'open',
            }
          : c
      )
    );

    // Save to Supabase
    await saveMessage(agentMsg);
    await updateConversationStatus(conversationId, { status: 'open', lastMessageText: text, lastMessageAt: now });
  };

  const handleUpdateConvStatus = async (conversationId: string, status: 'open' | 'resolved' | 'transferred') => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, status } : c))
    );
    await updateConversationStatus(conversationId, { status });
  };

  const handleSignOut = async () => {
    clearPersistentSession();
    setUser(null);
    setChatbots([]);
    setConversations([]);
    setMessagesMap({});
    setSelectedChatbot(null);
    await signOutUser();
  };

  const unreadConversationsCount = conversations.filter((c) => c.unreadForTenant).length;

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-mono">Loading OmniDesk...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans relative">
        <AuthModal
          onClose={() => {}}
          onSuccess={(u) => {
            savePersistentSession(u);
            setUser(u);
          }}
        />
      </div>
    );
  }

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
        onOpenAuth={() => {}}
        onSignOut={handleSignOut}
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
              onDeleteChatbot={handleDeleteChatbot}
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

      {/* Auth Modal handled at root */}
    </div>
  );
}
