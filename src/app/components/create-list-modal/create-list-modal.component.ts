import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { serverTimestamp } from 'firebase/firestore';
import { Loading } from 'notiflix';
import { Category } from 'src/app/interfaces/category.interface';
import { HabitList } from 'src/app/interfaces/habitlist.interface';
import { UserService } from 'src/app/services/user.service';
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
  constructor() { }
  public uid = this.userService.getUserId();

  public habitList: HabitList = {
    id: '',
    name: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    habitIds: [],
    categories: [] as string[],
  }

  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
  ngOnInit() { }

  public categories = PREDEFINED_CATEGORIES

  public toggleCategory(categoryId: string) {
    const index = this.habitList.categories.indexOf(categoryId);
    if (index > -1) {
      this.habitList.categories.splice(index, 1);
    } else {
      this.habitList.categories.push(categoryId);
    }
  }

  public async createList() {
    if (this.habitList.name !== '') {
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

        await this.userService.addList(uid, this.habitList);

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
    } else { alert('Por favor, insira um nome a lista.') }
  }

}
