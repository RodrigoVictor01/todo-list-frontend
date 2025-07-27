import { Component, OnInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { TarefaService } from '../../services/tarefa';

interface Task {
    id: number;
    titulo: string;
    descricao: string;
    responsavel: string;
    prioridade: 'Baixa' | 'Média' | 'Alta';
    deadline: string;
    status: 'Pendente' | 'Em Andamento' | 'Concluída';
    criadoEm: Date;
}

@Component({
    selector: 'app-list-tasks',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterModule],
    templateUrl: './list-tasks.html',
    styleUrls: ['./list-tasks.css'],
    encapsulation: ViewEncapsulation.None
})
export class ListTasksComponent implements OnInit {
    filterForm: FormGroup;
    editForm: FormGroup;
    tasks: Task[] = [];
    filteredTasks: Task[] = [];
    isLoading = false;
    isLoadingData = true;
    errorMessage = '';
    successMessage = '';

    isEditModalOpen = false;
    isEditLoading = false;
    editingTask: Task | null = null;
    editErrorMessage = '';

    responsaveis: string[] = [];
    statusList: string[] = [];
    prioridadesList: string[] = [];

    sortColumn: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';

    constructor(
        private formBuilder: FormBuilder,
        private tarefaService: TarefaService,
        private cdr: ChangeDetectorRef
    ) {
        this.filterForm = this.formBuilder.group({
            numero: [''],
            tituloDescricao: [''],
            responsavel: [''],
            prioridade: [''],
            situacao: ['']
        });

        this.editForm = this.formBuilder.group({
            titulo: ['', [Validators.required, Validators.minLength(3)]],
            descricao: ['', [Validators.required, Validators.minLength(10)]],
            responsavel: ['', [Validators.required, Validators.minLength(3)]],
            prioridade: ['', Validators.required],
            deadline: ['', [Validators.required, this.deadlineValidator]],
            status: ['', Validators.required]
        });
    }

    deadlineValidator(control: AbstractControl): ValidationErrors | null {
        if (!control.value) {
            return null;
        }

        const selectedDateStr = control.value;
        const today = new Date();
        const todayStr = today.getFullYear() + '-' +
            String(today.getMonth() + 1).padStart(2, '0') + '-' +
            String(today.getDate()).padStart(2, '0');

        if (selectedDateStr < todayStr) {
            return { 'dateInPast': true };
        }

        return null;
    }

    ngOnInit(): void {
        this.carregarDadosIniciais();
    }

    carregarDadosIniciais(): void {
        this.isLoadingData = true;
        let carregamentosCompletos = 0;
        const totalCarregamentos = 4;

        const verificarCarregamentoCompleto = () => {
            carregamentosCompletos++;
            if (carregamentosCompletos === totalCarregamentos) {
                this.isLoadingData = false;
            }
        };

        this.carregarResponsaveis(verificarCarregamentoCompleto);
        this.carregarStatus(verificarCarregamentoCompleto);
        this.carregarPrioridades(verificarCarregamentoCompleto);
        this.carregarTarefas(verificarCarregamentoCompleto);
    }

    carregarResponsaveis(callback?: () => void): void {
        this.tarefaService.listarResponsaveis().subscribe({
            next: (responsaveis) => {
                this.responsaveis = responsaveis;
                if (callback) callback();
            },
            error: (error) => {
                if (callback) callback();
            }
        });
    }

    carregarStatus(callback?: () => void): void {
        this.tarefaService.listarStatus().subscribe({
            next: (status) => {
                this.statusList = status;
                if (callback) callback();
            },
            error: (error) => {
                if (callback) callback();
            }
        });
    }

    carregarPrioridades(callback?: () => void): void {
        this.tarefaService.listarPrioridades().subscribe({
            next: (prioridades) => {
                this.prioridadesList = prioridades;
                if (callback) callback();
            },
            error: (error) => {
                console.error('Erro ao carregar prioridades:', error);
                if (callback) callback();
            }
        });
    }

    carregarTarefas(callback?: () => void): void {
        this.tarefaService.listar().subscribe({
            next: (tarefas) => {
                this.tasks = tarefas.map(tarefa => ({
                    ...tarefa,
                    id: tarefa.id || 0,
                    criadoEm: tarefa.criadoEm || new Date()
                }));
                this.filteredTasks = [...this.tasks];
                if (callback) callback();
            },
            error: (error) => {
                console.error('Erro ao carregar tarefas:', error);
                this.errorMessage = 'Erro ao carregar tarefas do servidor.';
                if (callback) callback();
            }
        });
    }

