import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2 } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  deleteApplication,
  fetchApplication,
  updateApplicationStatus,
} from '@/lib/applications-api'
import { useAuth } from '@/lib/auth'
import { STATUS_LABELS, type ApplicationStatus } from '@/types/api'

const STATUSES: ApplicationStatus[] = [
  'PENDING',
  'UNDER_REVIEW',
  'ACCEPTED',
  'REJECTED',
]

export function ApplicationDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<ApplicationStatus | ''>('')
  const [note, setNote] = useState('')

  const query = useQuery({
    queryKey: ['application', id],
    queryFn: () => fetchApplication(id),
    enabled: Boolean(id),
  })

  const statusMutation = useMutation({
    mutationFn: () =>
      updateApplicationStatus(
        id,
        (status || query.data?.status) as ApplicationStatus,
        note || undefined,
      ),
    onSuccess: (data) => {
      toast.success('Holat yangilandi')
      void queryClient.invalidateQueries({ queryKey: ['application', id] })
      void queryClient.invalidateQueries({ queryKey: ['applications'] })
      setStatus(data.status)
      setNote(data.statusNote ?? '')
    },
    onError: () => toast.error('Holatni yangilab bo‘lmadi'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(id),
    onSuccess: () => {
      toast.success('Ariza o‘chirildi')
      void queryClient.invalidateQueries({ queryKey: ['applications'] })
      navigate('/')
    },
    onError: () => toast.error('O‘chirish amalga oshmadi'),
  })

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!query.data) {
    return (
      <div className="space-y-4">
        <p>Ariza topilmadi</p>
        <Button render={<Link to="/" />}>Orqaga</Button>
      </div>
    )
  }

  const app = query.data
  const currentStatus = status || app.status

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="h-9 w-fit gap-2 px-2"
            render={<Link to="/" />}
          >
            <ArrowLeft className="size-4" />
            Ro‘yxat
          </Button>
          <div>
            <h2 className="text-3xl font-semibold text-balance">{app.fullName}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={app.status} />
              <span className="text-sm tabular-nums text-muted-foreground">
                {formatTashkentDateTime(app.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {isAdmin ? (
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive" className="gap-2" />}
            >
              <Trash2 className="size-4" />
              O‘chirish
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Arizani o‘chirish?</AlertDialogTitle>
                <AlertDialogDescription>
                  {app.fullName} arizasi butunlay o‘chiriladi.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  O‘chirish
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Anketa ma’lumotlari</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Info label="Yosh" value={`${app.age}`} />
            <Info label="Jins" value={app.gender === 'MALE' ? 'Yigit' : 'Qiz'} />
            <Info label="Telefon" value={app.phone} />
            <Info
              label="Telegram"
              value={app.telegramUsername ? `@${app.telegramUsername}` : '—'}
            />
            <Info label="Manzil" value={app.address} className="sm:col-span-2" />
            <Info
              label="Tajriba"
              value={app.experience}
              className="sm:col-span-2"
            />
            <Info label="Texnika" value={`${app.techSkill}/10`} />
            <Info label="Rus tili" value={`${app.russianLevel}/10`} />
            <Info label="Ingliz tili" value={`${app.englishLevel}/10`} />
            <Info
              label="Video/Instagram"
              value={app.readyForVideo ? 'Ha' : 'Yo‘q'}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rasm</CardTitle>
            </CardHeader>
            <CardContent>
              {app.photoUrl ? (
                <img
                  src={app.photoUrl}
                  alt={app.fullName}
                  className="aspect-[4/5] w-full rounded-xl border object-cover"
                />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">
                  Rasm yo‘q
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Holatni o‘zgartirish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Holat</Label>
                <Select
                  value={currentStatus}
                  onValueChange={(value) =>
                    setStatus((value as ApplicationStatus) ?? app.status)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {STATUS_LABELS[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Izoh (ixtiyoriy)</Label>
                <Input
                  id="note"
                  value={note || app.statusNote || ''}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Masalan: suhbatga chaqiriladi"
                />
              </div>
              <Button
                className="w-full"
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate()}
              >
                Saqlash
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Info({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-pretty whitespace-pre-wrap">{value}</p>
    </div>
  )
}
