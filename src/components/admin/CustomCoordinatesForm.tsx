import { Plus } from 'lucide-react';

interface CustomCoordinatesFormProps {
  customName: string;
  customLat: string;
  customLng: string;
  onNameChange: (value: string) => void;
  onLatChange: (value: string) => void;
  onLngChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CustomCoordinatesForm({
  customName,
  customLat,
  customLng,
  onNameChange,
  onLatChange,
  onLngChange,
  onSubmit,
}: CustomCoordinatesFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col gap-3"
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Add Custom Location</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Input coordinates to place a pin directly</p>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Institution Name (Optional)"
          value={customName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none placeholder-slate-400 focus:border-slate-300 transition-colors"
        />
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">Lat</span>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 6.613"
              value={customLat}
              onChange={(e) => onLatChange(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none placeholder-slate-400 focus:border-slate-300 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">Lng</span>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 12.125"
              value={customLng}
              onChange={(e) => onLngChange(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none placeholder-slate-400 focus:border-slate-300 transition-colors"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 hover:bg-[#1E3A8A] text-slate-700 hover:text-white px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer"
      >
        <Plus size={14} />
        <span>Stage Custom Pin</span>
      </button>
    </form>
  );
}
