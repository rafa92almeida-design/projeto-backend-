/**
 * Controller de Produtos (ProductController)
 * Contém toda a lógica do CRUD completo (Listar, Buscar por ID, Criar, Atualizar e Excluir).
 * Segue o padrão MVC recebendo req/res das rotas e consultando o Model Product.
 */

const { Op } = require('sequelize');
const { Product, User } = require('../models');

/**
 * Função auxiliar para validar os dados de entrada ao criar/atualizar produto.
 * Retorna um array com as mensagens de erro encontradas.
 */
function validateProductPayload(body, isUpdate = false) {
  const errors = [];

  if (!isUpdate || body.name !== undefined) {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      errors.push('O nome do produto deve ter pelo menos 2 caracteres.');
    }
  }

  if (!isUpdate || body.price !== undefined) {
    const parsedPrice = Number(body.price);
    if (body.price === undefined || body.price === '' || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.push('O preco deve ser um numero maior que zero.');
    }
  }

  if (!isUpdate || body.stock !== undefined) {
    const parsedStock = Number(body.stock);
    if (
      body.stock === undefined ||
      body.stock === '' ||
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      errors.push('O estoque deve ser um numero inteiro maior ou igual a zero.');
    }
  }

  if (!isUpdate || body.category !== undefined) {
    if (!body.category || typeof body.category !== 'string' || body.category.trim().length < 2) {
      errors.push('A categoria do produto e obrigatoria.');
    }
  }

  return errors;
}

const productController = {
  /**
   * GET /api/produtos
   * Lista todos os produtos cadastrados (aceita filtros ?category= e ?search=).
   */
  async index(req, res) {
    try {
      const { category, search } = req.query;
      const where = {};

      // Aplica filtro de categoria se informado na URL
      if (category) {
        where.category = String(category).trim();
      }

      // Aplica busca parcial pelo nome do produto
      if (search) {
        where.name = { [Op.like]: `%${String(search).trim()}%` };
      }

      const products = await Product.findAll({
        where,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email'],
          },
        ],
        order: [['id', 'DESC']],
      });

      return res.status(200).json({
        total: products.length,
        produtos: products,
      });
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      return res.status(500).json({
        erro: 'Erro interno ao buscar lista de produtos.',
      });
    }
  },

  /**
   * GET /api/produtos/:id
   * Busca um único produto pelo ID informado na rota.
   */
  async show(req, res) {
    try {
      const productId = Number(req.params.id);

      // Valida se o ID recebido é um número inteiro positivo
      if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
          erro: 'ID do produto invalido. Informe um numero inteiro positivo.',
        });
      }

      const product = await Product.findByPk(productId, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      // Se não existir no banco, retorna 404 (Not Found)
      if (!product) {
        return res.status(404).json({
          erro: `Produto com ID ${productId} nao encontrado.`,
        });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error('Erro ao buscar produto por ID:', error);
      return res.status(500).json({
        erro: 'Erro interno ao consultar o produto.',
      });
    }
  },

  /**
   * POST /api/produtos
   * Cria um novo produto no banco de dados MySQL (rota protegida).
   */
  async store(req, res) {
    try {
      const validationErrors = validateProductPayload(req.body, false);

      if (validationErrors.length > 0) {
        return res.status(400).json({
          erro: 'Dados invalidos para cadastro do produto.',
          detalhes: validationErrors,
        });
      }

      const { name, description, price, stock, category, active } = req.body;

      const newProduct = await Product.create({
        name: name.trim(),
        description: description ? String(description).trim() : null,
        price: Number(price).toFixed(2),
        stock: Number(stock),
        category: category.trim(),
        active: active !== undefined ? Boolean(active) : true,
        user_id: req.user ? req.user.id : null,
      });

      // Retorna 201 (Created) com o registro recém-salvo
      return res.status(201).json({
        mensagem: 'Produto cadastrado com sucesso.',
        produto: newProduct,
      });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return res.status(500).json({
        erro: 'Erro interno ao salvar produto no banco de dados.',
      });
    }
  },

  /**
   * PUT /api/produtos/:id
   * Atualiza os dados de um produto existente (rota protegida).
   */
  async update(req, res) {
    try {
      const productId = Number(req.params.id);

      if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
          erro: 'ID do produto invalido.',
        });
      }

      const product = await Product.findByPk(productId);

      if (!product) {
        return res.status(404).json({
          erro: `Produto com ID ${productId} nao encontrado.`,
        });
      }

      // Autorização simples: só o criador do produto ou um admin pode atualizar
      if (product.user_id && product.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          erro: 'Voce nao tem permissao para atualizar este produto.',
        });
      }

      const validationErrors = validateProductPayload(req.body, true);

      if (validationErrors.length > 0) {
        return res.status(400).json({
          erro: 'Dados invalidos para atualizacao.',
          detalhes: validationErrors,
        });
      }

      const { name, description, price, stock, category, active } = req.body;

      // Atualiza apenas os campos enviados na requisição
      await product.update({
        name: name !== undefined ? name.trim() : product.name,
        description: description !== undefined ? String(description).trim() : product.description,
        price: price !== undefined ? Number(price).toFixed(2) : product.price,
        stock: stock !== undefined ? Number(stock) : product.stock,
        category: category !== undefined ? category.trim() : product.category,
        active: active !== undefined ? Boolean(active) : product.active,
      });

      return res.status(200).json({
        mensagem: 'Produto atualizado com sucesso.',
        produto: product,
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      return res.status(500).json({
        erro: 'Erro interno ao atualizar o produto.',
      });
    }
  },

  /**
   * DELETE /api/produtos/:id
   * Remove um produto do banco de dados (rota protegida).
   */
  async destroy(req, res) {
    try {
      const productId = Number(req.params.id);

      if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({
          erro: 'ID do produto invalido.',
        });
      }

      const product = await Product.findByPk(productId);

      if (!product) {
        return res.status(404).json({
          erro: `Produto com ID ${productId} nao encontrado.`,
        });
      }

      // Autorização simples: só o criador do produto ou um admin pode excluir
      if (product.user_id && product.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          erro: 'Voce nao tem permissao para excluir este produto.',
        });
      }

      await product.destroy();

      return res.status(200).json({
        mensagem: `Produto "${product.name}" (ID ${productId}) removido com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      return res.status(500).json({
        erro: 'Erro interno ao excluir o produto.',
      });
    }
  },
};

module.exports = productController;
