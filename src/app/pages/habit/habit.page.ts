import { UserService } from './../../services/user.service';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './../../components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, inject, Output } from '@angular/core';
import { IonContent, IonGrid, IonCol, IonRow, IonSpinner } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../components/header/header.component";
import { CreateCardComponent } from "../../components/create-card/create-card.component";
import { HabitCardComponent } from "../../components/habit-card/habit-card.component";
import { CreateHabitModalComponent } from "../../components/create-habit-modal/create-habit-modal.component";
import { trigger, transition, style, animate } from '@angular/animations';
import { CreateListModalComponent } from "../../components/create-list-modal/create-list-modal.component";
import { Loading } from 'notiflix';
import Swal from 'sweetalert2';
import { HabitData } from 'src/app/interfaces/habit.interface';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-habit',
  templateUrl: './habit.page.html',
  styleUrls: ['./habit.page.scss'],
  standalone: true,
  imports: [IonRow, IonCol, IonGrid, IonContent, MenuComponent, CommonModule, HeaderComponent, CreateCardComponent, HabitCardComponent, CreateHabitModalComponent, CreateListModalComponent],
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
export class HabitPage {

  public userService = inject(UserService);
  public alertController = inject(AlertController)
  public habits: any[] = [];
  public tabs: any[] = [];
  public activeTab: string = 'Ver tudo';
  public activeListHabits: any[] = [];
  public hasHabits: boolean = false;
  public loading: boolean = true;

  constructor() { }

  async ngOnInit() {
    this.loadLists();
    this.loadHabitsForActiveTab('Ver tudo');
  }
  showHabitModal = false;
  showListModal = false;

  openHabitModal() {
    this.showHabitModal = true;
  }

