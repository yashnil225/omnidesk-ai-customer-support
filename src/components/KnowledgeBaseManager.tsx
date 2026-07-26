import React, { useState } from 'react';
import { 
  BookOpen, 
  Globe, 
  HelpCircle, 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Link2
} from 'lucide-react';
import { ChatbotConfig, FAQItem, KBUrl, KBDocument } from '../types';

interface KnowledgeBaseManagerProps {
  chatbot: ChatbotConfig | null;
  onUpdateChatbot: (updatedBot: ChatbotConfig) => void;
}

export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({
  chatbot,
  onUpdateChatbot,
}) => {
  if (!chatbot) {
    return (
      <div className="text-center py-12 bg-[#0f0f0f] rounded-2xl border border-zinc-800">
        <p className="text-zinc-500">Please select or create a chatbot first to train its knowledge base.</p>
      </div>
    );
  }

  const [activeKbTab, setActiveKbTab] = useState<'urls' | 'faqs' | 'docs' | 'prompt'>('faqs');

  // URL States
  const [newUrl, setNewUrl] = useState('');
  const [isCrawlingUrl, setIsCrawlingUrl] = useState(false);
  const [urlError, setUrlError] = useState('');

  // FAQ States
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // Doc States
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');

  // System Prompt State
  const [systemPrompt, setSystemPrompt] = useState(chatbot.customSystemPrompt || '');

  // 1. Handle URL Indexing
  const handleCrawlUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    let targetUrl = newUrl.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    setIsCrawlingUrl(true);
    setUrlError('');

    try {
      const res = await fetch('/api/kb/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();

      if (data.success) {
        const urlItem: KBUrl = {
          id: 'url_' + Date.now(),
          url: targetUrl,
          status: 'indexed',
          pageTitle: data.pageTitle,
          textContent: data.textContent,
          lastCrawledAt: new Date().toISOString(),
        };

        const updatedUrls = [...(chatbot.kbUrls || []), urlItem];
        onUpdateChatbot({ ...chatbot, kbUrls: updatedUrls });
        setNewUrl('');
      } else {
        setUrlError(data.error || 'Could not crawl URL');
      }
    } catch (err: any) {
      setUrlError('Failed to connect to crawler server');
    } finally {
      setIsCrawlingUrl(false);
    }
  };

  const handleRemoveUrl = (id: string) => {
    const updatedUrls = (chatbot.kbUrls || []).filter(u => u.id !== id);
    onUpdateChatbot({ ...chatbot, kbUrls: updatedUrls });
  };

  // 2. Handle FAQ Adding
  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;

    const newFaq: FAQItem = {
      id: 'faq_' + Date.now(),
      question: faqQuestion.trim(),
      answer: faqAnswer.trim(),
      category: 'General',
    };

    const updatedFaqs = [...(chatbot.kbFaqs || []), newFaq];
    onUpdateChatbot({ ...chatbot, kbFaqs: updatedFaqs });
    setFaqQuestion('');
    setFaqAnswer('');
  };

  const handleRemoveFaq = (id: string) => {
    const updatedFaqs = (chatbot.kbFaqs || []).filter(f => f.id !== id);
    onUpdateChatbot({ ...chatbot, kbFaqs: updatedFaqs });
  };

  // 3. Handle Doc Adding
  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    const newDoc: KBDocument = {
      id: 'doc_' + Date.now(),
      title: docTitle.trim(),
      content: docContent.trim(),
      updatedAt: new Date().toISOString(),
      type: 'doc',
    };

    const updatedDocs = [...(chatbot.kbDocs || []), newDoc];
    onUpdateChatbot({ ...chatbot, kbDocs: updatedDocs });
    setDocTitle('');
    setDocContent('');
  };

  const handleRemoveDoc = (id: string) => {
    const updatedDocs = (chatbot.kbDocs || []).filter(d => d.id !== id);
    onUpdateChatbot({ ...chatbot, kbDocs: updatedDocs });
  };

  // 4. Handle System Prompt Save
  const handleSavePrompt = () => {
    onUpdateChatbot({ ...chatbot, customSystemPrompt: systemPrompt });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-mono font-semibold uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            AI Knowledge Base Training
          </div>
          <h1 className="text-xl font-bold text-white">
            Training Context for <span className="text-emerald-400">{chatbot.name}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Train your Gemini model using FAQs, live Website URLs, custom Documents/PDFs, or Persona Instructions.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-emerald-400 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Real-time Context Synced</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveKbTab('faqs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition ${
            activeKbTab === 'faqs'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:bg-zinc-800/40'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>FAQs ({chatbot.kbFaqs?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveKbTab('urls')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition ${
            activeKbTab === 'urls'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:bg-zinc-800/40'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>Website URLs ({chatbot.kbUrls?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveKbTab('docs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition ${
            activeKbTab === 'docs'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:bg-zinc-800/40'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Documents & Policies ({chatbot.kbDocs?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveKbTab('prompt')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition ${
            activeKbTab === 'prompt'
              ? 'bg-zinc-800 text-white shadow-xs'
              : 'text-zinc-400 hover:bg-zinc-800/40'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>System Persona & Rules</span>
        </button>
      </div>

      {/* TAB 1: FAQs */}
      {activeKbTab === 'faqs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add FAQ Form */}
          <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Add FAQ Pair
            </h3>

            <form onSubmit={handleAddFaq} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                  Customer Question
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. What are your delivery times?"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                  AI Answer
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Orders placed before 3 PM EST ship same-day and deliver within 2-4 business days."
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-100 hover:bg-white text-black font-semibold uppercase tracking-wider py-2.5 rounded-xl text-xs shadow-xs transition"
              >
                Add FAQ to Knowledge Base
              </button>
            </form>
          </div>

          {/* FAQ List */}
          <div className="lg:col-span-2 bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs space-y-4">
            <h3 className="font-bold text-white text-base">
              Trained FAQs ({chatbot.kbFaqs?.length || 0})
            </h3>

            {chatbot.kbFaqs && chatbot.kbFaqs.length > 0 ? (
              <div className="space-y-3">
                {chatbot.kbFaqs.map((faq) => (
                  <div key={faq.id} className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 flex items-start justify-between gap-4 group">
                    <div className="space-y-1">
                      <div className="font-bold text-white text-xs">Q: {faq.question}</div>
                      <div className="text-xs text-zinc-400 leading-relaxed">A: {faq.answer}</div>
                    </div>

                    <button
                      onClick={() => handleRemoveFaq(faq.id)}
                      title="Remove FAQ"
                      className="text-zinc-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                No FAQs added yet. Use the form on the left to add your first Q&A pair.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WEBSITE URLS */}
      {activeKbTab === 'urls' && (
        <div className="space-y-6">
          <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              Index Website URL
            </h3>
            <p className="text-xs text-zinc-400">
              Enter your company website, documentation, or pricing page URL to crawl and train your chatbot automatically.
            </p>

            <form onSubmit={handleCrawlUrl} className="flex gap-3">
              <div className="relative flex-1">
                <Link2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="https://yourwebsite.com/docs"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={isCrawlingUrl}
                className="bg-zinc-100 hover:bg-white text-black font-semibold uppercase tracking-wider px-5 py-2.5 rounded-xl text-xs shadow-xs flex items-center gap-2 shrink-0 transition"
              >
                {isCrawlingUrl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Crawling...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Fetch & Train</span>
                  </>
                )}
              </button>
            </form>

            {urlError && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-900/50">
                <AlertCircle className="w-4 h-4" />
                <span>{urlError}</span>
              </div>
            )}
          </div>

          {/* Indexed URLs List */}
          <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs space-y-4">
            <h3 className="font-bold text-white text-base">
              Crawled Pages ({chatbot.kbUrls?.length || 0})
            </h3>

            {chatbot.kbUrls && chatbot.kbUrls.length > 0 ? (
              <div className="space-y-3">
                {chatbot.kbUrls.map((u) => (
                  <div key={u.id} className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{u.pageTitle || u.url}</span>
                        <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[9px] font-mono uppercase font-semibold rounded">
                          {u.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-indigo-400 font-mono truncate">{u.url}</div>
                      {u.textContent && (
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1 italic">
                          "{u.textContent}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemoveUrl(u.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                No URLs crawled yet. Enter a website URL above to index website content automatically.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeKbTab === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Add Document / Policy
            </h3>

            <form onSubmit={handleAddDoc} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SLA Terms & Privacy Policy"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                  Text Content / PDF Extract
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste company policy, product manual, or PDF text excerpt here..."
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-100 hover:bg-white text-black font-semibold uppercase tracking-wider py-2.5 rounded-xl text-xs shadow-xs transition"
              >
                Add Document to Knowledge
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs space-y-4">
            <h3 className="font-bold text-white text-base">
              Document Knowledge ({chatbot.kbDocs?.length || 0})
            </h3>

            {chatbot.kbDocs && chatbot.kbDocs.length > 0 ? (
              <div className="space-y-3">
                {chatbot.kbDocs.map((doc) => (
                  <div key={doc.id} className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-white text-xs">{doc.title}</div>
                      <div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line line-clamp-4">
                        {doc.content}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl">
                No custom documents added yet. Paste text content above to train your bot.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM PROMPT & PERSONA */}
      {activeKbTab === 'prompt' && (
        <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                AI Persona & Behavior Rules
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Define guidelines, tone of voice, fallback responses, and business constraints for Gemini.
              </p>
            </div>

            <button
              onClick={handleSavePrompt}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-black font-semibold uppercase tracking-wider px-4 py-2 rounded-xl text-xs shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save System Prompt</span>
            </button>
          </div>

          <textarea
            rows={10}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full p-4 rounded-xl border border-zinc-800 font-mono text-xs leading-relaxed focus:outline-none focus:border-zinc-700 bg-black text-zinc-200"
            placeholder="Write custom instructions for the AI bot..."
          />
        </div>
      )}
    </div>
  );
};
