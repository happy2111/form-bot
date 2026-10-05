import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  Clock3,
  Inbox,
  Users,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchStats } from '@/lib/applications-api'
import { STATUS_LABELS, type StatsPeriod } from '@/types/api'
import { cn } from '@/lib/utils'

const PERIODS: Array<{ value: StatsPeriod; label: string }> = [
  { value: 'today', label: 'Bugun' },
  { value: '7d', label: '7 kun' },
  { value: '30d', label: '30 kun' },
  { value: 'all', label: 'Hammasi' },
]

function statusLabelClean(status: keyof typeof STATUS_LABELS) {
  return STATUS_LABELS[status].replace(/^[^\s]+\s/, '')
}

function formatDay(date: string, compact: boolean) {
  const [, month, day] = date.split('-')
  if (compact) return day
  return `${day}.${month}`
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string
  value: string | number
  hint?: string
  icon: typeof Inbox
}) {
  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
          {hint ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
        <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  )
}

function DistributionList({
  items,
}: {
  items: Array<{ label: string; value: number; tone?: string }>
}) {
  const max = Math.max(1, ...items.map((item) => item.value))

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium tabular-nums">{item.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full bg-primary/80', item.tone)}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function DailyChart({
  data,
}: {
  data: Array<{ date: string; count: number }>
}) {
  const max = Math.max(1, ...data.map((item) => item.count))
  const dense = data.length > 14
  const labelStep = data.length > 20 ? 5 : data.length > 14 ? 3 : 1

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Bu davr uchun ma’lumot yo‘q
      </p>
    )
  }

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div
        className={cn(
          'flex h-48 items-end',
          dense ? 'min-w-[36rem] gap-1' : 'w-full gap-1.5 sm:gap-2',
        )}
      >
        {data.map((item, index) => {
          const showLabel =
            index === 0 ||
            index === data.length - 1 ||
            index % labelStep === 0

          return (
            <div
              key={item.date}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
              title={`${formatDay(item.date, false)}: ${item.count} ta`}
            >
              <span className="h-3 text-[10px] tabular-nums text-muted-foreground">
                {item.count > 0 ? item.count : ''}
              </span>
              <div className="flex h-28 w-full items-end">
                <div
                  className="mx-auto w-full max-w-6 rounded-t-md bg-primary/80 transition-[height]"
                  style={{
                    height: `${Math.max(
                      item.count ? 10 : 3,
                      (item.count / max) * 100,
                    )}%`,
                  }}
                />
              </div>
              <span
                className={cn(
                  'h-4 text-center text-[10px] tabular-nums text-muted-foreground',
                  !showLabel && 'invisible',
                )}
              >
                {formatDay(item.date, dense)}
              </span>
            </div>
          )
        })}
      </div>
      {dense ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Sanalar: faqat ba’zi kunlar ko‘rsatiladi. Batafsil uchun ustunga
          boring.
        </p>
      ) : null}
    </div>
  )
}

export function StatsPage() {
  const [period, setPeriod] = useState<StatsPeriod>('30d')

  const query = useQuery({
    queryKey: ['stats', period],
    queryFn: () => fetchStats(period),
  })

  const stats = query.data
  const periodLabel =
    PERIODS.find((item) => item.value === period)?.label ?? period

  const statusItems = useMemo(() => {
    if (!stats) return []
    return (
      Object.keys(stats.byStatus) as Array<keyof typeof stats.byStatus>
    ).map((key) => ({
      label: STATUS_LABELS[key],
      value: stats.byStatus[key],
    }))
  }, [stats])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Statistika
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Arizalar oqimi, holatlar va kandidatlar profili.
          </p>
        </div>
        <Select
          value={period}
          onValueChange={(value) => setPeriod((value as StatsPeriod) ?? '30d')}
        >
          <SelectTrigger className="h-9 w-full sm:w-40">
            <SelectValue placeholder="Davr">{periodLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {query.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : null}

      {stats ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Jami arizalar"
              value={stats.summary.total}
              hint={`Qabul: ${stats.summary.acceptedRate}% · Rad: ${stats.summary.rejectedRate}%`}
              icon={Inbox}
            />
            <StatCard
              title="Navbatda"
              value={stats.summary.queue}
              hint={`${statusLabelClean('PENDING')} + ${statusLabelClean('UNDER_REVIEW')}`}
              icon={Clock3}
            />
            <StatCard
              title="Qabul qilingan"
              value={stats.summary.accepted}
              hint={`${stats.summary.acceptedRate}% umumiy`}
              icon={CheckCircle2}
            />
            <StatCard
              title="Rad etilgan"
              value={stats.summary.rejected}
              hint={
                stats.summary.avgDecisionHours != null
                  ? `O‘rtacha qaror: ${stats.summary.avgDecisionHours} soat`
                  : 'Hali qaror vaqti yo‘q'
              }
              icon={XCircle}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="border-border/70 shadow-sm xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  Kunlik oqim
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Har bir kun nechta ariza kelgani (Toshkent vaqti).
                </p>
              </CardHeader>
              <CardContent>
                <DailyChart data={stats.daily} />
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Holatlar</CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionList items={statusItems} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Yosh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  O‘rtacha yosh:{' '}
                  <span className="font-medium text-foreground tabular-nums">
                    {stats.skills.avgAge ?? '—'}
                  </span>
                </p>
                <DistributionList
                  items={[
                    { label: '18–22', value: stats.ageBuckets['18-22'] },
                    { label: '23–26', value: stats.ageBuckets['23-26'] },
                    { label: '27–30', value: stats.ageBuckets['27-30'] },
                    { label: 'Boshqa', value: stats.ageBuckets.other },
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  Jins va video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <DistributionList
                  items={[
                    { label: 'Yigit', value: stats.byGender.MALE },
                    { label: 'Qiz', value: stats.byGender.FEMALE },
                  ]}
                />
                <DistributionList
                  items={[
                    {
                      label: 'Videoga tayyor',
                      value: stats.readyForVideo.yes,
                      tone: 'bg-emerald-500/80',
                    },
                    {
                      label: 'Tayyor emas',
                      value: stats.readyForVideo.no,
                      tone: 'bg-rose-500/70',
                    },
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-sm md:col-span-2 xl:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <Users className="size-4 text-muted-foreground" />
                  Ko‘nikmalar
                </CardTitle>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Anketadagi 1–10 ballik o‘z baholarining o‘rtachasi.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Texnika', value: stats.skills.avgTech },
                    { label: 'Rus tili', value: stats.skills.avgRussian },
                    { label: 'Ingliz tili', value: stats.skills.avgEnglish },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-border/60 bg-muted/30 p-3 text-center"
                    >
                      <p className="text-[11px] leading-tight text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 text-lg font-semibold tabular-nums">
                        {item.value ?? '—'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        o‘rtacha
                      </p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                  <p className="text-sm font-medium">Kuchli profil</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Texnika, rus va inglizning{' '}
                    <span className="text-foreground">har biri ≥ 7</span>{' '}
                    bo‘lgan arizalar.
                  </p>
                  <p className="mt-2 text-sm">
                    <span className="font-semibold tabular-nums">
                      {stats.skills.strongProfileCount}
                    </span>{' '}
                    ta ·{' '}
                    <span className="tabular-nums">
                      {stats.skills.strongProfileRate}%
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {query.isError ? (
        <Card className="border-border/70">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Statistikani yuklashda xatolik. Qayta urinib ko‘ring.
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
