import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _menuOpen = new BehaviorSubject<boolean>(false);
  public menuOpen$ = this._menuOpen.asObservable();
  private _isMobile = new BehaviorSubject<boolean>(window.innerWidth <= 768);
  public isMobile$ = this._isMobile.asObservable();
  public isMobile = window.innerWidth <= 768;

  constructor() {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
      this._isMobile.next(this.isMobile);
      if (!this.isMobile) {
        this.setMenuOpen(false); // Fecha menu flutuante se voltar pro desktop
      }
    });
  }

  setMenuOpen(open: boolean) {
    this._menuOpen.next(open);
  }

  toggleMenu() {
    this._menuOpen.next(!this._menuOpen.value);
  }

  get isOpen() {
    return this._menuOpen.value;
  }

}
