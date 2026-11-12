import fs from 'node:fs';
import path from 'node:path';

export interface MvcFileEntry {
  id: string;
  filePath: string;
  fileName: string;
  layer:
    | 'Configuração'
    | 'Models e Migrations'
    | 'Middlewares'
    | 'Controllers'
    | 'Rotas'
    | 'Entrada e Docs';
  language: 'javascript' | 'json' | 'env' | 'markdown';
  summary: string;
  content: string;
}

const BACKEND_PACKAGE_JSON_TEMPLATE = `{
  "name": "api-loja-mvc",
  "version": "1.0.0",
  "description": "Projeto de conclusao de modulo - API RESTful com Node.js, Express e MySQL",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "npx sequelize-cli db:migrate",
    "migrate:undo": "npx sequelize-cli db:migrate:undo"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "mysql2": "^3.11.0",
    "sequelize": "^6.37.3",
    "swagger-ui-express": "^5.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.4",
    "sequelize-cli": "^6.6.2"
  }
}`;

const BACKEND_ENV_EXAMPLE_TEMPLATE = `# Configuracao do servidor Express
PORT=3000
NODE_ENV=development

# Credenciais do banco de dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=loja_mvc_db
DB_USER=root
DB_PASS=sua_senha_mysql`;

function readProjectFile(relativePath: string): string {
  const fullPath = path.join(process.cwd(), relativePath);
  return fs.readFileSync(fullPath, 'utf8');
}

