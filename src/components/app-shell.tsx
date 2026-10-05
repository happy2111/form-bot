import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { ClipboardList, LogOut, Menu } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              ApplePark
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-balance">
              Form Admin
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <p className="text-sm text-pretty text-muted-foreground">
          Ishga arizalarni ko‘rib chiqish va holatni boshqarish.
        </p>
      </div>
      <Separator />
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <Button
          variant="ghost"
          className="justify-start gap-2"
          render={<Link to="/" onClick={onNavigate} />}
        >
          <ClipboardList className="size-4" />
          Arizalar
        </Button>
      </nav>
      <div className="mt-auto border-t p-4">
        <div className="mb-3">
          <p className="truncate text-sm font-medium">{user?.fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Rol: {isAdmin ? 'ADMIN' : 'REVIEWER'}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => {
            logout()
            navigate('/login')
            onNavigate?.()
          }}
        >
          <LogOut className="size-4" />
          Chiqish
        </Button>
      </div>
    </div>
  )
}

export function AppShell() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[260px_1fr]">
      <aside className="hidden border-r bg-sidebar/80 backdrop-blur md:block">
        <NavContent />
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur md:hidden">
          <div>
            <p className="text-xs text-muted-foreground">ApplePark</p>
            <p className="font-medium">Form Admin</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button variant="outline" size="icon" aria-label="Menyu" />
                }
              >
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 sm:max-w-none">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menyu</SheetTitle>
                </SheetHeader>
                <NavContent onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
