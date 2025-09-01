import { StatisticsService } from 'src/app/services/statistics/statistics.service';
import { HabitData } from './../../interfaces/habit.interface';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ApexNonAxisChartSeries, ApexChart, ApexResponsive, ApexLegend, NgApexchartsModule } from 'ng-apexcharts';
import { GoalData } from 'src/app/interfaces/goal.interface';
import { GoalService } from 'src/app/services/goal/goal.service';
import { HabitService } from 'src/app/services/habit/habit.service';

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
export class DailySummaryComponent implements OnInit {

  public habitService = inject(HabitService)
  public goalService = inject(GoalService)
  public statisticsService = inject(StatisticsService)
  public habits: HabitData[] = []
  public goals: GoalData[] = []

  currentHabitValue = 0
  targetHabitValue = 0

  goalRate = 0

  public todayDate!: string;
  async ngOnInit() {
    const now = new Date();
    const weekDay = now.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    const dayMonth = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    this.todayDate = `Hoje - ${this.capitalizeFirst(weekDay)}, ${dayMonth}`;
    this.habits = await this.habitService.getUserHabitsWithLogs()
    this.goals = await this.goalService.getUserGoals()
    this.currentHabitValue = this.getCurrentLog(now)
    this.targetHabitValue = this.getHabitsForWeekday(now);

    this.goalRate = this.statisticsService.getGoalCompletionRate(this.goals)
  }

  getHabitsForWeekday(date: Date): number {
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toLowerCase();
    console.log(weekday)
    const habitsForDay = this.habits.filter(habit =>
      habit.days.map(d => d.toLowerCase()).includes(weekday)
    ).length;
    return habitsForDay;
  }

  formatLocalDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getCurrentLog(date: Date): number {
    const weekday = this.formatLocalDate(date);
    const logsCompleted = this.habits.reduce((acc, habit) => {
      let habitCompleted = habit.logs.filter(l => l.state === 'completed' && l.date.includes(weekday)).length
      return habitCompleted = acc + habitCompleted
    }, 0)

    console.log('Ids:', this.habits.map(h =>
      h.logs.filter(l => l.state === 'completed' && l.date.includes('2025-08-27'))
    ))
    console.log('Nomes:', this.habits.map(h => h.id))
    return logsCompleted
  }

  calculateProgress(current: number, target: number): number {
    const today = new Date()

    if (!target || target === 0) return 0;



    let percentage = (current / target) * 100;

    // if (this.goal.goalType === 'habit' && percentage > 100) {
    //   percentage = 100;
    // }

    // if (percentage >= 99) return Math.floor(percentage * 10) / 10;

    return Math.floor(percentage);
  }

  getProgressColor(progress: number): string {
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

  constructor() {

  }

  capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
