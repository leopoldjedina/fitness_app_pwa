import { getISOWeek, getISOWeekYear, startOfISOWeek, format, addDays } from 'date-fns'

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function getKW(date: Date): number {
  return getISOWeek(date)
}

export function getKWYear(date: Date): number {
  return getISOWeekYear(date)
}

export function getWeekStart(date: Date): Date {
  return startOfISOWeek(date)
}

export function getWeekDates(date: Date): string[] {
  const monday = startOfISOWeek(date)
  return Array.from({ length: 7 }, (_, i) => toISODate(addDays(monday, i)))
}

export function formatDisplayDate(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00')
  return format(d, 'dd.MM.yyyy')
}

export function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00')
  return format(d, 'dd.MM.')
}

export function formatDayName(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00')
  const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  return days[d.getDay()]
}

export function isToday(isoDate: string): boolean {
  return isoDate === todayISO()
}
