import { useEffect, useState } from 'react';
import { ClipboardList, Check, X, Loader2, Phone, Mail, MapPin } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, onSnapshot, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface PendingOrphanage {
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
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<PendingOrphanage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query listings where verified is false
    const q = query(collection(db, 'orphanages'), where('verified', '==', false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: PendingOrphanage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          name: data.name || '',
          region: data.region || '',
          city: data.city || '',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          phone: data.phone || '',
          email: data.email || '',
          capacity: data.capacity || 0,
          description: data.description || '',
          photo: data.photo || ''
        });
      });
      setSubmissions(fetched);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching submissions:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'orphanages', id), {
        verified: true
      });
    } catch (err) {
      console.error("Error approving orphanage:", err);
      alert("Failed to approve orphanage.");
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to reject and delete the submission "${name}"?`)) {
      try {
        await deleteDoc(doc(db, 'orphanages', id));
      } catch (err) {
        console.error("Error rejecting/deleting orphanage:", err);
        alert("Failed to reject orphanage.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20 text-slate-400">
        <Loader2 className="animate-spin text-[#1E3A8A] mr-2" size={24} />
        <span>Loading pending reviews...</span>
      </div>
    );
  }

  return (
    <main className="flex-1 p-8 max-w-[1400px] w-full mx-auto flex flex-col gap-6 select-none">
      
      {/* Section Title Container along with Count Counter Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-serif text-[#1E3A8A] tracking-tight">
          Pending Reviews
        </h2>
        
        {/* Custom Pill Count Badge Layout */}
        <div className="bg-[#FFF7ED] border border-orange-200/60 px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase text-[#F97316]">
          {submissions.length} {submissions.length === 1 ? 'Submission' : 'Submissions'}
        </div>
      </div>

      {submissions.length === 0 ? (
        /* Outer Canvas Containment Wrapper Box when empty */
        <div className="flex-1 bg-white border border-slate-200/60 rounded-3xl p-12 min-h-[450px] flex items-center justify-center">
          {/* Inner Dashed Boundary Framework Component Layout */}
          <div className="w-full max-w-[1100px] h-full min-h-[320px] border-2 border-dashed border-slate-200/80 rounded-2xl flex flex-col items-center justify-center p-8">
            {/* Custom Circular Floating Layout Icon Node */}
            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-sm">
              <ClipboardList size={22} strokeWidth={1.8} />
            </div>
            {/* Empty Context Notice Text Label */}
            <p className="text-slate-400 font-medium italic text-sm tracking-wide text-center">
              Queue is clear. No new submissions.
            </p>
          </div>
        </div>
      ) : (
        /* Grid of pending submissions */
        <div className="grid grid-cols-1 gap-6">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-stretch hover:shadow-md transition-shadow">
              
              {/* Left Column: Image preview */}
              <div className="w-full md:w-56 h-36 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100 relative">
                {sub.photo ? (
                  <img src={sub.photo} alt={sub.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xs italic">No Image</div>
                )}
                <span className="absolute top-2 left-2 bg-orange-100 border border-orange-200 text-[#C2410C] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                  Pending Review
                </span>
              </div>

              {/* Middle Column: Details info */}
              <div className="flex-1 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                      {sub.name}
                    </h3>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold px-2 py-0.5 rounded">
                      Capacity: {sub.capacity}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-xs font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      {sub.city}, {sub.region}
                    </span>
                    {sub.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        {sub.phone}
                      </span>
                    )}
                    {sub.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" />
                        {sub.email}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
                  {sub.description || 'No description provided.'}
                </p>

                <div className="text-[9px] font-mono text-slate-300 select-all">
                  ID: {sub.id} | GPS: {sub.latitude}, {sub.longitude}
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex md:flex-col justify-center gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <button
                  onClick={() => handleApprove(sub.id)}
                  className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  <Check size={14} strokeWidth={2.5} /> Approve
                </button>
                <button
                  onClick={() => handleReject(sub.id, sub.name)}
                  className="flex-1 md:flex-initial bg-rose-50 border border-rose-200 hover:bg-rose-100 active:scale-98 text-rose-700 font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  <X size={14} strokeWidth={2.5} /> Reject
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </main>
  );
}