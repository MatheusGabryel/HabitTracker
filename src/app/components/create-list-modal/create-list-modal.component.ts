import { HabitService } from 'src/app/services/habit/habit.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { serverTimestamp } from 'firebase/firestore';
import { Loading } from 'notiflix';
import { Category } from 'src/app/interfaces/category.interface';
import { HabitList } from 'src/app/interfaces/habit.interface';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-list-modal',
  templateUrl: './create-list-modal.component.html',
  styleUrls: ['./create-list-modal.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class CreateListModalComponent {
  private habitService = inject(HabitService);

  @Output() close = new EventEmitter<void>();

  public categories: Category[] = PREDEFINED_CATEGORIES

  public habitList: HabitList = {
    id: '',
    name: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    categories: [] as string[],
    isVisible: true
  }

  closeModal() {
    this.close.emit();
  }

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
    if (!this.isFormValid()) {
      Swal.fire({ title: 'Erro', text: 'Preencha todos os campos corretamente.', icon: 'warning', heightAuto: false })
      return;
    }
    try {
      Loading.standard('Adicionando lista...');
      await this.habitService.addHabitList(this.habitList);
      Swal.fire({ title: 'Sucesso', text: 'Lista adicionado com sucesso', icon: 'success', heightAuto: false, confirmButtonColor: '#E0004D' });
      this.closeModal();
    } catch (err: unknown) {
      if (err instanceof Error) {
        Swal.fire({ title: 'Erro', text: err.message, icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      } else {
        Swal.fire({ title: 'Erro', text: 'Ocorreu um erro desconhecido', icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      }
    } finally {
      Loading.remove()
    }
  }
}
