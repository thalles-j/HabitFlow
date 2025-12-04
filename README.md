# HabitFlow

> **Ajudando você a construir consistência e alcançar seus objetivos, um dia de cada vez.**

O **HabitFlow** é uma aplicação completa para rastreamento e gerenciamento de hábitos, projetada para ajudar usuários a manterem o foco e a disciplina. Com uma interface intuitiva e recursos poderosos, você pode monitorar seu progresso diário e visualizar sua consistência ao longo do tempo.

---

## 🚀 O que já fazemos

Atualmente, o HabitFlow oferece as seguintes funcionalidades principais:

- **Registro de Hábitos Diários**: Marque seus hábitos como concluídos e acompanhe seu dia.
- **Tarefas Únicas e Recorrentes**: Flexibilidade para criar hábitos que se repetem em dias específicos da semana.
- **Gráfico de Consistência**: Visualize seu desempenho através de um "heatmap" de atividades (semelhante ao do GitHub), motivando você a não quebrar a corrente.
- **Edição e Gerenciamento**: Controle total para editar ou excluir hábitos conforme sua rotina muda.

---

## 🔮 Em breve (Roadmap)

Estamos trabalhando constantemente para melhorar o HabitFlow. Confira as próximas atualizações planejadas:

- [ ] **Gamificação**: Sistema de Níveis e XP para tornar a construção de hábitos mais divertida.
- [ ] **Modo Social**: Adicione amigos e compartilhe suas conquistas.
- [ ] **App Mobile**: Versões nativas para iOS e Android.
- [ ] **Sincronização com Calendário**: Integração com Google Calendar e outros serviços.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi desenvolvido utilizando uma stack moderna e robusta:

### Frontend
- **React** + **Vite**: Para uma interface rápida e reativa.
- **Tailwind CSS**: Para estilização moderna e responsiva.
- **Radix UI**: Componentes acessíveis e de alta qualidade.
- **Lucide React**: Ícones elegantes.

### Backend
- **Node.js** + **Express**: Servidor robusto e escalável.
- **Prisma ORM**: Para interação eficiente com o banco de dados.
- **PostgreSQL**: Banco de dados relacional confiável.

---

## 📦 Como Rodar o Projeto

Siga os passos abaixo para configurar e rodar o HabitFlow em sua máquina local.

### Pré-requisitos
- Node.js instalado (versão 18+ recomendada)
- PostgreSQL instalado e rodando

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/thalles-j/HabitFlow.git
   cd HabitFlow
   ```

2. **Instale as dependências**
   Execute o comando na raiz do projeto para instalar as dependências do frontend e do backend:
   ```bash
   npm run install:all
   ```

3. **Configuração do Banco de Dados**
   - Crie um arquivo `.env` na pasta `backend/` e configure a URL do seu banco de dados PostgreSQL:
     ```env
     DATABASE_URL="postgresql://usuario:senha@localhost:5432/habitflow?schema=public"
     ```
   - Execute as migrações para criar as tabelas:
     ```bash
     npm run prisma:migrate
     ```
   - (Opcional) Popule o banco com dados iniciais:
     ```bash
     npm run prisma:seed
     ```

4. **Configuração do Frontend**
   - Crie um arquivo `.env` na pasta `frontend/` (se necessário) para configurar a URL da API:
     ```env
     VITE_API_URL="http://localhost:3333"
     ```

5. **Rodando a Aplicação**
   Na raiz do projeto, execute o comando para iniciar tanto o backend quanto o frontend:
   ```bash
   npm run dev
   ```
   - O **Frontend** estará rodando em: `http://localhost:5173`
   - O **Backend** estará rodando em: `http://localhost:3333`

---

## 📄 Licença

© 2025 HabitFlow Project. Todos os direitos reservados.
