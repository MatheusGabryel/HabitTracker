import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { serverTimestamp } from 'firebase/firestore';
import { Loading } from 'notiflix';
import { Category } from 'src/app/interfaces/category.interface';
import { HabitList } from 'src/app/interfaces/habit.interface';
import { HabitService } from 'src/app/services/habit/habit.service';
import { UserService } from 'src/app/services/user/user.service';
import { normalizeFirestoreDate } from 'src/app/shared/utils/timestamp.utils';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-lists-modal',
  templateUrl: './edit-lists-modal.component.html',
  styleUrls: ['./edit-lists-modal.component.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true,
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
export class EditListsModalComponent implements OnInit {
  public userService = inject(UserService);
  public habitService = inject(HabitService);
  public categories = PREDEFINED_CATEGORIES;
  @Input() lists!: HabitList[];
  public loading = true;
  @Output() toggle = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  public showEditListModal = false
  public selectedList!: HabitList | null;

  constructor() { }

  async ngOnInit() {
    console.log(this.lists)
    this.isLoading()
  }


  isLoading() {
    if (this.lists.length >= 1 || this.lists.length === 0) {
      this.loading = false
    }
  }
  closeModal() {
    this.close.emit();
  }

  closeEditModal() {
    this.showEditListModal = false
  }

  public selectedCategory(list: HabitList, categoryId: string) {
    const updatedCategories = new Set(list.categories);
    if (updatedCategories.has(categoryId)) {
      updatedCategories.delete(categoryId);
    } else {
      updatedCategories.add(categoryId);
    }
    list.categories = Array.from(updatedCategories);
  }

  getCategoryNames(categoryIds: string[]): string {
    if (!categoryIds || categoryIds.length === 0) return 'Nenhuma categoria';

    return categoryIds.map(id => {
      const category = this.categories.find(cat => cat.id === id);
      return category ? category.displayName : '';
    }).filter(name => name).join(', ');
  }

  editList(list: HabitList) {
    this.selectedList = structuredClone(list)
    this.showEditListModal = true


    console.log('Editar lista:', list);
  }

  toggleVisibility(list: HabitList) {
    this.toggle.emit(list.id)
    list.isVisible = !list.isVisible
  }

  deleteList(list: HabitList) {
    this.delete.emit(list.id);
  }

  public isFormValid(list: HabitList): boolean {
    return !!list.name &&
      list.categories.length > 0
  }


  public async updateList(list: HabitList) {
    if (list.name === '') {
      Swal.fire({
        title: 'Erro',
        text: 'Insira um nome.',
        icon: 'warning',
        heightAuto: false,
      });
      Loading.remove()
      return;

    }
    if (list.categories.length === 0) {
      Swal.fire({
        title: 'Erro',
        text: 'Selecione uma categoria.',
        icon: 'warning',
        heightAuto: false,
      });
      Loading.remove()
      return;
    }
    try {

      Loading.standard('Atualizando lista...');
      const uid = await this.userService.getUserId();
      if (!uid) throw new Error('Usuário não autenticado');
      list.createdAt = normalizeFirestoreDate(list.createdAt)
      list.updatedAt = serverTimestamp();

      console.log(list.createdAt)
      await this.habitService.updateHabitList(list, list.id);
      console.log(list)
      Swal.fire({ title: 'Sucesso', text: 'Lista atualizada com sucesso', icon: 'success', heightAuto: false, confirmButtonColor: '#E0004D' });
      Loading.remove();
      this.closeModal();
    } catch (err: unknown) {
      Loading.remove();
      const message = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido';
      Swal.fire({ title: 'Erro', text: message, icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
    }
  }

}