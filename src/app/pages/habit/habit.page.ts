import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, inject, Output, ViewChild } from '@angular/core';
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
import { HabitList } from 'src/app/interfaces/habitlist.interface';
import { FormsModule } from '@angular/forms';
import { register } from 'swiper/element/bundle';
import { HabitLog } from 'src/app/interfaces/habitlog.interface';
register()

@Component({
  selector: 'app-habit',
  templateUrl: './habit.page.html',
  styleUrls: ['./habit.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonRow, FormsModule, IonCol, IonGrid, IonContent, MenuComponent, CommonModule, HeaderComponent, CreateCardComponent, HabitCardComponent, CreateHabitModalComponent, CreateListModalComponent],
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

  logs: { [date: string]: HabitLog } = {};
  logsByHabit: { [habitId: string]: { [date: string]: HabitLog } } = {};
  public userService = inject(UserService);
  public habits: any[] = [];
  public tabs: any[] = [];
  readonly DEFAULT_TAB = 'Ver tudo';
  public activeTab: string = this.DEFAULT_TAB;
  public activeListHabits: any[] = [];
  public hasHabits: boolean = false;
  public loading: boolean = true;
  public searchText: string = '';
  public filteredHabits: any[] = [];
  // editingList: HabitList | null = null;
  // editingListName: string = '';
  // allHabits: HabitData[] = [];
  // selectedHabits: Set<string> = new Set();
  today = new Date();
  constructor() { }

  async ngOnInit() {
    this.loadLists();
    this.loadHabitsForActiveTab(this.DEFAULT_TAB);
  }
  public showHabitModal = false;
  public showListModal = false;

  openHabitModal() {
    this.showHabitModal = true;
  }

  public tableHeaders: { key: 'name' | 'category' | 'state' | 'priority'; label: string; class: string }[] = [
    { key: 'name', label: 'Nome', class: 'name' },
    { key: 'category', label: 'Categoria', class: 'category' },
    { key: 'state', label: 'Status', class: 'status' },
    { key: 'priority', label: 'Prioridade', class: 'priority' }
  ];

  onDaySelected(dateIso: string) {
    console.log('Dia clicado:', dateIso);
  }


  private getNextStateYesNo(currentState: HabitData['state']): HabitData['state'] {
    const states: HabitData['state'][] = ['in_progress', 'completed', 'failed'];
    const nextIndex = (states.indexOf(currentState) + 1) % states.length;
    return states[nextIndex];
  }
  async presentTimesInputAlert(habit: HabitData): Promise<number | null> {
    const maxAllowed = habit.timesTarget!.value * 1000;
    const maxLimit = maxAllowed < 100000 ? maxAllowed : 100000;

    const { value: inputValue } = await Swal.fire({
      title: 'Registrar progresso',
      heightAuto: false,
      text: `Quantas vezes você realizou o hábito "${habit.name}"?`,
      input: 'number',
      inputAttributes: {
        min: '0',
        max: maxAllowed < 100000 ? String(maxAllowed) : '100000',
        placeholder: 'Ex: 3',
      },
      inputValidator: (value) => {
        const num = Number(value);
        if (isNaN(num) || num < 0 || num > maxLimit) {
          return `Insira um valor válido entre 0 e ${maxLimit}.`;
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const input = document.querySelector('.swal2-input');
        if (input) input.classList.add('swal2-input-wide');
      }
    });


    if (inputValue === undefined) return null;
    return Number(inputValue);
  }


  async presentTimeInputAlert(habit: HabitData): Promise<number | null> {
    const { value: formValues } = await Swal.fire({
      title: 'Registrar progresso',
      heightAuto: false,
      html: `
      <input type="number" id="swal-hours" class="swal2-input" placeholder="Horas" min="0" />
      <input type="number" id="swal-minutes" class="swal2-input" placeholder="Min" min="0" max="59" />
      <input type="number" id="swal-seconds" class="swal2-input" placeholder="Seg" min="0" max="59" />
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const hours = Number((document.getElementById('swal-hours') as HTMLInputElement).value) || 0;
        const minutes = Number((document.getElementById('swal-minutes') as HTMLInputElement).value) || 0;
        const seconds = Number((document.getElementById('swal-seconds') as HTMLInputElement).value) || 0;

        if (hours < 0 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
          Swal.showValidationMessage('Insira valores válidos para horas, minutos (0-59) e segundos (0-59).');
          return null;
        }
        return { hours, minutes, seconds };
      }
    });

    if (!formValues) return null;

    const totalSeconds = formValues.hours * 3600 + formValues.minutes * 60 + formValues.seconds;
    if (totalSeconds < 0) return null;

    return totalSeconds;
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
        state = inputValue > target ? 'failed' : 'in_progress';
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
        state = inputValue > targetSeconds ? 'failed' : 'in_progress';
        break;
      case 'any':
        state = 'completed';
        break;
    }

    return { state, progressValue: inputValue };
  }

  async completeHabit(habit: HabitData, dateIso: string) {
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
    const logDate = dateIso || new Date().toISOString().split('T')[0];

    await this.userService.logHabitCompletion(uid, habit.id, logDate, habit.state);

    const updatedLogs = {
      ...this.logsByHabit[habit.id],
      [logDate]: {
        habitId: habit.id,
        date: logDate,
        state: habit.state,
        updatedAt: new Date().toISOString(),
      }
    };

    this.logsByHabit = {
      ...this.logsByHabit,
      [habit.id]: updatedLogs
    };
  }

  onLogsUpdated(newLogs: { [date: string]: HabitLog }, habitId: string) {
    this.logsByHabit[habitId] = newLogs;
  }

  public openListModal() {
    this.showListModal = true;
  }

  public closeModal() {
    this.showHabitModal = false;
    this.showListModal = false;

    this.loadLists();
    this.loadHabitsForActiveTab(this.activeTab);
  }

  async setActive(tabName: string) {
    this.activeTab = tabName;

    const list = this.tabs.find(tab => tab.name === tabName && tab.id);
    await this.loadHabitsForActiveTab(tabName, list as HabitList);
  }


  async deleteHabit(habitId: string) {
    try {
      const uid = await this.userService.getUserId();
      if (!uid) return;
      Swal.fire({
        title: "Tem certeza?",
        text: "Você perderá tudo relacionado ao hábito excluído!",
        icon: "warning",
        heightAuto: false,
        showCancelButton: true,
        confirmButtonColor: "#1976d2",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, desejo deletar."
      }).then((result) => {
        if (result.isConfirmed) {
          this.userService.deleteHabit(uid, habitId);
          this.activeListHabits = this.activeListHabits.filter(h => h.id !== habitId);

          Swal.fire({
            title: 'Excluido',
            text: 'Hábito excluido com sucesso',
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
      this.tabs = [{ name: this.DEFAULT_TAB, id: null }, ...lists];
    }
    console.log('tabs carregadas', this.tabs);
  }

  async loadHabitsForActiveTab(tabName: string, list?: HabitList) {
    this.loading = true
    const uid = await this.userService.getUserId();
    if (!uid) throw new Error('Usuário não autenticado');

    if (!list && tabName !== this.DEFAULT_TAB) {
      list = this.tabs.find(tab => tab.name === tabName && tab.id) as HabitList;
    }

    if (tabName === this.DEFAULT_TAB) {
      this.habits = await this.userService.getUserHabits(uid);
    } else if (list) {
      this.habits = await this.userService.getHabitsByCategories(uid, list.categories);
    } else {
      this.habits = [];
    }

    this.applySearchFilter();
    this.hasHabits = this.filteredHabits.length > 0;
    this.loading = false;
  }

  applySearchFilter() {
    const search = this.searchText.toLowerCase();
    this.filteredHabits = this.habits.filter(habit =>
      habit.name.toLowerCase().includes(search)
    );
    this.activeListHabits = this.filteredHabits;
  }

  public sortState: { key: 'name' | 'category' | 'state' | 'priority'; direction: 'asc' | 'desc' } = {
    key: 'name',
    direction: 'asc'
  };

  public sortBy(key: 'name' | 'category' | 'state' | 'priority') {
    if (this.sortState.key === key) {
      this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortState.key = key;
      this.sortState.direction = 'asc';
    }

    this.sortHabits();
  }
  public sortHabits() {
    const key = this.sortState.key;
    const direction = this.sortState.direction;

    const directionFactor = direction === 'asc' ? 1 : -1;

    this.filteredHabits.sort((a, b) => {
      if (key === 'name' || key === 'category') {
        return a[key].localeCompare(b[key]) * directionFactor;
      }

      if (key === 'state') {
        const order = ['completed', 'not_completed', 'in_progress'];
        const aIndex = order.indexOf(a.state);
        const bIndex = order.indexOf(b.state);
        return (aIndex - bIndex) * directionFactor;
      }

      if (key === 'priority') {
        const order = ['high', 'medium-high', 'medium', 'low'];
        const aIndex = order.indexOf(a.priority);
        const bIndex = order.indexOf(b.priority);
        return (aIndex - bIndex) * directionFactor;
      }

      return 0;
    });
  }

  onSearchChange() {
    this.applySearchFilter();
  }


  //   async openEditModal(list: HabitList) {
  //     this.editingList = list;
  //     this.editingListName = list.name;

  //     const uid = await this.userService.getUserId();
  //     if (!uid) return;
  //     const allHabits = await this.userService.getUserHabits(uid);
  //     this.habits = allHabits;

  //     this.selectedHabits = new Set(list.habitIds);
  //   }

  //   toggleHabitSelection(habitId: string) {
  //     if (this.selectedHabits.has(habitId)) {
  //       this.selectedHabits.delete(habitId);
  //     } else {
  //       this.selectedHabits.add(habitId);
  //     }
  //   }
  //   cancelEdit() {
  //     this.editingList = null;
  //     this.editingListName = '';
  //     this.selectedHabits.clear();
  //   }

  //   async saveListChanges() {
  //     if (!this.editingList) return;

  // const uid = await this.userService.getUserId();
  // if (!uid) return;
  //     const updatedList: HabitList = {
  //       ...this.editingList,
  //       name: this.editingListName,
  //       habitIds: Array.from(this.selectedHabits),
  //       updatedAt: new Date()
  //     };

  //     await this.userService.updateUserList(uid, updatedList);

  //     // atualizar localmente
  //     this.editingList = null;
  //     this.editingListName = '';
  //     this.selectedHabits.clear();

  //     // recarregar listas e hábitos
  //     await this.loadLists();
  //     await this.setActive(updatedList.name);
  //   }

}
