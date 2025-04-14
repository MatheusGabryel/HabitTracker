import { Component, OnInit } from '@angular/core';
import { MenuService } from 'src/app/services/menu.service';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { menuOutline, } from 'ionicons/icons';
import { IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonIcon, CommonModule]
})
export class HeaderComponent {

    menuOpen = false;
    isMobile = false;
  
    constructor(public menuService: MenuService) {
      addIcons({menuOutline});
    }
    toggleMenu() {
      this.menuService.toggleMenu();
    }

  ngOnInit() {}

}
