import { GoalCardComponent } from './components/goal-card/goal-card.component';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { CreateGoalModalComponent } from "./components/create-goal-modal/create-goal-modal.component";
import { animate, style, transition, trigger } from '@angular/animations';
import { UserService } from 'src/app/services/user/user.service';
import { GoalData } from 'src/app/interfaces/goal.interface';
import Swal from 'sweetalert2';
import { Loading } from 'notiflix';
import { GoalService } from 'src/app/services/goal/goal.service';
import { FormsModule } from '@angular/forms';
import { FilterGoalModalComponent } from "src/app/pages/goals/components/filter-goal-modal/filter-goal-modal.component";
import { EditGoalModalComponent } from "src/app/pages/goals/components/edit-goal-modal/edit-goal-modal.component";
import { GoalFilters } from 'src/app/interfaces/goalFilters.interface';
import { CreateCardComponent } from "src/app/shared/components/create-card/create-card.component";

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
  public userService = inject(UserService);
  public goalService = inject(GoalService);

  public showGoalModal = false;
  public showFilterModal = false;
  public showEditGoalModal = false;

  public goalToEdit: any = null;

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


  public async ionViewWillEnter() {
    this.loadGoals()
    const result: boolean = await this.goalService.checkGoalsForHabit()
    if (result === true) {
      this.loadGoals();
    }
  }

  async loadGoals() {
    try {
      this.loading = true
      this.goals = await this.goalService.getUserGoals();
      this.filteredGoals = this.goalService.filterGoals(this.goals, this.activeFilters, this.searchText);
      this.hasGoals = this.filteredGoals.length > 0;
    } catch {
      this.goals = [];
      this.filteredGoals = [];
      this.hasGoals = false;
    } finally {
      this.loading = false
    }
  }

  public openCreateModal() {
    this.showGoalModal = true;
  }

  public openFilterModal() {
    this.showFilterModal = true
  }
  public openEditGoalModal(goal: GoalData) {
    this.goalToEdit = goal;
    this.showEditGoalModal = true;
  }
  public closeModal() {
    this.showGoalModal = false;
    this.showFilterModal = false;
    this.showEditGoalModal = false;

    this.loadGoals()
  }

  public async deleteGoal(goal: GoalData) {
    try {
      Swal.fire({ title: "Tem certeza?", text: "Você perderá tudo relacionado a meta excluída!", icon: "warning", heightAuto: false, showCancelButton: true, confirmButtonColor: "#1976d2", cancelButtonColor: "#d33", confirmButtonText: "Sim, desejo deletar." })
        .then((result) => {
          if (result.isConfirmed) {
            this.goalService.deleteGoal(goal.id);
            this.goals = this.goals.filter(g => g.id !== goal.id);
            this.loadGoals()
            Swal.fire({ title: 'Excluido', text: 'Meta excluída com sucesso', icon: 'success', heightAuto: false, confirmButtonColor: '#E0004D' });
          }
        });
    } catch (err: unknown) {
      if (err instanceof Error) {
        Swal.fire({ title: 'Erro', text: 'Não foi possivel excluir a meta', icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      } else {
        Swal.fire({ title: 'Erro', text: 'Ocorreu um erro desconhecido', icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      }
    }
  }

  public restoreGoal(goal: GoalData) {
    try {
      Swal.fire({
        title: "Tem certeza?", text: "Tem certeza de que deseja restaurar esta meta? Essa ação não pode ser desfeita.", icon: "warning", heightAuto: false, showCancelButton: true, confirmButtonColor: "#1976d2", cancelButtonColor: "#d33", confirmButtonText: "Sim, desejo restaurar."
      }).then((result) => {
        if (result.isConfirmed) {
          this.goalService.restoreGoal(goal)
          Swal.fire({
            title: 'Restaurada', text: 'Meta restaurada com sucesso', icon: 'success', heightAuto: false, confirmButtonColor: '#E0004D'
          });
        }
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        Swal.fire({ title: 'Erro', text: 'Não foi possivel restaurar a meta', icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      } else {
        Swal.fire({ title: 'Erro', text: 'Ocorreu um erro desconhecido', icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      }
    }
  }

  public cancelGoal(goal: GoalData) {
    try {
      Swal.fire({
        title: "Tem certeza?", text: "Tem certeza de que deseja cancelar está meta?", icon: "warning", heightAuto: false, showCancelButton: true, confirmButtonColor: "#1976d2", cancelButtonColor: "#d33", confirmButtonText: "Sim, desejo restaurar."
      }).then((result) => {
        if (result.isConfirmed) {
          this.goalService.cancelGoal(goal)
          Swal.fire({
            title: 'Cancelada', text: 'Meta cancelada com sucesso', icon: 'success', heightAuto: false, confirmButtonColor: '#E0004D'
          });
        }
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        Swal.fire({ title: 'Erro', text: 'Não foi possivel cancelar a meta', icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      } else {
        Swal.fire({ title: 'Erro', text: 'Ocorreu um erro desconhecido', icon: 'error', heightAuto: false, confirmButtonColor: '#E0004D' });
      }
    }
  }

  public completeGoal(goal: GoalData) {
    this.goalService.completeGoal(goal)
  }

  public onFiltersApplied(filters: GoalFilters) {
    this.activeFilters = filters;
    this.filteredGoals = this.goalService.filterGoals(this.goals, filters, this.searchText);
    return this.activeFilters
  }

  public onSearchChange() {
    this.filteredGoals = this.goalService.filterGoals(this.goals, this.activeFilters, this.searchText);
  }
}
