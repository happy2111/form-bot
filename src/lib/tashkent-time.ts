const TASHKENT_TZ = 'Asia/Tashkent'

export function formatTashkentDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value

  return new Intl.DateTimeFormat('uz-UZ', {
    timeZone: TASHKENT_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}
