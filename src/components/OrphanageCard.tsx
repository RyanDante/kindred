import { MapPin, Star, Globe, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Orphanage } from '../types/orphanage';

interface OrphanageCardProps {
  orphanage: Orphanage;
  favorite?: boolean;
  onToggleFavorite?: (orphanage: Orphanage) => void;
}

export default function OrphanageCard({ orphanage, favorite = false, onToggleFavorite }: OrphanageCardProps) {
  const { language } = useLanguage();

  const directionsUrl =
    orphanage.googleMapsUrl ||
    `https://www.openstreetmap.org/?mlat=${orphanage.latitude}&mlon=${orphanage.longitude}#map=16/${orphanage.latitude}/${orphanage.longitude}`;

  const coverImage = orphanage.photos?.length ? orphanage.photos[0] : orphanage.photo || 'https://images.unsplash.com/photo-1540479859555-17af45c78602?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col group select-none">
      <div className="h-44 w-full bg-slate-50 relative overflow-hidden shrink-0">
        <img
          src={coverImage}
          alt={orphanage.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1540479859555-17af45c78602?auto=format&fit=crop&w=600&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {orphanage.verified && (
          <span className="absolute top-3 left-3 bg-[#10B981] text-white text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm">
            {language === 'fr' ? 'Vérifié' : 'Verified'}
          </span>
        )}
        {orphanage.rating != null && (
          <span className="absolute top-3 right-3 bg-white/95 backdrop-blur text-amber-600 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Star size={10} className="fill-amber-500 text-amber-500" />
            {orphanage.rating}
          </span>
        )}
        <span className="absolute bottom-3 right-3 bg-white/95 backdrop-blur text-[#1E3A8A] text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded shadow-sm border border-slate-100">
          {orphanage.region}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <MapPin size={11} className="text-slate-400 shrink-0" />
            <span className="truncate">{orphanage.city}, Cameroon</span>
          </div>
          <h3 className="text-base font-black text-slate-800 tracking-tight group-hover:text-[#1E3A8A] transition-colors leading-tight line-clamp-1">
            {orphanage.name}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
            {orphanage.description || 'No description provided.'}
          </p>

          {orphanage.openHours && (
            <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line mt-2">
              <span className="font-semibold text-slate-700">Hours:</span> {orphanage.openHours}
            </p>
          )}

          {orphanage.reviews && orphanage.reviews.length > 0 && (
            <div className="mt-2 space-y-1.5 border-t border-slate-50 pt-3">
              {orphanage.reviews.slice(0, 2).map((review, i) => (
                <div key={i} className="text-[11px] text-slate-500">
                  <span className="font-bold text-slate-600">{review.authorName}</span>
                  <span className="text-amber-500 ml-1">★ {review.rating}</span>
                  <p className="line-clamp-2 mt-0.5">{review.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-50 pt-4 mt-auto space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400/80 font-bold tracking-widest uppercase">Capacity</span>
              <span className="text-slate-700 font-extrabold">{orphanage.capacity} Children</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] text-slate-400/80 font-bold tracking-widest uppercase">Contact</span>
              <span className="text-[#1E3A8A] font-extrabold">{orphanage.phone || 'N/A'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={favorite}
              onClick={() => onToggleFavorite?.(orphanage)}
              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-colors ${
                favorite ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'text-slate-600 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <Star size={10} className={favorite ? 'fill-amber-500 text-amber-500' : 'text-slate-500'} />
              {favorite ? (language === 'fr' ? 'Favori' : 'Saved') : (language === 'fr' ? 'Enregistrer' : 'Save')}
            </button>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A] bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink size={10} />
              Directions
            </a>
            {orphanage.website && (
              <a
                href={orphanage.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <Globe size={10} />
                Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
