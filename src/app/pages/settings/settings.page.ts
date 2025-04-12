import { CommonModule } from '@angular/common';
import { MenuComponent } from './../../components/menu/menu.component';
import { Component } from '@angular/core';
import { IonContent, IonMenuButton, IonGrid, IonCol, IonRow, IonHeader, IonIcon, IonToolbar, IonTitle, IonList, IonItem, IonMenu, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { menuOutline, } from 'ionicons/icons';
import { MenuController } from '@ionic/angular';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonButtons, IonMenuButton, IonItem, IonList, IonTitle, IonToolbar, IonIcon, IonHeader, IonRow, IonCol, IonGrid, IonContent, IonMenu, MenuComponent, CommonModule]
})
export class SettingsPage {

  menuOpen = false;
  isMobile = false;

  constructor(public menuService: MenuService) {
    addIcons({menuOutline});
  }
  toggleMenu() {
    this.menuService.toggleMenu();
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
