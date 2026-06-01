import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Orphanage } from '../types/orphanage';

const SAMPLE_DATA = [
  {
    name: "Saint Rita's Orphanage",
    region: 'Littoral',
    city: 'Douala',
    latitude: 4.051,
    longitude: 9.767,
    capacity: 45,
    phone: '+237 677 889 900',
    email: 'contact@saintritaorphanage.org',
    photo: 'https://images.unsplash.com/photo-1540479859555-17af45c78602?auto=format&fit=crop&w=600&q=80',
    description: 'Providing care, primary education, and a warm family environment for orphans and abandoned children in Douala.',
    verified: true,
  },
  {
    name: 'Chantal Biya Foundation Shelter Center',
    region: 'Central',
    city: 'Yaoundé',
    latitude: 3.848,
    longitude: 11.502,
    capacity: 120,
    phone: '+237 222 345 678',
    email: 'info@fondationchantalbiya.cm',
    photo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
    description: 'A leading state-supported pediatric care and shelter facility offering comprehensive healthcare, nutritional support, and nursery services.',
    verified: true,
  },
  {
    name: 'Buea Mountain Grace Vocational Home',
    region: 'South-West',
    city: 'Buea',
    latitude: 4.156,
    longitude: 9.241,
    capacity: 35,
    phone: '+237 699 112 233',
    email: 'bueagracehome@gmail.com',
    photo: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80',
    description: 'Nestled at the foot of Mount Cameroon, this home nurtures and educates orphaned children, focusing on vocational skills training.',
    verified: true,
  },
];

interface UseOrphanagesOptions {
  autoSeed?: boolean;
}

export function useOrphanages({ autoSeed = false }: UseOrphanagesOptions = {}) {
  const [orphanages, setOrphanages] = useState<Orphanage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orphanages'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty && autoSeed) {
          SAMPLE_DATA.forEach(async (item) => {
            try {
              await addDoc(collection(db, 'orphanages'), {
                ...item,
                createdAt: serverTimestamp(),
              });
            } catch (e) {
              console.error('Error seeding sample data:', e);
            }
          });
        } else {
          const fetched: Orphanage[] = [];
          snapshot.forEach((doc) => {
            fetched.push({ id: doc.id, ...doc.data() } as Orphanage);
          });
          setOrphanages(fetched);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching orphanage data:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [autoSeed]);

  return { orphanages, loading };
}
