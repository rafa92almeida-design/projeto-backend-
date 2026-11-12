/**
 * Model User (Usuário)
 * Representa a tabela 'users' no banco de dados MySQL.
 * Responsável por armazenar os dados de cadastro e autenticação.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O nome do usuario e obrigatorio.' },
        len: {
          args: [2, 100],
          msg: 'O nome deve ter entre 2 e 100 caracteres.',
        },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: {
        msg: 'Este e-mail ja esta cadastrado.',
      },
      validate: {
        isEmail: { msg: 'Informe um e-mail valido.' },
      },
    },
    // Guardamos apenas o hash da senha, nunca a senha em texto puro
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'student'),
      allowNull: false,
      defaultValue: 'student',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = User;
