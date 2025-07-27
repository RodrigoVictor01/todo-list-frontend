import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateUsuarioRequest {
    nome: string;
    email: string;
    username: string;
    senha: string;
}

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    username: string;
    ativo: boolean;
    createdAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private apiUrl = `${environment.apiBaseUrl}${environment.apiEndpointUsuario}`;

    constructor(private http: HttpClient) { }

    criarUsuario(usuario: CreateUsuarioRequest): Observable<Usuario> {
        return this.http.post<Usuario>(`${this.apiUrl}/criar`, usuario);
    }
}
