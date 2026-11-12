/**
 * Controller de Autenticação (AuthController)
 * Responsável pelo cadastro de novos usuários e validação de login.
 */

const { User } = require('../models');
const { hashPassword, verifyPassword } = require('../middlewares/authMiddleware');

const authController = {
  /**
   * POST /api/auth/register
   * Cadastra um novo usuário no banco de dados.
   */
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Validação simples dos campos obrigatórios
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
          erro: 'O nome e obrigatorio e precisa ter pelo menos 2 caracteres.',
        });
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({
          erro: 'Informe um e-mail valido.',
        });
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({
          erro: 'A senha e obrigatoria e deve ter no minimo 6 caracteres.',
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Verifica se já existe alguém com o mesmo e-mail
      const existingUser = await User.findOne({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return res.status(400).json({
          erro: 'Ja existe um usuario cadastrado com este e-mail.',
        });
      }

      // Cria o hash da senha antes de salvar no MySQL
      const passwordHash = hashPassword(password);

      const newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        role: 'student',
      });

      // Retorna 201 (Created) sem enviar o password_hash na resposta
      return res.status(201).json({
        mensagem: 'Usuario cadastrado com sucesso.',
        usuario: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          created_at: newUser.created_at,
        },
      });
    } catch (error) {
      console.error('Erro ao cadastrar usuario:', error);
      return res.status(500).json({
        erro: 'Erro interno no servidor ao cadastrar usuario.',
      });
    }
  },

  /**
   * POST /api/auth/login
   * Valida e-mail e senha e devolve o cabeçalho Basic Auth pronto para testes.
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          erro: 'Informe e-mail e senha para entrar.',
        });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const user = await User.findOne({ where: { email: normalizedEmail } });

      if (!user || !verifyPassword(String(password), user.password_hash)) {
        return res.status(401).json({
          erro: 'E-mail ou senha incorretos.',
        });
      }

      // Gera a string Basic Base64 para facilitar o uso nas rotas protegidas
      const basicToken = Buffer.from(`${normalizedEmail}:${password}`).toString('base64');

      return res.status(200).json({
        mensagem: 'Login realizado com sucesso.',
        usuario: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        authorization_header: `Basic ${basicToken}`,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({
        erro: 'Erro interno no servidor ao realizar login.',
      });
    }
  },
};

module.exports = authController;
