import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

export default function LoadingIndicator({
  message = 'Loading...',
  className = 'flex-1 flex flex-col items-center justify-center py-20 text-slate-400',
}: LoadingIndicatorProps) {
  return (
    <div className={className}>
      <Loader2 className="animate-spin text-[#1E3A8A] mb-3" size={32} />
      <span className="text-sm font-semibold tracking-wide">{message}</span>
    </div>
  );
}
