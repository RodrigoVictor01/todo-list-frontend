import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
    username: string;
    senha: string;
}

export interface LoginResponse {
    token: string;
    type: string;
    username: string;
    expiresIn: number;
}

export interface Usuario {
    id?: number;
    username: string;
    email?: string;
    role?: string;
    criadoEm?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private API_URL_AUTH = `${environment.apiBaseUrl}${environment.apiEndpointAuthLogin}`;
    private API_URL_USUARIOS = `${environment.apiBaseUrl}${environment.apiEndpointUsuario}`;

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    private currentUserSubject = new BehaviorSubject<string | null>(this.getCurrentUsername());
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) { }

    login(credentials: LoginRequest): Observable<LoginResponse> {

        return this.http.post<LoginResponse>(this.API_URL_AUTH, credentials, this.httpOptions)
            .pipe(
                tap(response => {
                    this.setAuthData(response);
                }),
                catchError(this.handleError)
            );
    }

    logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_type');
        localStorage.removeItem('auth_username');
        localStorage.removeItem('auth_expires');

        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
    }

    private setAuthData(response: LoginResponse): void {
        const expirationDate = new Date().getTime() + response.expiresIn;

        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_type', response.type);
        localStorage.setItem('auth_username', response.username);
        localStorage.setItem('auth_expires', expirationDate.toString());

        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(response.username);
    }

    getToken(): string | null {
        if (!this.hasValidToken()) {
            return null;
        }
        return localStorage.getItem('auth_token');
    }

    getAuthHeader(): string | null {
        const token = this.getToken();
        const type = localStorage.getItem('auth_type');

        if (token && type) {
            return `${type} ${token}`;
        }
        return null;
    }

    getCurrentUsername(): string | null {
        if (!this.hasValidToken()) {
            return null;
        }
        return localStorage.getItem('auth_username');
    }

    hasValidToken(): boolean {
        const token = localStorage.getItem('auth_token');
        const expires = localStorage.getItem('auth_expires');

        if (!token || !expires) {
            return false;
        }

        const expirationDate = parseInt(expires);
        const now = new Date().getTime();

        if (now >= expirationDate) {
            this.logout();
            return false;
        }

        return true;
    }

    isAuthenticated(): boolean {
        return this.hasValidToken();
    }

    private getAuthenticatedHttpOptions(): { headers: HttpHeaders } {
        const authHeader = this.getAuthHeader();
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(authHeader && { 'Authorization': authHeader })
        });

        return { headers };
    }

    criarUsuario(usuario: Omit<Usuario, 'id' | 'criadoEm'>): Observable<Usuario> {
        return this.http.post<Usuario>(this.API_URL_USUARIOS, usuario, this.getAuthenticatedHttpOptions())
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Erro desconhecido';

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Erro: ${error.error.message}`;
        }
        else {
            if (error.error && error.error.message) {
                errorMessage = error.error.message;
            } else {
                switch (error.status) {
                    case 400:
                        errorMessage = 'Usuário ou senha inválidos';
                        break;
                    case 401:
                        errorMessage = 'Credenciais inválidas ou token expirado';
                        break;
                    case 403:
                        errorMessage = 'Acesso negado';
                        break;
                    case 404:
                        errorMessage = 'Recurso não encontrado';
                        break;
                    case 500:
                        errorMessage = 'Erro interno do servidor';
                        break;
                    default:
                        errorMessage = `Erro ${error.status}: ${error.message}`;
                }
            }
        }

        console.error('Erro na requisição:', error);
        return throwError(() => errorMessage);
    }
}
