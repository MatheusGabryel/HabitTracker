import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _isMobile = new BehaviorSubject(window.innerWidth <= 768);
  private _menuOpen = new BehaviorSubject(!this._isMobile.value);

  public menuOpen$ = this._menuOpen.asObservable();
  public isMobile$ = this._isMobile.asObservable();

  constructor() {
    window.addEventListener('resize', () => {
      const isMobile = window.innerWidth <= 768;
      this._isMobile.next(isMobile);

      if (!isMobile) this.setMenuOpen(true);
    });
  }

  public setMenuOpen(open: boolean) {
    this._menuOpen.next(open);
  }

  public toggleMenu() {
    this._menuOpen.next(!this._menuOpen.value);
  }

  get isOpen(): boolean {
    return this._menuOpen.value;
  }

  get isMobile(): boolean {
    return this._isMobile.value;
  }
}

