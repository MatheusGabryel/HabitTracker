import { Component, EventEmitter, Output, inject } from '@angular/core';
import { addIcons } from 'ionicons';
import { menuOutline, chevronDownOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MenuService } from 'src/app/services/menu/menu.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink],
})
export class MenuComponent {

  private router = inject(Router)
  public menuService = inject(MenuService)

  public showSubMenu = false;

  @Output() closeMenu = new EventEmitter<void>();

  constructor() {
    addIcons({ menuOutline, chevronDownOutline });
  }

  public isRouteActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  public toggleSidebarDesktop(): void {
    this.menuService.toggleMenu();
  }

  public close(): void {
    this.menuService.setMenuOpen(false);
  }
}
