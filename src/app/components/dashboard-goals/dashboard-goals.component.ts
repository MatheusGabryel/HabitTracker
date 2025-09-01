import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from 'src/app/interfaces/category.interface';
import { GoalData } from 'src/app/interfaces/goal.interface';
import { GoalService } from 'src/app/services/goal/goal.service';
import { HabitService } from 'src/app/services/habit/habit.service';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';

@Component({
  selector: 'app-dashboard-goals',
  templateUrl: './dashboard-goals.component.html',
  styleUrls: ['./dashboard-goals.component.scss'],
  imports: [CommonModule, RouterLink],
})
export class DashboardGoalsComponent implements OnInit {

  title!: string;
  progress!: number;
  current!: number;
  target!: number;
  unit?: string;
  isCompleted?: boolean;
  habitNamesMap: Record<string, string> = {};
  name: any = ''


  goals: GoalData[] = []
  filteredGoals: GoalData[] = []
  public habitService = inject(HabitService)
  public goalService = inject(GoalService);
  constructor() { }

  async ngOnInit() {
    this.goals = await this.goalService.getUserGoals()

    this.filteredGoals = this.goals.sort((a, b) => {
      if (a.progressValue == null) return 1;
      if (b.progressValue == null) return -1;
      return b.progressValue - a.progressValue;
    });

    for (const goal of this.goals) {
      if (goal.goalType === 'habit' && goal.linkedHabit) {
        const name = await this.habitService.getHabitById(goal.linkedHabit);
        this.habitNamesMap[goal.linkedHabit] = name?.name || "Hábito não encontrado";
      }
    }
  }



  async getHabitName(goalHabit: string) {
    const habit = await this.habitService.getHabitById(goalHabit)
    const name = habit?.name
    return this.name = name
  }
  completeGoal(goal: GoalData) {
    this.goalService.completeGoal(goal)
  }

  calculateProgress(goal: any): number {
    const ratio = goal.progressValue / goal.targetValue;
    return Math.min(100, Math.round(ratio * 100));
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

category(goal: GoalData): Category | undefined {
  return PREDEFINED_CATEGORIES.find(cat => cat.id === goal.category);
}


rgbaCatColor(goal: GoalData): string | undefined {
  const category = this.category(goal);
  const color = category?.color;
  if (!color) return undefined;

  return color.replace('rgb', 'rgba').replace(')', ', 0.8)');
}
}
