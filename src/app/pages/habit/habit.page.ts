import { UserService } from '../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../components/header/header.component";
import { CreateCardComponent } from "../../components/create-card/create-card.component";
import { HabitCardComponent } from "../../components/habit-card/habit-card.component";
import { CreateHabitModalComponent } from "../../components/create-habit-modal/create-habit-modal.component";
import { trigger, transition, style, animate } from '@angular/animations';
import { CreateListModalComponent } from "../../components/create-list-modal/create-list-modal.component";
import { Loading } from 'notiflix';
import Swal from 'sweetalert2';
import { HabitData } from 'src/app/interfaces/habit.interface';
import { HabitList } from 'src/app/interfaces/habit.interface';
import { FormsModule } from '@angular/forms';
import { register } from 'swiper/element/bundle';
import { HabitLog } from 'src/app/interfaces/habit.interface';
import { HabitService } from 'src/app/services/habit/habit.service';
register()

@Component({
  selector: 'app-habit',
  templateUrl: './habit.page.html',
  styleUrls: ['./habit.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [FormsModule, IonContent, MenuComponent, CommonModule, HeaderComponent, CreateCardComponent, HabitCardComponent, CreateHabitModalComponent, CreateListModalComponent],
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
  public habitService = inject(HabitService)
  public logsByHabit: { [habitId: string]: { [date: string]: HabitLog } } = {};
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
  constructor() { 
;
  }

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

  completeHabit(habit: any, dateIso: string) {
      this.habitService.completeHabit(habit, dateIso);
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
          this.habitService.deleteHabit(uid, habitId);
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
      const lists = await this.habitService.getHabitLists(uid);
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
      this.habits = await this.habitService.getUserHabits(uid);
    } else if (list) {
      this.habits = await this.habitService.getHabitsByCategories(uid, list.categories);
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
