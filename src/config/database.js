/**
 * Configuração da conexão com o banco de dados MySQL utilizando o Sequelize.
 * As credenciais são lidas do arquivo .env para não expor senhas no código.
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Pegando as variáveis de ambiente (com valores padrão caso não estejam no .env)
const DB_NAME = process.env.DB_NAME || 'loja_mvc_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;

// Criando a instância do Sequelize para conectar no MySQL
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  // Desativa logs enormes de SQL no terminal durante o uso normal (mude para console.log se quiser depurar)
  logging: process.env.NODE_ENV === 'development' ? false : false,
  define: {
    // Usa snake_case nas colunas automáticas (created_at, updated_at)
    underscored: true,
    timestamps: true,
  },
});

/**
 * Função auxiliar para testar se a conexão com o MySQL funcionou
 * antes de iniciar o servidor Express.
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexao com o banco de dados MySQL estabelecida com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados MySQL:', error.message);
    throw error;
  }
}

module.exports = {
  sequelize,
  testConnection,
};
