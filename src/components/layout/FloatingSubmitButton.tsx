import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FloatingSubmitButton() {
  return (
    <Link
      to="/submit"
      className="fixed bottom-6 right-6 w-14 h-14 bg-[#F97316] hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95 z-50"
    >
      <Plus size={28} strokeWidth={2.5} />
    </Link>
  );
}
