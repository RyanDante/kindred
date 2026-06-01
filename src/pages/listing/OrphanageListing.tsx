import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { db, storage } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import BasicInfoSection from '../../components/forms/BasicInfoSection';
import LocationSection from '../../components/forms/LocationSection';
import ContactDetailsSection from '../../components/forms/ContactDetailsSection';
import SubmitStatusBanners from '../../components/forms/SubmitStatusBanners';

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
  photo: File | null;
}

export default function SubmitOrphanage() {
  const { t } = useLanguage();
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
    photo: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isDisabled = isSubmitting || submitSuccess;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      let photoUrl = '';

      if (formData.photo) {
        const fileExtension = formData.photo.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
        const storageRef = ref(storage, `orphanages/${fileName}`);

        const snapshot = await uploadBytes(storageRef, formData.photo);
        photoUrl = await getDownloadURL(snapshot.ref);
      } else {
        throw new Error('Please select an image file to upload.');
      }

      const newOrphanage = {
        name: formData.name.trim(),
        region: formData.region,
        city: formData.city.trim(),
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        phone: formData.phone.trim() || '',
        email: formData.email.trim() || '',
        capacity: parseInt(formData.capacity) || 0,
        description: formData.description.trim() || '',
        photo: photoUrl,
        verified: false,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'orphanages'), newOrphanage);

      setSubmitSuccess(true);
      setTimeout(() => navigate('/home'), 2000);
    } catch (err: unknown) {
      console.error('Error submitting orphanage listing:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit orphanage listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700 relative">
      <header className="flex items-center justify-between px-12 py-8 max-w-[1200px] mx-auto w-full">
        <h1 className="text-2xl font-bold text-[#1E3A8A] tracking-tight">{t('submitOrphanage')}</h1>
        <Link to="/home" className="text-slate-900 hover:text-slate-600 transition-colors" aria-label="Close form">
          <X size={24} strokeWidth={2.5} />
        </Link>
      </header>

      <main className="max-w-[1200px] mx-auto px-12 pb-24 w-full">
        <form onSubmit={handleSubmit} className="max-w-[760px] mx-auto flex flex-col gap-8">
          <SubmitStatusBanners submitSuccess={submitSuccess} submitError={submitError} />

          <BasicInfoSection
            formData={formData}
            onChange={handleInputChange}
            disabled={isDisabled}
          />

          <LocationSection
            latitude={formData.latitude}
            longitude={formData.longitude}
            onInputChange={handleInputChange}
            onLocationChange={handleLocationChange}
            disabled={isDisabled}
          />

          <ContactDetailsSection
            formData={formData}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
            disabled={isDisabled}
          />

          <button
            type="submit"
            disabled={isDisabled}
            className="w-full bg-[#1E3A8A] hover:bg-[#152960] active:scale-[0.99] disabled:bg-slate-300 disabled:scale-100 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 tracking-wider transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t('submitting')}
              </>
            ) : (
              <>
                <Send size={16} className="transform -rotate-12 fill-white" />
                {t('submit')}
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
