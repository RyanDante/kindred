import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useFavorites } from '../../hooks/useFavorites';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface UserSubmission {
  id: string;
  name: string;
  location: string;
  createdAt: Timestamp | null;
  status: 'pending' | 'approved' | 'rejected';
}

export default function UserProfile() {
  const { user, updateProfileDetails } = useAuth();
  const { t } = useLanguage();
  const { favoriteIds } = useFavorites(user?.uid);
  
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'submissions' | 'favorites'>('account');

  useEffect(() => {
    const loadSubmissions = async () => {
      if (!user) return;
      setLoadingSubmissions(true);
      try {
        const q = query(collection(db, 'submissions'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserSubmission[];
        setSubmissions(data.sort((a, b) => (b.createdAt?.toDate?.() || new Date(0)).getTime() - (a.createdAt?.toDate?.() || new Date(0)).getTime()));
      } catch (error) {
        console.error('Error loading submissions:', error);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    if (user && activeTab === 'submissions') {
      loadSubmissions();
    }
  }, [user, activeTab]);

  const handleSaveName = async () => {
    if (!newName.trim() || newName === user?.displayName) {
      setEditingName(false);
      return;
    }
    setSaving(true);
    try {
      await updateProfileDetails(newName.trim());
      setEditingName(false);
    } catch (error) {
      console.error('Error updating name:', error);
      setNewName(user?.displayName || '');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('profileTitle')}</h1>
          <p className="text-sm text-slate-600 mb-6">{t('loginToAdd')}</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full bg-[#1E3A8A] px-6 py-3 text-sm font-bold text-white hover:bg-[#152960] transition"
          >
            {t('loginWithGoogle')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 font-sans text-slate-800">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('profileTitle')}</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">{t('profileDesc')}</p>
          </div>
          <Link
            to="/submit"
            className="inline-flex items-center justify-center rounded-full bg-[#F97316] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
          >
            {t('submitNewEntry')}
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-3 font-semibold transition ${activeTab === 'account' ? 'border-b-2 border-[#1E3A8A] text-[#1E3A8A]' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-3 font-semibold transition ${activeTab === 'submissions' ? 'border-b-2 border-[#1E3A8A] text-[#1E3A8A]' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-3 font-semibold transition ${activeTab === 'favorites' ? 'border-b-2 border-[#1E3A8A] text-[#1E3A8A]' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Favorites ({favoriteIds.length})
          </button>
        </div>

        {/* Account Tab */}
        {activeTab === 'account' && (
          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('accountId')}</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Name</label>
                  {editingName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={saving}
                        className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#152960] transition disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingName(false);
                          setNewName(user?.displayName || '');
                        }}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">{user.displayName || 'Not set'}</span>
                      <button
                        onClick={() => setEditingName(true)}
                        className="text-sm text-[#1E3A8A] hover:underline font-semibold"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-slate-500">Email</span>
                  <span className="text-slate-700">{user.email}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-slate-500">{t('memberSince')}</span>
                  <span className="text-slate-700">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '-'}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-slate-500">{t('lastSignIn')}</span>
                  <span className="text-slate-700">{user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : '-'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <p className="text-2xl font-bold text-[#1E3A8A]">{submissions.length}</p>
                  <p className="text-xs text-slate-600 mt-1">Submissions</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                  <p className="text-2xl font-bold text-red-600">{favoriteIds.length}</p>
                  <p className="text-xs text-slate-600 mt-1">Favorites</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                  <p className="text-2xl font-bold text-green-600">{submissions.filter(s => s.status === 'approved').length}</p>
                  <p className="text-xs text-slate-600 mt-1">Approved</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <p className="text-2xl font-bold text-amber-600">{submissions.filter(s => s.status === 'pending').length}</p>
                  <p className="text-xs text-slate-600 mt-1">Pending</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Submissions</h2>
            {loadingSubmissions ? (
              <p className="text-slate-600 text-center py-8">Loading...</p>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">No submissions yet</p>
                <Link to="/submit" className="text-[#1E3A8A] font-semibold hover:underline">
                  Submit your first orphanage
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition">
                    <div>
                      <p className="font-semibold text-slate-900">{submission.name}</p>
                      <p className="text-sm text-slate-600">{submission.location}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        submission.status === 'approved' ? 'bg-green-100 text-green-700' :
                        submission.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {submission.status}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        {submission.createdAt?.toDate?.()?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Favorites</h2>
            {favoriteIds.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">No favorites saved yet</p>
                <Link to="/" className="text-[#1E3A8A] font-semibold hover:underline">
                  Explore the map to add favorites
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {favoriteIds.map((id) => (
                  <div key={id} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition">
                    <p className="font-semibold text-slate-900">Orphanage {id.slice(0, 8)}</p>
                    <Link to={`/listing/${id}`} className="text-[#1E3A8A] text-sm font-semibold hover:underline mt-2 inline-block">
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
