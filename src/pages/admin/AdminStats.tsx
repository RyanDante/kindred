import { useEffect, useState } from 'react';
import { 
  FileText, 
  FolderHeart, 
  MessageSquare, 
  ChevronRight, 
  Layers,
  PieChart,
  Loader2
} from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';

interface Orphanage {
  id: string;
  name: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  capacity: number;
  description: string;
  photo: string;
  verified: boolean;
  createdAt: Timestamp | null;
}

export default function AdminStats() {
  const [orphanages, setOrphanages] = useState<Orphanage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orphanages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Orphanage[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Orphanage);
      });
      setOrphanages(fetched);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching live stats data:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalCount = orphanages.length;
  const liveCount = orphanages.filter(o => o.verified).length;
  const pendingCount = orphanages.filter(o => !o.verified).length;

  const statsCards = [
    {
      title: 'Total Institutions',
      value: String(totalCount),
      icon: <FolderHeart className="text-blue-600 w-5 h-5" />,
      bg: 'bg-blue-50/70',
    },
    {
      title: 'Live Listings',
      value: String(liveCount),
      icon: <Layers className="text-emerald-600 w-5 h-5" />,
      bg: 'bg-emerald-50/70',
      valueColor: 'text-emerald-600'
    },
    {
      title: 'Awaiting Review',
      value: String(pendingCount),
      icon: <FileText className="text-orange-500 w-5 h-5" />,
      bg: 'bg-orange-50/70',
      valueColor: 'text-orange-600'
    },
    {
      title: 'New Feedback',
      value: '0',
      icon: <MessageSquare className="text-purple-500 w-5 h-5" />,
      bg: 'bg-purple-50/70',
      valueColor: 'text-purple-600'
    }
  ];

  const getRegionPercentage = (regionName: string) => {
    if (orphanages.length === 0) return '0%';
    const regionListings = orphanages.filter(o => o.region.toLowerCase() === regionName.toLowerCase());
    const pct = Math.round((regionListings.length / totalCount) * 100);
    return `${pct}%`;
  };

  const regionalData = [
    { region: 'Littoral', percentage: getRegionPercentage('Littoral'), color: 'bg-blue-500' },
    { region: 'Central', percentage: getRegionPercentage('Central'), color: 'bg-emerald-500' }
  ];

  const recentListings = orphanages
    .filter(o => o.verified)
    .slice(0, 2)
    .map(o => ({
      name: o.name,
      city: o.city.toUpperCase(),
      region: o.region.toUpperCase(),
      photo: o.photo
    }));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20 text-slate-400">
        <Loader2 className="animate-spin text-[#1E3A8A] mr-2" size={24} />
        <span>Loading stats dashboard...</span>
      </div>
    );
  }

  return (
    <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
      
      {/* Top 4-Column Stat Summary Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        {statsCards.map((card, index) => (
          <div 
            key={index} 
            className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden"
          >
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                {card.title}
              </h3>
              <span className={`text-3xl font-black ${card.valueColor || 'text-slate-900'}`}>
                {card.value}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Bottom Analytics Split Row Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start select-none">
        
        {/* Left Block: Regional Horizontal Bar Progress Visualizers */}
        <div className="lg:col-span-7 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col gap-6 min-h-[380px]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-serif text-slate-900">
              Regional Distribution
            </h2>
            <div className="w-7 h-7 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400">
              <PieChart size={14} />
            </div>
          </div>

          {/* Simulated Horizontal Graph Charts */}
          <div className="flex flex-col gap-8 my-auto max-w-[90%] w-full">
            {regionalData.map((item, idx) => (
              <div key={idx} className="flex items-center w-full">
                <span className="w-20 text-[11px] font-bold text-slate-400 text-right pr-4">
                  {item.region}
                </span>
                <div className="flex-1 h-3 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: item.percentage }} />
                </div>
              </div>
            ))}
          </div>

          {/* Floating marker pointer reference node */}
          <div className="flex justify-center mt-auto">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
          </div>
        </div>

        {/* Right Block: Recently Verified Item Navigation Stack */}
        <div className="lg:col-span-5 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col gap-4 min-h-[380px]">
          <h2 className="text-base font-bold font-serif text-slate-900 mb-2">
            Recently Verified
          </h2>

          <div className="flex flex-col gap-3">
            {recentListings.map((listing, index) => (
              <div 
                key={index}
                className="w-full bg-white border border-slate-100 hover:border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm group cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Placeholder Media Box container */}
                  <div className="w-11 h-11 bg-slate-50 border border-slate-100 text-slate-300 rounded-lg flex items-center justify-center text-[10px] font-bold italic overflow-hidden shrink-0">
                    {listing.photo ? (
                      <img src={listing.photo} alt={listing.name} className="w-full h-full object-cover" />
                    ) : (
                      'IMG'
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E3A8A] group-hover:text-blue-800 transition-colors">
                      {listing.name}
                    </h4>
                    <p className="text-[10px] font-bold tracking-wide text-slate-400 uppercase mt-0.5">
                      {listing.city}, {listing.region}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>

      </section>

    </main>
  );
}
