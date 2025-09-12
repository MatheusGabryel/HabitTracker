import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from 'src/app/interfaces/category.interface';
import { GoalData } from 'src/app/interfaces/goal.interface';
import { HabitService } from 'src/app/services/habit/habit.service';
import { normalizeFirestoreDate } from 'src/app/shared/utils/timestamp.utils';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';

@Component({
  selector: 'app-goal-card',
  templateUrl: './goal-card.component.html',
  styleUrls: ['./goal-card.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class GoalCardComponent implements OnInit {
  public habitService = inject(HabitService)

  @Input() goal!: GoalData;
  @Output() mark = new EventEmitter<GoalData>();
  @Output() delete = new EventEmitter<GoalData>();
  @Output() complete = new EventEmitter<GoalData>();
  @Output() restore = new EventEmitter<GoalData>();
  @Output() cancel = new EventEmitter<GoalData>();
  @Output() edit = new EventEmitter<GoalData>();

  public showGoalModal: boolean = false;

  public habitName!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public completedAt!: Date;

  async ngOnInit() {
    if (this.goal.goalType === 'habit' && this.goal.linkedHabit) {
      const habit = await this.habitService.getHabitById(this.goal.linkedHabit)
      this.habitName = habit?.name ?? '';
    }

    this.createdAt = normalizeFirestoreDate(this.goal.createdAt)
    this.updatedAt = normalizeFirestoreDate(this.goal.updatedAt);
    this.completedAt = normalizeFirestoreDate(this.goal.completedAt);
  }

  public openModal() {
    this.showGoalModal = true;
  }

  public closeModal() {
    this.showGoalModal = false;
  }

  public translateStatus(): string {
    const status = this.goal.state
    const translations: Record<string, string> = {
      in_progress: 'Em progresso',
      completed: 'Concluído',
      not_completed: 'Falhado',
      cancelled: 'Cancelado'
    };

    return translations[status] || status;
  }

  public calculateProgress(): number {
    if (this.goal?.targetValue == null || this.goal?.progressValue == null) {
      return 0
    }
    const current = this.goal.progressValue;
    const target = this.goal.targetValue;

    if (!target || target === 0) return 0;
    let percentage = (current / target) * 100;
    if (this.goal.goalType === 'habit' && percentage > 100) {
      percentage = 100;
    }
    if (percentage >= 99) return Math.floor(percentage * 10) / 10;
    return Math.floor(percentage);
  }

  public getProgressColor(progress: number): string {
    const status = this.goal.state;

    if (status === 'cancelled') return '#bdbdbd';
    if (status === 'not_completed') return '#d32f2f';

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

  public getRemainingValue(): number {
    if (this.goal?.targetValue == null || this.goal?.progressValue == null) {
      return 0
    }
    const remaining = this.goal.targetValue - this.goal.progressValue;
    return remaining > 0 ? remaining : 0;
  }

  public getExtraValue(): number {
    if (this.goal?.targetValue == null || this.goal?.progressValue == null) {
      return 0
    }
    const extra = this.goal.progressValue - this.goal.targetValue;
    return extra
  }

  public getGoalTypeDisplay(): string {
    const types: Record<string, string> = {
      unit: 'Contagem de Unidades',
      habit: 'Baseada em Hábito',
      yes_no: 'Sim ou Não'
    };
    return types[this.goal.goalType] || this.goal.goalType;
  }

  public editGoal(event: MouseEvent): void {
    event.stopPropagation();
    this.closeModal();
    this.edit.emit(this.goal);

  }

  public deleteGoal(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.goal);
  }

  public restoreGoal(event: MouseEvent): void {
    event.stopPropagation();
    this.restore.emit(this.goal);
  }

  public cancelGoal(event: MouseEvent): void {
    event.stopPropagation();
    this.cancel.emit(this.goal);
  }

  public addProgress(event: MouseEvent): void {
    event.stopPropagation();
    this.mark.emit(this.goal);
  }

  public completeGoal(event: MouseEvent): void {
    event.stopPropagation();
    this.complete.emit(this.goal);
  }

  get category(): Category | undefined {
    return this.goal
      ? PREDEFINED_CATEGORIES.find(cat => cat.id === this.goal.category)
      : undefined;
  }

  get rgbaCatColor(): string | undefined {
    const color = this.category?.color;
    if (!color) return undefined;

    return color.replace('rgb', 'rgba').replace(')', ', 0.8)');
  }
}
