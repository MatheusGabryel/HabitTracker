import { Component, OnInit, EventEmitter, Output, inject } from '@angular/core';
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
export class MenuComponent implements OnInit {
  public showSubMenu = false;
  public router = inject(Router)
   public menuService = inject(MenuService)

  @Output() closeMenu = new EventEmitter<void>();

  constructor(
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
