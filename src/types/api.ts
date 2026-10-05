export type UserRole = 'REVIEWER' | 'ADMIN'

export type ApplicationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'

export type Gender = 'MALE' | 'FEMALE'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  accessToken: string
  expiresIn: string
  user: AuthUser
}

export interface Application {
  id: string
  telegramId: string
  telegramUsername: string | null
  fullName: string
  age: number
  gender: Gender
  phone: string
  address: string
  experience: string
  techSkill: number
  russianLevel: number
  englishLevel: number
  readyForVideo: boolean
  photoKey: string
  photoUrl: string | null
  status: ApplicationStatus
  statusNote: string | null
  createdAt: string
  updatedAt: string
}

export interface ApplicationsListResponse {
  items: Application[]
  total: number
  page: number
  limit: number
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: '⏳ Ko‘rib chiqilmoqda',
  UNDER_REVIEW: '🔍 Tekshirilmoqda',
  ACCEPTED: '✅ Qabul qilindi',
  REJECTED: '❌ Rad etildi',
}
