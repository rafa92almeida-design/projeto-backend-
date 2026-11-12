/**
 * Ponto de entrada da aplicação (server.js).
 * Carrega o .env, testa a conexão com o MySQL e inicia o servidor HTTP.
 */

require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Primeiro garante que o banco MySQL está acessível
    await testConnection();

    // Depois inicia o servidor na porta configurada
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
      console.log(`Documentacao Swagger em http://localhost:${PORT}/api-docs`);
      console.log(`Teste a saude da API em http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Nao foi possivel iniciar o servidor:', error.message);
    process.exit(1);
  }
}

startServer();
