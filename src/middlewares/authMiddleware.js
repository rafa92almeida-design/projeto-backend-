/**
 * Middleware de Autenticação Básica (Basic Auth) e Token simples.
 * Fica entre a rota e o controller para proteger endpoints de criação,
 * edição e exclusão de produtos.
 */

const crypto = require('crypto');
const { User } = require('../models');

/**
 * Gera um hash seguro da senha usando o módulo nativo 'crypto' do Node.js.
 * Formato salvo no banco: "salt:hash"
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Compara a senha digitada com o hash salvo no banco de forma segura.
 */
function verifyPassword(password, storedHash) {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;

  const hashBuffer = crypto.scryptSync(password, salt, 64);
  const originalBuffer = Buffer.from(originalHash, 'hex');

  if (hashBuffer.length !== originalBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, originalBuffer);
}

/**
 * Middleware Express que exige o cabeçalho Authorization: Basic <base64(email:senha)>
 */
async function requireBasicAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 1. Verifica se o header Authorization foi enviado
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({
        erro: 'Acesso nao autorizado. Envie as credenciais no formato Basic Auth.',
      });
    }

    // 2. Decodifica a string Base64 para "email:senha"
    const base64Credentials = authHeader.slice(6).trim();
    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const separatorIndex = decoded.indexOf(':');

    if (separatorIndex === -1) {
      return res.status(401).json({
        erro: 'Formato de credenciais invalido.',
      });
    }

    const email = decoded.slice(0, separatorIndex).trim().toLowerCase();
    const password = decoded.slice(separatorIndex + 1);

    // 3. Busca o usuário no banco de dados MySQL pelo e-mail
    const user = await User.findOne({ where: { email } });

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({
        erro: 'E-mail ou senha invalidos.',
      });
    }

    // 4. Salva os dados básicos do usuário na requisição para o controller usar
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Segue para o próximo middleware ou controller
    return next();
  } catch (error) {
    console.error('Erro no middleware de autenticacao:', error);
    return res.status(500).json({
      erro: 'Erro interno ao validar autenticacao.',
    });
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  requireBasicAuth,
};
