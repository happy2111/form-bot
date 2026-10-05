import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/status-badge'
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-balance md:text-4xl">
            Arizalar
          </h2>
          <p className="mt-1 text-sm text-pretty text-muted-foreground">
            Telegram orqali kelgan ishga arizalar ro‘yxati.
          </p>
        </div>
        {isAdmin ? (
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive" className="gap-2" />}
            >
              <Trash2 className="size-4" />
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
        ) : null}
      </div>

      <Card>
        <CardHeader className="gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base font-medium">
            Jami:{' '}
            <span className="tabular-nums">{query.data?.total ?? '—'}</span>
          </CardTitle>
          <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Qidirish: ism, telefon..."
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
              <SelectTrigger className="w-full sm:w-48">
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
        </CardHeader>
        <CardContent className="px-0 md:px-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell className="font-medium">{item.fullName}</TableCell>
                    <TableCell className="tabular-nums">{item.age}</TableCell>
                    <TableCell className="tabular-nums">{item.phone}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {format(new Date(item.createdAt), 'dd.MM.yyyy HH:mm')}
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
                {!query.isLoading && query.data?.items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Arizalar topilmadi
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 px-4 md:hidden">
            {query.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))
              : null}
            {query.data?.items.map((item) => (
              <Link
                key={item.id}
                to={`/applications/${item.id}`}
                className="block rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-balance">{item.fullName}</p>
                    <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                      {item.phone}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="tabular-nums">{item.age} yosh</span>
                  <span className="tabular-nums">
                    {format(new Date(item.createdAt), 'dd.MM.yyyy HH:mm')}
                  </span>
                </div>
              </Link>
            ))}
            {!query.isLoading && query.data?.items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Arizalar topilmadi
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between px-4 pb-2">
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
    </div>
  )
}
