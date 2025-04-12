import { MenuComponent } from './../../components/menu/menu.component';
import { Component, OnInit } from '@angular/core';
import { IonContent, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable, switchMap, of } from 'rxjs';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonRow, IonCol, IonGrid, IonContent, MenuComponent, CommonModule],
})
export class HomePage {
  userData: any;;
  user$ = this.authService.getUser();
  displayName = '';
  email = ''
  userData$!: Observable<any>;

  constructor(private authService: AuthService) {
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