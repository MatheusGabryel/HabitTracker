import { UserService } from './../../services/user.service';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './../../components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonContent, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../components/header/header.component";
import { CreateCardComponent } from "../../components/create-card/create-card.component";
import { HabitCardComponent } from "../../components/habit-card/habit-card.component";
import { CreateHabitModalComponent } from "../../components/create-habit-modal/create-habit-modal.component";
import { trigger, transition, style, animate } from '@angular/animations';
import { CreateListModalComponent } from "../../components/create-list-modal/create-list-modal.component";
import { Loading } from 'notiflix';

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


  constructor() { }

  ngOnInit() {
    this.loadLists();
    this.loadHabitsForActiveTab('Ver tudo');
  }
  tabs: any[] = [];
  activeTab: string = 'Ver tudo';
  activeListHabits: any[] = [];

  showHabitModal = false;
  showListModal = false;

  openHabitModal() {
    this.showHabitModal = true;
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



  async loadLists() {
    const uid = await this.userService.getUserId();
    if (uid) {
      // Obter listas do Firestore
      const lists = await this.userService.getUserLists(uid);
      this.tabs = [{ name: 'Ver tudo', id: null }, ...lists];
    }
    console.log('tabs carregadas', this.tabs);
  }

  async loadHabitsForActiveTab(tabName: string) {
    const uid = await this.userService.getUserId();
    if (!uid) throw new Error('Usuário não autenticado');

    if (tabName === 'Ver tudo') {
      // Carregar todos os hábitos
      this.activeListHabits = await this.userService.getUserHabits(uid);
    } else {

      console.log('hábitos não carregados')
    }
  }
}
