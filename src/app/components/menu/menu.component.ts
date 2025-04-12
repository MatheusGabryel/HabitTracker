import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { menuOutline, chevronDownOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [IonIcon, CommonModule, RouterLink],
})
export class MenuComponent implements OnInit {
  isMenuOpen = false;
  public showSubMenu = false;


  constructor(
    private alertController: AlertController,
    private authService: AuthService,
    public menuService: MenuService,
    private router: Router) {
    addIcons({
      menuOutline, chevronDownOutline
    })
  }

  toggleSidebarDesktop() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  isMobile = window.innerWidth <= 768;
  isOpen = false;

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  @Output() closeMenu = new EventEmitter<void>();

  get isMobileView(): boolean {
    return window.innerWidth <= 768;
  }

  close() {
    this.menuService.setMenuOpen(false);
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

  ngOnInit() { }

}
