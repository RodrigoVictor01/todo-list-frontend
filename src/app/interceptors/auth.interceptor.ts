import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url.includes('/auth/login') || req.url.includes('/api/usuarios/criar')) {
            return next.handle(req);
        }

        const authHeader = this.authService.getAuthHeader();
        if (authHeader) {
            const authReq = req.clone({
                headers: req.headers.set('Authorization', authHeader)
            });

            return next.handle(authReq).pipe(
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 401) {
                        this.authService.logout();
                        this.router.navigate(['/login']);
                    }
                    return throwError(() => error);
                })
            );
        }

        return next.handle(req);
    }
}
