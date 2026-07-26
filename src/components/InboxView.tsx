import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  CheckCircle2, 
  Send, 
  User, 
  Clock, 
  Mail, 
  Globe, 
  Bot, 
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Download,
  FileText,
  Printer
} from 'lucide-react';
import { Conversation, Message } from '../types';

interface InboxViewProps {
  conversations: Conversation[];
  messagesMap: Record<string, Message[]>;
  onSendMessage: (conversationId: string, text: string) => void;
  onUpdateStatus: (conversationId: string, status: 'open' | 'resolved' | 'transferred') => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  conversations,
  messagesMap,
  onSendMessage,
  onUpdateStatus,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'transferred' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConvId, setSelectedConvId] = useState<string>(conversations[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const filteredConversations = conversations.filter((c) => {
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    const matchesSearch =
      (c.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customerEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lastMessageText || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];
  const activeMessages = activeConv ? messagesMap[activeConv.id] || [] : [];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, replyText.trim());
    setReplyText('');
  };

  const handleDownloadTXT = () => {
    if (!activeConv) return;
    const header = `==================================================\n` +
      `OMNIDESK AI SUPPORT TRANSCRIPT\n` +
      `==================================================\n` +
      `Customer Name:  ${activeConv.customerName || 'Anonymous Visitor'}\n` +
      `Customer Email: ${activeConv.customerEmail || 'Not provided'}\n` +
      `Visitor ID:     ${activeConv.visitorId}\n` +
      `Assigned Bot:   ${activeConv.chatbotId}\n` +
      `Status:         ${activeConv.status.toUpperCase()}\n` +
      `Export Date:    ${new Date().toLocaleString()}\n` +
      `==================================================\n\n` +
      `CONVERSATION HISTORY:\n\n`;

    const body = activeMessages.map(m => {
      const senderLabel = m.sender === 'user' 
        ? (activeConv.customerName || 'Customer') 
        : m.sender === 'bot' 
        ? 'AI Bot' 
        : 'Human Agent';
      const timeStr = new Date(m.createdAt).toLocaleString();
      return `[${timeStr}] ${senderLabel}:\n${m.text}\n`;
    }).join('\n');

    const content = header + body;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = (activeConv.customerName || 'visitor').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `transcript_${safeName}_${activeConv.id.slice(0, 8)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!activeConv) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const messagesHtml = activeMessages.map(m => {
      const isUser = m.sender === 'user';
      const isAgent = m.sender === 'agent';
      const label = isUser ? (activeConv.customerName || 'Customer') : m.sender === 'bot' ? 'AI Bot' : 'Human Agent';
      const timeStr = new Date(m.createdAt).toLocaleString();
      const alignClass = isUser ? 'text-align: left;' : 'text-align: right;';
      const bgStyle = isUser 
        ? 'background: #f4f4f5; color: #18181b; border: 1px solid #e4e4e7;' 
        : isAgent 
        ? 'background: #059669; color: #ffffff;' 
        : 'background: #18181b; color: #ffffff;';

      return `
        <div style="margin-bottom: 16px; ${alignClass}">
          <div style="font-size: 11px; color: #71717a; margin-bottom: 4px; font-weight: 600;">
            ${label} &bull; ${timeStr}
          </div>
          <div style="display: inline-block; max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.5; white-space: pre-wrap; ${bgStyle}">
            ${m.text}
          </div>
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transcript - ${activeConv.customerName || 'Visitor'}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #18181b; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 2px solid #18181b; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; margin: 0; }
            .subtitle { font-size: 12px; color: #71717a; margin-top: 4px; }
            .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; background: #f4f4f5; border-radius: 12px; margin-bottom: 28px; padding: 16px; font-size: 12px; }
            .meta-item { display: flex; flex-direction: column; }
            .meta-label { font-size: 10px; font-weight: 700; color: #71717a; text-transform: uppercase; margin-bottom: 2px; }
            .meta-value { font-weight: 600; color: #09090b; }
            .transcript-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e4e4e7; margin-bottom: 20px; padding-bottom: 8px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">OmniDesk AI Support Transcript</h1>
              <div class="subtitle">Official Customer Record</div>
            </div>
            <div style="text-align: right; font-size: 11px; color: #71717a;">
              Generated: ${new Date().toLocaleString()}
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Customer Name</span>
              <span class="meta-value">${activeConv.customerName || 'Anonymous Visitor'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Email Address</span>
              <span class="meta-value">${activeConv.customerEmail || 'Not provided'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Visitor ID</span>
              <span class="meta-value">${activeConv.visitorId}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Assigned Bot / Status</span>
              <span class="meta-value">${activeConv.chatbotId} (${activeConv.status.toUpperCase()})</span>
            </div>
          </div>

          <div class="transcript-title">Conversation History (${activeMessages.length} Messages)</div>
          <div class="messages">
            ${messagesHtml}
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] bg-[#0f0f0f] rounded-2xl border border-zinc-800 shadow-xs flex overflow-hidden">
      {/* COLUMN 1: Conversations List (1/3) */}
      <div className="w-80 border-r border-zinc-800 flex flex-col shrink-0 bg-[#0c0c0c]">
        {/* Header & Search */}
        <div className="p-4 border-b border-zinc-800 space-y-3 bg-[#0f0f0f]">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Support Inbox
            </h2>
            <span className="bg-zinc-900 text-emerald-400 text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-zinc-800">
              {conversations.length} Threads
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 text-white rounded-xl focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 overflow-x-auto pb-1">
            {(['all', 'open', 'transferred', 'resolved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition ${
                  filterStatus === status
                    ? 'bg-zinc-100 text-black font-semibold'
                    : 'hover:bg-zinc-800 text-zinc-400'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((c) => {
              const isSelected = c.id === activeConv?.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedConvId(c.id)}
                  className={`p-3.5 cursor-pointer transition flex items-start gap-3 ${
                    isSelected ? 'bg-zinc-900 border-l-4 border-emerald-500' : 'hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-zinc-800 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-zinc-700">
                    {(c.customerName || 'A').charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-xs text-zinc-100 truncate">
                        {c.customerName || 'Anonymous Visitor'}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 truncate mb-1.5">{c.lastMessageText}</p>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold ${
                        c.status === 'resolved'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : c.status === 'transferred'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          : 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/60'
                      }`}>
                        {c.status.toUpperCase()}
                      </span>

                      {c.unreadForTenant && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500">
              No conversations match criteria.
            </div>
          )}
        </div>
      </div>

      {/* COLUMN 2: Message Thread & Agent Reply (Middle) */}
      {activeConv ? (
        <div className="flex-1 flex flex-col h-full bg-[#0f0f0f]">
          {/* Thread Top Bar */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#0f0f0f]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                {(activeConv.customerName || 'A').charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {activeConv.customerName || 'Anonymous Visitor'}
                </h3>
                <div className="text-xs text-zinc-400 font-mono">{activeConv.customerEmail || activeConv.visitorId}</div>
              </div>
            </div>

            {/* Actions: Download Transcript & Mark Resolved / Reopen */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Transcript</span>
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#121212] border border-zinc-800 rounded-xl shadow-xl z-20 py-1 text-xs divide-y divide-zinc-800/60">
                    <button
                      onClick={() => { setShowExportMenu(false); handleDownloadPDF(); }}
                      className="w-full text-left px-3.5 py-2.5 text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-white">Print / PDF</div>
                        <div className="text-[10px] text-zinc-500">Formatted client PDF record</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { setShowExportMenu(false); handleDownloadTXT(); }}
                      className="w-full text-left px-3.5 py-2.5 text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <div>
                        <div className="font-semibold text-white">Text File (.txt)</div>
                        <div className="text-[10px] text-zinc-500">Plain text transcript file</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {activeConv.status !== 'resolved' ? (
                <button
                  onClick={() => onUpdateStatus(activeConv.id, 'resolved')}
                  className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              ) : (
                <button
                  onClick={() => onUpdateStatus(activeConv.id, 'open')}
                  className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                >
                  <span>Reopen Thread</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-black/40">
            {activeMessages.map((m) => {
              const isUser = m.sender === 'user';
              const isAgent = m.sender === 'agent';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-1">
                    {m.sender === 'bot' && <Bot className="w-3 h-3 text-emerald-400" />}
                    {m.sender === 'agent' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                    <span className="font-semibold text-zinc-400">
                      {m.sender === 'user' ? 'Customer' : m.sender === 'bot' ? 'AI Bot' : 'Human Agent'}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-xs'
                        : isAgent
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-zinc-800 text-white rounded-br-xs border border-zinc-700'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Human Agent Reply Bar */}
          <form onSubmit={handleSendReply} className="p-4 border-t border-zinc-800 bg-[#0f0f0f] flex items-center gap-3">
            <input
              type="text"
              placeholder="Reply to customer as Human Agent..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
            />
            <button
              type="submit"
              className="bg-zinc-100 hover:bg-white text-black font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Reply</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs">
          Select a conversation from the left to view messages.
        </div>
      )}

      {/* COLUMN 3: Visitor Details (Right) */}
      {activeConv && (
        <div className="w-72 border-l border-zinc-800 p-5 shrink-0 space-y-5 bg-[#0c0c0c] hidden xl:block">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
            Visitor Metadata
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-zinc-900/80 rounded-xl space-y-1 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 font-mono font-semibold uppercase">Email Address</div>
              <div className="font-semibold text-zinc-200 truncate">
                {activeConv.customerEmail || 'Not provided'}
              </div>
            </div>

            <div className="p-3 bg-zinc-900/80 rounded-xl space-y-1 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 font-mono font-semibold uppercase">Visitor ID</div>
              <div className="font-mono text-zinc-400 truncate">{activeConv.visitorId}</div>
            </div>

            <div className="p-3 bg-zinc-900/80 rounded-xl space-y-1 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 font-mono font-semibold uppercase">Session Started</div>
              <div className="text-zinc-300 text-xs">
                {new Date(activeConv.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-zinc-900/80 rounded-xl space-y-1 border border-zinc-800 text-emerald-400">
              <div className="text-[10px] text-zinc-500 font-mono font-semibold uppercase flex items-center gap-1">
                <Bot className="w-3 h-3 text-emerald-400" /> Assigned Bot
              </div>
              <div className="font-semibold text-xs text-white">{activeConv.chatbotId}</div>
            </div>

            {/* Quick Export Block */}
            <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-2.5">
              <div className="text-[10px] text-zinc-400 font-mono font-semibold uppercase flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-400" /> Export Record
              </div>
              <p className="text-[11px] text-zinc-500 leading-snug">
                Download a complete record of this interaction for client compliance and auditing.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold py-1.5 px-2 rounded-lg border border-zinc-700 flex items-center justify-center gap-1 transition"
                >
                  <Printer className="w-3 h-3 text-emerald-400" />
                  <span>PDF Record</span>
                </button>
                <button
                  onClick={handleDownloadTXT}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-semibold py-1.5 px-2 rounded-lg border border-zinc-700 flex items-center justify-center gap-1 transition"
                >
                  <FileText className="w-3 h-3 text-indigo-400" />
                  <span>TXT Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
