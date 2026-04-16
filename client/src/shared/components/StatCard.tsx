const colorStyles: Record<string, string> = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  green: 'border-green-200 bg-green-50 text-green-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  slate: 'border-slate-200 bg-white text-slate-700',
};

interface StatCardProps {
  label: string;
  value: number;
  color?: 'blue' | 'green' | 'red' | 'amber' | 'slate';
}

export default function StatCard({ label, value, color = 'slate' }: StatCardProps) {
  const styleClass = colorStyles[color] || colorStyles.slate;

  return (
    <div className={`rounded-2xl border p-6 shadow-sm ${styleClass}`}>
      <p className="text-4xl font-bold tracking-tight">{value}</p>
      <p className="mt-3 text-sm font-medium opacity-80">{label}</p>
    </div>
  );
}
