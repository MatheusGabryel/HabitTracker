import { UserService } from './../../services/user/user.service';
import { Component, OnInit, EventEmitter, Output, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitData } from 'src/app/interfaces/habit.interface';
import Swal from 'sweetalert2';
import { Loading } from 'notiflix';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import { serverTimestamp } from 'firebase/firestore';
import { HabitService } from 'src/app/services/habit/habit.service';


@Component({
  selector: 'app-create-habit-modal',
  templateUrl: './create-habit-modal.component.html',
  styleUrls: ['./create-habit-modal.component.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true,
})

export class CreateHabitModalComponent implements OnInit {

  public habitService = inject(HabitService)
  public userService = inject(UserService);
  @Output() close = new EventEmitter<void>();

  public currentStep = 1;

  public habit: HabitData = {
    id: '',
    name: '',
    category: '',
    days: [] as string[],
    description: '',
    priority: '',
    progressType: 'yes_no',
    timeTarget: {
      hours: 0,
      minutes: 0,
      seconds: 0,
      value: 0,
      rule: 'at_least',
    },
    timesTarget: {
      value: 0,
      rule: 'at_least',
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  constructor() { }

  ngOnInit() {
  }

  public closeModal() {
    this.close.emit();
  }

  public progressType: 'yes_no' | 'time' | 'times' = 'yes_no';

  public daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  public categories = PREDEFINED_CATEGORIES;
  public goToStep(step: number) {
    if (step < this.currentStep || this.canProceed()) {
      this.currentStep = step;
    }
  }

  public nextStep() {
    if (this.canProceed()) {
      this.currentStep++;
    }
  }

  public previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  public canProceed(): boolean {
    if (this.currentStep === 1) {
      return !!this.habit.name && !!this.habit.category;
    } else if (this.currentStep === 2) {
      return this.habit.days.length > 0 &&
        (this.progressType !== 'times' ||
          this.habit.timesTarget!.rule === 'any' ||
          this.habit.timesTarget!.value > 0);
    }
    return true;
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
  }

  public getCategoryIcon(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '';
  }

  public getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.displayName : '';
  }


  public async createHabit() {
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

    this.habit.progressType = this.progressType;

    if (this.progressType === 'yes_no') {
      delete this.habit.timesTarget;
      delete this.habit.timeTarget;
    } else if (this.progressType === 'times') {
      delete this.habit.timeTarget;
    } else if (this.progressType === 'time') {
      delete this.habit.timesTarget;

      const { hours = 0, minutes = 0, seconds = 0 } = this.habit.timeTarget || {};
      this.habit.timeTarget = {
        hours,
        minutes,
        seconds,
        value: (hours * 3600) + (minutes * 60) + seconds,
        rule: this.habit.timeTarget?.rule ?? 'at_least',
      };
    }

    try {
      Loading.standard('Adicionando hábito...');
      const uid = await this.userService.getUserId();
      if (!uid) throw new Error('Usuário não autenticado');

      await this.habitService.addHabit(uid, this.habit);

      Swal.fire({ title: 'Sucesso', text: 'Hábito adicionado com sucesso', icon: 'success', heightAuto: false, confirmButtonColor: '#E0004D' });
      Loading.remove();
      this.closeModal();
    } catch (err: unknown) {
      Loading.remove();
      const message = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido';
      Swal.fire({ title: 'Erro', text: message, icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
    }
  }



}


