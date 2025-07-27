import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TarefaService } from '../../services/tarefa';
import { Tarefa } from '../../models/model';

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
  selector: 'app-task-manager',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './task-manager.html',
  styleUrls: ['./task-manager.css'],
  encapsulation: ViewEncapsulation.None
})
export class TaskManagerComponent implements OnInit {
  taskForm: FormGroup;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  editingTask: Task | null = null;
  isLoading = false;
  isLoadingData = true;
  errorMessage = '';
  successMessage = '';
  filterStatus = '';
  filterPriority = '';
  nextId = 1;
  responsaveis: string[] = [];
  prioridades: string[] = [];
  statusList: string[] = [];
  minDate: string;

  constructor(
    private formBuilder: FormBuilder,
    private tarefaService: TarefaService,
    private router: Router
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.taskForm = this.formBuilder.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descricao: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      responsavel: ['', [Validators.required]],
      prioridade: ['', [Validators.required]],
      deadline: ['', [Validators.required, this.deadlineValidator]],
      status: ['Pendente']
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

    this.taskForm.valueChanges.subscribe(() => {
      this.errorMessage = '';
      this.successMessage = '';
    });
  }

  carregarDadosIniciais(): void {
    this.isLoadingData = true;
    let carregamentosCompletos = 0;
    const totalCarregamentos = 3;

    const verificarCarregamentoCompleto = () => {
      carregamentosCompletos++;
      if (carregamentosCompletos === totalCarregamentos) {
        this.isLoadingData = false;
      }
    };

    this.carregarResponsaveis();
    this.carregarPrioridades();
    this.carregarStatus();
  }

  carregarResponsaveis(): void {
    this.tarefaService.listarResponsaveis().subscribe({
      next: (responsaveis) => {
        this.responsaveis = responsaveis;
        this.verificarCarregamentoCompleto();
      },
      error: (error) => {
        console.error('Erro ao carregar responsáveis:', error);
        this.errorMessage = 'Erro ao carregar responsáveis do servidor.';
        this.verificarCarregamentoCompleto();
      }
    });
  }

  carregarPrioridades(): void {
    this.tarefaService.listarPrioridades().subscribe({
      next: (prioridades) => {
        this.prioridades = prioridades;
        this.verificarCarregamentoCompleto();
      },
      error: (error) => {
        console.error('Erro ao carregar prioridades:', error);
        this.errorMessage = 'Erro ao carregar prioridades do servidor.';
        this.verificarCarregamentoCompleto();
      }
    });
  }

  carregarStatus(): void {
    this.tarefaService.listarStatus().subscribe({
      next: (status) => {
        this.statusList = status;
        this.verificarCarregamentoCompleto();
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar status do servidor.';
        this.verificarCarregamentoCompleto();
      }
    });
  }

  private carregamentosCompletos = 0;
  private totalCarregamentos = 3;

  private verificarCarregamentoCompleto(): void {
    this.carregamentosCompletos++;
    if (this.carregamentosCompletos === this.totalCarregamentos) {
      this.isLoadingData = false;
    }
  }

  carregarTarefas(): void {
    this.tarefaService.listar().subscribe({
      next: (tarefas) => {
        this.tasks = tarefas.map(tarefa => ({
          ...tarefa,
          id: tarefa.id || 0,
          criadoEm: tarefa.criadoEm || new Date()
        }));
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar tarefas. Usando dados locais.';
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.taskForm.value;
      const novaTarefa: Omit<Tarefa, 'id' | 'criadoEm'> = {
        titulo: formValue.titulo,
        descricao: formValue.descricao,
        responsavel: formValue.responsavel,
        prioridade: formValue.prioridade,
        deadline: formValue.deadline,
        status: 'Pendente'
      };

      this.tarefaService.criar(novaTarefa).subscribe({
        next: (tarefaCriada) => {
          const newTask: Task = {
            id: tarefaCriada.id || this.nextId++,
            titulo: tarefaCriada.titulo,
            descricao: tarefaCriada.descricao,
            responsavel: tarefaCriada.responsavel,
            prioridade: tarefaCriada.prioridade,
            deadline: tarefaCriada.deadline,
            status: tarefaCriada.status,
            criadoEm: tarefaCriada.criadoEm || new Date()
          };

          this.tasks.push(newTask);
          this.taskForm.reset();
          this.taskForm.patchValue({ status: 'Pendente' });
          this.isLoading = false;
          this.successMessage = 'Tarefa cadastrada com sucesso!';

          setTimeout(() => {
            this.router.navigate(['/tarefas/listar']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = `Erro ao criar tarefa: ${error}`;
          console.error('Erro ao criar tarefa:', error);

        }
      });

    }
    else {
      this.markFormGroupTouched();
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      this.taskForm.get(key)?.markAsTouched();
    });
  }

  get titulo() { return this.taskForm.get('titulo'); }
  get descricao() { return this.taskForm.get('descricao'); }
  get responsavel() { return this.taskForm.get('responsavel'); }
  get prioridade() { return this.taskForm.get('prioridade'); }
  get deadline() { return this.taskForm.get('deadline'); }
}