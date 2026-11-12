/**
 * Model Product (Produto)
 * Representa a tabela 'products' no banco de dados MySQL.
 * Cada produto pertence a um usuário responsável pelo cadastro (chave estrangeira user_id).
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O nome do produto e obrigatorio.' },
        len: {
          args: [2, 120],
          msg: 'O nome do produto deve ter entre 2 e 120 caracteres.',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      // DECIMAL(10, 2) evita erros de arredondamento com valores monetários
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: 'O preco deve ser um numero valido.' },
        min: {
          args: [0.01],
          msg: 'O preco deve ser maior que zero.',
        },
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: 'O estoque deve ser um numero inteiro.' },
        min: {
          args: [0],
          msg: 'O estoque nao pode ser negativo.',
        },
      },
    },
    category: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'A categoria e obrigatoria.' },
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Product;
