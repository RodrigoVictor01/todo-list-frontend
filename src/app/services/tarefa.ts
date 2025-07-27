import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Tarefa } from '../models/model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';
import { Usuario } from './usuario';

@Injectable({
  providedIn: 'root'
})
export class TarefaService {
  private API_URL = `${environment.apiBaseUrl}${environment.apiEndpointTarefa}`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHttpOptions(): { headers: HttpHeaders } {
    const authHeader = this.authService.getAuthHeader();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(authHeader && { 'Authorization': authHeader })
    });

    return { headers };
  }

  listarPrioridades(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/prioridades`, this.getHttpOptions())
      .pipe(
        map(prioridades => prioridades.map(p => this.mapPrioridadeFromBackend(p))),
        catchError(this.handleError)
      );
  }

  listarStatus(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/status`, this.getHttpOptions())
      .pipe(
        map(status => status.map(s => this.mapStatusFromBackend(s))),
        catchError(this.handleError)
      );
  }

  listarResponsaveis(): Observable<string[]> {
    return this.http.get<Usuario[]>(`${environment.apiBaseUrl}${environment.apiEndpointUsuario}/listar`, this.getHttpOptions())
      .pipe(
        map(usuarios => usuarios.filter(usuario => usuario.ativo).map(usuario => usuario.nome)),
        catchError(this.handleError)
      );
  }

  listar(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(`${this.API_URL}/listar`, this.getHttpOptions())
      .pipe(
        map(tarefas => tarefas.map(tarefa => ({
          ...tarefa,
          criadoEm: tarefa.criadoEm ? new Date(tarefa.criadoEm) : new Date()
        }))),
        catchError(this.handleError)
      );
  }

  private mapPrioridadeFromBackend(prioridade: any): 'Baixa' | 'Média' | 'Alta' {
    switch (prioridade) {
      case 'ALTA': return 'Alta';
      case 'MEDIA': return 'Média';
      case 'BAIXA': return 'Baixa';

      case 'Alta': return 'Alta';
      case 'Média': return 'Média';
      case 'Baixa': return 'Baixa';
      default: return 'Baixa';
    }
  }

  private mapStatusFromBackend(status: any): 'Pendente' | 'Em Andamento' | 'Concluída' {
    switch (status) {
      case 'PENDENTE': return 'Pendente';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'CONCLUIDA': return 'Concluída';
      case 'Pendente': return 'Pendente';
      case 'Em Andamento': return 'Em Andamento';
      case 'Concluída': return 'Concluída';
      default: return 'Pendente';
    }
  }

  criar(tarefa: Omit<Tarefa, 'id' | 'criadoEm'>): Observable<Tarefa> {
    const prioridadeMap: { [key: string]: string } = {
      'Alta': 'ALTA',
      'Média': 'MEDIA',
      'Baixa': 'BAIXA'
    };

    const statusMap: { [key: string]: string } = {
      'Pendente': 'PENDENTE',
      'Em Andamento': 'EM_ANDAMENTO',
      'Concluída': 'CONCLUIDA'
    };

    const tarefaParaEnviar = {
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      responsavel: tarefa.responsavel,
      prioridade: prioridadeMap[tarefa.prioridade] || tarefa.prioridade,
      deadline: tarefa.deadline,
      status: statusMap[tarefa.status] || tarefa.status,
      concluida: tarefa.status === 'Concluída'
    };

    return this.http.post<Tarefa>(`${this.API_URL}/criar`, tarefaParaEnviar, this.getHttpOptions())
      .pipe(
        map(response => ({
          ...response,
          criadoEm: response.criadoEm ? new Date(response.criadoEm) : new Date()
        })),
        catchError(this.handleError)
      );
  }

  atualizar(id: number, tarefa: Partial<Tarefa>): Observable<Tarefa> {
    const prioridadeMap: { [key: string]: string } = {
      'Alta': 'ALTA',
      'Média': 'MEDIA',
      'Baixa': 'BAIXA'
    };

    const statusMap: { [key: string]: string } = {
      'Pendente': 'PENDENTE',
      'Em Andamento': 'EM_ANDAMENTO',
      'Concluída': 'CONCLUIDA'
    };

    const tarefaParaEnviar: any = {
      ...tarefa,
      prioridade: tarefa.prioridade ? prioridadeMap[tarefa.prioridade] || tarefa.prioridade : undefined,
      status: tarefa.status ? statusMap[tarefa.status] || tarefa.status : undefined
    };

    if (tarefa.status === 'Concluída') {
      tarefaParaEnviar.concluida = true;
    }
    else if (tarefa.status && ['Pendente', 'Em Andamento'].includes(tarefa.status)) {
      tarefaParaEnviar.concluida = false;
    }

    return this.http.put<Tarefa>(`${this.API_URL}/${id}`, tarefaParaEnviar, this.getHttpOptions())
      .pipe(
        map(response => ({
          ...response
        })),
        catchError(this.handleError)
      );
  }

  buscarPorId(id: number): Observable<Tarefa> {
    return this.http.get<Tarefa>(`${this.API_URL}/${id}`, this.getHttpOptions())
      .pipe(
        map(response => ({
          ...response,
          criadoEm: new Date(response.criadoEm || '')
        })),
        catchError(this.handleError)
      );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, this.getHttpOptions())
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
      switch (error.status) {
        case 400:
          errorMessage = 'Dados inválidos fornecidos';
          break;
        case 401:
          errorMessage = 'Não autorizado - Token inválido ou expirado';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 404:
          errorMessage = 'Tarefa não encontrada';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    console.error('Erro na requisição:', error);
    return throwError(() => errorMessage);
  }
}
