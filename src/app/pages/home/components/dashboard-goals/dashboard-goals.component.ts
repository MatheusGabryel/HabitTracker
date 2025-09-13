import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
export class DashboardGoalsComponent {

  public habitService = inject(HabitService)
  public goalService = inject(GoalService);

  @Input() goals!: GoalData[];
  @Output() update = new EventEmitter<void>();

  public habitNamesMap: Record<string, string> = {};
  public filteredGoals: GoalData[] = []

  async ngOnChanges() {
    this.filteredGoals = this.goals.sort((a, b) => {
      if (a.progressValue == null) return 1;
      if (b.progressValue == null) return -1;
      return b.progressValue - a.progressValue;
    });

    this.getHabitName()
    setTimeout(() => {
      this.update.emit()
    }, 300);
  }

  public completeGoal(goal: GoalData) {
    this.goalService.completeGoal(goal)

    setTimeout(() => {
      this.update.emit()
    }, 300);
  }

  public async getHabitName() {
    for (const goal of this.goals) {
      if (goal.goalType === 'habit' && goal.linkedHabit) {
        const habit = await this.habitService.getHabitById(goal.linkedHabit);
        this.habitNamesMap[goal.linkedHabit] = habit?.name || "Hábito não encontrado";
      }
    }
  }

  public calculateProgress(goal: any): number {
    const ratio = goal.progressValue / goal.targetValue;
    return Math.min(100, Math.round(ratio * 100));
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

  public category(goal: GoalData): Category | undefined {
    return PREDEFINED_CATEGORIES.find(cat => cat.id === goal.category);
  }

  public rgbaCatColor(goal: GoalData): string | undefined {
    const category = this.category(goal);
    const color = category?.color;
    if (!color) return undefined;

    return color.replace('rgb', 'rgba').replace(')', ', 0.8)');
  }
}
