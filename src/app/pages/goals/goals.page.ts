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
import { GoalData } from 'src/app/interfaces/goal.interface';
import { AlertController } from '@ionic/angular';

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
  public alertController = inject(AlertController)
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

      this.goals = await this.userService.getUserGoals(uid);
      console.log(this.goals)
      this.hasGoals = this.goals.length > 0;
      this.loading = false;
    } catch {
      this.goals = [];
    }
  }


  async progressGoalInput(goal: GoalData): Promise<number | null> {
    return new Promise(async (resolve) => {
      const maxAllowed = goal.targetValue! * 100;
      const alert = await this.alertController.create({
        header: 'Registrar progresso',
        message: `Informe seu progresso na meta: "${goal.name}"?`,
        inputs: [
          {
            name: 'times',
            type: 'number',
            placeholder: 'Ex: 3',
            min: 0,
            max: maxAllowed < 100000 ? maxAllowed : 100000
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: 'OK',
            handler: (data: { times: string }) => {
              const inputValue = Number(data.times);
              if (inputValue >= 0 && inputValue <= maxAllowed) {

                resolve(inputValue);
                return true;
              } else {
                setTimeout(async () => {
                  const invalidAlert = await this.alertController.create({
                    header: 'Valor inválido',
                    message: 'Insira valores válidos.',
                    buttons: ['OK']
                  });
                  await invalidAlert.present();
                }, 0);

                return false;
              }
            }
          }
        ]
      });

      await alert.present();
    });
  }



  async completeGoal(goal: GoalData) {
    const uid = await this.userService.getUserId();
    if (!uid) return;
    const inputValue = await this.progressGoalInput(goal);
    if (inputValue == null) return;

    const target = goal.targetValue ?? 0;
    let progressValue = inputValue + goal.progressValue;
    const state: GoalData['state'] = progressValue >= target ? 'completed' : 'in_progress';


    await this.userService.updateGoalProgress(goal.id, {
      state,
      progressValue,
    }, uid);

    goal.state = state;
    goal.progressValue = progressValue;
  }
}
