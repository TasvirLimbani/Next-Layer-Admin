import { CheckCircle, Clock, Loader, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

const statusConfig = {
  pending: {
    bg: 'bg-yellow-50 border border-yellow-200',
    text: 'text-yellow-700',
    label: 'Pending',
    icon: Clock,
  },
  processing: {
    bg: 'bg-blue-50 border border-blue-200',
    text: 'text-blue-700',
    label: 'Processing',
    icon: Loader,
  },
  completed: {
    bg: 'bg-green-50 border border-green-200',
    text: 'text-green-700',
    label: 'Completed',
    icon: CheckCircle,
  },
  cancelled: {
    bg: 'bg-red-50 border border-red-200',
    text: 'text-red-700',
    label: 'Cancelled',
    icon: XCircle,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
