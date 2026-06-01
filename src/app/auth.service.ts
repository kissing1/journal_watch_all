import { Injectable, signal } from '@angular/core';
import { LoginRes, User } from './model/res/login_res';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoggedIn = signal(!!localStorage.getItem('auth_token'));
  private _user = signal<User | null>(this.loadUser());

  get isLoggedIn(): boolean {
    return this._isLoggedIn();
  }

  get user(): User | null {
    return this._user();
  }

  get token(): string | null {
    return localStorage.getItem('auth_token');
  }

  get userPicture(): string {
    return localStorage.getItem('auth_picture') ?? '';
  }

  setLoggedIn(res: LoginRes, picture: string = ''): void {
    localStorage.setItem('auth_token', res.data.accessToken);
    localStorage.setItem('auth_user', JSON.stringify(res.data.user));
    localStorage.setItem('auth_picture', picture);
    this._isLoggedIn.set(true);
    this._user.set(res.data.user);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_picture');
    this._isLoggedIn.set(false);
    this._user.set(null);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  }
}
