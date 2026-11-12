/**
 * Configuração utilizada pelo Sequelize CLI para rodar migrations no MySQL.
 * Lê as mesmas variáveis do arquivo .env usadas em src/config/database.js.
 */

require('dotenv').config();

const baseConfig = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'loja_mvc_db',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
};

module.exports = {
  development: baseConfig,
  test: baseConfig,
  production: baseConfig,
};
