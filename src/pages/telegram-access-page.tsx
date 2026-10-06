import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Shield, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Navigate } from 'react-router-dom'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  createTelegramAccess,
  deleteTelegramAccess,
  fetchTelegramAccess,
  updateTelegramAccess,
} from '@/lib/applications-api'
import { useAuth } from '@/lib/auth'
import { formatTashkentDateTime } from '@/lib/tashkent-time'

export function TelegramAccessPage() {
  const { isAdmin, loading } = useAuth()
  const queryClient = useQueryClient()
  const [telegramId, setTelegramId] = useState('')
  const [label, setLabel] = useState('')

  const query = useQuery({
    queryKey: ['telegram-access'],
    queryFn: fetchTelegramAccess,
    enabled: isAdmin,
  })

  const createMutation = useMutation({
    mutationFn: createTelegramAccess,
    onSuccess: () => {
      toast.success('Telegram ID qo‘shildi')
      setTelegramId('')
      setLabel('')
      void queryClient.invalidateQueries({ queryKey: ['telegram-access'] })
    },
    onError: () => toast.error('Qo‘shib bo‘lmadi. ID ni tekshiring.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: string
      isActive: boolean
    }) => updateTelegramAccess(id, { isActive }),
    onSuccess: () => {
      toast.success('Yangilandi')
      void queryClient.invalidateQueries({ queryKey: ['telegram-access'] })
    },
    onError: () => toast.error('Yangilab bo‘lmadi'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTelegramAccess,
    onSuccess: () => {
      toast.success('O‘chirildi')
      void queryClient.invalidateQueries({ queryKey: ['telegram-access'] })
    },
    onError: () => toast.error('O‘chirib bo‘lmadi'),
  })

  if (!loading && !isAdmin) {
    return <Navigate to="/" replace />
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const id = telegramId.trim()
    if (!/^\d{5,20}$/.test(id)) {
      toast.error('Telegram ID faqat raqamlardan iborat bo‘lishi kerak')
      return
    }
    createMutation.mutate({
      telegramId: id,
      label: label.trim() || undefined,
      isActive: true,
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Telegram ruxsat
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Faqat shu Telegram ID lar botda «Ariza ro‘yxatlari»ni ko‘ra oladi va
          holatni o‘zgartira oladi.
        </p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Shield className="size-4 text-muted-foreground" />
            Yangi ID qo‘shish
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
            onSubmit={onSubmit}
          >
            <div className="space-y-1.5">
              <Label htmlFor="tg-id">Telegram ID</Label>
              <Input
                id="tg-id"
                inputMode="numeric"
                placeholder="Masalan: 123456789"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tg-label">Ism / izoh (ixtiyoriy)</Label>
              <Input
                id="tg-label"
                placeholder="HR / Admin"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={createMutation.isPending}
              >
                Qo‘shish
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Ruxsat berilganlar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {query.isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))
            : null}

          {query.data?.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-border/70 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-semibold tabular-nums">{item.telegramId}</p>
                <p className="text-sm text-muted-foreground">
                  {item.label || 'Izoh yo‘q'} ·{' '}
                  {item.isActive ? 'Faol' : 'O‘chirilgan'} ·{' '}
                  {formatTashkentDateTime(item.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      id: item.id,
                      isActive: !item.isActive,
                    })
                  }
                >
                  {item.isActive ? 'O‘chirish' : 'Yoqish'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-muted-foreground hover:text-destructive"
                      />
                    }
                  >
                    <Trash2 className="size-3.5" />
                    O‘chirish
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Ruxsatni o‘chirish?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {item.telegramId} endi botda ariza ro‘yxatini
                        ko‘ra olmaydi.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Bekor</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(item.id)}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        O‘chirish
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}

          {!query.isLoading && (query.data?.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Hali ruxsat berilgan Telegram ID yo‘q.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
