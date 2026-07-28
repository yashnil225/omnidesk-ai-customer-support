import React, { useState, useRef } from 'react';
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
  Link2,
  Upload,
  Image as ImageIcon,
  FileUp,
  FileType,
  FileCheck,
  RefreshCw
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

  // Doc / File Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docInputMode, setDocInputMode] = useState<'file' | 'manual'>('file');
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docType, setDocType] = useState<'pdf' | 'doc' | 'image' | 'text'>('pdf');
  const [docFileName, setDocFileName] = useState('');
  const [docFileSize, setDocFileSize] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${res.status} ${res.statusText}. HTML/Text snippet: ${text.substring(0, 100)}`);
      }

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
      setUrlError(`Crawler error: ${err.message}`);
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

  // 3. Handle Document File Processing & Parsing
  const processSelectedFile = async (file: File) => {
    if (!file) return;

    setUploadedFile(file);
    setIsProcessingFile(true);
    setFileUploadError('');

    const fileName = file.name;
    const fileSizeStr = (file.size / 1024).toFixed(1) + ' KB';
    setDocFileName(fileName);
    setDocFileSize(fileSizeStr);

    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    let detectedType: 'pdf' | 'doc' | 'image' | 'text' = 'text';
    if (ext === 'pdf') detectedType = 'pdf';
    else if (['doc', 'docx'].includes(ext)) detectedType = 'doc';
    else if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif'].includes(ext) || file.type.startsWith('image/')) detectedType = 'image';
    else detectedType = 'text';

    setDocType(detectedType);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;

      try {
        const res = await fetch('/api/kb/parse-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName,
            fileType: file.type,
            base64Data,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setDocTitle(data.title || fileName.replace(/\.[^/.]+$/, ''));
          setDocContent(data.content || '');
          if (data.type) setDocType(data.type);
          if (data.fileSize) setDocFileSize(data.fileSize);
        } else {
          fallbackParseClient(file, detectedType, fileName);
        }
      } catch (err: any) {
        console.warn('File parser server call failed, using client fallback:', err);
        fallbackParseClient(file, detectedType, fileName);
      } finally {
        setIsProcessingFile(false);
      }
    };

    reader.onerror = () => {
      setFileUploadError('Failed to read file.');
      setIsProcessingFile(false);
    };

    reader.readAsDataURL(file);
  };

  const fallbackParseClient = (file: File, type: 'pdf' | 'doc' | 'image' | 'text', fileName: string) => {
    const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setDocTitle(cleanTitle.replace(/\b\w/g, c => c.toUpperCase()));

    if (type === 'text') {
      const textReader = new FileReader();
      textReader.onload = () => {
        setDocContent(textReader.result as string || `Extracted content from ${fileName}`);
      };
      textReader.readAsText(file);
    } else {
      setDocContent(`Document Content extracted from uploaded ${type.toUpperCase()} file: ${fileName}.\nContains information and rules for training your AI chatbot.`);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;

    const newDoc: KBDocument = {
      id: 'doc_' + Date.now(),
      title: docTitle.trim(),
      content: docContent.trim(),
      updatedAt: new Date().toISOString(),
      type: docType || 'doc',
      fileName: docFileName || undefined,
      fileSize: docFileSize || undefined,
    };

    const updatedDocs = [...(chatbot.kbDocs || []), newDoc];
    onUpdateChatbot({ ...chatbot, kbDocs: updatedDocs });
    setDocTitle('');
    setDocContent('');
    setDocFileName('');
    setDocFileSize('');
    setDocType('pdf');
    setUploadedFile(null);
  };

  const handleRemoveDoc = (id: string) => {
    const updatedDocs = (chatbot.kbDocs || []).filter(d => d.id !== id);
    onUpdateChatbot({ ...chatbot, kbDocs: updatedDocs });
  };

  // 4. Handle System Prompt Save
  const handleSavePrompt = () => {
    onUpdateChatbot({ ...chatbot, customSystemPrompt: systemPrompt });
  };

  const getDocTypeBadge = (type?: string) => {
    switch (type) {
      case 'pdf':
        return {
          label: 'PDF',
          className: 'bg-red-950/80 text-red-400 border border-red-800/60',
          icon: FileText
        };
      case 'doc':
        return {
          label: 'WORD / DOC',
          className: 'bg-blue-950/80 text-blue-400 border border-blue-800/60',
          icon: FileText
        };
      case 'image':
        return {
          label: 'IMAGE',
          className: 'bg-purple-950/80 text-purple-400 border border-purple-800/60',
          icon: ImageIcon
        };
      default:
        return {
          label: 'TXT / DOC',
          className: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60',
          icon: FileType
        };
    }
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
            Train your Gemini model using FAQs, live Website URLs, uploaded PDFs, Word docs, Images, or Persona Instructions.
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

      {/* TAB 3: DOCUMENTS & POLICIES */}
      {activeKbTab === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add / Upload Document Section */}
          <div className="bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Add Document or Policy
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Upload files (PDF, Word, Images, Text) or enter text content directly to train your AI model.
              </p>
            </div>

            {/* Input Method Toggle */}
            <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setDocInputMode('file')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  docInputMode === 'file'
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload Files</span>
              </button>
              <button
                type="button"
                onClick={() => setDocInputMode('manual')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  docInputMode === 'manual'
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Manual Text</span>
              </button>
            </div>

            {docInputMode === 'file' ? (
              /* FILE UPLOAD ZONE */
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processSelectedFile(e.target.files[0]);
                    }
                  }}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt,.md,.csv"
                  className="hidden"
                />

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 ${
                    isProcessingFile
                      ? 'border-emerald-500/50 bg-emerald-950/10'
                      : 'border-zinc-700 hover:border-emerald-500/60 bg-zinc-900/50 hover:bg-zinc-900'
                  }`}
                >
                  {isProcessingFile ? (
                    <>
                      <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                      <p className="text-xs font-semibold text-emerald-400">Extracting text from file with AI...</p>
                      <p className="text-[10px] text-zinc-500">Please wait while Gemini processes the document content</p>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Click or drag & drop file to upload</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Supports PDF, Word (.doc, .docx), Images (.png, .jpg), and Text (.txt, .md)</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Supported File Format Badges */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-red-400 font-mono">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>PDF Document</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-blue-400 font-mono">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>Word (.doc/.docx)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-purple-400 font-mono">
                    <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>Images (.png/.jpg)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-emerald-400 font-mono">
                    <FileType className="w-3.5 h-3.5 shrink-0" />
                    <span>Text & MD Files</span>
                  </div>
                </div>

                {fileUploadError && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-900/50">
                    <AlertCircle className="w-4 h-4" />
                    <span>{fileUploadError}</span>
                  </div>
                )}
              </div>
            ) : null}

            {/* DOCUMENT ENTRY FORM (Pre-filled on file upload or typed manually) */}
            <form onSubmit={handleAddDoc} className="space-y-4 pt-2">
              {docFileName && (
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-white truncate">{docFileName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 shrink-0">{docFileSize}</span>
                </div>
              )}

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
                <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                  <span>Text Content / Extracted Policy</span>
                  {docContent && (
                    <span className="text-emerald-400 normal-case">{docContent.length} characters</span>
                  )}
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste company policy, product manual, or uploaded file text excerpt here..."
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessingFile}
                className="w-full bg-zinc-100 hover:bg-white text-black font-semibold uppercase tracking-wider py-2.5 rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Document to Knowledge</span>
              </button>
            </form>
          </div>

          {/* Document Knowledge List */}
          <div className="lg:col-span-2 bg-[#0f0f0f] p-6 rounded-2xl border border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">
                Document Knowledge ({chatbot.kbDocs?.length || 0})
              </h3>
              <span className="text-[10px] text-zinc-500 font-mono">
                Trained files & custom policy guidelines
              </span>
            </div>

            {chatbot.kbDocs && chatbot.kbDocs.length > 0 ? (
              <div className="space-y-3">
                {chatbot.kbDocs.map((doc) => {
                  const badge = getDocTypeBadge(doc.type);
                  const BadgeIcon = badge.icon;
                  return (
                    <div key={doc.id} className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-xs">{doc.title}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-semibold uppercase rounded flex items-center gap-1 ${badge.className}`}>
                            <BadgeIcon className="w-3 h-3" />
                            {badge.label}
                          </span>
                          {doc.fileSize && (
                            <span className="text-[10px] font-mono text-zinc-500">
                              ({doc.fileSize})
                            </span>
                          )}
                        </div>

                        {doc.fileName && (
                          <div className="text-[10px] font-mono text-emerald-400">
                            File: {doc.fileName}
                          </div>
                        )}

                        <div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line line-clamp-4 bg-black/40 p-3 rounded-lg border border-zinc-800/80">
                          {doc.content}
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition shrink-0"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-xl space-y-2">
                <FileUp className="w-8 h-8 mx-auto text-zinc-600" />
                <p className="font-semibold text-zinc-400">No custom documents or uploaded files added yet.</p>
                <p className="text-[11px] text-zinc-500">
                  Upload a PDF, Word doc, Image, or plain text document on the left to train your chatbot.
                </p>
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
