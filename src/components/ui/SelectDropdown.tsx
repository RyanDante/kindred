import { ChevronDown } from 'lucide-react';

interface SelectDropdownProps {
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  className?: string;
}

export default function SelectDropdown({
  value,
  onChange,
  options,
  className = 'w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 appearance-none outline-none cursor-pointer pr-10 shadow-sm',
}: SelectDropdownProps) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={14} />
    </div>
  );
}
