import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  trend?: number;
  trendLabel?: string;
  completed?: number;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'bg-blue-100',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: 'bg-green-100',
    gradient: 'from-green-500 to-green-600',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: 'bg-purple-100',
    gradient: 'from-purple-500 to-purple-600',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    icon: 'bg-orange-100',
    gradient: 'from-orange-500 to-orange-600',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  trend,
  trendLabel,
  completed,
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {completed !== undefined && (
              <span className="text-sm text-slate-500">({completed} completed)</span>
            )}
          </div>
          {trend !== undefined && trendLabel && (
            <div className="mt-3 flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-600">{trendLabel}</span>
            </div>
          )}
        </div>
        <div className={`rounded-lg p-4 ${colors.icon}`}>
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>
      </div>
      <div className="mt-4 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full w-3/4 bg-gradient-to-r ${colors.gradient}`} />
      </div>
    </div>
  );
}
