interface MapSearchSuggestionsProps<T extends { id: string; name: string }> {
  suggestions: T[];
  onSelect: (item: T) => void;
  getSubtitle: (item: T) => string;
  className?: string;
}

export default function MapSearchSuggestions<T extends { id: string; name: string }>({
  suggestions,
  onSelect,
  getSubtitle,
  className = 'mt-2 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-lg',
}: MapSearchSuggestionsProps<T>) {
  if (suggestions.length === 0) return null;

  return (
    <div className={className}>
      {suggestions.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          className="w-full text-left px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
        >
          <div className="text-sm font-semibold text-slate-900">{item.name}</div>
          <div className="text-[10px] text-slate-500">{getSubtitle(item)}</div>
        </button>
      ))}
    </div>
  );
}
