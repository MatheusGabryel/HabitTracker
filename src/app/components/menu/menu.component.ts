import { Component, OnInit } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, homeSharp, leafOutline, folderOutline, flagOutline, cogOutline, helpOutline, menuOutline, chevronDownOutline} from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular';

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

  

  constructor(
    private alertController: AlertController,
    private authService: AuthService,
    private router: Router) { 
    addIcons({
          homeOutline, homeSharp, leafOutline, folderOutline, flagOutline, cogOutline, helpOutline, menuOutline, chevronDownOutline
        })
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirmação',
      message: 'Deseja realmente sair da conta?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          handler: async () => {
            await this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }

  ngOnInit() {}

}
