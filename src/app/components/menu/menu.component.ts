import { Component, OnInit } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, homeSharp, leafOutline, folderOutline, flagOutline, cogOutline, helpOutline, menuOutline, chevronDownOutline} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [IonIcon, CommonModule, RouterLink],
})
export class MenuComponent  implements OnInit {
  isMenuOpen = false;
  public showSubMenu = false;

  toggleSidebar() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  

  constructor() { 
    addIcons({
          homeOutline, homeSharp, leafOutline, folderOutline, flagOutline, cogOutline, helpOutline, menuOutline, chevronDownOutline
        })
  }

  ngOnInit() {}

}
