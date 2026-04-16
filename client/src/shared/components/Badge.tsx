import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { cn } from '../lib/utils';

const badgeStyles: Record<string, string> = {
  delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
  failed: 'bg-red-500/15 text-red-300 border-red-400/20',
  partial: 'bg-amber-500/15 text-amber-300 border-amber-400/20',
  pending: 'bg-slate-500/15 text-slate-300 border-slate-400/20',
  retrying: 'bg-slate-500/15 text-slate-300 border-slate-400/20',
  inactive: 'bg-slate-500/15 text-slate-300 border-slate-400/20',
  active: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
  email: 'bg-sky-500/15 text-sky-300 border-sky-400/20',
  webhook: 'bg-violet-500/15 text-violet-300 border-violet-400/20',
};

interface BadgeProps {
  status: string;
  className?: string;
}

export default function Badge({ status, className }: BadgeProps) {
  const normalizedStatus = String(status || '').toLowerCase();
  const classes = badgeStyles[normalizedStatus] || 'bg-slate-500/15 text-slate-200 border-slate-400/20';

  return (
    <ShadcnBadge
      className={cn(
        'border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em]',
        classes,
        className,
      )}
    >
      {status}
    </ShadcnBadge>
  );
}
