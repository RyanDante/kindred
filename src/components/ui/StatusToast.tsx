interface StatusToastProps {
  visible: boolean;
  type: 'success' | 'error';
  message: string;
}

export default function StatusToast({ visible, type, message }: StatusToastProps) {
  if (!visible) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className={`fixed right-5 top-5 z-50 max-w-sm rounded-3xl border p-4 shadow-2xl transition-opacity ${
        isSuccess
          ? 'bg-emerald-50 border-emerald-100 text-emerald-900'
          : 'bg-rose-50 border-rose-100 text-rose-900'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-sm font-semibold uppercase tracking-[0.16em]">
          {isSuccess ? 'Saved' : 'Error'}
        </span>
        <p className="text-sm leading-5">{message}</p>
      </div>
    </div>
  );
}
