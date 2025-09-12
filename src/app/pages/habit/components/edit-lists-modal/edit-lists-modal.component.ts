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
export class EditListsModalComponent {
  private habitService = inject(HabitService);

  @Input() lists!: HabitList[];
  @Output() toggle = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  public categories: Category[] = PREDEFINED_CATEGORIES;
  public showEditListModal: boolean = false
  public selectedList!: HabitList | null;

  public closeModal() {
    this.close.emit();
  }

  public closeEditModal() {
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

  public getCategoryNames(categoryIds: string[]): string {
    if (!categoryIds || categoryIds.length === 0) return 'Nenhuma categoria';

    return categoryIds.map(id => {
      const category = this.categories.find(cat => cat.id === id);
      return category ? category.displayName : '';
    }).filter(name => name).join(', ');
  }

  public editList(list: HabitList) {
    this.selectedList = structuredClone(list)
    this.showEditListModal = true
  }

  public toggleVisibility(list: HabitList) {
    this.toggle.emit(list.id)
    list.isVisible = !list.isVisible
  }

  public deleteList(list: HabitList) {
    this.delete.emit(list.id);
  }

  public isFormValid(list: HabitList): boolean {
    return !!list.name &&
      list.categories.length > 0
  }

  public async updateList(list: HabitList) {
    if (list.name === '') {
      Swal.fire({ title: 'Erro', text: 'Insira um nome.', icon: 'warning', heightAuto: false, });
      return;
    }
    if (list.categories.length === 0) {
      Swal.fire({ title: 'Erro', text: 'Selecione uma categoria.', icon: 'warning', heightAuto: false, });
      return;
    } 
    if (!this.isFormValid(list)) {
      Swal.fire({ title: 'Erro', text: 'Preencha todos os campos corretamente.', icon: 'warning', heightAuto: false, });
      return
    }
    try {
      Loading.standard('Atualizando lista...');
      list.createdAt = normalizeFirestoreDate(list.createdAt)
      list.updatedAt = serverTimestamp();
      await this.habitService.updateHabitList(list, list.id);
      Swal.fire({ title: 'Sucesso', text: 'Lista atualizada com sucesso', icon: 'success', heightAuto: false, confirmButtonColor: '#E0004D' });
      this.closeModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido';
      Swal.fire({ title: 'Erro', text: message, icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
    } finally {
      Loading.remove()
    }
  }

}