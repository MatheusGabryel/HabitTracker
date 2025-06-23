import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldValue, serverTimestamp } from 'firebase/firestore';
import { Loading } from 'notiflix';
import { GoalData } from 'src/app/interfaces/goal.interface';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-goal-modal',
  templateUrl: './create-goal-modal.component.html',
  styleUrls: ['./create-goal-modal.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class CreateGoalModalComponent {

  public userDataService = inject(AuthService);
  public userService = inject(UserService);
  public now = new Date();
  constructor() { }

  ngOnInit() { }

  @Output() fechar = new EventEmitter<void>();
  progressTypes = ['Unidade', 'Kg', 'Km', 'Minutos', 'Horas', 'Páginas', 'Repetições', 'Dinheiro', 'Outro'];
  public categories = PREDEFINED_CATEGORIES;

  goal: GoalData = {
    id: '',
    name: '',
    category: '',
    description: '',
    progressValueType: '',
    customProgressType: '',
    hasEndDate: false,
    endDate: '',
    targetValue: 0,
    state: 'in_progress',
    progressValue: 0,
    createdAt: undefined,
    updatedAt: undefined,
  };

  onClose() {
    this.fechar.emit();
  }


  public async createGoal() {
    const progressTypeToSave =
      this.goal.progressValueType === 'Outro'
        ? this.goal.customProgressType
        : this.goal.progressValueType;

    const goalToSave = {
      ...this.goal,
      progressValueType: progressTypeToSave as string,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (this.goal.name === '') {
      Swal.fire({
        title: 'Erro',
        text: 'Insira um nome.',
        icon: 'warning',
        heightAuto: false,
      });
      return;
    }
    if (this.goal.category === '') {
      Swal.fire({
        title: 'Erro',
        text: 'Selecione uma categoria.',
        icon: 'warning',
        heightAuto: false,
      });
      return;
    }
    if (this.goal.progressValueType === 'Outro' && this.goal.customProgressType === '') {
      Swal.fire({
        title: 'Erro',
        text: 'Selecione um tipo de marcação.',
        icon: 'warning',
        heightAuto: false,
      });
      return;
    }
    if (this.goal.targetValue === 0) {
      Swal.fire({
        title: 'Erro',
        text: 'Defina um valor de conclusão.',
        icon: 'warning',
        heightAuto: false,
      });
      return;
    }

    try {
      Loading.standard('Adicionando meta...');
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

      await this.userService.addGoal(uid, goalToSave);

      Swal.fire({
        title: 'Sucesso',
        text: 'Meta adicionada com sucesso',
        icon: 'success',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });
      Loading.remove()
      this.onClose();
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