export function loadMvcProjectFiles(): {
  files: MvcFileEntry[];
  readmeContent: string;
} {
  const readmeContent = readProjectFile('README.md');

  const files: MvcFileEntry[] = [
    {
      id: 'database',
      filePath: 'src/config/database.js',
      fileName: 'database.js',
      layer: 'Configuração',
      language: 'javascript',
      summary:
        'Configura a instância do Sequelize lendo as credenciais do MySQL via variáveis de ambiente (.env).',
      content: readProjectFile('src/config/database.js'),
    },
    {
      id: 'sequelize-cli',
      filePath: 'src/config/sequelizeCli.js',
      fileName: 'sequelizeCli.js',
      layer: 'Configuração',
      language: 'javascript',
      summary:
        'Exporta as credenciais por ambiente (development/test/production) para o Sequelize CLI executar migrations.',
      content: readProjectFile('src/config/sequelizeCli.js'),
    },
    {
      id: 'swagger-config',
      filePath: 'src/config/swagger.js',
      fileName: 'swagger.js',
      layer: 'Configuração',
      language: 'javascript',
      summary:
        'Especificação OpenAPI 3.0 servida em /api-docs pelo swagger-ui-express com todos os endpoints e schemas.',
      content: readProjectFile('src/config/swagger.js'),
    },
    {
      id: 'model-index',
      filePath: 'src/models/index.js',
      fileName: 'index.js',
      layer: 'Models e Migrations',
      language: 'javascript',
      summary:
        'Centraliza os models e define o relacionamento 1:N entre usuários e produtos.',
      content: readProjectFile('src/models/index.js'),
    },
    {
      id: 'model-user',
      filePath: 'src/models/User.js',
      fileName: 'User.js',
      layer: 'Models e Migrations',
      language: 'javascript',
      summary:
        'Define a tabela users com validações de nome, e-mail único, hash de senha e papel do usuário.',
      content: readProjectFile('src/models/User.js'),
    },
    {
      id: 'model-product',
      filePath: 'src/models/Product.js',
      fileName: 'Product.js',
      layer: 'Models e Migrations',
      language: 'javascript',
      summary:
        'Define a tabela products com DECIMAL(10, 2) para preço, controle de estoque e FK user_id.',
      content: readProjectFile('src/models/Product.js'),
    },
    {
      id: 'migration-init',
      filePath: 'src/models/migrations/202611120001-create-users-and-products.js',
      fileName: '202611120001-create-users-and-products.js',
      layer: 'Models e Migrations',
      language: 'javascript',
      summary:
        'Migration do Sequelize que cria as tabelas users e products no MySQL com chave estrangeira e rollback.',
      content: readProjectFile(
        'src/models/migrations/202611120001-create-users-and-products.js'
      ),
    },
    {
      id: 'auth-middleware',
      filePath: 'src/middlewares/authMiddleware.js',
      fileName: 'authMiddleware.js',
      layer: 'Middlewares',
      language: 'javascript',
      summary:
        'Funções de hash seguro com crypto nativo e middleware requireBasicAuth para proteger rotas de escrita.',
      content: readProjectFile('src/middlewares/authMiddleware.js'),
    },
    {
      id: 'auth-controller',
      filePath: 'src/controllers/authController.js',
      fileName: 'authController.js',
      layer: 'Controllers',
      language: 'javascript',
      summary:
        'Cadastro de usuários (/register) e validação de login (/login) com retorno de status 200, 201, 400, 401 e 500.',
      content: readProjectFile('src/controllers/authController.js'),
    },
    {
      id: 'user-controller',
      filePath: 'src/controllers/userController.js',
      fileName: 'userController.js',
      layer: 'Controllers',
      language: 'javascript',
      summary:
        'CRUD de usuários (index, show, update, destroy) ocultando password_hash e validando autorização (403).',
      content: readProjectFile('src/controllers/userController.js'),
    },
    {
      id: 'product-controller',
      filePath: 'src/controllers/productController.js',
      fileName: 'productController.js',
      layer: 'Controllers',
      language: 'javascript',
      summary:
        'CRUD completo de produtos (index, show, store, update, destroy) com validação simples, permissão (403) e códigos HTTP corretos.',
      content: readProjectFile('src/controllers/productController.js'),
    },
    {
      id: 'routes-index',
      filePath: 'src/routes/index.js',
      fileName: 'index.js',
      layer: 'Rotas',
      language: 'javascript',
      summary:
        'Roteador central em /api que agrega /auth, /users, /produtos e o endpoint de saúde /health.',
      content: readProjectFile('src/routes/index.js'),
    },
    {
      id: 'routes-auth',
      filePath: 'src/routes/authRoutes.js',
      fileName: 'authRoutes.js',
      layer: 'Rotas',
      language: 'javascript',
      summary: 'Define as rotas POST /register e POST /login no Express.',
      content: readProjectFile('src/routes/authRoutes.js'),
    },
    {
      id: 'routes-user',
      filePath: 'src/routes/userRoutes.js',
      fileName: 'userRoutes.js',
      layer: 'Rotas',
      language: 'javascript',
      summary:
        'Define rotas protegidas do CRUD de usuários (GET, PUT, DELETE) em /api/users.',
      content: readProjectFile('src/routes/userRoutes.js'),
    },
    {
      id: 'routes-product',
      filePath: 'src/routes/productRoutes.js',
      fileName: 'productRoutes.js',
      layer: 'Rotas',
      language: 'javascript',
      summary:
        'Define rotas públicas de leitura (GET) e rotas protegidas por Basic Auth (POST, PUT, DELETE).',
      content: readProjectFile('src/routes/productRoutes.js'),
    },
    {
      id: 'app-js',
      filePath: 'app.js',
      fileName: 'app.js',
      layer: 'Entrada e Docs',
      language: 'javascript',
      summary:
        'Configura o app Express, Swagger (/api-docs), CORS, JSON, prefixo /api, 404 e tratamento global de erro 500.',
      content: readProjectFile('app.js'),
    },
    {
      id: 'server-js',
      filePath: 'server.js',
      fileName: 'server.js',
      layer: 'Entrada e Docs',
      language: 'javascript',
      summary:
        'Ponto de entrada que carrega o .env, testa a conexão com o MySQL e inicia o servidor na porta configurada.',
      content: readProjectFile('server.js'),
    },
    {
      id: 'sequelizerc',
      filePath: '.sequelizerc',
      fileName: '.sequelizerc',
      layer: 'Entrada e Docs',
      language: 'javascript',
      summary:
        'Configura o Sequelize CLI para localizar config, models e migrations dentro da estrutura MVC.',
      content: readProjectFile('.sequelizerc'),
    },
    {
      id: 'env-example',
      filePath: '.env.example (modelo do projeto)',
      fileName: '.env.example',
      layer: 'Entrada e Docs',
      language: 'env',
      summary:
        'Modelo de variáveis de ambiente necessárias para configurar porta e credenciais do MySQL.',
      content: BACKEND_ENV_EXAMPLE_TEMPLATE,
    },
    {
      id: 'package-json',
      filePath: 'package.json (modelo do projeto)',
      fileName: 'package.json',
      layer: 'Entrada e Docs',
      language: 'json',
      summary:
        'Dependências Express, Sequelize, mysql2, swagger-ui-express, dotenv, cors e scripts de execução.',
      content: BACKEND_PACKAGE_JSON_TEMPLATE,
    },
    {
      id: 'readme-md',
      filePath: 'README.md',
      fileName: 'README.md',
      layer: 'Entrada e Docs',
      language: 'markdown',
      summary:
        'Documentação completa com passo a passo para instalar dependências, configurar o MySQL e testar as rotas.',
      content: readmeContent,
    },
  ];

  return { files, readmeContent };
}
