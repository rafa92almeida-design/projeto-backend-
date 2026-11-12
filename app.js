/**
 * Configuração principal do aplicativo Express (app.js).
 * Aqui configuramos middlewares globais, JSON parser, rotas e tratamento de erros.
 * Separar app.js do server.js facilita testes futuros sem precisar subir a porta.
 */

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./src/config/swagger');
const routes = require('./src/routes');

const app = express();

// Permite requisições de outros domínios (ex: frontend rodando em outra porta)
app.use(cors());

// Habilita a leitura de corpo da requisição em formato JSON
app.use(express.json());

// Documentação interativa da API no Swagger (/api-docs)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Prefixo padrão '/api' para todos os endpoints do projeto
app.use('/api', routes);

// Middleware para rotas não encontradas (404)
app.use((req, res) => {
  return res.status(404).json({
    erro: `Rota ${req.method} ${req.originalUrl} nao encontrada.`,
  });
});

// Middleware global para capturar erros inesperados (500)
app.use((err, req, res, next) => {
  console.error('Erro nao tratado:', err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(500).json({
    erro: 'Ocorreu um erro interno inesperado no servidor.',
  });
});

module.exports = app;
