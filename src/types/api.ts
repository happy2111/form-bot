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

export type StatsPeriod = 'today' | '7d' | '30d' | 'all'

export interface ApplicationStats {
  period: StatsPeriod
  summary: {
    total: number
    queue: number
    accepted: number
    rejected: number
    acceptedRate: number
    rejectedRate: number
    avgDecisionHours: number | null
  }
  byStatus: Record<ApplicationStatus, number>
  byGender: {
    MALE: number
    FEMALE: number
  }
  ageBuckets: {
    '18-22': number
    '23-26': number
    '27-30': number
    other: number
  }
  readyForVideo: {
    yes: number
    no: number
  }
  skills: {
    avgTech: number | null
    avgRussian: number | null
    avgEnglish: number | null
    avgAge: number | null
    strongProfileCount: number
    strongProfileRate: number
  }
  daily: Array<{ date: string; count: number }>
}

export interface TelegramAccess {
  id: string
  telegramId: string
  label: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}
