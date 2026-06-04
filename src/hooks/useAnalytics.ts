import { useCallback } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type AnalyticsEventType = 
  | 'view_orphanage'
  | 'favorite_orphanage'
  | 'view_profile'
  | 'submit_orphanage'
  | 'search_orphan­ages'
  | 'filter_orphanages'
  | 'view_map'
  | 'contact_orphanage';

interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  orphanageId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export function useAnalytics() {
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      await addDoc(collection(db, 'analytics'), {
        ...event,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.pathname,
      });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }, []);

  return { trackEvent };
}
