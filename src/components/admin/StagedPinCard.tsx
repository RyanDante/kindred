import { Trash2 } from 'lucide-react';
import type { BatchPin } from '../../types/orphanage';

interface StagedPinCardProps {
  pin: BatchPin;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof BatchPin, value: string | number | boolean) => void;
}

export default function StagedPinCard({
  pin,
  isSelected,
  onSelect,
  onRemove,
  onUpdate,
}: StagedPinCardProps) {
  return (
    <div
      className={`rounded-3xl border p-4 ${
        isSelected ? 'border-[#1E3A8A] bg-slate-50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <button type="button" onClick={() => onSelect(pin.id)} className="flex items-center gap-3 text-left min-w-0 flex-1">
          {pin.photo && (
            <img src={pin.photo} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200" />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{pin.name}</p>
            <p className="text-[11px] text-slate-500 truncate">
              {pin.city || 'No city yet'}, {pin.region}
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => onRemove(pin.id)}
          className="text-slate-400 hover:text-rose-500"
          title="Remove staged pin"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="grid gap-2">
        <input
          type="text"
          value={pin.name}
          onChange={(e) => onUpdate(pin.id, 'name', e.target.value)}
          placeholder="Name"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none"
        />
        <input
          type="text"
          value={pin.city}
          onChange={(e) => onUpdate(pin.id, 'city', e.target.value)}
          placeholder="City"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none"
        />
        <input
          type="text"
          value={pin.region}
          onChange={(e) => onUpdate(pin.id, 'region', e.target.value)}
          placeholder="Region"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none"
        />
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">Latitude</span>
            <input
              type="number"
              step="any"
              value={pin.latitude || ''}
              onChange={(e) => {
                const val = e.target.value;
                onUpdate(pin.id, 'latitude', val === '' ? 0 : parseFloat(val));
              }}
              placeholder="Latitude"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none"
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase pl-1">Longitude</span>
            <input
              type="number"
              step="any"
              value={pin.longitude || ''}
              onChange={(e) => {
                const val = e.target.value;
                onUpdate(pin.id, 'longitude', val === '' ? 0 : parseFloat(val));
              }}
              placeholder="Longitude"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
