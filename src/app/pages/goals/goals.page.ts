import { CommonModule } from '@angular/common';
import { MenuComponent } from './../../components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonContent, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../components/header/header.component";
import { CreateCardComponent } from "../../components/create-card/create-card.component";
import { CreateGoalModalComponent } from "../../components/create-goal-modal/create-goal-modal.component";
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  standalone: true,
  imports: [IonRow, IonCol, IonGrid, IonContent, MenuComponent, CommonModule, HeaderComponent, CreateGoalModalComponent],
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

  public openModal() {
    this.showGoalModal = true;
  }

  public closeModal() {
    this.showGoalModal = false;
  }

  constructor() { }

  ngOnInit() {
  }

}
