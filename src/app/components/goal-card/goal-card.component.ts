import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from 'src/app/interfaces/category.interface';
import { GoalData } from 'src/app/interfaces/goal.interface';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import { register } from 'swiper/element/bundle';
register()

@Component({
  selector: 'app-goal-card',
  templateUrl: './goal-card.component.html',
  styleUrls: ['./goal-card.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule],
})
export class GoalCardComponent implements OnInit {
  @Input() goal: any;
  @Output() mark = new EventEmitter<GoalData>();
  public showGoalModal = false;

  constructor() { }

onAddProgressClick(event: MouseEvent): void {
  event.stopPropagation();
  this.mark.emit(this.goal);
}

  openModal() {
    this.showGoalModal = true;
  }
  closeModal() {
    this.showGoalModal = false;
  }

  translateStatus(): string {
    const status = this.goal.state
    const translations: Record<string, string> = {
      in_progress: 'Em progresso',
      completed: 'Concluído',
      not_completed: 'Falhado',
      cancelled: 'Cancelado'
    };

    return translations[status] || status;
  }
  calculateProgress(): number {
    const current = this.goal.progressValue;
    const target = this.goal.targetValue;
    if (!target || target === 0) return 0;

    if (current >= target) return 100;

    const percentage = (current / target) * 100;

    if (percentage >= 99) return Math.floor(percentage * 10) / 10;
    return Math.floor(percentage);
  }


  getProgressColor(progress: number): string {
    const status = this.goal.state;

    if (status === 'cancelled') return '#bdbdbd';
    if (status === 'not_completed') return '#d32f2f';
    if (status === 'suspended') return '#828282';

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
  ngOnInit() { }

  get category(): Category | undefined {
    return this.goal
      ? PREDEFINED_CATEGORIES.find(cat => cat.id === this.goal.category)
      : undefined;
  }

  get rgbaCatColor(): string | undefined {
    const color = this.category?.color;
    if (!color) return undefined;

    // Transforma: rgb(255, 0, 0) → rgba(255, 0, 0, 0.)
    return color.replace('rgb', 'rgba').replace(')', ', 0.7)');
  }

}
