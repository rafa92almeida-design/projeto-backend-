/**
 * Rotas de Produtos (/api/produtos)
 * Rotas de leitura (GET) são públicas; criação, edição e exclusão exigem autenticação.
 */

const express = require('express');
const productController = require('../controllers/productController');
const { requireBasicAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

// Rotas públicas (qualquer visitante pode listar e ver detalhes)
router.get('/', productController.index);
router.get('/:id', productController.show);

// Rotas protegidas (exigem cabeçalho Authorization: Basic ...)
router.post('/', requireBasicAuth, productController.store);
router.put('/:id', requireBasicAuth, productController.update);
router.delete('/:id', requireBasicAuth, productController.destroy);

module.exports = router;