    aplicarFiltros(): void {
        const filtros = this.filterForm.value;

        this.filteredTasks = this.tasks.filter(task => {
            if (filtros.numero && !task.id.toString().includes(filtros.numero)) {
                return false;
            }

            if (filtros.tituloDescricao) {
                const busca = filtros.tituloDescricao.toLowerCase();
                const encontrou = task.titulo.toLowerCase().includes(busca) ||
                    task.descricao.toLowerCase().includes(busca);
                if (!encontrou) return false;
            }

            if (filtros.responsavel && task.responsavel !== filtros.responsavel) {
                return false;
            }

            if (filtros.prioridade && task.prioridade !== filtros.prioridade) {
                return false;
            }

            if (filtros.situacao && task.status !== filtros.situacao) {
                return false;
            }

            return true;
        });

        if (this.sortColumn) {
            this.ordenarPor(this.sortColumn);
        }
    }

    buscarTarefas(): void {
        this.aplicarFiltros();
    }

    atualizarListaFiltrada(): void {
        const filtros = this.filterForm.value;

        this.filteredTasks = this.tasks.filter(task => {
            if (filtros.numero && !task.id.toString().includes(filtros.numero)) {
                return false;
            }

            if (filtros.tituloDescricao) {
                const busca = filtros.tituloDescricao.toLowerCase();
                const encontrou = task.titulo.toLowerCase().includes(busca) ||
                    task.descricao.toLowerCase().includes(busca);
                if (!encontrou) return false;
            }

            if (filtros.responsavel && task.responsavel !== filtros.responsavel) {
                return false;
            }

            if (filtros.prioridade && task.prioridade !== filtros.prioridade) {
                return false;
            }

            if (filtros.situacao && task.status !== filtros.situacao) {
                return false;
            }

            return true;
        });

        if (this.sortColumn) {
            this.ordenarPor(this.sortColumn);
        }
    }

    limparFiltros(): void {
        this.filterForm.reset();
        this.filteredTasks = [...this.tasks];

        if (this.sortColumn) {
            this.ordenarPor(this.sortColumn);
        }
    }

