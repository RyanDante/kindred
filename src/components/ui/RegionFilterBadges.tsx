import { REGIONS_WITH_ALL } from '../../constants/regions';

interface RegionFilterBadgesProps {
  selectedRegion: string;
  onSelect: (region: string) => void;
  allLabel?: string;
}

export default function RegionFilterBadges({
  selectedRegion,
  onSelect,
  allLabel = 'All Regions',
}: RegionFilterBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2 py-1 select-none">
      {REGIONS_WITH_ALL.map((region) => (
        <button
          key={region}
          type="button"
          onClick={() => onSelect(region)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
            selectedRegion === region
              ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          {region === 'All Regions' ? allLabel : region}
        </button>
      ))}
    </div>
  );
}
