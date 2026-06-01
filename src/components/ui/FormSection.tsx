import type { LucideIcon } from 'lucide-react';

interface FormSectionProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

export default function FormSection({ icon: Icon, title, children }: FormSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2 border-l-[3px] border-[#1E3A8A] pl-3 h-5">
        <Icon size={16} className="text-[#1E3A8A]" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">{title}</h2>
      </div>
      {children}
    </section>
  );
}
