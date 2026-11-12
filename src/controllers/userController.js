/**
 * Controller de Usuários (UserController)
 * Completa o CRUD da entidade User (Listar, Buscar por ID, Atualizar e Excluir).
 * O cadastro inicial (Create) é feito via POST /api/auth/register.
 */

const { User } = require('../models');
const { hashPassword } = require('../middlewares/authMiddleware');

const userController = {
  /**
   * GET /api/users
   * Lista todos os usuários cadastrados (sem retornar password_hash).
   */
  async index(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'created_at', 'updated_at'],
        order: [['id', 'ASC']],
      });

      return res.status(200).json({
        total: users.length,
        usuarios: users,
      });
    } catch (error) {
      console.error('Erro ao listar usuarios:', error);
      return res.status(500).json({
        erro: 'Erro interno ao listar usuarios.',
      });
    }
  },

  /**
   * GET /api/users/:id
   * Busca um usuário específico pelo ID.
   */
  async show(req, res) {
    try {
      const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          erro: 'ID do usuario invalido. Informe um numero inteiro positivo.',
        });
      }

      const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'role', 'created_at', 'updated_at'],
      });

      if (!user) {
        return res.status(404).json({
          erro: `Usuario com ID ${userId} nao encontrado.`,
        });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Erro ao buscar usuario por ID:', error);
      return res.status(500).json({
        erro: 'Erro interno ao consultar usuario.',
      });
    }
  },

  /**
   * PUT /api/users/:id
   * Atualiza nome, e-mail ou senha do usuário (apenas o próprio usuário ou admin).
   */
  async update(req, res) {
    try {
      const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          erro: 'ID do usuario invalido.',
        });
      }

      // Autorização simples: só pode editar a própria conta ou se for admin
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          erro: 'Voce nao tem permissao para atualizar outro usuario.',
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          erro: `Usuario com ID ${userId} nao encontrado.`,
        });
      }

      const { name, email, password } = req.body;
      const errors = [];

      if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
        errors.push('O nome deve ter pelo menos 2 caracteres.');
      }

      if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
        errors.push('Informe um e-mail valido.');
      }

      if (password !== undefined && (typeof password !== 'string' || password.length < 6)) {
        errors.push('A nova senha deve ter pelo menos 6 caracteres.');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          erro: 'Dados invalidos para atualizacao do usuario.',
          detalhes: errors,
        });
      }

      // Se o e-mail mudou, verifica se já não pertence a outra pessoa
      if (email !== undefined) {
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail !== user.email) {
          const emailInUse = await User.findOne({ where: { email: normalizedEmail } });
          if (emailInUse) {
            return res.status(400).json({
              erro: 'Este e-mail ja esta sendo usado por outro usuario.',
            });
          }
        }
      }

      await user.update({
        name: name !== undefined ? name.trim() : user.name,
        email: email !== undefined ? email.trim().toLowerCase() : user.email,
        password_hash: password !== undefined ? hashPassword(password) : user.password_hash,
      });

      return res.status(200).json({
        mensagem: 'Usuario atualizado com sucesso.',
        usuario: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          updated_at: user.updated_at,
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar usuario:', error);
      return res.status(500).json({
        erro: 'Erro interno ao atualizar usuario.',
      });
    }
  },

  /**
   * DELETE /api/users/:id
   * Remove um usuário do banco de dados (apenas o próprio usuário ou admin).
   */
  async destroy(req, res) {
    try {
      const userId = Number(req.params.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          erro: 'ID do usuario invalido.',
        });
      }

      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          erro: 'Voce nao tem permissao para excluir outro usuario.',
        });
      }

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          erro: `Usuario com ID ${userId} nao encontrado.`,
        });
      }

      await user.destroy();

      return res.status(200).json({
        mensagem: `Usuario "${user.name}" (ID ${userId}) removido com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao excluir usuario:', error);
      return res.status(500).json({
        erro: 'Erro interno ao excluir usuario.',
      });
    }
  },
};

module.exports = userController;
