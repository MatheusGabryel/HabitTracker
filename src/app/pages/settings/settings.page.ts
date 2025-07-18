import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './../../components/menu/menu.component';

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { menuOutline, } from 'ionicons/icons';
import { MenuService } from 'src/app/services/menu.service';
import { HeaderComponent } from "../../components/header/header.component";
import { ToggleThemeComponent } from "../../shared/ui/toggle-theme/toggle-theme.component";
import { SwitchComponent } from "../../shared/ui/switch/switch.component";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonContent, MenuComponent, CommonModule, HeaderComponent, ToggleThemeComponent, SwitchComponent]
})
export class SettingsPage {
  public currentSection: string = 'account';
  public nome: string = '';
  public email: string = '';

  constructor(public menuService: MenuService, private userService: UserService) {
    addIcons({ menuOutline });
  }

  ngOnInit() {
    this.userService.getUserId().then((uid) => {
      if (uid) {
        this.userService.getUserDoc(uid).then(data => {
          if (data) {
            this.nome = data.displayName;
            this.email = data.email;
          }
        });
      }
    });
  }

  changeSection(section: string) {
    this.currentSection = section
  }



}
