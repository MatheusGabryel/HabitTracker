import { Component, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { menuOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MenuService } from 'src/app/services/menu/menu.service';
import { UserService } from 'src/app/services/user/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonIcon, CommonModule, RouterLink]
})
export class HeaderComponent {

  private menuService = inject(MenuService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private elementRef = inject(ElementRef);
  private router = inject(Router);

  public name: string = '';
  public email: string = '';
  public avatar: string = '';

  public isModalOpen: boolean = false;
  public isOpen: boolean = false;
  public isMobile: boolean = false;

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

  constructor() {
    addIcons({ menuOutline });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const route = event.urlAfterRedirects.split('/')[1];
        this.routerName = route;
        this.pageTitle = this.routeToTitleMap[route] || 'App';
        this.closeUserMenu();
      }
    });

  }

  public ngOnInit() {
    const cachedUser = localStorage.getItem('userDoc');
    if (cachedUser) {
      const data = JSON.parse(cachedUser);
      this.name = data.displayName;
      this.email = data.email;
      this.avatar = data.avatar;
    }

    this.userService.getUserId().then((uid) => {
      if (uid) {
        this.userService.getUserDoc(uid).then((data) => {
          if (data) {
            this.name = data.displayName;
            this.email = data.email;
            this.avatar = data.avatar;
            localStorage.setItem('userDoc', JSON.stringify(data));
          }
        });
      }
    });
  }

  public toggleMenu() {
    this.menuService.toggleMenu();
  }

  public toggleOptionsMenu() {
    this.isOpen = !this.isOpen;
  }

  public closeUserMenu() {
    this.isOpen = false;
  }

  public async logout() {
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
      try {
        await this.authService.logout();
        this.router.navigate(['/login']);
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Não foi possível sair. Tente novamente.',
          icon: 'error',
          heightAuto: false,
        });
      }
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
