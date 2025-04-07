import { CommonModule } from '@angular/common';
import { MenuComponent } from './../../components/menu/menu.component';
import { Component } from '@angular/core';
import { IonIcon, IonContent, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle, notifications, menu } from 'ionicons/icons';

@Component({
  selector: 'app-habit',
  templateUrl: './habit.page.html',
  styleUrls: ['./habit.page.scss'],
  standalone: true,
  imports: [IonRow, IonCol, IonGrid, IonContent, IonIcon, MenuComponent, CommonModule]
})
export class HabitPage {

  constructor() { }

  ngOnInit() {
  }

}
