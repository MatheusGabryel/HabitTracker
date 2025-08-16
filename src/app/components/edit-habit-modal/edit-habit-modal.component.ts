import { UserService } from './../../services/user/user.service';
import { Component, OnInit, EventEmitter, Output, Input, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitData } from 'src/app/interfaces/habit.interface';
import Swal from 'sweetalert2';
import { Loading } from 'notiflix';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import { FieldValue, serverTimestamp, Timestamp } from 'firebase/firestore';
import { HabitService } from 'src/app/services/habit/habit.service';
import { normalizeFirestoreDate } from 'src/app/shared/utils/timestamp.utils';

@Component({
  selector: 'app-edit-habit-modal',
  templateUrl: './edit-habit-modal.component.html',
  styleUrls: ['./edit-habit-modal.component.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true,
})

export class EditHabitModalComponent implements OnInit {
  public habitService = inject(HabitService);
  public userService = inject(UserService);
  @Output() close = new EventEmitter<void>();
  @Input() habitToEdit!: HabitData;
  public currentStep = 1;
  public originalHabit!: HabitData;
  public habit!: HabitData;
  public sensitiveFieldsChanged = false;

  constructor() { }

  ngOnInit() {
    this.originalHabit = structuredClone(this.habitToEdit);
    this.habit = structuredClone(this.habitToEdit);

    for (const h of [this.originalHabit, this.habit]) {
      h.createdAt = normalizeFirestoreDate(h.createdAt);
      h.updatedAt = normalizeFirestoreDate(h.updatedAt);
    }

    this.progressType = this.habit.progressType;
    console.log(this.habit);
  }

  public closeModal() {
    this.close.emit();
  }

  public progressType: 'yes_no' | 'time' | 'times' = 'yes_no';

  public daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  public categories = PREDEFINED_CATEGORIES;

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

  public onTimesTargetValueChange(newValue: number) {
    this.habit.timesTarget!.value = newValue;
    this.sensitiveFieldsChanged = this.checkSensitiveChanges();
  }

  public onTimeTargetValueChange() {
    const time = this.habit.timeTarget!;

    time.value = (time.hours ?? 0) * 3600 + (time.minutes ?? 0) * 60 + (time.seconds ?? 0);

    this.sensitiveFieldsChanged = this.checkSensitiveChanges();
  }
  public checkSensitiveChanges(): boolean {
    if (JSON.stringify(this.habit.timesTarget) !== JSON.stringify(this.originalHabit.timesTarget)) {
      return true;
    }

    if (JSON.stringify(this.habit.timeTarget) !== JSON.stringify(this.originalHabit.timeTarget)) {
      return true;
    }

    if (this.originalHabit.days.length !== this.habit.days.length) {
      return true;
    }

    if (!this.originalHabit.days.every(day => this.habit.days.includes(day))) {
      return true;
    }

    return false;
  }

  public isFormValid(): boolean {
    return !!this.habit.name &&
      !!this.habit.category &&
      this.habit.days.length > 0 &&
      !!this.habit.priority;
  }

  public selectCategory(categoryId: string) {
    this.habit.category = categoryId;
  }

  public toggleDay(day: string) {
    const updatedDays = new Set(this.habit.days);
    if (updatedDays.has(day)) {
      updatedDays.delete(day);
    } else {
      updatedDays.add(day);
    }
    this.habit.days = Array.from(updatedDays);

    this.sensitiveFieldsChanged = this.checkSensitiveChanges();
  }

  public getCategoryIcon(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '';
  }

  public getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.displayName : '';
  }

  public async updateHabit() {
    if (this.habit.name === '') {
      Swal.fire({ title: 'Erro', text: 'Insira um nome.', icon: 'warning', heightAuto: false });
      return;
    }
    if (this.habit.category === '') {
      Swal.fire({ title: 'Erro', text: 'Selecione uma categoria.', icon: 'warning', heightAuto: false });
      return;
    }
    if (this.habit.days.length === 0) {
      Swal.fire({ title: 'Erro', text: 'Selecione ao menos um dia.', icon: 'warning', heightAuto: false });
      return;
    }
    if (this.habit.priority === '') {
      Swal.fire({ title: 'Erro', text: 'Defina um nível de prioridade.', icon: 'warning', heightAuto: false });
      return;
    }

    if (this.sensitiveFieldsChanged) {
      const result = await Swal.fire({
        title: 'Atenção',
        text: "Você alterou informações importantes. Deseja criar um novo hábito com essas mudanças? Os dados antigos serão mantidos no histórico, mas não contarão mais nas estatísticas.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, criar novo',
        cancelButtonText: 'Cancelar.',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });

      if (result.isConfirmed) {

        this.habit.createdAt = serverTimestamp();
        this.habit.updatedAt = serverTimestamp();
        this.createNewHabit();
        return;
      } else {
        this.habit.days = [...this.habit.days];
        this.progressType = this.originalHabit.progressType;
        this.habit.progressType = this.originalHabit.progressType;

        if (this.originalHabit.timeTarget) {
          this.habit.timeTarget = { ...this.originalHabit.timeTarget };
        }

        if (this.originalHabit.timesTarget) {
          this.habit.timesTarget = { ...this.originalHabit.timesTarget };
        }
        return
      }
    }
    try {
      Loading.standard('Atualizando hábito...');
      const uid = await this.userService.getUserId();
      if (!uid) throw new Error('Usuário não autenticado');
      this.habit.updatedAt = serverTimestamp();

      console.log(this.habit.createdAt)
      await this.habitService.updateHabit(this.habit, this.habit.id);
      console.log(this.habit)
      Swal.fire({ title: 'Sucesso', text: 'Hábito atualizado com sucesso', icon: 'success', heightAuto: false, confirmButtonColor: '#E0004D' });
      Loading.remove();
      this.closeModal();
    } catch (err: unknown) {
      Loading.remove();
      const message = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido';
      Swal.fire({ title: 'Erro', text: message, icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
    }
  }

  private async createNewHabit() {
    try {
      Loading.standard('Criando novo hábito...');
      const uid = await this.userService.getUserId();
      if (!uid) throw new Error('Usuário não autenticado');

      await this.habitService.addNewEditHabit(this.habit);

      Swal.fire({ title: 'Sucesso', text: 'Novo hábito criado com sucesso', icon: 'success', heightAuto: false, confirmButtonColor: '#E0004D' });
      Loading.remove();
      this.closeModal();
    } catch (err: unknown) {
      Loading.remove();
      const message = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido';
      Swal.fire({ title: 'Erro', text: message, icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
    }
  }
}
