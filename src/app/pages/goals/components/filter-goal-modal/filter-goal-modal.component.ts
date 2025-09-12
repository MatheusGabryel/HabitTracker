import { Component, Output, EventEmitter, Input } from '@angular/core';
import { PREDEFINED_CATEGORIES } from 'src/assets/data/categories';
import { Category } from 'src/app/interfaces/category.interface';
import { GoalType, StateGoalType } from 'src/app/interfaces/goal.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GoalFilters } from 'src/app/interfaces/goalFilters.interface';


@Component({
  selector: 'app-filter-goal-modal',
  templateUrl: './filter-goal-modal.component.html',
  styleUrls: ['./filter-goal-modal.component.scss'],
  imports: [CommonModule, FormsModule]

})
export class FilterGoalModalComponent {
  @Input() initialFilters!: GoalFilters;

  @Output() close = new EventEmitter<void>();
  @Output() filtersApplied = new EventEmitter<any>();
  
  public categories: Category[] = PREDEFINED_CATEGORIES;
  public selectedCategories: string[] = ['all'];

  public goalTypeFilters = {
    unit: false,
    habit: false,
    yes_no: false
  };

  public statusFilters = {
    in_progress: false,
    completed: false,
    not_completed: false,
    cancelled: false
  };

  public deadlineFilters = {
    hasDeadline: false,
    overdue: false,
    dueThisWeek: false
  };

  public sortBy: string = 'created-newest';

  public ngOnChanges() {
    if (this.initialFilters) {
      this.selectedCategories = [...this.initialFilters.categories];
      this.goalTypeFilters = { ...this.initialFilters.goalTypes };
      this.statusFilters = { ...this.initialFilters.statuses };
      this.deadlineFilters = { ...this.initialFilters.deadlines };
      this.sortBy = this.initialFilters.sortBy;
    }
  }

  public closeModal() {
    this.close.emit();
  }

  public toggleCategory(categoryId: string) {
    if (categoryId === 'all') {
      this.selectedCategories = ['all'];
    } else {
      const index = this.selectedCategories.indexOf(categoryId);
      if (index > -1) {
        this.selectedCategories.splice(index, 1);
      } else {
        this.selectedCategories.push(categoryId);
      }

      const allIndex = this.selectedCategories.indexOf('all');
      if (allIndex > -1 && this.selectedCategories.length > 1) {
        this.selectedCategories.splice(allIndex, 1);
      }
      if (this.selectedCategories.length === 0) {
        this.selectedCategories = ['all'];
      }
    }
  }

  public onGoalTypeChange(type: GoalType, event: any) {
    const isChecked = event.target.checked;
    this.goalTypeFilters[type] = isChecked;
  }

  public onStatusChange(status: StateGoalType, event: any) {
    const isChecked = event.target.checked;
    this.statusFilters[status] = isChecked;
  }

  public onDeadlineChange(type: string, event: any) {
    const isChecked = event.target.checked;
    this.deadlineFilters[type as keyof typeof this.deadlineFilters] = isChecked;
  }

  public clearAllFilters() {
    this.selectedCategories = ['all'];
    this.goalTypeFilters = {
      unit: false,
      habit: false,
      yes_no: false
    };
    this.statusFilters = {
      in_progress: false,
      completed: false,
      not_completed: false,
      cancelled: false
    };
    this.deadlineFilters = {
      hasDeadline: false,
      overdue: false,
      dueThisWeek: false
    };
    this.sortBy = 'created-newest';
  }

  public applyFilters() {
    const filters = {
      categories: this.selectedCategories,
      goalTypes: this.goalTypeFilters,
      statuses: this.statusFilters,
      deadlines: this.deadlineFilters,
      sortBy: this.sortBy
    };

    this.filtersApplied.emit(filters);
    this.closeModal();
  }
}
