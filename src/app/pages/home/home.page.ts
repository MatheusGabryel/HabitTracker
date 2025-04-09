import { MenuComponent } from './../../components/menu/menu.component';
import { Component, OnInit } from '@angular/core';
import { IonIcon, IonContent, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle, notifications, menu } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonRow, IonCol, IonGrid, IonContent, IonIcon, MenuComponent, CommonModule],
})
export class HomePage {
  userData: any;;
  user$ = this.authService.getUser();

  constructor(private authService: AuthService) {
    addIcons({
      personCircle, notifications, menu
    })
  }
  ngOnInit() {

  }

}
