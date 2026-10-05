import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS, type ApplicationStatus } from '@/types/api'
import { cn } from '@/lib/utils'

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-900 border-amber-200',
  UNDER_REVIEW: 'bg-sky-100 text-sky-900 border-sky-200',
  ACCEPTED: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-900 border-rose-200',
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn('tabular-nums font-medium', STATUS_CLASS[status])}
    >
      {STATUS_LABELS[status]}
    </Badge>
  )
}
