import React from 'react';
import { 
  Bot, 
  MessageSquare, 
  Sparkles, 
  Users, 
  ArrowUpRight, 
  Plus, 
  Code, 
  CheckCircle2, 
  BookOpen, 
  FileText,
  Clock
} from 'lucide-react';
import { ChatbotConfig, Conversation } from '../types';

interface DashboardOverviewProps {
  chatbots: ChatbotConfig[];
  conversations: Conversation[];
  selectedChatbot: ChatbotConfig | null;
  onCreateChatbot: () => void;
  onNavigateTab: (tab: any) => void;
  onOpenEmbedModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  chatbots,
  conversations,
  selectedChatbot,
  onCreateChatbot,
  onNavigateTab,
  onOpenEmbedModal,
}) => {
  const botConversations = selectedChatbot 
    ? conversations.filter(c => c.chatbotId === selectedChatbot.id)
    : conversations;
    
  const totalChats = botConversations.length;
  const resolvedChats = botConversations.filter(c => c.status === 'resolved').length;
  const resolutionRate = totalChats > 0 ? Math.round((resolvedChats / totalChats) * 100) : 0;
  const leadsCount = botConversations.filter(c => c.customerEmail).length;

  return (
    <div className="space-y-8">
      {/* Welcome & Action Banner */}
      <div className="bg-[#0f0f0f] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-widest mb-2">
            <Sparkles className="w-4 h-4" />
            Multi-Tenant Customer Support SaaS Engine
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white">
            Welcome to your <span className="font-serif italic text-zinc-300">AI Control Center</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
            Train custom AI chatbots using your website URLs, PDFs, and FAQs. Deploy embeddable widgets to WordPress, Shopify, or React.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onCreateChatbot}
            className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New AI Chatbot</span>
          </button>
          <button
            onClick={onOpenEmbedModal}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider border border-zinc-800 transition"
          >
            <Code className="w-4 h-4" />
            <span>Get Widget Code</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#0f0f0f] p-5 rounded-2xl border border-zinc-800 shadow-xs hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">Active Chatbots</span>
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{chatbots.length}</span>
            <span className="text-[10px] font-mono uppercase font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">Active</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Ready to handle visitor chats</p>
        </div>

        <div className="bg-[#0f0f0f] p-5 rounded-2xl border border-zinc-800 shadow-xs hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">Total Conversations</span>
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalChats}</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +18%
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Across all deployed channels</p>
        </div>

        <div className="bg-[#0f0f0f] p-5 rounded-2xl border border-zinc-800 shadow-xs hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">AI Resolution Rate</span>
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{resolutionRate}%</span>
            <span className="text-[10px] font-mono uppercase font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">High</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Resolved without human agent</p>
        </div>

        <div className="bg-[#0f0f0f] p-5 rounded-2xl border border-zinc-800 shadow-xs hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">Leads Captured</span>
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{leadsCount}</span>
            <span className="text-[10px] font-mono uppercase font-semibold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">Verified</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Captured during visitor chats</p>
        </div>
      </div>

      {/* Onboarding Steps Card */}
      <div className="bg-[#0f0f0f] rounded-2xl p-6 border border-zinc-800 shadow-xs">
        <h2 className="text-base font-bold text-white mb-1">Quick Setup Roadmap</h2>
        <p className="text-xs text-zinc-400 mb-6">4 simple steps to deploy your AI Support Assistant</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div 
            onClick={() => onNavigateTab('chatbots')}
            className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700 cursor-pointer transition group"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-emerald-400 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs mb-3">
              01
            </div>
            <h3 className="font-semibold text-white text-sm group-hover:text-emerald-400 transition">Create Chatbot</h3>
            <p className="text-xs text-zinc-500 mt-1">Configure bot name, welcome greetings & persona.</p>
          </div>

          <div 
            onClick={() => onNavigateTab('knowledge')}
            className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700 cursor-pointer transition group"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-emerald-400 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs mb-3">
              02
            </div>
            <h3 className="font-semibold text-white text-sm group-hover:text-emerald-400 transition">Train Knowledge Base</h3>
            <p className="text-xs text-zinc-500 mt-1">Add website URLs, PDFs, or FAQs for training.</p>
          </div>

          <div 
            onClick={() => onNavigateTab('customizer')}
            className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700 cursor-pointer transition group"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-emerald-400 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs mb-3">
              03
            </div>
            <h3 className="font-semibold text-white text-sm group-hover:text-emerald-400 transition">Customize UI</h3>
            <p className="text-xs text-zinc-500 mt-1">Set brand colors, position, logo, and quick prompts.</p>
          </div>

          <div 
            onClick={onOpenEmbedModal}
            className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700 cursor-pointer transition group"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-800 text-emerald-400 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs mb-3">
              04
            </div>
            <h3 className="font-semibold text-white text-sm group-hover:text-emerald-400 transition">Embed & Launch</h3>
            <p className="text-xs text-zinc-500 mt-1">Copy JS snippet to WordPress, Shopify, or HTML.</p>
          </div>
        </div>
      </div>

      {/* Selected Bot Knowledge & Recent Chats Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Knowledge Base Status */}
        <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Trained Knowledge
            </h3>
            <button
              onClick={() => onNavigateTab('knowledge')}
              className="text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              Manage KB
            </button>
          </div>

          {selectedChatbot ? (
            <div className="space-y-3">
              <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-500" /> FAQs Trained
                </span>
                <span className="font-bold text-white">{selectedChatbot.kbFaqs?.length || 0} FAQs</span>
              </div>

              <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-500" /> Crawled URLs
                </span>
                <span className="font-bold text-white">{selectedChatbot.kbUrls?.length || 0} Pages</span>
              </div>

              <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-500" /> Docs / PDFs
                </span>
                <span className="font-bold text-white">{selectedChatbot.kbDocs?.length || 0} Files</span>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                <span>Model Engine</span>
                <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 text-[10px]">
                  Gemini 3.6 Flash
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-zinc-500">
              No chatbot selected. Create or select a chatbot to view knowledge sources.
            </div>
          )}
        </div>

        {/* Recent Conversations Table */}
        <div className="lg:col-span-2 bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Recent Support Conversations
            </h3>
            <button
              onClick={() => onNavigateTab('inbox')}
              className="text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              View All Inbox
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="pb-3">Customer / Visitor</th>
                  <th className="pb-3">Last Inquiry</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {botConversations.slice(0, 5).map((conv) => (
                  <tr key={conv.id} className="hover:bg-zinc-900/60 transition cursor-pointer" onClick={() => onNavigateTab('inbox')}>
                    <td className="py-3 pr-2">
                      <div className="font-semibold text-white">{conv.customerName || 'Anonymous Visitor'}</div>
                      <div className="text-[11px] text-zinc-500">{conv.customerEmail || conv.visitorId}</div>
                    </td>
                    <td className="py-3 pr-2 max-w-[220px] truncate text-zinc-300">
                      {conv.lastMessageText}
                    </td>
                    <td className="py-3 pr-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        conv.status === 'resolved'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : conv.status === 'transferred'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}>
                        {conv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
