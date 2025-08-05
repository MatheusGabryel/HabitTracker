import { Component, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { menuOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuService } from 'src/app/services/menu/menu.service';
import { UserService } from 'src/app/services/user/user.service';
import { ProfileModalComponent } from '../../components/profile-modal/profile-modal.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonIcon, CommonModule, RouterLink, ProfileModalComponent]
})
export class HeaderComponent {

  private menuService = inject(MenuService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private elementRef = inject(ElementRef);
  private router = inject(Router);

  public nome: string = '';
  public email: string = '';
  public isModalOpen: boolean = false;
  public isOpen: boolean = false;
  public isMobile: boolean = false;
  public menuOpen: boolean = false;
  public routerName: string = '';
  public pageTitle: string = '';
  public routeToTitleMap: { [key: string]: string } = {
    'home': 'Início',
    'habit': 'Hábitos',
    'goals': 'Metas',
    'settings': 'Configurações',
    'help': 'Ajuda',
    'profile': 'Perfil',
  };
  constructor(
  ) {
    addIcons({ menuOutline });
    this.routerName = window.location.pathname.split('/')[1];
    this.pageTitle = this.routeToTitleMap[this.routerName] || 'App';
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.closeUserMenu();
      }
    });
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

  toggleMenu() {
    this.menuService.toggleMenu();
  }

  toggleUserMenu() {
    this.isOpen = !this.isOpen;
  }
  closeUserMenu() {
    this.isOpen = false;
  }
  async logout() {
    const result = await Swal.fire({
      title: 'Confirmação',
      text: 'Deseja realmente sair da conta?',
      icon: 'warning',
      heightAuto: false,
      showCancelButton: true,
      confirmButtonText: 'Sair',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      await this.authService.logout();
      this.router.navigate(['/login']);
    }
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside && this.isOpen) {
      this.closeUserMenu();
    }
  }
}
