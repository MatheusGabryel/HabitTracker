import { GoalCardComponent } from './../../components/goal-card/goal-card.component';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './../../components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonContent, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../components/header/header.component";
import { CreateCardComponent } from "../../components/create-card/create-card.component";
import { CreateGoalModalComponent } from "../../components/create-goal-modal/create-goal-modal.component";
import { animate, style, transition, trigger } from '@angular/animations';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  standalone: true,
  imports: [IonRow, IonCol, IonGrid, IonContent, MenuComponent, CommonModule, HeaderComponent, CreateGoalModalComponent, GoalCardComponent],
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
  public loading: boolean = true;
  public hasHabits: boolean = false;
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

      this.goals = await this.userService.getUserGoals(uid);
      console.log(this.goals)
      this.hasHabits = this.goals.length > 0;
      this.loading = false;
    } catch {
      this.goals = [];
    }
  }
}
