import { HabitService } from 'src/app/services/habit/habit.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { serverTimestamp } from 'firebase/firestore';
import { Loading } from 'notiflix';
import { Category } from 'src/app/interfaces/category.interface';
import { HabitList } from 'src/app/interfaces/habit.interface';
import { UserService } from 'src/app/services/user/user.service';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-list-modal',
  templateUrl: './create-list-modal.component.html',
  styleUrls: ['./create-list-modal.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class CreateListModalComponent implements OnInit {
  public userService = inject(UserService);
  public habitService = inject(HabitService);

   public categories = PREDEFINED_CATEGORIES

  @Output() close = new EventEmitter<void>();

  public habitList: HabitList = {
    id: '',
    name: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    categories: [] as string[],
    isVisible: true
  }

  constructor() { }



  closeModal() {
    this.close.emit();
  }
  ngOnInit() { }

 

  public toggleCategory(categoryId: string) {
    const updatedCategories = new Set(this.habitList.categories);
    if (updatedCategories.has(categoryId)) {
      updatedCategories.delete(categoryId);
    } else {
      updatedCategories.add(categoryId);
    }
    this.habitList.categories = Array.from(updatedCategories);
  }

  public isFormValid(): boolean {
    return !!this.habitList.name &&
      this.habitList.categories.length > 0
  }

  public async createList() {
    if (this.habitList.name !== '') {
      try {
        Loading.standard('Adicionando lista...');
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

        if (this.habitList.name === '') {
          Swal.fire({
            title: 'Erro',
            text: 'Insira um nome.',
            icon: 'warning',
            heightAuto: false,
          });
          Loading.remove()
          return;

        }
        if (this.habitList.categories.length === 0) {
          Swal.fire({
            title: 'Erro',
            text: 'Selecione uma categoria.',
            icon: 'warning',
            heightAuto: false,
          });
          Loading.remove()
          return;
        }

        await this.habitService.addHabitList(uid, this.habitList);

        Swal.fire({
          title: 'Sucesso',
          text: 'Lista adicionado com sucesso',
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
    } else {
      Swal.fire({
        title: 'Erro',
        text: 'Por favor, insira um nome a lista.',
        icon: 'error',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });
    }
  }

}
