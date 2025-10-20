import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  private isGuestSubject = new BehaviorSubject<boolean>(false);
  isGuest$ = this.isGuestSubject.asObservable();

  private menuState = new BehaviorSubject<boolean>(true);
  menuState$ = this.menuState.asObservable();

  private showIcons = new BehaviorSubject<boolean>(true);
  showIcons$ = this.showIcons.asObservable();

  constructor() { }

  setMenuState(state: boolean) {
    this.menuState.next(state);
  }

  getMenuState() {
    return this.menuState$;
  }

  setShowIcons(state: boolean) {
    this.showIcons.next(state);
  }

  getShowIcons() {
    return this.showIcons$;
  }
  setGuest(state: boolean) {
    this.isGuestSubject.next(state);
    if (state) localStorage.setItem('guestAccess', 'true');
    else localStorage.removeItem('guestAccess');
  }

  getGuest(): boolean {
    return this.isGuestSubject.getValue();
  }
}
