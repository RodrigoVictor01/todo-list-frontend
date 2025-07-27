# TodoListFrontend

Este projeto foi gerado usando [Angular CLI](https://github.com/angular/angular-cli) versão 20.1.3.

## Funcionalidades Implementadas

- **a) Login**: Autenticação de usuários
- **b) Cadastro de Usuário**: Registro de novos usuários  
- **c) Gerenciamento de Tarefas**: Criação de novas tarefas com validações
- **d) Listagem de Tarefas**: Visualização, edição e gerenciamento de tarefas existentes com filtros


## Configuração e Execução Local

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Angular CLI (`npm install -g @angular/cli`)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/RodrigoVictor01/todo-list-frontend.git
cd todo-list-frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
# Principalmente a URL da API se diferente de http://localhost:8080
```

### Configuração de Ambiente

O projeto utiliza um .env:

- **API_BASE_URL**: URL base da API backend (padrão: http://localhost:8080)
- **API_ENDPOINT**: Endpoint de tarefas (/api/tarefas)


### Servidor de Desenvolvimento

Para iniciar o servidor de desenvolvimento local, execute:

```bash
ng serve
```

O servidor será iniciado e estará disponível em `http://localhost:4200/`. A aplicação será recarregada automaticamente sempre que você modificar qualquer arquivo de origem.

### Backend

Certifique-se de que o backend Spring Boot esteja rodando em `http://localhost:8080` para que as funcionalidades de API funcionem corretamente.

## 🛠️ Tecnologias Utilizadas

- **Angular 18+**: Framework frontend
- **TypeScript**: Linguagem principal
- **RxJS**: Programação reativa para HTTP requests
- **Reactive Forms**: Formulários com validação
- **CSS3**: Estilização com gradientes e responsividade
- **HttpClient**: Comunicação com API REST


## Funcionalidades

### a) Sistema de Login
- Autenticação de usuários
- Validação de formulário
- Interface responsiva

### b) Cadastro de Usuário
- Registro de novos usuários
- Validações de campos obrigatórios
- Feedback visual de sucesso/erro

### c) Gerenciamento de Tarefas
- **Criação de tarefas** com campos:
  - Título (obrigatório, mín. 3 caracteres)
  - Descrição (obrigatório, mín. 5, máx. 500 caracteres)
  - Responsável (seleção dinâmica do backend)
  - Prioridade (Alta, Média, Baixa)
  - Deadline (validação para não aceitar datas passadas)
  - Status (Pendente, Em Andamento, Concluída)
- **Validações personalizadas** para deadline
- **Integração com API** Spring Boot
- **Mapeamento de enums** entre frontend e backend

### d) Listagem de Tarefas
- **Tabela responsiva** com scroll personalizado
- **Filtros avançados**:
  - Por número (ID)
  - Por título/descrição (busca textual)
  - Por responsável
  - Por prioridade
  - Por status/situação
- **Ações disponíveis**:
  - Editar tarefa
  - Excluir tarefa (com confirmação)
  - Concluir tarefa
- **Interface otimizada**:
  - Cabeçalho fixo (sticky)
  - Badges coloridos para prioridade e status
  - Mensagens de feedback
  - Contador de tarefas filtradas


