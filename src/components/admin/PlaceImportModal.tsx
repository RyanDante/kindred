import { useState } from 'react';
import { X, Loader2, Star, MapPin, Globe, Phone, MessageSquare } from 'lucide-react';
import type { PlaceImportFields, PlaceOrphanage } from '../../types/orphanage';
import { DEFAULT_IMPORT_FIELDS } from '../../types/orphanage';

interface PlaceImportModalProps {
  place: PlaceOrphanage;
  loading: boolean;
  onConfirm: (fields: PlaceImportFields) => void;
  onClose: () => void;
}

type FieldKey = Exclude<keyof PlaceImportFields, 'reviewCount'>;

const FIELD_LABELS: Record<FieldKey, string> = {
  name: 'Name',
  region: 'Region',
  city: 'City',
  latitude: 'Latitude',
  longitude: 'Longitude',
  phone: 'Phone',
  photo: 'Photo',
  description: 'Description',
  website: 'Website link',
  googleMapsUrl: 'Map / directions link (OpenStreetMap)',
  rating: 'Rating',
  reviews: 'Reviews',
};

function FieldPreview({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '') return null;
  return (
    <div className="text-[11px] text-slate-600">
      <span className="font-bold text-slate-400 uppercase tracking-wider">{label}: </span>
      <span className="text-slate-700">{value}</span>
    </div>
  );
}

export default function PlaceImportModal({ place, loading, onConfirm, onClose }: PlaceImportModalProps) {
  const [fields, setFields] = useState<PlaceImportFields>({ ...DEFAULT_IMPORT_FIELDS });

  const toggle = (key: FieldKey) => {
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Import from OpenStreetMap</p>
            <h3 className="text-lg font-bold text-slate-900 truncate">{place.name}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {place.photo && (
            <img
              src={place.photo}
              alt={place.name}
              className="w-full h-36 object-cover rounded-2xl border border-slate-200"
            />
          )}

          <div className="bg-slate-50 rounded-2xl p-4 space-y-1.5 border border-slate-100">
            <FieldPreview label="Address" value={place.address} />
            <FieldPreview label="Coords" value={`${place.latitude.toFixed(5)}, ${place.longitude.toFixed(5)}`} />
            <FieldPreview label="Phone" value={place.phone} />
            <FieldPreview label="Website" value={place.website} />
            <FieldPreview label="Rating" value={place.rating ? `${place.rating}/5` : undefined} />
            <FieldPreview label="Reviews available" value={place.reviews?.length ?? 0} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Choose fields to store in database
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FIELD_LABELS) as FieldKey[]).map((key) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer text-xs font-semibold transition-colors ${
                    fields[key]
                      ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={fields[key]}
                    onChange={() => toggle(key)}
                    className="rounded border-slate-300"
                  />
                  {FIELD_LABELS[key]}
                </label>
              ))}
            </div>
          </div>

          {fields.reviews && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                <MessageSquare size={12} />
                Number of reviews to import
              </p>
              <div className="flex gap-2">
                {[2, 4, 6].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setFields((prev) => ({ ...prev, reviewCount: count }))}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold transition-colors ${
                      fields.reviewCount === count
                        ? 'bg-[#1E3A8A] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    First {count}
                  </button>
                ))}
              </div>
              {place.reviews && place.reviews.length > 0 && (
                <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                  {place.reviews.slice(0, fields.reviewCount).map((review, i) => (
                    <div key={i} className="text-[11px] bg-slate-50 rounded-lg p-2 border border-slate-100">
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <Star size={10} className="text-amber-500 fill-amber-500" />
                        {review.authorName} · {review.rating}/5
                      </div>
                      <p className="text-slate-500 line-clamp-2 mt-0.5">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
            {fields.latitude && fields.longitude && (
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
                <MapPin size={10} /> Directions saved as lat/lng
              </span>
            )}
            {fields.website && place.website && (
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
                <Globe size={10} /> Website link
              </span>
            )}
            {fields.phone && place.phone && (
              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full">
                <Phone size={10} /> Phone
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(fields)}
            disabled={loading}
            className="flex-1 rounded-2xl bg-[#1E3A8A] hover:bg-[#152960] py-3 text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Stage selected fields
          </button>
        </div>
      </div>
    </div>
  );
}
