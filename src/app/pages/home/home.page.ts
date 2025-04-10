import { MenuComponent } from './../../components/menu/menu.component';
import { Component, OnInit } from '@angular/core';
import { IonIcon, IonContent, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle, notifications, menu } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable, switchMap, of } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonRow, IonCol, IonGrid, IonContent, IonIcon, MenuComponent, CommonModule],
})
export class HomePage {
  userData: any;;
  user$ = this.authService.getUser();
  displayName = '';
  email = ''
  userData$!: Observable<any>;

  constructor(private authService: AuthService) {
    addIcons({
      personCircle, notifications, menu
    })
  }
  ngOnInit() {
    this.userData$ = this.authService.getUser().pipe(
      switchMap((user) => {
        if (user) {
          return this.authService.getUserDataFromFirestore$(user.uid);
        } else {
          return of(null);
        }
      })
    );
  }
}