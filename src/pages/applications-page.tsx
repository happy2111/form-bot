import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/status-badge'
import { formatTashkentDateTime } from '@/lib/tashkent-time'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { clearAllApplications, fetchApplications } from '@/lib/applications-api'
import { useAuth } from '@/lib/auth'
import { STATUS_LABELS, type ApplicationStatus } from '@/types/api'

const STATUSES: Array<ApplicationStatus | 'ALL'> = [
  'ALL',
  'PENDING',
  'UNDER_REVIEW',
  'ACCEPTED',
  'REJECTED',
]

export function ApplicationsPage() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<ApplicationStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const query = useQuery({
    queryKey: ['applications', status, search, page],
    queryFn: () =>
      fetchApplications({
        status,
        search,
        page,
        limit: 20,
      }),
  })

  const clearMutation = useMutation({
    mutationFn: clearAllApplications,
    onSuccess: (result) => {
      toast.success(`${result.deleted} ta ariza o‘chirildi`)
      void queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: () => toast.error('Tozalash amalga oshmadi'),
  })

  const totalPages = useMemo(() => {
    if (!query.data) return 1
    return Math.max(1, Math.ceil(query.data.total / query.data.limit))
  }, [query.data])

  const isEmpty = !query.isLoading && (query.data?.items.length ?? 0) === 0

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Arizalar
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
          Telegram orqali kelgan ishga arizalar ro‘yxati.
        </p>
      </div>

      <Card className="border-border/80 bg-card shadow-sm">
        <CardHeader className="gap-3 space-y-0 border-b border-border/60 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jami:{' '}
              <span className="tabular-nums text-foreground">
                {query.data?.total ?? '—'}
              </span>
            </CardTitle>

            <div className="flex w-full gap-2 sm:w-auto sm:max-w-md sm:flex-1">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-9 border-border/70 bg-background/60 pl-8 shadow-none"
                  placeholder="Qidirish..."
                  value={search}
                  onChange={(e) => {
                    setPage(1)
                    setSearch(e.target.value)
                  }}
                />
              </div>
              <Select
                value={status}
                onValueChange={(value) => {
                  setPage(1)
                  setStatus((value as ApplicationStatus | 'ALL') ?? 'ALL')
                }}
              >
                <SelectTrigger className="h-9 w-[9.5rem] shrink-0 border-border/70 bg-background/60 shadow-none">
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item === 'ALL' ? 'Barchasi' : STATUS_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 pt-0 md:px-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Ism</TableHead>
                  <TableHead>Yosh</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
                {query.data?.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold">{item.fullName}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {item.age}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {item.phone}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {formatTashkentDateTime(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link to={`/applications/${item.id}`} />}
                      >
                        Ochish
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 px-4 pt-4 md:hidden">
            {query.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))
              : null}
            {query.data?.items.map((item) => (
              <Link
                key={item.id}
                to={`/applications/${item.id}`}
                className="block rounded-xl border border-border/80 bg-muted/40 p-4 shadow-[0_1px_0_oklch(1_0_0/0.04)] transition-colors hover:bg-muted/60 dark:bg-neutral-900 dark:hover:bg-neutral-900/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1.5">
                    <p className="truncate text-base font-semibold leading-snug text-balance">
                      {item.fullName}
                    </p>
                    <p className="text-sm leading-relaxed tabular-nums text-muted-foreground">
                      {item.phone}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-3.5 flex items-center justify-between text-xs leading-relaxed text-muted-foreground/90">
                  <span className="tabular-nums">{item.age} yosh</span>
                  <span className="tabular-nums">
                    {formatTashkentDateTime(item.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-14 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ClipboardList className="size-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Arizalar topilmadi</p>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  Qidiruv yoki filtr bo‘yicha natija yo‘q. Boshqa so‘rov
                  sinab ko‘ring.
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex items-center justify-between border-t border-border/60 px-4 py-3">
            <p className="text-sm tabular-nums text-muted-foreground">
              Sahifa {page}/{totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Oldingi
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Keyingi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAdmin ? (
        <div className="flex justify-end pt-1">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-destructive"
                />
              }
            >
              <Trash2 className="size-3.5" />
              Hammasini tozalash
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Barcha arizalarni o‘chirish?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu amal qaytarilmaydi. Barcha arizalar va ularning rasmlari
                  o‘chiriladi.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => clearMutation.mutate()}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  O‘chirish
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : null}
    </div>
  )
}
