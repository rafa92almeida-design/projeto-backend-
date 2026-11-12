/**
 * Rotas de Usuários (/api/users)
 * Todas as rotas de consulta, atualização e exclusão exigem autenticação Basic Auth.
 */

const express = require('express');
const userController = require('../controllers/userController');
const { requireBasicAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protege todas as rotas de /api/users com autenticação básica
router.use(requireBasicAuth);

router.get('/', userController.index);
router.get('/:id', userController.show);
router.put('/:id', userController.update);
router.delete('/:id', userController.destroy);

module.exports = router;
