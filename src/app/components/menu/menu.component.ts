import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { menuOutline, chevronDownOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MenuService } from 'src/app/services/menu.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [IonIcon, CommonModule, RouterLink],
})
export class MenuComponent implements OnInit {
  public showSubMenu = false;

  @Output() closeMenu = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    public menuService: MenuService,
    private router: Router
  ) {
    addIcons({
      menuOutline,
      chevronDownOutline
    });
  }

  ngOnInit() { }

  isRouteActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  toggleSidebarDesktop(): void {
    this.menuService.toggleMenu();
  }

  close(): void {
    this.menuService.setMenuOpen(false);
  }
}
