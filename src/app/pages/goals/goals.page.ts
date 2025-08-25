import { GoalCardComponent } from './../../components/goal-card/goal-card.component';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './../../components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../components/header/header.component";
import { CreateGoalModalComponent } from "../../components/create-goal-modal/create-goal-modal.component";
import { animate, style, transition, trigger } from '@angular/animations';
import { UserService } from 'src/app/services/user/user.service';
import { GoalData, GoalType, StateGoalType } from 'src/app/interfaces/goal.interface';
import Swal from 'sweetalert2';
import { Loading } from 'notiflix';
import { GoalService } from 'src/app/services/goal/goal.service';
import { FormsModule } from '@angular/forms';
import { FilterGoalModalComponent } from "src/app/components/filter-goal-modal/filter-goal-modal.component";
import { EditGoalModalComponent } from "src/app/components/edit-goal-modal/edit-goal-modal.component";
import { GoalFilters } from 'src/app/interfaces/goalFilters.interface';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  standalone: true,
  imports: [IonContent, MenuComponent, CommonModule, HeaderComponent, CreateGoalModalComponent, GoalCardComponent, FormsModule, FilterGoalModalComponent, EditGoalModalComponent],
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
export class GoalsPage {

  public showGoalModal = false;
  public showFilterModal = false;
  public showEditGoalModal = false;

  public goalToEdit: any = null;

  public userService = inject(UserService);
  public goalService = inject(GoalService);
  public loading: boolean = true;
  public hasGoals: boolean = false;

  public searchText: string = '';
  public goals: GoalData[] = [];
  public filteredGoals: GoalData[] = [];
  public activeFilters: GoalFilters = {
    categories: ['all'],
    goalTypes: {
      unit: false,
      habit: false,
      yes_no: false
    },
    statuses: {
      in_progress: false,
      completed: false,
      not_completed: false,
      cancelled: false
    },
    deadlines: {
      hasDeadline: false,
      overdue: false,
      dueThisWeek: false
    },
    sortBy: 'created-newest'
  }


  public openModal() {
    this.showGoalModal = true;
  }

  public openFilterModal() {
    this.showFilterModal = true
  }

  public closeModal() {
    this.showGoalModal = false;
    this.showFilterModal = false;
    this.showEditGoalModal = false;

    this.loadGoals()
  }
  public openEditGoalModal(goal: GoalData) {
    this.goalToEdit = goal;
    this.showEditGoalModal = true;
  }

  async ionViewWillEnter() {
    this.loadGoals();
  }

  constructor() { }

  async ngOnInit() {

    this.loadGoals()
    this.goalService.checkGoalsForHabit()
  }

  deleteGoal(goal: GoalData) {
    try {
      Swal.fire({
        title: "Tem certeza?",
        text: "Você perderá tudo relacionado a meta excluída!",
        icon: "warning",
        heightAuto: false,
        showCancelButton: true,
        confirmButtonColor: "#1976d2",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, desejo deletar."
      }).then((result) => {
        if (result.isConfirmed) {
          this.goalService.deleteGoal(goal.id);
          this.goals = this.goals.filter(g => g.id !== goal.id);
          this.loadGoals()

          Swal.fire({
            title: 'Excluido',
            text: 'Meta excluída com sucesso',
            icon: 'success',
            heightAuto: false,
            confirmButtonColor: '#E0004D'
          });
          Loading.remove()
        }
      });
    } catch (err: unknown) {
      Loading.remove()
      if (err instanceof Error) {
        console.error(err);
        Swal.fire({
          title: 'Erro',
          text: 'Não foi possivel excluir a meta',
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

  async loadGoals() {
    try {
      this.loading = true
      const uid = await this.userService.getUserId();
      if (!uid) throw new Error('Usuário não autenticado');

      this.goals = await this.goalService.getUserGoals();
      this.filteredGoals = this.goalService.filterGoals(this.goals, this.activeFilters, this.searchText);

      this.hasGoals = this.filteredGoals.length > 0;
      this.loading = false;
    } catch {
      this.goals = [];
      this.filteredGoals = [];
      this.hasGoals = false;
      this.loading = false;
    }
  }



  onFiltersApplied(filters: GoalFilters) {
    this.activeFilters = filters;
    this.filteredGoals = this.goalService.filterGoals(this.goals, filters, this.searchText);
    return this.activeFilters
  }
  onSearchChange() {
    this.filteredGoals = this.goalService.filterGoals(this.goals, this.activeFilters, this.searchText);
  }

  restoreGoal(goal: GoalData) {
    this.goalService.restoreGoal(goal)
  }

  completeGoal(goal: GoalData) {
    this.goalService.completeGoal(goal)
  }
  cancelGoal(goal: GoalData) {
    this.goalService.cancelGoal(goal)
  }


}
