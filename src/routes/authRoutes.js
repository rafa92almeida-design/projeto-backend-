/**
 * Rotas de Autenticação (/api/auth)
 * Mapeia os endpoints de cadastro e login para o AuthController.
 */

const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Rota para cadastrar um novo usuário
router.post('/register', authController.register);

// Rota para autenticar usuário e obter o header Basic Auth
router.post('/login', authController.login);

module.exports = router;
