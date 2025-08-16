import { GoalCardComponent } from './../../components/goal-card/goal-card.component';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './../../components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../components/header/header.component";
import { CreateGoalModalComponent } from "../../components/create-goal-modal/create-goal-modal.component";
import { animate, style, transition, trigger } from '@angular/animations';
import { UserService } from 'src/app/services/user/user.service';
import { GoalData } from 'src/app/interfaces/goal.interface';
import Swal from 'sweetalert2';
import { Loading } from 'notiflix';
import { GoalService } from 'src/app/services/goal/goal.service';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  standalone: true,
  imports: [IonContent, MenuComponent, CommonModule, HeaderComponent, CreateGoalModalComponent, GoalCardComponent],
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
  public userService = inject(UserService);
  public goalService = inject(GoalService);
  public loading: boolean = true;
  public hasGoals: boolean = false;
  public goals: any[] = [];

  public openModal() {
    this.showGoalModal = true;
  }

  public closeModal() {
    this.showGoalModal = false;
  }

  public tabs = ['Em andamento', 'Concluído', 'Falhado']
  constructor() { }

  async ngOnInit() {
    this.loadGoals()
  }

  async loadGoals() {
    try {
      this.loading = true
      const uid = await this.userService.getUserId();
      if (!uid) throw new Error('Usuário não autenticado');

      this.goals = await this.goalService.getUserGoals();
      console.log(this.goals)
      this.hasGoals = this.goals.length > 0;
      this.loading = false;
    } catch {
      this.goals = [];
    }
  }

  async progressGoalInput(goal: GoalData): Promise<number | null> {
    const maxAllowed = goal.targetValue! * 100;

    const { value: inputValue } = await Swal.fire({
      title: 'Registrar progresso',
      heightAuto: false,
      text: `Informe seu progresso na meta: "${goal.name}"`,
      input: 'number',
      inputAttributes: {
        min: '0',
        max: maxAllowed < 100000 ? String(maxAllowed) : '100000',
        placeholder: 'Ex: 3'
      },
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancelar',

      inputValidator: (value) => {
        const num = Number(value);
        if (isNaN(num) || num <= 0 || num > maxAllowed) {
          return 'Insira um valor válido.';
        }
        return null;

      },
      didOpen: () => {
        const input = document.querySelector('.swal2-input');
        if (input) input.classList.add('swal2-input-wide');
      }
    });
    if (inputValue === undefined) return null;
    return Number(inputValue);
  }




  async completeGoal(goal: GoalData) {
    const uid = await this.userService.getUserId();
    if (!uid) return;
    const inputValue = await this.progressGoalInput(goal);
    if (inputValue == null) return;

    const target = goal.targetValue ?? 0;
    let progressValue = inputValue + goal.progressValue;
    const state: GoalData['state'] = progressValue >= target ? 'completed' : 'in_progress';


    await this.goalService.updateGoalProgress(goal.id, {
      state,
      progressValue,
    }, uid);

    goal.state = state;
    goal.progressValue = progressValue;
  }
}
