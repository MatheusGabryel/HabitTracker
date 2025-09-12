import { StatisticsService } from 'src/app/services/statistics/statistics.service';
import { ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from 'src/app/services/habit/habit.service';
import { UserService } from 'src/app/services/user/user.service';
import { HabitData, HabitLog } from 'src/app/interfaces/habit.interface';
import { GoalData, GoalType } from 'src/app/interfaces/goal.interface';
import { GoalService } from 'src/app/services/goal/goal.service';
import { startOfWeek, addDays, format, subWeeks } from 'date-fns';
import { Category } from 'src/app/interfaces/category.interface';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import { getCurrentWeekRange, getLastNWeekRanges } from 'src/app/shared/utils/date.utils';

@Component({
  selector: 'app-dashboard-stats',
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardStatsComponent {

  public statisticsService = inject(StatisticsService)

  @Input() isCompact: boolean = false;
  @Input() habits!: HabitData[];
  @Input() goals!: GoalData[];

  public showStatsModal: boolean = false;
  public isClosing: boolean = false;

  public habitCompletionRate!: number;
  public habitStreak!: number;

  public goalCompletionRate!: number;
  public inProgressGoalsCount!: number;
  public lastCompletedGoal!: { name: string, date: Date } | null

  public totalHabitsCreated!: number;
  public historyHabits!: { start: string, end: string, count: number, label: string }[];
  public averageCompletionRate: any = [];
  public bestHabitStreak!: { name: string, count: number };
  public bestDayOfWeek!: { name: string, rate: number };

  public totalGoalsCreated!: number;
  public completedGoalsCount!: number;
  public failedGoalsCount!: number;
  public mostCommonGoalType!: { name: GoalType, count: number }
  public mostCommonGoalCategory!: { name: string, count: number };
  public goalsCompletedInSemester!: number;
  public longestGoal!: { name: string; date: Date; } | null;

  ngOnChanges() {
    this.updateStatistics(this.goals, this.habits)
  }

  public updateStatistics(goals: GoalData[], habits: HabitData[]) {
    const weekRange = getCurrentWeekRange();
    const weekLastRanges = getLastNWeekRanges(4);

    this.habitCompletionRate = +this.statisticsService.getHabitCompletionRate(habits, weekRange);
    this.totalHabitsCreated = habits.length;
    this.historyHabits = this.statisticsService.getHistoryHabits(habits, weekLastRanges);
    this.averageCompletionRate = this.statisticsService.getAverageCompletionRate(habits, weekLastRanges);
    this.bestDayOfWeek = this.statisticsService.getBestDayOfWeek(habits, weekLastRanges);

    const top = habits.reduce<{ habit: string; bestStreak: number }>(
      (acc, habit) => {
        const streak = this.statisticsService.calculateHabitBestStreak(habit);
        return streak > acc.bestStreak ? { habit: habit.name, bestStreak: streak } : acc;
      },
      { habit: '', bestStreak: 0 }
    );

    const current = habits.reduce((acc, habit) => {
      const streak = this.statisticsService.calculateHabitCurrentStreak(habit);
      return streak > acc ? streak : acc;
    }, 0);

    this.bestHabitStreak = { name: top.habit, count: top.bestStreak };
    this.habitStreak = current;

    this.totalGoalsCreated = goals.length;
    this.completedGoalsCount = this.statisticsService.getTotalGoalsCompleted(goals);
    this.goalCompletionRate = this.statisticsService.getGoalCompletionRate(goals);
    this.inProgressGoalsCount = this.statisticsService.getInProgressGoals(goals);
    this.failedGoalsCount = this.statisticsService.getFailedProgressGoals(goals);
    this.lastCompletedGoal = this.statisticsService.getLastCompletitionGoal(goals);
    this.mostCommonGoalType = this.statisticsService.getMostCommumGoalType(goals);
    this.mostCommonGoalCategory = this.statisticsService.getMostCommumGoalCategory(goals);
    this.goalsCompletedInSemester = this.statisticsService.getCompletedGoalsLastSemester(goals);
    this.longestGoal = this.statisticsService.getOldestGoal(goals);
  }

  public openStatsModal() {
    this.showStatsModal = true;
  }

  public closeStatsModal(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.isClosing = true;
    setTimeout(() => {
      this.showStatsModal = false;
      this.isClosing = false;
    }, 300);
  }

  public getGoalTypeName(type: GoalType): string {
    switch (type) {
      case "habit":
        return "Baseada em Hábito";
      case "unit":
        return "Contagem de Unidades";
      case "yes_no":
        return "Sim ou Não";
      default:
        return type;
    }
  }

  getGoalCategoryName(catId: string): string | undefined {
    const category = PREDEFINED_CATEGORIES.find(cat => cat.id === catId);
    return category?.displayName
  }
}
