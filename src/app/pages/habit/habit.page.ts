import { UserService } from '../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { CreateCardComponent } from "../../shared/components/create-card/create-card.component";
import { HabitCardComponent } from "./components/habit-card/habit-card.component";
import { CreateHabitModalComponent } from "./components/create-habit-modal/create-habit-modal.component";
import { trigger, transition, style, animate } from '@angular/animations';
import { CreateListModalComponent } from "./components/create-list-modal/create-list-modal.component";
import { Loading } from 'notiflix';
import Swal from 'sweetalert2';
import { HabitData } from 'src/app/interfaces/habit.interface';
import { HabitList } from 'src/app/interfaces/habit.interface';
import { FormsModule } from '@angular/forms';
import { HabitService } from 'src/app/services/habit/habit.service';
import { EditHabitModalComponent } from "./components/edit-habit-modal/edit-habit-modal.component";
import { EditListsModalComponent } from "src/app/pages/habit/components/edit-lists-modal/edit-lists-modal.component";

@Component({
  selector: 'app-habit',
  templateUrl: './habit.page.html',
  styleUrls: ['./habit.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [FormsModule, IonContent, MenuComponent, CommonModule, HeaderComponent, CreateCardComponent, HabitCardComponent, CreateHabitModalComponent, CreateListModalComponent, EditHabitModalComponent, EditListsModalComponent],
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
  public userService = inject(UserService);

  readonly DEFAULT_TAB = 'Ver tudo';

  public tabs: (HabitList | { name: string; id: string | null })[] = [];
  public habits: HabitData[] = [];
  public lists: HabitList[] = [];
  public filteredHabits: HabitData[] = [];
  public filteredLists: HabitList[] = [];

  public activeTab: string = this.DEFAULT_TAB;
  public searchText: string = '';

  public today: Date = new Date()

  public hasHabits: boolean = false;
  public loading: boolean = true;
  public showHabitModal: boolean = false;
  public showListModal: boolean = false;
  public showEditHabitModal: boolean = false;
  public showEditListsModal: boolean = false;

  public habitToEdit: HabitData | null = null;

  public tableHeaders: { key: 'name' | 'category' | 'state' | 'priority'; label: string; class: string }[] = [
    { key: 'name', label: 'Nome', class: 'name' },
    { key: 'category', label: 'Categoria', class: 'category' },
    { key: 'state', label: 'Status', class: 'status' },
    { key: 'priority', label: 'Prioridade', class: 'priority' }
  ];

  public async ngOnInit() {
    this.loadLists();
    this.loadHabitsForActiveTab(this.DEFAULT_TAB);
  }

  public openHabitModal() {
    this.showHabitModal = true;
  }
  public openListModal() {
    this.showListModal = true;
  }

  public openEditListsModal() {
    this.showEditListsModal = true;
  }

  public openEditHabitModal(habit: HabitData) {
    this.habitToEdit = habit;
    this.showEditHabitModal = true;
  }

  public closeModal() {
    this.showHabitModal = false;
    this.showListModal = false;
    this.showEditHabitModal = false;
    this.showEditListsModal = false;
    this.habitToEdit = null;

    this.loadLists();
    this.loadHabitsForActiveTab(this.activeTab);
  }

  public async loadHabitsForActiveTab(tabName: string, list?: HabitList) {
    this.loading = true
    const uid = await this.userService.getUserId();
    if (!uid) throw new Error('Usuário não autenticado');
    this.habits = await this.habitService.getHabitsWithLogs();

    if (!list && tabName !== this.DEFAULT_TAB) {
      list = this.tabs.find(tab => tab.name === tabName && tab.id) as HabitList;
    }

    if (tabName === this.DEFAULT_TAB) {
      this.habits
    } else if (list) {
      this.habits = await this.habitService.getHabitsByCategories(uid, list.categories);
    } else {
      this.habits = [];
    }

    this.applySearchFilter();
    this.hasHabits = this.filteredHabits.length > 0;
    this.loading = false;
  }

  public async loadLists() {
    const uid = await this.userService.getUserId();
    if (uid) {
      const lists = await this.habitService.getHabitLists(uid);
      this.lists = lists
      const filteredLists = lists.filter(l => l.isVisible !== false);
      this.tabs = [{ name: this.DEFAULT_TAB, id: null }, ...filteredLists];
    }
  }

  public async deleteHabit(habitId: string) {
    try {
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
          this.habitService.deleteHabit(habitId);
          this.filteredHabits = this.filteredHabits.filter(h => h.id !== habitId);

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

  public async deleteList(event: any) {
    const listId = event as string;

    const uid = await this.userService.getUserId();
    if (!uid) return;
    Swal.fire({
      title: "Tem certeza?",
      text: "Deseja deletar esta lista?",
      icon: "warning",
      heightAuto: false,
      showCancelButton: true,
      confirmButtonColor: "#1976d2",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, desejo deletar."
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          this.habitService.deleteHabitList(listId);
          this.tabs = this.tabs.filter(l => l.id !== listId);
          this.lists = this.lists.filter(l => l.id !== listId)

          Swal.fire({
            title: 'Excluido',
            text: 'Lista excluido com sucesso',
            icon: 'success',
            heightAuto: false,
            confirmButtonColor: '#E0004D'
          });
          Loading.remove()
        } catch (error) {
          Swal.fire({
            title: 'Falhou',
            text: 'Falhou',
            icon: 'success',
            heightAuto: false,
            confirmButtonColor: '#E0004D'
          });
          Loading.remove()
        }
      }

    });
  }

  public async setActive(tabName: string) {
    this.activeTab = tabName;

    const list = this.tabs.find(tab => tab.name === tabName && tab.id);
    await this.loadHabitsForActiveTab(tabName, list as HabitList);
  }

  public async toggleVisibility(listId: string) {
    const uid = await this.userService.getUserId();
    if (!uid) return;

    const lists = await this.habitService.getHabitLists(uid);
    const list = lists.find(tab => tab.id === listId);
    if (!list) return;

    const newVisibility = !list.isVisible;

    await this.habitService.updateListVisibility(uid, listId, newVisibility);
    if (!newVisibility && this.activeTab === list.name) {
      this.setActive(this.DEFAULT_TAB);
    }
    this.loadLists()
  }


  public applySearchFilter() {
    const search = this.searchText.toLowerCase();
    this.filteredHabits = this.habits.filter(habit =>
      habit.name.toLowerCase().includes(search)
    );
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

      // if (key === 'state') {
      //   const order = ['completed', 'not_completed', 'in_progress'];
      //   const aIndex = order.indexOf(a.state);
      //   const bIndex = order.indexOf(b.state);
      //   console.log((aIndex - bIndex) * directionFactor)
      //   return (aIndex - bIndex) * directionFactor;
      // }

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
}
