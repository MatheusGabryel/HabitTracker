import { StatisticsService } from 'src/app/services/statistics/statistics.service';
import { HabitData } from '../../../../interfaces/habit.interface';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ApexNonAxisChartSeries, ApexChart, ApexResponsive, ApexLegend, NgApexchartsModule } from 'ng-apexcharts';
import { GoalData } from 'src/app/interfaces/goal.interface';
import { GoalService } from 'src/app/services/goal/goal.service';
import { HabitService } from 'src/app/services/habit/habit.service';
import { formatLocalDate } from 'src/app/shared/utils/date.utils';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  legend: ApexLegend;
};

@Component({
  selector: 'app-daily-summary',
  templateUrl: './daily-summary.component.html',
  styleUrls: ['./daily-summary.component.scss'],
  imports: [NgApexchartsModule, CommonModule],
})
export class DailySummaryComponent {

  public statisticsService = inject(StatisticsService)

  @Input() habits!: HabitData[];
  @Input() goals!: GoalData[];

  public currentHabitValue!: number;
  public targetHabitValue!: number;

  public goalRate!: number;

  public todayDate!: string;

  async ngOnChanges() {
    this.getSummaryInfo()
  }

  public getSummaryInfo() {
    const now = new Date();
    const weekDay = now.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    const dayMonth = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    
    this.todayDate = `Hoje - ${this.capitalizeFirst(weekDay)}, ${dayMonth}`;
    this.currentHabitValue = this.getCurrentLog(now)
    this.targetHabitValue = this.getHabitsForWeekday(now);

    this.goalRate = this.statisticsService.getGoalCompletionRate(this.goals)
  }

  public getHabitsForWeekday(date: Date): number {
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toLowerCase();
    const habitsForDay = this.habits.filter(habit =>
      habit.days.map(d => d.toLowerCase()).includes(weekday)
    ).length;
    return habitsForDay;
  }

  public getCurrentLog(date: Date): number {
    const weekday = formatLocalDate(date);
    const logsCompleted = this.habits.reduce((acc, habit) => {
      let habitCompleted = habit.logs.filter(l => l.state === 'completed' && l.date.includes(weekday)).length
      return habitCompleted = acc + habitCompleted
    }, 0)
    return logsCompleted
  }

  public calculateProgress(current: number, target: number): number {
    if (!target || target === 0) return 0;

    let percentage = (current / target) * 100;

    if (percentage > 100) {
      percentage = 100;
    }

    return Math.floor(percentage);
  }

  public getProgressColor(progress: number): string {
    if (progress >= 100) return '#219653';
    if (progress >= 90) return '#27ae60';
    if (progress >= 80) return '#43b97f';
    if (progress >= 70) return '#66cdaa';
    if (progress >= 50) return '#f1c232';
    if (progress >= 40) return '#f2c94c';
    if (progress >= 30) return '#f2994a';
    if (progress >= 20) return '#f38b3f';
    if (progress >= 10) return '#eb5757';
    return '#f8b195';
  }

  public capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
