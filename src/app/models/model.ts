export interface Tarefa {
    id?: number;
    titulo: string;
    descricao: string;
    responsavel: string;
    prioridade: 'Baixa' | 'Média' | 'Alta';
    deadline: string;
    status: 'Pendente' | 'Em Andamento' | 'Concluída';
    criadoEm?: Date;
}
