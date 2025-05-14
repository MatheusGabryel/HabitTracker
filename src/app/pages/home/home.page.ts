import { MenuComponent } from './../../components/menu/menu.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonContent, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable, switchMap, of } from 'rxjs';
import { HeaderComponent } from "../../components/header/header.component";


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonRow, IonCol, IonGrid, IonContent, MenuComponent, CommonModule, HeaderComponent],
})
export class HomePage {

  constructor(private authService: AuthService) {
  }
  ngOnInit() {
  }
}