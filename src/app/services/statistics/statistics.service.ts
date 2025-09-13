import { HabitData, HabitLog } from 'src/app/interfaces/habit.interface';
import { Injectable } from '@angular/core';
import { format, parseISO, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { average, Timestamp } from 'firebase/firestore';
import { GoalData, GoalType } from 'src/app/interfaces/goal.interface';
import { formatLocalDate, getLastMonthStart, getLastWeekStart, getLastYearStart, getSixMonthsAgo, parseLocalDate } from 'src/app/shared/utils/date.utils';
import { normalizeFirestoreDate, normalizeFirestoreDateOrNull } from 'src/app/shared/utils/timestamp.utils';


@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  constructor() { }

  getHabitCompletionRate(habits: HabitData[], weekRange: string[]): number {
    const expectedExecutions = habits.reduce((acc, habit) => {
      return acc += habit.days.length;
    }, 0)
    const completedExecutions = habits.reduce((acc, habit) => {
      return acc += habit.logs?.filter(log => weekRange.includes(log.date) && log.state === 'completed').length;
    }, 0);
    return expectedExecutions === 0 ? 0 : Number(((completedExecutions / expectedExecutions) * 100).toFixed(1));
  }


  getHistoryHabits(habits: HabitData[], weekRange: any[]) {
    return weekRange.map(week => {
      const logsInWeek = habits
        .flatMap(habit => habit.logs || [])
        .filter(log =>
          log.date >= week.start &&
          log.date <= week.end &&
          log.state === 'completed'
        );

      const label = `${format(parseISO(week.start), "dd MMM", { locale: ptBR })} – ${format(parseISO(week.end), "dd MMM", { locale: ptBR })}`;

      return {
        label,
        start: week.start,
        end: week.end,
        count: logsInWeek.length
      };
    });
  }

  getAverageCompletionRate(habits: HabitData[], weekRange: any[]) {
    const firstWeek = weekRange[0].start
    const lastWeek = weekRange[weekRange.length - 1].end;
    const habitRates = habits.map(habit => {
      const expectedHabits = habit.days.length * weekRange.length
      if (expectedHabits === 0) return 0;
      const completedLogs = habit.logs?.filter(log => log.date >= firstWeek && log.date <= lastWeek && log.state === 'completed').length ?? 0;
      const almost = completedLogs / expectedHabits * 100

      return almost
    })
    const total = habitRates.reduce((s, almost) => s + almost, 0)

    return habitRates.length === 0 ? 0 : Number((total / habitRates.length).toFixed(1));
  }

  getDaysOfWeek(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDay();
    return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][day];
  }
  
  getBestDayOfWeek(habits: HabitData[], weekRange: any[]) {
    const start = new Date(weekRange[0].start);
    const end = new Date(weekRange[weekRange.length - 1].end);

    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    const stats = Object.fromEntries(
      weekDays.map(day => [day, { expected: 0, completed: 0 }])
    ) as Record<string, { expected: number, completed: number }>;

    const dayOccurrences = Object.fromEntries(
      weekDays.map(day => [day, 0])
    ) as Record<string, number>;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = this.getDaysOfWeek(d.toISOString());
      dayOccurrences[day] += 1;
    }

    habits.forEach(habit => {
      habit.days.forEach(day => {
        stats[day].expected += dayOccurrences[day] ?? 0;

        const logs = habit.logs?.filter(log =>
          this.getDaysOfWeek(log.date) === day &&
          log.state === 'completed' &&
          log.date >= weekRange[0].start &&
          log.date <= weekRange[weekRange.length - 1].end
        ) ?? [];

        stats[day].completed += logs.length;
      });
    });
    let bestDay = { name: '', rate: 0 };

    for (const [day, data] of Object.entries(stats)) {
      const rate = data.expected === 0 ? 0 : (data.completed / data.expected) * 100;
      if (rate > bestDay.rate) {
        bestDay = { name: day, rate: Number(rate.toFixed(1)) };
      }
    }

    return bestDay;
  }

  getTotalGoalsCompleted(goals: GoalData[]): number {
    const completedGoals = goals.reduce((acc, goal) => {
      if (goal.state === 'completed') {
        acc += 1
      }
      return acc
    }, 0)

    return completedGoals
  }

  getInProgressGoals(goals: GoalData[]): number {
    const inProgress = goals.reduce((acc, goal) => {
      if (goal.state === 'in_progress') {
        acc += 1
      }
      return acc
    }, 0)

    return inProgress
  }

  getFailedProgressGoals(goals: GoalData[]): number {
    const failed = goals.reduce((acc, goal) => {
      if (goal.state === 'cancelled' || goal.state === 'not_completed') {
        acc += 1
      }
      return acc
    }, 0)

    return failed
  }


  getGoalCompletionRate(goals: GoalData[]): number {
    const totalGoals = goals.length

    const completedGoals = goals.reduce((acc, goal) => {
      if (goal.state === 'completed') {
        acc += 1
      }
      return acc
    }, 0)

    return totalGoals === 0 ? 0 : Number(((completedGoals / totalGoals) * 100).toFixed(1));
  }

  getLastCompletitionGoal(goals: GoalData[]) {
    return goals.reduce((acc, goal) => {
      const goalDate = normalizeFirestoreDateOrNull(goal.completedAt);
      if (!goalDate) return acc;
      if (!acc) return { name: goal.name, date: goalDate };

      return goalDate < acc.date ? { name: goal.name, date: goalDate } : acc;
    }, null as { name: string; date: Date } | null);
  }

  getOldestGoal(goals: GoalData[]) {
    return goals.reduce((acc, goal) => {
      const createdDate = normalizeFirestoreDateOrNull(goal.createdAt);
      if (goal.completedAt !== null) return acc;
      if (!createdDate) return acc;
      if (!acc) return { name: goal.name, date: createdDate };

      return createdDate < acc.date ? { name: goal.name, date: createdDate } : acc;
    }, null as { name: string; date: Date } | null);
  }

  getMostCommumGoalType(goals: GoalData[]) {
    const types = goals.reduce((acc, goal) => {
      if (!acc[goal.goalType]) {
        acc[goal.goalType] = 0;
      }
      acc[goal.goalType]++;
      return acc;
    }, {} as Record<GoalType, number>);

    const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
    const mostComum = { name: sorted[0][0] as GoalType, count: sorted[0][1] };

    return mostComum
  }

  getMostCommumGoalCategory(goals: GoalData[]) {
    const types = goals.reduce((acc, goal) => {
      if (!acc[goal.category]) {
        acc[goal.category] = 0;
      }
      acc[goal.category]++;
      return acc;
    }, {} as Record<string, number>);

    const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
    const mostComum = { name: sorted[0][0], count: sorted[0][1] };

    return mostComum
  }
  getCompletedGoalsLastSemester(goals: GoalData[]) {
    const sixMonthsAgo = new Date(subMonths(new Date(), 6));

    return goals.filter(goal => goal.state === 'completed' && !!goal.completedAt && normalizeFirestoreDate(goal.completedAt)! >= sixMonthsAgo).length;
  }


  // Individual Habit Statistics


  getIndivualHabitCompletionRate(habit: HabitData, weekRange: string[]) {
    const expectedExecutions = habit.days.length
    const completedExecutions = habit.logs?.filter(log => weekRange.includes(log.date) && log.state === 'completed').length ?? 0;
    let executions = { completed: 0, rate: 0 }
    return executions = { completed: completedExecutions, rate: expectedExecutions === 0 ? 0 : Number(((completedExecutions / expectedExecutions) * 100).toFixed(1)) }
  }

  calculateHabitCurrentStreak(habit: HabitData) {
    let streak = 0;
    let currentDate = new Date();
    const daysOrder = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const days = habit.days
      .sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b))
      .map(d => daysOrder.indexOf(d));

    const logMap = new Map<string, HabitLog>();
    habit.logs.forEach(log => logMap.set(log.date, log));

    while (true) {
      const dayOfWeek = currentDate.getDay();

      if (days.includes(dayOfWeek)) {
        const dateStr = currentDate.toISOString().slice(0, 10);
        const log = logMap.get(dateStr);

        if (log && log.state === 'completed') {
          streak++;
        } else {
          break;
        }
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }


    return streak;
  }

  calculateHabitBestStreak(habit: HabitData): number {
    const daysOrder = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const habitDays = habit.days
      .map(d => daysOrder.indexOf(d))
      .filter(d => d !== -1)
      .sort((a, b) => a - b);

    const logMap = new Map<string, HabitLog>();
    habit.logs.forEach(log => logMap.set(log.date, log));


    if (habit.logs.length === 0) return 0;
    const sortedLogsDates = habit.logs.filter(l => l.state === 'completed')
      .map(l => l.date)


    let bestStreak = 0;
    let currentStreak = 0;
    if (sortedLogsDates.length === 0) return 0;
    let currentDate = parseLocalDate(sortedLogsDates[0]);
    const lastDate = parseLocalDate(sortedLogsDates[sortedLogsDates.length - 1]);

    while (currentDate <= lastDate) {
      const dayOfWeek = currentDate.getDay();
      if (habitDays.includes(dayOfWeek)) {
        const dateStr = formatLocalDate(currentDate);
        const log = logMap.get(dateStr);
        if (log?.state === 'completed') {
          currentStreak++;
        } else {
          bestStreak = Math.max(bestStreak, currentStreak);
          currentStreak = 0;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    if (currentStreak > bestStreak) bestStreak = currentStreak;

    return bestStreak;
  }

  getHabitCompletion(habit: HabitData) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const perYear = getLastYearStart();
    const perWeek = getLastWeekStart();
    const perMonth = getLastMonthStart();

    const countCompleted = (from: string, to: string) =>
      habit.logs?.filter(l => l.date >= from && l.date <= to && l.state === 'completed').length || 0;

    return {
      week: countCompleted(perWeek, todayStr),
      month: countCompleted(perMonth, todayStr),
      year: countCompleted(perYear, todayStr),
      total: habit.logs?.filter(l => l.state === 'completed').length || 0,
    };
  }

  getPerfomanceHabit(habit: HabitData) {
    const createdAtDate = habit.createdAt as Date;

    const startDate = formatLocalDate(createdAtDate);
    const endDate = new Date();

    const logMap = new Map(
      habit.logs.map(log => [
        typeof log.date === 'string' ? log.date : formatLocalDate(log.date),
        log.state
      ])
    );

    let currentDate = parseLocalDate(startDate);
    let success = 0;
    let pending = 0;
    let failed = 0;

    const dayMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    while (currentDate <= endDate) {
      const dayName = dayMap[currentDate.getDay()];

      if (habit.days.includes(dayName)) {
        const dateStr = formatLocalDate(currentDate);
        const state = logMap.get(dateStr);

        if (state === 'completed') {
          success++;
        } else if (state === 'failed') {
          failed++;
        } else {
          pending++;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalDays = success + failed + pending;
    const percentSuccess = totalDays ? (success / totalDays) * 100 : 0;
    const percentFailed = totalDays ? (failed / totalDays) * 100 : 0;
    const percentPending = totalDays ? (pending / totalDays) * 100 : 0;


    return {
      total: totalDays,
      success,
      failed,
      pending,
      percentSuccess: Number(percentSuccess.toFixed(1)),
      percentFailed: Number(percentFailed.toFixed(1)),
      percentPending: Number(percentPending.toFixed(1))
    };
  }

  getProgressValueHabit(habit: HabitData) {
    const perWeek = parseLocalDate(getLastWeekStart());

    const logs = habit.logs ?? [];

    const totalValue = logs.reduce((acc, log) => acc + (log.progressValue || 0), 0);

    const weekValue = logs
      .filter(log => parseLocalDate(log.date) >= perWeek)
      .reduce((acc, log) => acc + (log.progressValue || 0), 0);

    const almostValue = logs.length ? Number((totalValue / logs.length).toFixed(0)) : 0;

    return { totalValue, weekValue, almostValue };
  }




}