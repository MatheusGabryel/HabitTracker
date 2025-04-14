import { CommonModule } from '@angular/common';
import { MenuComponent } from './../../components/menu/menu.component';

import { Component } from '@angular/core';
import { IonContent, IonGrid, IonCol, IonRow } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { menuOutline, } from 'ionicons/icons';
import { MenuController } from '@ionic/angular';
import { MenuService } from 'src/app/services/menu.service';
import { HeaderComponent } from "../../components/header/header.component";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonRow, IonCol, IonGrid, IonContent, MenuComponent, CommonModule, HeaderComponent]
})
export class SettingsPage {

  constructor(public menuService: MenuService) {
    addIcons({menuOutline});
  }

  // checkViewport() {
  //   this.isMobile = window.innerWidth <= 768;
  //   window.addEventListener('resize', () => {
  //     this.isMobile = window.innerWidth <= 768;
  //     if (!this.isMobile) {
  //       this.menuOpen = false; // Fecha menu flutuante ao voltar pro desktop
  //     }
  //   });
  // }

  ngOnInit() {

  }

}
