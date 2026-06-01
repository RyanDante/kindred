import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { db, storage } from '../../firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import GoogleMapPicker from '../../components/maps/GoogleMapPicker';
import { CAMEROON_REGIONS } from '../../constants/regions';

interface FormState {
  name: string;
  region: string;
  city: string;
  latitude: string;
  longitude: string;
  phone: string;
  email: string;
  capacity: string;
  description: string;
  photo: string;
  photos: string;
  videos: string;
  website: string;
  openHours: string;
  verified: boolean;
}

export default function AdminEditOrphanage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormState>({
    name: '',
    region: 'Adamawa',
    city: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    capacity: '',
    description: '',
    photo: '',
    photos: '',
    videos: '',
    website: '',
    openHours: '',
    verified: false,
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchOrphanage = async () => {
      try {
        const docRef = doc(db, 'orphanages', id);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
          setError('Orphanage not found.');
          setLoading(false);
          return;
        }

        const data = snapshot.data();
        setFormData({
          name: data.name ?? '',
          region: data.region ?? 'Adamawa',
          city: data.city ?? '',
          latitude: data.latitude?.toString() ?? '',
          longitude: data.longitude?.toString() ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          capacity: data.capacity?.toString() ?? '',
          description: data.description ?? '',
          photo: data.photo ?? '',
          photos: Array.isArray(data.photos) ? data.photos.join('\n') : data.photo ? data.photo : '',
          videos: Array.isArray(data.videos) ? data.videos.join('\n') : '',
          website: data.website ?? '',
          openHours: data.openHours ?? '',
          verified: !!data.verified,
        });
      } catch (err) {
        console.error('Failed to load orphanage:', err);
        setError('Unable to load orphanage details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrphanage();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
  };

  const normalizeLinks = (value: string) =>
    value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);

  const uploadFileUrls = async (files: File[], folder: string) => {
    if (!id || files.length === 0) return [];

    const uploads = await Promise.all(
      files.map(async (file) => {
        const path = `orphanages/${id}/${folder}/${Date.now()}-${file.name}`;
        const fileRef = storageRef(storage, path);
        await uploadBytes(fileRef, file);
        return getDownloadURL(fileRef);
      })
    );

    return uploads;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photos' | 'videos') => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (type === 'photos') setPhotoFiles(files);
    else setVideoFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !id) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const docRef = doc(db, 'orphanages', id);
      const photoLinks = normalizeLinks(formData.photos);
      const videoLinks = normalizeLinks(formData.videos);
      const uploadedPhotoUrls = await uploadFileUrls(photoFiles, 'photos');
      const uploadedVideoUrls = await uploadFileUrls(videoFiles, 'videos');
      const finalPhotos = [...photoLinks, ...uploadedPhotoUrls];
      const finalVideos = [...videoLinks, ...uploadedVideoUrls];
      const primaryPhoto = finalPhotos.length > 0 ? finalPhotos[0] : formData.photo.trim();

      await updateDoc(docRef, {
        name: formData.name.trim(),
        region: formData.region,
        city: formData.city.trim(),
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        capacity: parseInt(formData.capacity, 10) || 0,
        description: formData.description.trim(),
        photo: primaryPhoto,
        photos: finalPhotos,
        videos: finalVideos,
        website: formData.website.trim(),
        openHours: formData.openHours.trim(),
        verified: formData.verified,
        updatedAt: serverTimestamp(),
      });
      setPhotoFiles([]);
      setVideoFiles([]);
      setSuccess(true);
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err) {
      console.error('Failed to update orphanage:', err);
      setError('Unable to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans px-8 py-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors">
              <ArrowLeft size={16} />
              <span className="ml-2 text-xs font-bold uppercase tracking-wider">Back</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Orphanage</h1>
              <p className="text-sm text-slate-500">Update location, contact, and description information.</p>
            </div>
          </div>
          <div className="text-xs uppercase tracking-[0.24em] text-slate-400">ID: {id}</div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            <Loader2 className="animate-spin mx-auto mb-4 text-[#1E3A8A]" size={28} />
            Loading orphanage details...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
            {error}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
            {success && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                Changes saved successfully. Redirecting to admin directory...
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
              <div className="space-y-6 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Orphanage Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Region</label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                      >
                        {CAMEROON_REGIONS.map((region) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">City</label>
                      <input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Phone</label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Email</label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Website</label>
                      <input
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://example.org"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Open Hours</label>
                      <textarea
                        name="openHours"
                        value={formData.openHours}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="e.g. Mon-Fri 8am - 5pm"
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Capacity</label>
                      <input
                        name="capacity"
                        type="number"
                        min={0}
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-7">
                      <input
                        id="verified"
                        name="verified"
                        type="checkbox"
                        checked={formData.verified}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-[#1E3A8A] border-slate-300 rounded"
                      />
                      <label htmlFor="verified" className="text-sm font-semibold text-slate-700">Verified listing</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Primary photo URL</label>
                    <input
                      name="photo"
                      value={formData.photo}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                    />
                    <p className="text-[10px] text-slate-400 mt-2">
                      This image is the primary listing picture. Add gallery photos below, and the first gallery photo will become the front-page image.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Photo gallery URLs</label>
                      <textarea
                        name="photos"
                        value={formData.photos}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="One image URL per line or comma-separated"
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                      />
                      <p className="text-[10px] text-slate-400 mt-2">
                        The first link entered here becomes the front-page image.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Upload photos</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileChange(e, 'photos')}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                      />
                      {photoFiles.length > 0 && (
                        <p className="mt-2 text-[10px] text-slate-500">{photoFiles.length} photo(s) ready to upload.</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Video links</label>
                      <textarea
                        name="videos"
                        value={formData.videos}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="One video URL per line or comma-separated"
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Upload videos</label>
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={(e) => handleFileChange(e, 'videos')}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                      />
                      {videoFiles.length > 0 && (
                        <p className="mt-2 text-[10px] text-slate-500">{videoFiles.length} video(s) ready to upload.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Location</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Latitude</label>
                      <input
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Longitude</label>
                      <input
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1E3A8A]"
                      />
                    </div>
                  </div>
                  <GoogleMapPicker
                    latitude={parseFloat(formData.latitude) || 0}
                    longitude={parseFloat(formData.longitude) || 0}
                    onLocationChange={handleLocationChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Save changes</p>
                <p className="text-sm text-slate-500">Edit orphanage information and keep the directory current.</p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1E3A8A] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#152960] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
