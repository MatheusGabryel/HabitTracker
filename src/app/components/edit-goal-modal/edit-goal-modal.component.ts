import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { serverTimestamp } from 'firebase/firestore';
import { Loading } from 'notiflix';
import { Category } from 'src/app/interfaces/category.interface';
import { GoalData, GoalType } from 'src/app/interfaces/goal.interface';
import { HabitData } from 'src/app/interfaces/habit.interface';
import { GoalService } from 'src/app/services/goal/goal.service';
import { HabitService } from 'src/app/services/habit/habit.service';
import { UserService } from 'src/app/services/user/user.service';
import { normalizeFirestoreDate } from 'src/app/shared/utils/timestamp.utils';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-goal-modal',
  templateUrl: './edit-goal-modal.component.html',
  styleUrls: ['./edit-goal-modal.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class EditGoalModalComponent implements OnInit {
  private goalService = inject(GoalService);
  private userService = inject(UserService);
  private habitService = inject(HabitService);
  
  @Input() goalToEdit!: GoalData
  @Output() close = new EventEmitter<void>();

  public goal!: GoalData;

  public currentStep: number = 1;

  public userHabits: HabitData[] = [];
  public selectedHabit: string = '';

  public progressTypes: string[] = ['Unidade', 'Kg', 'Km', 'Minutos', 'Horas', 'Páginas', 'Repetições', 'R$', 'Dias', 'Semanas', 'Outro'];
  public categories: Category[] = PREDEFINED_CATEGORIES;



  public async ngOnInit() {
    this.goal = structuredClone(this.goalToEdit);
    this.goal.createdAt = normalizeFirestoreDate(this.goal.createdAt)
    this.goal.updatedAt = normalizeFirestoreDate(this.goal.updatedAt)
    if (this.goal.completedAt) {
      this.goal.completedAt = normalizeFirestoreDate(this.goal.completedAt);
    }
    await this.loadUserHabits();
  }

  public closeModal() {
    this.close.emit();
  }

  public goToStep(step: number) {
    this.currentStep = step;
  }

  public nextStep() {
    this.currentStep++;
  }


  public previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  public isFormValid(): boolean {
    if (!this.goal.name || !this.goal.category || !this.goal.goalType) {
      return false;
    }

    if (this.goal.goalType === 'unit') {
      if (!this.goal.progressValueType) return false;

      if (this.goal.progressValueType === 'Outro' && !this.goal.customProgressType) {
        return false;
      }

      if (this.goal.targetValue === undefined || this.goal.targetValue <= 0) {
        return false;
      }
    }

    if (this.goal.goalType === 'habit') {
      if (!this.goal.linkedHabit) return false;

      if (this.goal.targetValue === undefined || this.goal.targetValue <= 0) {
        return false;
      }
    }

    if (this.goal.hasEndDate === true && !this.goal.endDate) {
      return false;
    }

    return true;
  }
  public selectCategory(categoryId: string) {
    this.goal.category = categoryId;
  }

  public selectGoalType(type: GoalType) {
    this.goal.goalType = type;

    if (type === 'unit') {
      this.goal.progressValueType = 'Unidade';
      this.goal.targetValue = 1;
      this.goal.linkedHabit = undefined;
      this.selectedHabit = '';
    } else if (type === 'habit') {
      this.goal.progressValueType = undefined;
      this.goal.customProgressType = undefined;
      this.goal.targetValue = 1;
      this.goal.linkedHabit = '';
      this.selectedHabit = '';
    } else if (type === 'yes_no') {
      this.goal.progressValueType = undefined;
      this.goal.customProgressType = undefined;
      this.goal.targetValue = undefined;
      this.goal.linkedHabit = undefined;
      this.selectedHabit = '';
    }
  }

  private async loadUserHabits() {
    try {
      const uid = await this.userService.getUserId();
      if (uid) {
        this.userHabits = await this.habitService.getUserHabits() as HabitData[];
      }
    } catch (error) {
      console.error('Erro ao carregar hábitos:', error);
    }
  }

  public toggleHabitSelection(habitId: string) {
    if (this.isHabitSelected(habitId)) {
      this.selectedHabit = '';
      this.goal.linkedHabit = '';
    } else {
      this.selectedHabit = habitId;
      this.goal.linkedHabit = habitId;
    }
  }
  public isHabitSelected(habitId: string): boolean {
    return this.goal.linkedHabit === habitId;
  }


  public getHabitName(habitId: string): string {
    const habit = this.userHabits.find(cat => cat.id === habitId);
    return habit ? habit.name : '';
  }

  public getCategoryInfo(categoryId: string): Category | null {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category || null
  }


  public getGoalTypeDisplay(): string {
    switch (this.goal.goalType) {
      case 'unit': return 'Contagem de Unidades';
      case 'habit': return 'Conclusão de Hábito';
      case 'yes_no': return 'Sim/Não';
      default: return '';
    }
  }

  public async updateGoal() {
    if (!this.isFormValid()) {
      Swal.fire({
        title: 'Erro',
        text: 'Por favor, preencha todos os campos obrigatórios.',
        icon: 'warning',
        heightAuto: false,
      });
      return;
    }

    let goalToSave: GoalData = {
      ...this.goal,
      updatedAt: serverTimestamp(),
    };

    if (this.goal.goalType === 'unit') {
      delete goalToSave.linkedHabit
      const progressTypeToSave = this.goal.progressValueType === 'Outro' ? this.goal.customProgressType : this.goal.progressValueType;
      if (goalToSave.progressValueType !== 'Outro') {
        delete goalToSave.customProgressType
      }
      goalToSave.progressValueType = progressTypeToSave as string;
    } else if (this.goal.goalType === 'habit') {
      delete goalToSave.progressValueType;
      delete goalToSave.customProgressType;
      goalToSave.linkedHabit = this.goal.linkedHabit;
      goalToSave.state = 'in_progress'
    } else if (this.goal.goalType === 'yes_no') {
      delete goalToSave.progressValueType;
      delete goalToSave.customProgressType;
      delete goalToSave.linkedHabit;
      goalToSave.targetValue = 1;
    }
    try {
      Loading.standard('Atualizando meta...');
      await this.goalService.updateGoal(this.goal.id, goalToSave);
      Swal.fire({ title: 'Sucesso', text: 'Meta atualizada com sucesso', icon: 'success', heightAuto: false, confirmButtonColor: '#E0004D' });
      this.closeModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        Swal.fire({
          title: 'Erro',
          text: err.message,
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      } else {
        Swal.fire({
          title: 'Erro',
          text: 'Ocorreu um erro desconhecido',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      }
    } finally {
      Loading.remove()
    }
  }
}
