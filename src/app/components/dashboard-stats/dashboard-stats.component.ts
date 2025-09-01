import { StatisticsService } from 'src/app/services/statistics/statistics.service';
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from 'src/app/services/habit/habit.service';
import { UserService } from 'src/app/services/user/user.service';
import { HabitData, HabitLog } from 'src/app/interfaces/habit.interface';
import { GoalData, GoalType } from 'src/app/interfaces/goal.interface';
import { GoalService } from 'src/app/services/goal/goal.service';
import { startOfWeek, addDays, format, subWeeks } from 'date-fns';
import { Category } from 'src/app/interfaces/category.interface';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';

@Component({
  selector: 'app-dashboard-stats',
  templateUrl: './dashboard-stats.component.html',
  styleUrls: ['./dashboard-stats.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardStatsComponent implements OnInit {

  public habitService = inject(HabitService)
  public userService = inject(UserService)
  public statisticsService = inject(StatisticsService)
  public goalService = inject(GoalService)

  @Input() isCompact: boolean = false;

  public showStatsModal: boolean = false;
  public isClosing: boolean = false;

  public habitCompletionRate: number = 0;
  public habitStreak: number = 0;

  public goalCompletionRate: number = 0;
  public inProgressGoalsCount: number = 0;
  public lastCompletedGoal!: { name: string, date: Date } | null

  public totalHabitsCreated: number = 0;
  public historyHabits!: { start: string, end: string, count: number, label: string }[];
  public averageCompletionRate: any = [];
  public bestHabitStreak = { name: 'Meditação', count: 21 };
  public bestDayOfWeek: any = [];


  public totalGoalsCreated: number = 0;
  public completedGoalsCount: number = 0;
  public failedGoalsCount: number = 0;
  public mostCommonGoalType!: { name: GoalType, count: number }
  public mostCommonGoalCategory!: { name: string, count: number };
  public goalsCompletedInSemester: number = 0;
  longestGoal!: {name: string; date: Date; } | null;
  public habits: any[] = []
  public goals: any[] = []

  constructor(

  ) { }

  async ngOnInit() {
    const weekRange = this.getCurrentWeekRange();
    const weekLastRanges = this.getLastNWeekRanges(4);

    this.habits = await this.habitService.getUserHabitsWithLogs();
    this.goals = await this.goalService.getUserGoals()

    this.habitCompletionRate = +this.statisticsService.getHabitCompletionRate(this.habits, weekRange)
    this.totalHabitsCreated = this.habits.length
    this.historyHabits = this.statisticsService.getHistoryHabits(this.habits, weekLastRanges)
    this.averageCompletionRate = this.statisticsService.getAverageCompletionRate(this.habits, weekLastRanges)
    this.bestDayOfWeek = this.statisticsService.getBestDayOfWeek(this.habits, weekLastRanges)

    const top = this.habits.reduce((acc, habit) => {
      const streak = this.statisticsService.calculateHabitBestStreak(habit);
      return streak > acc.bestStreak ? { habit: habit.name, bestStreak: streak } : acc;
    }, { habit: null as HabitData | null, bestStreak: 0 });

    const current = this.habits.reduce((acc, habit) => {
      const streak = this.statisticsService.calculateHabitCurrentStreak(habit);
      return streak > acc ? streak : acc;
    }, 0);
    this.bestHabitStreak = {
      name: top.habit,
      count: top.bestStreak
    }
    this.habitStreak = await current


    this.totalGoalsCreated = this.goals.length
    this.completedGoalsCount = this.statisticsService.getTotalGoalsCompleted(this.goals)
    this.goalCompletionRate = this.statisticsService.getGoalCompletionRate(this.goals)
    this.inProgressGoalsCount = this.statisticsService.getInProgressGoals(this.goals)
    this.failedGoalsCount = this.statisticsService.getFailedProgressGoals(this.goals)
    this.lastCompletedGoal = this.statisticsService.getLastCompletitionGoal(this.goals)
    this.mostCommonGoalType = this.statisticsService.getMostCommumGoalType(this.goals)
    this.mostCommonGoalCategory = this.statisticsService.getMostCommumGoalCategory(this.goals)
    this.goalsCompletedInSemester = this.statisticsService.getCompletedGoalsLastSemester(this.goals)
    this.longestGoal = this.statisticsService.getOldestGoal(this.goals)
    console.log(this.completedGoalsCount)
  }


  openStatsModal() {
    this.showStatsModal = true;
  }

  closeStatsModal() {
    this.isClosing = true;
    setTimeout(() => {
      this.showStatsModal = false;
      this.isClosing = false;
    }, 300);
  }

  getGoalTypeName(type: GoalType): string {
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

  getCurrentWeekRange(): string[] {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(start, i), 'yyyy-MM-dd')
    );
  }
  getLastNWeekRanges(n: number = 4): { start: string, end: string }[] {
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
}
