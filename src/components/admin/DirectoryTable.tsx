import { Edit2, Trash2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DirectoryItem } from '../../types/orphanage';

interface DirectoryTableProps {
  items: DirectoryItem[];
  onToggleVerification: (id: string, currentVerified: boolean) => void;
  onDelete: (id: string, name: string) => void;
}

export default function DirectoryTable({ items, onToggleVerification, onDelete }: DirectoryTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <th className="py-4 px-6 w-[45%]">Name</th>
            <th className="py-4 px-6 w-[20%]">Location</th>
            <th className="py-4 px-6 w-[20%]">Status</th>
            <th className="py-4 px-6 w-[15%] text-right pr-8">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/70">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
              <td className="py-5 px-6">
                <div className="font-bold text-slate-800 text-sm leading-tight">{item.name}</div>
                <span className="text-[10px] font-mono font-medium text-slate-300 tracking-wide select-all block mt-0.5">
                  {item.id}
                </span>
              </td>
              <td className="py-5 px-6">
                <div className="font-semibold text-slate-700">{item.city}</div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mt-0.5">
                  {item.region}
                </span>
              </td>
              <td className="py-5 px-6">
                <span
                  className={`text-[9px] font-extrabold tracking-widest px-2.5 py-1 rounded-md inline-block uppercase ${
                    item.verified ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FFF7ED] text-[#C2410C]'
                  }`}
                >
                  {item.verified ? 'APPROVED' : 'PENDING'}
                </span>
              </td>
              <td className="py-5 px-6 text-right pr-8">
                <div className="inline-flex items-center gap-2 justify-end w-full">
                  <Link
                    to={`/admin/edit/${item.id}`}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                    title="Edit orphanage details"
                  >
                    <Edit2 size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onToggleVerification(item.id, item.verified)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                    title={item.verified ? 'Revoke approval (mark PENDING)' : 'Approve listing (mark APPROVED)'}
                  >
                    <CheckCircle size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id, item.name)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                    title="Delete verification record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="py-10 text-center text-slate-400 italic">
                No matching listings found in the directory.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
