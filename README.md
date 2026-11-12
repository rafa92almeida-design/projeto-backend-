# API RESTful de Catálogo de Produtos e Usuários (Node.js + Express + MySQL)

Projeto de conclusão de módulo focado na construção de uma API RESTful organizada no padrão **MVC (Model-View-Controller)** com **Node.js**, **Express.js**, **Sequelize ORM**, **MySQL** e documentação interativa com **Swagger**.

---

## Tecnologias Utilizadas

- **Node.js** (v18 ou superior)
- **Express.js** (roteamento e middlewares HTTP)
- **MySQL** (banco de dados relacional)
- **Sequelize** + **mysql2** (ORM, modelagem de tabelas e migrations)
- **swagger-ui-express** (documentação interativa OpenAPI 3.0 em `/api-docs`)
- **dotenv** (gerenciamento de variáveis de ambiente)
- **cors** (liberação de acesso para frontends externos)

---

## Estrutura de Pastas (Padrão MVC)

```text
├── app.js                                      # Configuração do Express, Swagger, JSON e erros
├── server.js                                   # Ponto de entrada: testa o MySQL e sobe o servidor
├── .sequelizerc                                # Aponta o Sequelize CLI para as pastas MVC
├── .env                                        # Variáveis de ambiente locais (não enviar ao Git)
├── .env.example                                # Modelo das variáveis necessárias
├── README.md                                   # Documentação do projeto
└── src/
    ├── config/
    │   ├── database.js                         # Conexão do Sequelize com o MySQL
    │   ├── sequelizeCli.js                     # Configuração de ambientes para migrations
    │   └── swagger.js                          # Especificação OpenAPI 3.0 da API
    ├── controllers/
    │   ├── authController.js                   # Cadastro e login de usuários
    │   ├── userController.js                   # CRUD completo de usuários (listar, buscar, editar, excluir)
    │   └── productController.js                # CRUD completo de produtos, validações e permissão
    ├── middlewares/
    │   └── authMiddleware.js                   # Validação Basic Auth e hash de senha com crypto
    ├── models/
    │   ├── index.js                            # Centraliza models e relacionamentos (1:N)
    │   ├── User.js                             # Model da tabela users
    │   ├── Product.js                          # Model da tabela products
    │   └── migrations/
    │       └── 202611120001-create-users-and-products.js
    └── routes/
        ├── index.js                            # Roteador principal (/api)
        ├── authRoutes.js                       # Rotas /api/auth
        ├── userRoutes.js                       # Rotas /api/users
        └── productRoutes.js                    # Rotas /api/produtos
```

---

## Como Rodar o Projeto Localmente

### 1. Pré-requisitos
Certifique-se de ter instalado na sua máquina:
- [Node.js](https://nodejs.org/) (v18+)
- Servidor **MySQL** rodando localmente (ou via Docker / XAMPP)

### 2. Instalar as dependências
No terminal, dentro da pasta do projeto, instale os pacotes principais:

```bash
npm install express sequelize mysql2 dotenv cors swagger-ui-express
npm install -D nodemon sequelize-cli
```

### 3. Configurar as variáveis de ambiente (`.env`)
Crie um arquivo `.env` na raiz do projeto com os dados do seu banco MySQL local:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=loja_mvc_db
DB_USER=root
DB_PASS=sua_senha_mysql
```

### 4. Criar o banco de dados no MySQL
Acesse seu cliente MySQL (Workbench, DBeaver ou terminal) e execute:

```sql
CREATE DATABASE IF NOT EXISTS loja_mvc_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 5. Executar as migrations
Como o projeto já inclui o arquivo `.sequelizerc`, basta rodar:

```bash
npx sequelize-cli db:migrate
```

*(Caso queira desfazer a última migration: `npx sequelize-cli db:migrate:undo`)*

### 6. Iniciar o servidor
Em modo de desenvolvimento (com `nodemon`):

```bash
npx nodemon server.js
```

Ou em modo padrão:

```bash
node server.js
```

Se tudo estiver correto, o terminal exibirá:
```text
Conexao com o banco de dados MySQL estabelecida com sucesso.
Servidor rodando em http://localhost:3000
Documentacao Swagger em http://localhost:3000/api-docs
Teste a saude da API em http://localhost:3000/api/health
```

---

## Documentação dos Endpoints

Acesse a documentação interativa completa no navegador após iniciar o servidor: **`http://localhost:3000/api-docs`**.

### Saúde da API
| Método | Rota | Descrição | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Verifica se a API está online | Pública |

### Autenticação (`/api/auth`)
| Método | Rota | Descrição | Status de Retorno |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Cadastra um novo usuário | `201`, `400`, `500` |
| `POST` | `/api/auth/login` | Valida credenciais e retorna o header Basic Auth | `200`, `400`, `401`, `500` |

### Usuários (`/api/users`)
| Método | Rota | Descrição | Auth | Status de Retorno |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Lista todos os usuários (sem `password_hash`) | Basic Auth | `200`, `401`, `500` |
| `GET` | `/api/users/:id` | Busca um usuário por ID | Basic Auth | `200`, `400`, `401`, `404`, `500` |
| `PUT` | `/api/users/:id` | Atualiza o próprio usuário (ou admin) | Basic Auth | `200`, `400`, `401`, `403`, `404`, `500` |
| `DELETE` | `/api/users/:id` | Remove o próprio usuário (ou admin) | Basic Auth | `200`, `400`, `401`, `403`, `404`, `500` |

### Produtos (`/api/produtos`)
| Método | Rota | Descrição | Auth | Status de Retorno |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/produtos` | Lista todos os produtos (suporta `?category=` e `?search=`) | Pública | `200`, `500` |
| `GET` | `/api/produtos/:id` | Busca um produto específico por ID | Pública | `200`, `400`, `404`, `500` |
| `POST` | `/api/produtos` | Cadastra um novo produto vinculado ao usuário logado | Basic Auth | `201`, `400`, `401`, `500` |
| `PUT` | `/api/produtos/:id` | Atualiza um produto (apenas dono ou admin) | Basic Auth | `200`, `400`, `401`, `403`, `404`, `500` |
| `DELETE` | `/api/produtos/:id` | Remove um produto (apenas dono ou admin) | Basic Auth | `200`, `400`, `401`, `403`, `404`, `500` |

### Exemplo de requisição `POST /api/produtos`
**Headers:**
```text
Content-Type: application/json
Authorization: Basic YWx1bm9AZXhlbXBsby5jb206MTIzNDU2
```

**Body (JSON):**
```json
{
  "name": "Teclado Mecânico ABNT2",
  "description": "Teclado compacto switch marrom para programação",
  "price": 289.90,
  "stock": 15,
  "category": "Periféricos",
  "active": true
}
```
