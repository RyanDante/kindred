import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function FloatingSubmitButton() {
  const { user } = useAuth();
  return (
    <Link
      to={user ? '/submit' : '/login'}
      className="fixed bottom-6 right-6 w-14 h-14 bg-[#F97316] hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95 z-50"
      title={user ? 'Submit a new orphanage' : 'Login to add an orphanage'}
    >
      <Plus size={28} strokeWidth={2.5} />
    </Link>
  );
}
