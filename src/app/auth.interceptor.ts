import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing   = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        // ไม่ refresh ถ้า error มาจาก endpoint /auth/refresh เอง (ป้องกัน loop)
        // และไม่ redirect ถ้า user ยังไม่ได้ login อยู่ (ปล่อยให้ component จัดการ error เอง)
        if (err.status === 401 && !req.url.includes('/auth/refresh') && this.auth.isLoggedIn) {
          return this.handle401(req, next);
        }
        return throwError(() => err);
      }),
    );
  }

  private handle401(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {

    if (!this.isRefreshing) {
      // เริ่ม refresh — request อื่นที่ 401 พร้อมกันจะรอใน queue
      this.isRefreshing = true;
      this.refreshSubject.next(null);

      return this.auth.refreshAccessToken().pipe(
        switchMap(token => {
          this.isRefreshing = false;
          if (token) {
            this.refreshSubject.next(token);
            return next.handle(this.attachToken(req, token));
          }
          // refresh ล้มเหลว → logout แล้ว redirect
          this.auth.logout();
          this.router.navigateByUrl('/login');
          return throwError(() => new Error('Session expired'));
        }),
      );
    }

    // มี refresh อยู่แล้ว — รอจนได้ token ใหม่ แล้ว retry
    return this.refreshSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.attachToken(req, token!))),
    );
  }

  private attachToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
}
