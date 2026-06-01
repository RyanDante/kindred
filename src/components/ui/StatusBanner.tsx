interface StatusBannerProps {
  type: 'success' | 'error';
  message: string;
  detail?: string;
}

export default function StatusBanner({ type, message, detail }: StatusBannerProps) {
  const isSuccess = type === 'success';

  return (
    <div
      className={`rounded-xl p-4 flex items-start gap-3 animate-fadeIn ${
        isSuccess
          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          : 'bg-rose-50 border border-rose-200 text-rose-800'
      }`}
    >
      <div className="text-sm font-medium">
        {message}
        {detail && (
          <span className={`block text-xs font-normal mt-1 ${isSuccess ? 'text-emerald-600' : 'text-rose-500'}`}>
            {detail}
          </span>
        )}
      </div>
    </div>
  );
}
