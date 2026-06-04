import { Home, MapPin, Plus, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/home', label: 'Map', icon: MapPin },
  { path: '/submit', label: 'Submit', icon: Plus },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-full bg-white/95 border border-slate-200 shadow-xl backdrop-blur md:hidden">
      <ul className="flex items-center justify-between px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path} className="flex-1">
              <Link
                to={item.path}
                className={`inline-flex w-full flex-col items-center justify-center gap-1 rounded-full px-2 py-2 text-[10px] font-semibold transition ${
                  isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
