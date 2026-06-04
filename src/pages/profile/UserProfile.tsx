import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export default function UserProfile() {
  const { user } = useAuth();
  const { t } = useLanguage();

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
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('accountId')}</h2>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <span className="font-semibold w-32 text-slate-500">Name</span>
                <span>{user.displayName || t('profile')}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold w-32 text-slate-500">Email</span>
                <span>{user.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold w-32 text-slate-500">{t('memberSince')}</span>
                <span>{user.metadata.creationTime || '-'}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold w-32 text-slate-500">{t('lastSignIn')}</span>
                <span>{user.metadata.lastSignInTime || '-'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('profile')}</h2>
            <div className="space-y-4 text-sm text-slate-700">
              <p>{t('profileDesc')}</p>
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-sm font-semibold text-slate-900 mb-2">{t('loggedInAs')}</p>
                <p className="text-sm text-slate-600">{user.email}</p>
              </div>
              <div className="rounded-3xl bg-amber-50 p-4 border border-amber-100 text-amber-800">
                <p className="text-sm font-semibold">{t('submitNewEntry')}</p>
                <p className="text-xs leading-relaxed mt-1">{t('loginToAdd')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
