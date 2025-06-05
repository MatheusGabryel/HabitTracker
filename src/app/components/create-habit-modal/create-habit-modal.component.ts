import { UserService } from './../../services/user.service';
import { Component, OnInit, EventEmitter, Output, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitData } from 'src/app/interfaces/habit.interface';
import Swal from 'sweetalert2';
import { Loading } from 'notiflix';
import { AuthService } from 'src/app/services/auth.service';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';


@Component({
  selector: 'app-create-habit-modal',
  templateUrl: './create-habit-modal.component.html',
  styleUrls: ['./create-habit-modal.component.scss'],
  imports: [CommonModule, FormsModule],
})

export class CreateHabitModalComponent implements OnInit {

  public userDataService = inject(AuthService);
  public userService = inject(UserService);
  @Output() close = new EventEmitter<void>();

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
      rule: 'at_least',
    },
    timesTarget: {
      value: 0,
      rule: 'at_least',
    },
    state: 'in_progress',
    progressValue: 0 
  }

  constructor() { }

  ngOnInit() {

  }

  public closeModal() {
    this.close.emit();
  }

  public progressType: 'yes_no' | 'time' | 'times' = 'yes_no';

  public daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  public categories = PREDEFINED_CATEGORIES

  public toggleDay(day: string) {
    if (this.habit.days.includes(day)) {
      this.habit.days = this.habit.days.filter(d => d !== day);
    } else {
      this.habit.days.push(day);
    }
  }


  public async createHabit() {

    if (this.habit.name === '') {
      Swal.fire({
        title: 'Erro',
        text: 'Insira um nome.',
        icon: 'warning',
        heightAuto: false,
      });
      return;
    }
    if (this.habit.category === '') {
      Swal.fire({
        title: 'Erro',
        text: 'Selecione uma categoria.',
        icon: 'warning',
        heightAuto: false,
      });
      return;
    }
    if (this.habit.days.length === 0) {
      Swal.fire({
        title: 'Erro',
        text: 'Selecione ao menos um dia.',
        icon: 'warning',
        heightAuto: false,
      });
      return;
    }
    if (this.habit.priority === '') {
      Swal.fire({
        title: 'Erro',
        text: 'Defina um nivel de prioridade.',
        icon: 'warning',
        heightAuto: false,
      });
      return;
    }
    this.habit.progressType = this.progressType;

    // if (this.formProgress === 'time' && !this.habit.duration) {
    //   Swal.fire({ title: 'Erro', text: 'Selecione a duração da atividade.', icon: 'warning' });
    //   return;
    // }
    // if (this.formProgress === 'time' && !this.habit.duration) {
    //   Swal.fire({ title: 'Erro', text: 'Selecione a duração da atividade.', icon: 'warning' });
    //   return;
    // }

    try {
      Loading.standard('Adicionando hábito...');
      const uid = await this.userService.getUserId();
      if (!uid) {
        Swal.fire({
          title: 'Erro',
          text: 'Usuário não autenticado',
          icon: 'error',
          confirmButtonColor: '#E0004D'
        });
        throw new Error('Usuário não autenticado');
      }

      await this.userService.addHabit(uid, this.habit);

      Swal.fire({
        title: 'Sucesso',
        text: 'Hábito adicionado com sucesso',
        icon: 'success',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });
      Loading.remove()
      this.closeModal();
    } catch (err: unknown) {
      Loading.remove()
      if (err instanceof Error) {
        console.error(err);
        Swal.fire({
          title: 'Erro',
          text: err.message,
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      } else {
        console.error('Erro desconhecido', err);
        Swal.fire({
          title: 'Erro',
          text: 'Ocorreu um erro desconhecido',
          icon: 'error',
          heightAuto: false,
          confirmButtonColor: '#E0004D'
        });
      }
    }
  }


}


