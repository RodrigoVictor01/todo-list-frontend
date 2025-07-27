import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { CadastrarComponent } from './components/cadastrar/cadastrar';
import { TaskManagerComponent } from './components/task-manager/task-manager';
import { ListTasksComponent } from './components/list-tasks/list-tasks';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'usuario/cadastrar',
        component: CadastrarComponent
    },
    {
        path: 'tarefas/cadastrar',
        component: TaskManagerComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'tarefas/listar',
        component: ListTasksComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'list-tasks',
        component: ListTasksComponent,
        canActivate: [AuthGuard]
    },
    { path: '**', redirectTo: '/login' }
];
