import { useState } from 'react';
import { 
  ArrowLeft, 
  BarChart3, 
  FileText, 
  FolderHeart, 
  MessageSquare, 
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AdminStats from './AdminStats';
import AdminSubmissions from './AdminSubmissions';
import AdminDirectory from './AdminDirectory';
import AdminFeedback from './AdminFeedback';
import AdminBatchEntry from './AdminBatchEntry';

type Tab = 'stats' | 'submissions' | 'directory' | 'feedback' | 'batch';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
      
      {/* Top Navigation Header bar */}
      <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-30 select-none">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/home')}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 cursor-pointer"
            aria-label="Go back home"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none mb-1 font-serif">
              Admin Dashboard
            </h1>
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Institutions & Feedback Control
            </p>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs font-semibold text-slate-500">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'stats' 
                ? 'bg-white text-slate-800 shadow-sm font-bold' 
                : 'hover:text-slate-800'
            }`}
          >
            <BarChart3 size={14} /> Stats
          </button>
          
          <button 
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'submissions' 
                ? 'bg-white text-slate-800 shadow-sm font-bold' 
                : 'hover:text-slate-800'
            }`}
          >
            <FileText size={14} /> Submissions
          </button>
          
          <button 
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'directory' 
                ? 'bg-white text-slate-800 shadow-sm font-bold' 
                : 'hover:text-slate-800'
            }`}
          >
            <FolderHeart size={14} /> Directory
          </button>
          
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'feedback' 
                ? 'bg-white text-slate-800 shadow-sm font-bold' 
                : 'hover:text-slate-800'
            }`}
          >
            <MessageSquare size={14} /> Feedback
          </button>
          
          <div className="h-4 w-px bg-slate-200 mx-1" />
          
          <button 
            onClick={() => setActiveTab('batch')}
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'batch' 
                ? 'bg-white text-slate-800 shadow-sm font-bold' 
                : 'hover:text-slate-800'
            }`}
          >
            <Plus size={14} /> Batch Entry
          </button>
        </div>
      </header>

      {/* Primary Page Canvas - Dynamic mount area */}
      {activeTab === 'stats' && <AdminStats />}
      {activeTab === 'submissions' && <AdminSubmissions />}
      {activeTab === 'directory' && <AdminDirectory />}
      {activeTab === 'feedback' && <AdminFeedback />}
      {activeTab === 'batch' && <AdminBatchEntry />}

    </div>
  );
}