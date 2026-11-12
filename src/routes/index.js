/**
 * Roteador principal da API (/api)
 * Centraliza todos os grupos de rotas do sistema.
 */

const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');

const router = express.Router();

// Rota simples para verificar se a API está respondendo
router.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    mensagem: 'API RESTful MVC em funcionamento.',
  });
});

// Agrupando rotas por recurso
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/produtos', productRoutes);

module.exports = router;
