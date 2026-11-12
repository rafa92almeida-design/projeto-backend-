/**
 * Arquivo central de Models.
 * Aqui configuramos os relacionamentos entre as tabelas (1:N)
 * e exportamos tudo junto para facilitar os imports nos controllers.
 */

const { sequelize } = require('../config/database');
const User = require('./User');
const Product = require('./Product');

// Relacionamento 1 para N: Um usuário pode cadastrar vários produtos
User.hasMany(Product, {
  foreignKey: 'user_id',
  as: 'products',
});

// Cada produto pertence a um usuário (criador)
Product.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'owner',
});

module.exports = {
  sequelize,
  User,
  Product,
};
