import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  iconSize?: number;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = 'relative bg-white rounded-lg border border-slate-200 shadow-sm flex items-center px-4 py-2.5',
  inputClassName = 'w-full text-sm text-slate-700 bg-transparent outline-none placeholder-slate-400',
  iconSize = 18,
}: SearchInputProps) {
  return (
    <div className={className}>
      <Search className="text-slate-400 mr-3 shrink-0" size={iconSize} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClassName}
      />
    </div>
  );
}