    editarTarefa(id: number): void {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            if (this.isTarefaConcluida(task)) {
                this.errorMessage = 'Tarefas concluídas não podem ser editadas.';
                setTimeout(() => this.errorMessage = '', 3000);
                return;
            }

            this.editingTask = task;
            this.editForm.patchValue({
                titulo: task.titulo,
                descricao: task.descricao,
                responsavel: task.responsavel,
                prioridade: task.prioridade,
                deadline: task.deadline,
                status: task.status
            });
            this.isEditModalOpen = true;
            this.editErrorMessage = '';
        }
    }

    fecharModalEdicao(): void {
        this.isEditModalOpen = false;
        this.editingTask = null;
        this.editForm.reset();
        this.editErrorMessage = '';
    }

    salvarEdicao(): void {
        if (this.editForm.valid && this.editingTask) {
            this.isEditLoading = true;
            this.editErrorMessage = '';

            const tarefaAtualizada = {
                ...this.editForm.value,
                id: this.editingTask.id
            };

            this.tarefaService.atualizar(this.editingTask.id, tarefaAtualizada).subscribe({
                next: (response) => {
                    const index = this.tasks.findIndex(t => t.id === this.editingTask!.id);
                    if (index !== -1) {
                        this.tasks[index] = {
                            ...response,
                            id: response.id || this.editingTask!.id,
                            criadoEm: response.criadoEm || new Date()
                        };
                    }
                    this.atualizarListaFiltrada();
                    this.successMessage = 'Tarefa atualizada com sucesso!';
                    setTimeout(() => this.successMessage = '', 3000);
                    this.fecharModalEdicao();
                    this.isEditLoading = false;
                },
                error: (error) => {
                    console.error('Erro ao atualizar tarefa:', error);
                    this.editErrorMessage = 'Erro ao atualizar tarefa. Tente novamente.';
                    this.isEditLoading = false;
                }
            });
        }
        else {
            this.editErrorMessage = 'Por favor, preencha todos os campos obrigatórios.';
        }
    }

    temErro(campo: string): boolean {
        const control = this.editForm.get(campo);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getMensagemErro(campo: string): string {
        const control = this.editForm.get(campo);
        if (control && control.errors) {
            if (control.errors['required']) return `${campo.charAt(0).toUpperCase() + campo.slice(1)} é obrigatório.`;
            if (control.errors['minlength']) return `${campo.charAt(0).toUpperCase() + campo.slice(1)} deve ter pelo menos ${control.errors['minlength'].requiredLength} caracteres.`;
            if (control.errors['dateInPast']) return 'Deadline não pode ser uma data anterior ao dia atual.';
        }
        return '';
    }

    excluirTarefa(id: number): void {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            if (task.status === 'Concluída') {
                this.errorMessage = 'Tarefas concluídas não podem ser excluídas.';
                setTimeout(() => this.errorMessage = '', 3000);
                return;
            }

            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                this.tarefaService.deletar(id).subscribe({
                    next: () => {
                        this.tasks = this.tasks.filter(task => task.id !== id);
                        this.atualizarListaFiltrada();
                        this.successMessage = 'Tarefa excluída com sucesso!';
                        setTimeout(() => this.successMessage = '', 3000);
                    },
                    error: (error) => {
                        console.error('Erro ao excluir tarefa:', error);
                        this.errorMessage = 'Erro ao excluir tarefa.';
                        setTimeout(() => this.errorMessage = '', 3000);
                    }
                });
            }
        }
    }

    concluirTarefa(id: number): void {
        const tarefa = this.tasks.find(t => t.id === id);
        if (tarefa) {
            const tarefaAtualizada = { ...tarefa, status: 'Concluída' as const };

            this.tarefaService.atualizar(id, tarefaAtualizada).subscribe({
                next: (response) => {
                    const index = this.tasks.findIndex(t => t.id === id);
                    if (index !== -1) {
                        this.tasks[index] = {
                            ...this.tasks[index],
                            status: 'Concluída',
                            id: response.id || id,
                            titulo: response.titulo || this.tasks[index].titulo,
                            descricao: response.descricao || this.tasks[index].descricao,
                            responsavel: response.responsavel || this.tasks[index].responsavel,
                            prioridade: response.prioridade || this.tasks[index].prioridade,
                            deadline: response.deadline || this.tasks[index].deadline,
                            criadoEm: response.criadoEm || this.tasks[index].criadoEm
                        };
                    }
                    this.atualizarListaFiltrada();
                    this.cdr.detectChanges();
                    this.successMessage = 'Tarefa concluída com sucesso!';
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: (error) => {
                    this.errorMessage = 'Erro ao concluir tarefa.';
                    setTimeout(() => this.errorMessage = '', 3000);
                }
            });
        }
    }

    formatarData(data: Date | string): string {
        if (!data) return '';

        if (typeof data === 'string') {
            const [ano, mes, dia] = data.split('-');
            return `${dia}/${mes}/${ano}`;
        }

        const d = new Date(data);
        return d.toLocaleDateString('pt-BR');
    }

    getPrioridadeClass(prioridade: string): string {
        switch (prioridade) {
            case 'Alta': return 'prioridade-alta';
            case 'Média': return 'prioridade-media';
            case 'Baixa': return 'prioridade-baixa';
            default: return '';
        }
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'Pendente': return 'status-pendente';
            case 'Em Andamento': return 'status-progresso';
            case 'Concluída': return 'status-concluida';
            default: return '';
        }
    }

    trackByTaskId(index: number, task: Task): number {
        return task.id;
    }

    isTarefaConcluida(task: Task): boolean {
        const resultado = task.status === 'Concluída';
        return resultado;
    }

    ordenarPor(coluna: string): void {
        if (this.sortColumn === coluna) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        }
        else {
            this.sortColumn = coluna;
            this.sortDirection = 'asc';
        }

        this.filteredTasks.sort((a, b) => {
            let valorA: any;
            let valorB: any;

            switch (coluna) {
                case 'id':
                    valorA = a.id;
                    valorB = b.id;
                    break;
                case 'titulo':
                    valorA = a.titulo.toLowerCase();
                    valorB = b.titulo.toLowerCase();
                    break;
                case 'responsavel':
                    valorA = a.responsavel.toLowerCase();
                    valorB = b.responsavel.toLowerCase();
                    break;
                case 'prioridade':
                    const pesoPrioridade = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
                    valorA = pesoPrioridade[a.prioridade] || 0;
                    valorB = pesoPrioridade[b.prioridade] || 0;
                    break;
                case 'status':
                    const pesoStatus = { 'Pendente': 1, 'Em Andamento': 2, 'Concluída': 3 };
                    valorA = pesoStatus[a.status] || 0;
                    valorB = pesoStatus[b.status] || 0;
                    break;
                case 'deadline':
                    valorA = new Date(a.deadline);
                    valorB = new Date(b.deadline);
                    break;
                default:
                    return 0;
            }

            if (valorA < valorB) {
                return this.sortDirection === 'asc' ? -1 : 1;
            }
            if (valorA > valorB) {
                return this.sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    getSortIcon(coluna: string): string {
        if (this.sortColumn !== coluna) {
            return 'sort';
        }
        return this.sortDirection === 'asc' ? 'sort-up' : 'sort-down';
    }

    isSorted(coluna: string): boolean {
        return this.sortColumn === coluna;
    }
}
