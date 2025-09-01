import { addDays, format, startOfMonth, startOfWeek, startOfYear, subMonths, subWeeks, subYears } from "date-fns";

export function generateDays(today: Date, before: number, habitDays: string[]) {
  const days = [];

  for (let i = -before; i <= 0; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toLowerCase();
    const normalizedHabitDays = habitDays.map(day => day.toLowerCase());
    const isHabitDay = normalizedHabitDays.includes(weekday);
    days.push({
      date,
      iso: date.toISOString().split('T')[0],
      weekday,
      formattedDate: date.toLocaleDateString('pt-BR', { day: '2-digit' }),
      isHabitDay,
    });
  }

  return days;
}

export function getLastNWeekRanges(n: number = 4): { start: string, end: string }[] {
  const ranges = [];

  for (let i = n - 1; i >= 0; i--) {
    const start = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    const end = addDays(start, 6);

    ranges.push({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    });
  }

  return ranges;
}

export function getLastWeekStart(n: number = 1): string {
  return Array.from({ length: n }, (_, i) => 
    format(startOfWeek(subWeeks(new Date(), n - 1 - i), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  ).join();
}

export function getLastMonthStart(n: number = 1): string {
  return Array.from({ length: n }, (_, i) => 
    format(startOfMonth(subMonths(new Date(), n - 1 - i)), 'yyyy-MM-dd')
  ).join();
}

export function getLastYearStart(n: number = 1): string {
  return Array.from({ length: n }, (_, i) => 
    format(startOfYear(subYears(new Date(), n - 1 - i)), 'yyyy-MM-dd')
  ).join();
}
export function getSixMonthsAgo(): string {
  return format(subMonths(new Date(), 6), 'yyyy-MM-dd');
}
