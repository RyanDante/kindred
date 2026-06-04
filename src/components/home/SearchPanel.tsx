import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Orphanage } from '../../types/orphanage';
import SearchInput from '../ui/SearchInput';
import RegionFilterBadges from '../ui/RegionFilterBadges';
import SelectDropdown from '../ui/SelectDropdown';
import LoadingIndicator from '../ui/LoadingIndicator';
import OrphanageCard from '../OrphanageCard';

interface SearchPanelProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  minCapacity: number;
  onMinCapacityChange: (capacity: number) => void;
  filteredOrphanages: Orphanage[];
  favoriteIds: string[];
  onToggleFavorite: (orphanage: Orphanage) => void;
  loading: boolean;
}

const ITEMS_PER_PAGE = 6;

export default function SearchPanel({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  minCapacity,
  onMinCapacityChange,
  filteredOrphanages,
  favoriteIds,
  onToggleFavorite,
  loading,
}: SearchPanelProps) {
  const { language, t } = useLanguage();
  const childrenLabel = language === 'fr' ? 'Enfants' : 'Children';
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  // Calculate pagination
  const sortedOrphanageData = useMemo(() => {
    const data = [...filteredOrphanages];
    
    switch (sortBy) {
      case 'name':
        return data.sort((a, b) => a.name.localeCompare(b.name));
      case 'capacity':
        return data.sort((a, b) => b.capacity - a.capacity);
      case 'rating':
        return data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
      default:
        return data;
    }
  }, [filteredOrphanages, sortBy]);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(sortedOrphanageData.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedOrphanages = sortedOrphanageData.slice(start, end);
    return { totalPages, paginatedOrphanages, start, end };
  }, [sortedOrphanageData, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (callback: () => void) => {
    setCurrentPage(1);
    callback();
  };

  const capacityOptions = [
    { value: 0, label: t('minCapacity') },
    { value: 10, label: `10+ ${childrenLabel}` },
    { value: 30, label: `30+ ${childrenLabel}` },
    { value: 50, label: `50+ ${childrenLabel}` },
    { value: 100, label: `100+ ${childrenLabel}` },
  ];

  return (
    <div className="flex-1 flex flex-col gap-5 overflow-hidden">
      <SearchInput
        value={searchQuery}
        onChange={(query) => handleFilterChange(() => onSearchChange(query))}
        placeholder={t('searchPlaceholder')}
      />

      <RegionFilterBadges
        selectedRegion={selectedRegion}
        onSelect={(region) => handleFilterChange(() => onRegionChange(region))}
        allLabel={t('allRegions')}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SelectDropdown
          value={minCapacity}
          onChange={(val) => handleFilterChange(() => onMinCapacityChange(Number(val)))}
          options={capacityOptions}
        />
        <SelectDropdown
          value=""
          onChange={() => {}}
          options={[{ value: '', label: t('anyAgeGroup') }]}
        />
      </div>

      {/* Sort Options */}
      <div className="grid grid-cols-1 gap-4">
        <SelectDropdown
          value={sortBy}
          onChange={(val) => setSortBy(val)}
          options={[
            { value: 'newest', label: 'Newest First' },
            { value: 'name', label: 'Sort by Name (A-Z)' },
            { value: 'capacity', label: 'Highest Capacity' },
            { value: 'rating', label: 'Highest Rated' },
          ]}
        />
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs font-bold uppercase tracking-wider text-slate-400/80 px-1 shrink-0">
          <span>
            {sortedOrphanageData.length}{' '}
            {sortedOrphanageData.length === 1 ? 'Institution' : 'Institutions'}
            {sortedOrphanageData.length > ITEMS_PER_PAGE && (
              <span className="text-slate-500 ml-2 font-normal">
                (Page {currentPage} of {paginationData.totalPages})
              </span>
            )}
          </span>
          <div className="flex items-center gap-2">
            {selectedRegion !== 'All Regions' && (
              <span className="text-orange-500 bg-orange-50 px-2.5 py-0.5 rounded border border-orange-100">
                {selectedRegion}
              </span>
            )}
            {favoriteIds.length > 0 && (
              <span className="text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {favoriteIds.length} {favoriteIds.length === 1 ? 'Favorite' : 'Favorites'}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingIndicator message="Syncing with live directory..." />
        ) : filteredOrphanages.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 gap-6 md:grid-cols-2 pb-6 select-none">
              {paginationData.paginatedOrphanages.map((orphanage) => (
                <OrphanageCard
                  key={orphanage.id}
                  orphanage={orphanage}
                  favorite={favoriteIds.includes(orphanage.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {filteredOrphanages.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between px-1 py-3 border-t border-slate-100 mt-auto shrink-0">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: paginationData.totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                        currentPage === i + 1
                          ? 'bg-[#1E3A8A] text-white'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(paginationData.totalPages, p + 1))}
                  disabled={currentPage === paginationData.totalPages}
                  className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center py-20 text-center shadow-sm">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
              <Search size={24} />
            </div>
            <p className="text-slate-500 text-sm font-semibold max-w-xs px-6 leading-relaxed">
              {t('noResults')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