  private getNextStateYesNo(currentState: HabitData['state']): HabitData['state'] {
    const states: HabitData['state'][] = ['in_progress', 'completed', 'not_completed'];
    const nextIndex = (states.indexOf(currentState) + 1) % states.length;
    return states[nextIndex];
  }
  async presentTimesInputAlert(habit: HabitData): Promise<number | null> {
    return new Promise(async (resolve) => {
      const maxAllowed = habit.timesTarget!.value * 1000;
      const alert = await this.alertController.create({
        header: 'Registrar progresso',
        message: `Quantas vezes você realizou o hábito "${habit.name}"?`,
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
              if (inputValue >= 0 && inputValue <= (maxAllowed < 1000000 ? maxAllowed : 1000000)) {

                resolve(inputValue);
                return true;
              } else {
                setTimeout(async () => {
                  const invalidAlert = await this.alertController.create({
                    header: 'Valor inválido',
                    message: `Quantas vezes você realizou o hábito "${habit.name}"?\n(Máx: ${Math.min(maxAllowed, 100000)} vezes)`,
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

  async presentTimeInputAlert(habit: HabitData): Promise<number | null> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Registrar progresso',
        message: `Em quanto tempo realizou o hábito "${habit.name}"?`,
        inputs: [
          {
            name: 'hours',
            type: 'number',
            placeholder: 'Horas',
            min: 0,
          },
          {
            name: 'minutes',
            type: 'number',
            placeholder: 'Minutos',
            min: 0,
          },
          {
            name: 'seconds',
            type: 'number',
            placeholder: 'Segundos',
            min: 0,
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
            handler: (data: { hours?: string; minutes?: string; seconds?: string }) => {
              const inputValue = (Number(data.hours) || 0) * 3600 + (Number(data.minutes) || 0) * 60 + (Number(data.seconds) || 0);
              if (inputValue >= 0) {
                resolve(inputValue);
                return true;
              } else {
                setTimeout(async () => {
                  const invalidAlert = await this.alertController.create({
                    header: 'Tempo inválido',
                    message: 'Insira um tempo válido',
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


  private calcNewStateTimes(habit: HabitData, inputValue: number) {
    const rule = habit.timesTarget?.rule;
    const target = habit.timesTarget?.value ?? 0;
    let progressValue = inputValue;

    let state: HabitData['state'] = 'in_progress';

    switch (rule) {
      case 'equal':
        state = inputValue === target ? 'completed' : 'in_progress';
        break;
      case 'at_least':
        state = inputValue >= target ? 'completed' : 'in_progress';
        break;
      case 'at_most':
        state = inputValue > target ? 'not_completed' : 'in_progress';
        break;
      case 'any':
        state = 'completed';
        break;
    }

    return { state, progressValue };
  }

  private calcNewStateTime(habit: HabitData, inputValue: number) {

    const rule = habit.timeTarget?.rule;
    const targetSeconds = ((habit.timeTarget?.hours ?? 0) * 3600) +
      ((habit.timeTarget?.minutes ?? 0) * 60) +
      (habit.timeTarget?.seconds ?? 0);

    let state: HabitData['state'] = 'in_progress';

    switch (rule) {
      case 'equal':
        state = inputValue === targetSeconds ? 'completed' : 'in_progress';
        break;
      case 'at_least':
        state = inputValue >= targetSeconds ? 'completed' : 'in_progress';
        break;
      case 'at_most':
        state = inputValue > targetSeconds ? 'not_completed' : 'in_progress';
        break;
      case 'any':
        state = 'completed';
        break;
    }

    return { state, progressValue: inputValue };
  }

  async completeHabit(habit: HabitData) {
    const uid = await this.userService.getUserId();
    if (!uid) return;

    if (habit.progressType === 'yes_no') {
      const newState = this.getNextStateYesNo(habit.state);
      await this.userService.updateHabitState(habit.id, newState, uid);
      habit.state = newState;
      console.log('Novo estado:', habit.state);
    }

    if (habit.progressType === 'times') {
      const inputValue = await this.presentTimesInputAlert(habit);
      if (inputValue == null) return;

      const { state, progressValue } = this.calcNewStateTimes(habit, inputValue);
      await this.userService.updateHabitProgress(habit.id, {
        state,
        progressValue,
      }, uid);

      habit.state = state;
      habit.progressValue = progressValue;
      console.log('Novo estado:', habit.state);
    }

    if (habit.progressType === 'time') {
      const inputValue = await this.presentTimeInputAlert(habit);
      if (inputValue == null) return;

      const { state, progressValue } = this.calcNewStateTime(habit, inputValue);
      console.log(state, progressValue)
      await this.userService.updateHabitProgress(habit.id, {
        state,
        progressValue,
      }, uid);

      habit.state = state;
      habit.progressValue = progressValue;
      console.log('Novo estado:', habit.state);
    }
  }

 openListModal() {
    this.showListModal = true;
  }

  closeModal() {
    this.showHabitModal = false;
    this.showListModal = false;

    this.loadLists();
    this.loadHabitsForActiveTab(this.activeTab);
  }

  async setActive(tabName: string) {
    this.activeTab = tabName;
    await this.loadHabitsForActiveTab(tabName);
  }

  async deleteHabit(habitId: string) {
    try {
      Loading.standard('Excluindo Hábito...');
      const uid = await this.userService.getUserId();
      if (!uid) return;

      await this.userService.deleteHabit(uid, habitId);
      this.activeListHabits = this.activeListHabits.filter(h => h.id !== habitId);

      Swal.fire({
        title: 'Excluido',
        text: 'Hábito excluido com sucesso',
        icon: 'success',
        heightAuto: false,
        confirmButtonColor: '#E0004D'
      });
      Loading.remove()
    } catch (err: unknown) {
      Loading.remove()
      if (err instanceof Error) {
        console.error(err);
        Swal.fire({
          title: 'Erro',
          text: err.message,
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

  async loadLists() {
    const uid = await this.userService.getUserId();
    if (uid) {
      const lists = await this.userService.getUserLists(uid);
      this.tabs = [{ name: 'Ver tudo', id: null }, ...lists];
    }
    console.log('tabs carregadas', this.tabs);
  }

  async loadHabitsForActiveTab(tabName: string) {
    this.loading = true
    const uid = await this.userService.getUserId();
    if (!uid) throw new Error('Usuário não autenticado');

    if (tabName === 'Ver tudo') {
      this.habits = await this.userService.getUserHabits(uid);
      this.activeListHabits = this.habits;
      this.hasHabits = this.habits.length > 0;
    } else {
      this.activeListHabits = [];
      this.hasHabits = false;
      console.log('hábitos não carregados')
    }
    this.loading = false
  }
}
