/**
 * Configuração simples da documentação interativa da API usando OpenAPI 3.0 (Swagger).
 * Disponibilizada na rota GET /api-docs pelo pacote swagger-ui-express.
 */

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API Loja MVC — Catálogo de Produtos e Usuários',
    version: '1.0.0',
    description:
      'API RESTful desenvolvida em Node.js, Express, Sequelize e MySQL no padrão MVC.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local de desenvolvimento',
    },
  ],
  components: {
    securitySchemes: {
      basicAuth: {
        type: 'http',
        scheme: 'basic',
        description: 'Informe e-mail e senha cadastrados no formato Basic Auth.',
      },
    },
    schemas: {
      ProductInput: {
        type: 'object',
        required: ['name', 'price', 'stock', 'category'],
        properties: {
          name: { type: 'string', example: 'Teclado Mecânico ABNT2' },
          description: { type: 'string', example: 'Switch marrom compacto' },
          price: { type: 'number', example: 289.9 },
          stock: { type: 'integer', example: 15 },
          category: { type: 'string', example: 'Periféricos' },
          active: { type: 'boolean', example: true },
        },
      },
      UserInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Rafael Almeida' },
          email: { type: 'string', example: 'aluno@exemplo.com' },
          password: { type: 'string', example: '123456' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Verifica se a API está online',
        responses: {
          200: { description: 'API funcionando normalmente' },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastra um novo usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserInput' },
            },
          },
        },
        responses: {
          201: { description: 'Usuário criado com sucesso' },
          400: { description: 'Dados inválidos ou e-mail já cadastrado' },
          500: { description: 'Erro interno no servidor' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Valida login e retorna o cabeçalho Basic Auth',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'aluno@exemplo.com' },
                  password: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login realizado com sucesso' },
          400: { description: 'Campos obrigatórios não informados' },
          401: { description: 'E-mail ou senha incorretos' },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Usuários'],
        summary: 'Lista usuários cadastrados (sem expor senha)',
        security: [{ basicAuth: [] }],
        responses: {
          200: { description: 'Lista de usuários' },
          401: { description: 'Não autenticado' },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Usuários'],
        summary: 'Busca um usuário por ID',
        security: [{ basicAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Dados do usuário' },
          400: { description: 'ID inválido' },
          401: { description: 'Não autenticado' },
          404: { description: 'Usuário não encontrado' },
        },
      },
      put: {
        tags: ['Usuários'],
        summary: 'Atualiza dados do próprio usuário (ou admin)',
        security: [{ basicAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Usuário atualizado' },
          400: { description: 'Dados inválidos' },
          401: { description: 'Não autenticado' },
          403: { description: 'Sem permissão para editar outro usuário' },
          404: { description: 'Usuário não encontrado' },
        },
      },
      delete: {
        tags: ['Usuários'],
        summary: 'Remove um usuário (próprio usuário ou admin)',
        security: [{ basicAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Usuário removido' },
          401: { description: 'Não autenticado' },
          403: { description: 'Sem permissão para excluir outro usuário' },
          404: { description: 'Usuário não encontrado' },
        },
      },
    },
    '/api/produtos': {
      get: {
        tags: ['Produtos'],
        summary: 'Lista todos os produtos (suporta ?category= e ?search=)',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Lista de produtos retornada com sucesso' },
        },
      },
      post: {
        tags: ['Produtos'],
        summary: 'Cadastra um novo produto',
        security: [{ basicAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductInput' },
            },
          },
        },
        responses: {
          201: { description: 'Produto criado com sucesso' },
          400: { description: 'Erro de validação nos dados' },
          401: { description: 'Não autenticado' },
        },
      },
    },
    '/api/produtos/{id}': {
      get: {
        tags: ['Produtos'],
        summary: 'Busca um produto por ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Produto encontrado' },
          400: { description: 'ID inválido' },
          404: { description: 'Produto não encontrado' },
        },
      },
      put: {
        tags: ['Produtos'],
        summary: 'Atualiza um produto (dono ou admin)',
        security: [{ basicAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductInput' },
            },
          },
        },
        responses: {
          200: { description: 'Produto atualizado com sucesso' },
          400: { description: 'Dados ou ID inválidos' },
          401: { description: 'Não autenticado' },
          403: { description: 'Sem permissão para alterar produto de outro usuário' },
          404: { description: 'Produto não encontrado' },
        },
      },
      delete: {
        tags: ['Produtos'],
        summary: 'Remove um produto (dono ou admin)',
        security: [{ basicAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Produto removido com sucesso' },
          400: { description: 'ID inválido' },
          401: { description: 'Não autenticado' },
          403: { description: 'Sem permissão para excluir produto de outro usuário' },
          404: { description: 'Produto não encontrado' },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
