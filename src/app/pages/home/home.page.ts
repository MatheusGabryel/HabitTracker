import { MenuComponent } from './../../components/menu/menu.component';
import { Component } from '@angular/core';
import { IonIcon, IonContent, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle, notifications, menu } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonRow, IonCol, IonGrid, IonContent, IonIcon, MenuComponent],
})
export class HomePage {

  
  constructor() {
    addIcons({
      personCircle, notifications, menu
    })
  }
}
