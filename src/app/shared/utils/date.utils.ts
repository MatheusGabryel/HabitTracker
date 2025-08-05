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