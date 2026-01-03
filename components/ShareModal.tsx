
import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Globe, Database, Zap, Link as LinkIcon } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    // Generate a real working link for the current environment
    const url = new URL(window.location.href);
    if (!url.searchParams.has('ws')) {
      url.searchParams.set('ws', Math.random().toString(36).substr(2, 9));
    }
    setShareLink(url.toString());
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Globe size={20} className="text-blue-600" />
            Share & Sync Workspace
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[80vh]">
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Unique Sync Link</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-gray-600 font-mono overflow-hidden">
                <LinkIcon size={16} className="shrink-0 text-gray-400" />
                <span className="truncate">{shareLink}</span>
              </div>
              <button 
                onClick={handleCopy}
                className={`px-6 rounded-xl flex items-center gap-2 font-bold text-sm transition-all active:scale-95 ${
                  copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-600 font-medium">Open this link in a NEW TAB or send it to a friend to see real-time updates!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <Database size={18} />
                <h3 className="text-sm">Online Database Setup</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex gap-3 text-xs text-gray-600 leading-relaxed">
                  <span className="shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</span>
                  <span>Connect to <strong>Supabase</strong> for a real PostgreSQL backend.</span>
                </li>
                <li className="flex gap-3 text-xs text-gray-600 leading-relaxed">
                  <span className="shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</span>
                  <span>Use <code>workspace_id</code> to isolate data between groups.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <Zap size={18} />
                <h3 className="text-sm">Active Sync Status</h3>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  Real-time Simulation Active
                </div>
                <p className="text-[10px] text-emerald-600 leading-relaxed">
                  We are currently using the <strong>BroadcastChannel API</strong>. Any tab open with the SAME <code>ws</code> ID will update instantly when you save changes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50/80 flex items-center justify-center border-t border-gray-100">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-white border border-gray-200 hover:border-blue-500 text-gray-700 rounded-xl transition-all font-bold text-sm shadow-sm"
          >
            Start Syncing
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
