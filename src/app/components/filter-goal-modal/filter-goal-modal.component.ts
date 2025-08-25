import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
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
export class FilterGoalModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() filtersApplied = new EventEmitter<any>();
  @Input() initialFilters!: GoalFilters;

  categories: Category[] = PREDEFINED_CATEGORIES;
  selectedCategories: string[] = ['all'];
  
  goalTypeFilters = {
    unit: false,
    habit: false,
    yes_no: false
  };
  
  statusFilters = {
    in_progress: false,
    completed: false,
    not_completed: false,
    cancelled: false
  };
  
  deadlineFilters = {
    hasDeadline: false,
    overdue: false,
    dueThisWeek: false
  };
  
  sortBy: string = 'created-newest';

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
  if (this.initialFilters) {
    this.selectedCategories = [...this.initialFilters.categories];
    this.goalTypeFilters = { ...this.initialFilters.goalTypes };
    this.statusFilters = { ...this.initialFilters.statuses };
    this.deadlineFilters = { ...this.initialFilters.deadlines };
    this.sortBy = this.initialFilters.sortBy;
  }
}

  closeModal() {
    this.close.emit();
  }

  toggleCategory(categoryId: string) {
    console.log('Categoria selecionada:', categoryId);
    
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

  onGoalTypeChange(type: GoalType, event: any) {
    const isChecked = event.target.checked;
    // console.log(`Filtro tipo de meta '${type}':`, isChecked ? 'ativado' : 'desativado');
    this.goalTypeFilters[type] = isChecked;
    // console.log('Filtros de tipo de meta atuais:', this.goalTypeFilters);
  }

  onStatusChange(status: StateGoalType, event: any) {
    const isChecked = event.target.checked;
    // console.log(`Filtro status '${status}':`, isChecked ? 'ativado' : 'desativado');
    this.statusFilters[status] = isChecked;
    // console.log('Filtros de status atuais:', this.statusFilters);
  }

  onDeadlineChange(type: string, event: any) {
    const isChecked = event.target.checked;
    // console.log(`Filtro prazo '${type}':`, isChecked ? 'ativado' : 'desativado');
    this.deadlineFilters[type as keyof typeof this.deadlineFilters] = isChecked;
    // console.log('Filtros de prazo atuais:', this.deadlineFilters);
  }

  clearAllFilters() {
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

  applyFilters() {
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
