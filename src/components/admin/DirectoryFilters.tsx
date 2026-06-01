import { ChevronDown, Map, List } from 'lucide-react';
import { REGIONS_WITH_ALL } from '../../constants/regions';

interface DirectoryFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  viewMode: 'table' | 'map';
  onViewModeChange: (mode: 'table' | 'map') => void;
  resultCount: number;
}

export default function DirectoryFilters({
  searchTerm,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedStatus,
  onStatusChange,
  viewMode,
  onViewModeChange,
  resultCount,
}: DirectoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 w-48 text-xs shadow-sm">
        <input
          type="text"
          placeholder="Search name or city..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent outline-none w-full text-slate-700 placeholder-slate-400"
        />
      </div>

      <div className="relative bg-white border border-slate-200 rounded-lg text-xs font-bold shadow-sm pr-8 pl-3 py-1.5 cursor-pointer">
        <select
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value)}
          className="appearance-none bg-transparent outline-none cursor-pointer pr-2 text-slate-700"
        >
          {REGIONS_WITH_ALL.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-2 text-slate-500 pointer-events-none" size={12} />
      </div>

      <div className="relative bg-white border border-slate-200 rounded-lg text-xs font-bold shadow-sm pr-8 pl-3 py-1.5 cursor-pointer">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="appearance-none bg-transparent outline-none cursor-pointer pr-2 text-slate-700"
        >
          <option value="All Status">All Status</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
        </select>
        <ChevronDown className="absolute right-2.5 top-2 text-slate-500 pointer-events-none" size={12} />
      </div>

      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
        <button
          type="button"
          onClick={() => onViewModeChange('table')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
            viewMode === 'table' ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:text-slate-800'
          }`}
          title="Table view"
        >
          <List size={14} />
          Table
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('map')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
            viewMode === 'map' ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:text-slate-800'
          }`}
          title="Map view"
        >
          <Map size={14} />
          Map
        </button>
      </div>

      <div className="bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] text-[10px] font-black px-3 py-1.5 rounded-lg tracking-widest">
        FOUND: {resultCount}
      </div>
    </div>
  );
}
