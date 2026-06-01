import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-20 text-slate-400 select-none">
      <Loader2 className="animate-spin text-[#1E3A8A] mr-2.5" size={24} />
      <span className="text-sm font-semibold tracking-wide">{message}</span>
    </div>
  );
}
