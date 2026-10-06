import { api } from '@/lib/api'
import type {
  Application,
  ApplicationStats,
  ApplicationStatus,
  ApplicationsListResponse,
  AuthUser,
  LoginResponse,
  StatsPeriod,
  TelegramAccess,
} from '@/types/api'

export async function login(email: string, password: string) {
  const { data } = await api.post<LoginResponse>('/api/auth/login', {
    email,
    password,
  })
  return data
}

export async function fetchMe() {
  const { data } = await api.get<AuthUser>('/api/auth/me')
  return data
}

export async function fetchApplications(params: {
  status?: ApplicationStatus | 'ALL'
  search?: string
  page?: number
  limit?: number
}) {
  const { data } = await api.get<ApplicationsListResponse>(
    '/api/admin/applications',
    {
      params: {
        status: params.status === 'ALL' ? undefined : params.status,
        search: params.search || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    },
  )
  return data
}

export async function fetchApplication(id: string) {
  const { data } = await api.get<Application>(`/api/admin/applications/${id}`)
  return data
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  statusNote?: string,
) {
  const { data } = await api.patch<Application>(
    `/api/admin/applications/${id}/status`,
    { status, statusNote },
  )
  return data
}

export async function deleteApplication(id: string) {
  const { data } = await api.delete<{ id: string }>(
    `/api/admin/applications/${id}`,
  )
  return data
}

export async function clearAllApplications() {
  const { data } = await api.delete<{ deleted: number }>(
    '/api/admin/applications/clear-all',
  )
  return data
}

export async function fetchStats(period: StatsPeriod = '30d') {
  const { data } = await api.get<ApplicationStats>('/api/admin/stats', {
    params: { period },
  })
  return data
}

export async function fetchTelegramAccess() {
  const { data } = await api.get<TelegramAccess[]>('/api/admin/telegram-access')
  return data
}

export async function createTelegramAccess(payload: {
  telegramId: string
  label?: string
  isActive?: boolean
}) {
  const { data } = await api.post<TelegramAccess>(
    '/api/admin/telegram-access',
    payload,
  )
  return data
}

export async function updateTelegramAccess(
  id: string,
  payload: { label?: string; isActive?: boolean },
) {
  const { data } = await api.patch<TelegramAccess>(
    `/api/admin/telegram-access/${id}`,
    payload,
  )
  return data
}

export async function deleteTelegramAccess(id: string) {
  const { data } = await api.delete<{ id: string }>(
    `/api/admin/telegram-access/${id}`,
  )
  return data
}
