import { Badge } from '@/components/ui/badge'
import { STATUS_LABELS, type ApplicationStatus } from '@/types/api'
import { cn } from '@/lib/utils'
import { Check, Clock, Search, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  PENDING:
    'border-amber-500/40 bg-amber-500/15 text-amber-800 dark:text-amber-200',
  UNDER_REVIEW:
    'border-sky-500/40 bg-sky-500/15 text-sky-800 dark:text-sky-200',
  ACCEPTED:
    'border-emerald-500/50 bg-emerald-500/20 text-emerald-900 dark:text-emerald-100',
  REJECTED:
    'border-rose-500/40 bg-rose-500/15 text-rose-800 dark:text-rose-200',
}

const STATUS_ICON: Record<ApplicationStatus, LucideIcon> = {
  PENDING: Clock,
  UNDER_REVIEW: Search,
  ACCEPTED: Check,
  REJECTED: X,
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const Icon = STATUS_ICON[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 border px-2 py-0.5 font-semibold tracking-normal',
        STATUS_CLASS[status],
      )}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={2.5} />
      <span>{STATUS_LABELS[status].replace(/^[^\s]+\s/, '')}</span>
    </Badge>
  )
}
