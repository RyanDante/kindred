import { Phone, Mail, MapPin, Check, X } from 'lucide-react';
import type { Orphanage } from '../types/orphanage';

interface SubmissionCardProps {
  submission: Orphanage;
  onApprove: (id: string) => void;
  onReject: (id: string, name: string) => void;
}

export default function SubmissionCard({ submission, onApprove, onReject }: SubmissionCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-stretch hover:shadow-md transition-shadow select-none">
      {/* Left Column: Image preview */}
      <div className="w-full md:w-56 h-36 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100 relative">
        {submission.photo ? (
          <img src={submission.photo} alt={submission.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xs italic">
            No Image
          </div>
        )}
        <span className="absolute top-2 left-2 bg-orange-100 border border-orange-200 text-[#C2410C] text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded">
          Pending Review
        </span>
      </div>

      {/* Middle Column: Details info */}
      <div className="flex-1 flex flex-col justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
              {submission.name}
            </h3>
            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded">
              Capacity: {submission.capacity}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-xs font-medium">
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" />
              {submission.city}, {submission.region}
            </span>
            {submission.phone && (
              <span className="flex items-center gap-1">
                <Phone size={12} className="text-slate-400" />
                {submission.phone}
              </span>
            )}
            {submission.email && (
              <span className="flex items-center gap-1">
                <Mail size={12} className="text-slate-400" />
                {submission.email}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
          {submission.description || 'No description provided.'}
        </p>

        <div className="text-[9px] font-mono text-slate-300 select-all">
          ID: {submission.id} | GPS: {submission.latitude}, {submission.longitude}
        </div>
      </div>

      {/* Right Column: Actions */}
      <div className="flex md:flex-col justify-center gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
        <button
          onClick={() => onApprove(submission.id)}
          className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
        >
          <Check size={14} strokeWidth={2.5} /> Approve
        </button>
        <button
          onClick={() => onReject(submission.id, submission.name)}
          className="flex-1 md:flex-initial bg-rose-50 border border-rose-200 hover:bg-rose-100 active:scale-98 text-rose-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
        >
          <X size={14} strokeWidth={2.5} /> Reject
        </button>
      </div>
    </div>
  );
}
