export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface SandboxUser {
  id: number;
  name: string;
  email: string;
  passwordPlain: string;
  role: 'admin' | 'student';
  created_at: string;
}

export interface SandboxProduct {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  category: string;
  active: boolean;
  user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface SandboxState {
  users: SandboxUser[];
  products: SandboxProduct[];
  nextUserId: number;
  nextProductId: number;
}

export interface SandboxRequest {
  method: HttpMethod;
  path: string;
  authHeader?: string;
  bodyText?: string;
}

export interface SandboxResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
}

const HTTP_STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
};

export function createInitialSandboxState(): SandboxState {
  return {
    users: [
      {
        id: 1,
        name: 'Rafael Almeida',
        email: 'aluno@exemplo.com',
        passwordPlain: '123456',
        role: 'student',
        created_at: '2026-11-12T10:00:00.000Z',
      },
    ],
    products: [
      {
        id: 1,
        name: 'Teclado Mecanico ABNT2',
        description: 'Teclado compacto switch marrom para programacao',
        price: '289.90',
        stock: 14,
        category: 'Perifericos',
        active: true,
        user_id: 1,
        created_at: '2026-11-12T10:05:00.000Z',
        updated_at: '2026-11-12T10:05:00.000Z',
      },
      {
        id: 2,
        name: 'Mouse Ergonomico Sem Fio',
        description: 'Sensor optico 4000 DPI com conexao USB-C',
        price: '149.50',
        stock: 22,
        category: 'Perifericos',
        active: true,
        user_id: 1,
        created_at: '2026-11-12T10:12:00.000Z',
        updated_at: '2026-11-12T10:12:00.000Z',
      },
      {
        id: 3,
        name: 'Monitor IPS 27 Full HD',
        description: 'Painel antirreflexo 75Hz ideal para codigo e leitura',
        price: '1190.00',
        stock: 6,
        category: 'Monitores',
        active: true,
        user_id: 1,
        created_at: '2026-11-12T10:20:00.000Z',
        updated_at: '2026-11-12T10:20:00.000Z',
      },
      {
        id: 4,
        name: 'Hub USB-C 7 em 1',
        description: 'HDMI 4K, leitor SD e 3 portas USB 3.0',
        price: '175.00',
        stock: 0,
        category: 'Acessorios',
        active: false,
        user_id: 1,
        created_at: '2026-11-12T10:30:00.000Z',
        updated_at: '2026-11-12T10:30:00.000Z',
      },
    ],
    nextUserId: 2,
    nextProductId: 5,
  };
}

export function encodeBasicAuth(email: string, password: string): string {
  const raw = `${email}:${password}`;
  if (typeof Buffer !== 'undefined') {
    return `Basic ${Buffer.from(raw, 'utf8').toString('base64')}`;
  }
  return `Basic ${btoa(raw)}`;
}

function decodeBase64(encoded: string): string | null {
  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(encoded, 'base64').toString('utf8');
    }
    return atob(encoded);
  } catch {
    return null;
  }
}

function respond(status: number, body: unknown): SandboxResponse {
  return {
    status,
    statusText: HTTP_STATUS_TEXT[status] || 'Status',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Powered-By': 'Express (Simulador MVC)',
    },
    body,
  };
}

export function validateProductPayload(
  body: Record<string, unknown>,
  isUpdate: boolean
): string[] {
  const errors: string[] = [];

  if (!isUpdate || body.name !== undefined) {
    if (
      !body.name ||
      typeof body.name !== 'string' ||
      body.name.trim().length < 2
    ) {
      errors.push('O nome do produto deve ter pelo menos 2 caracteres.');
    }
  }

  if (!isUpdate || body.price !== undefined) {
    const parsedPrice = Number(body.price);
    if (
      body.price === undefined ||
      body.price === '' ||
      body.price === null ||
      Number.isNaN(parsedPrice) ||
      parsedPrice <= 0
    ) {
      errors.push('O preco deve ser um numero maior que zero.');
    }
  }

  if (!isUpdate || body.stock !== undefined) {
    const parsedStock = Number(body.stock);
    if (
      body.stock === undefined ||
      body.stock === '' ||
      body.stock === null ||
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      errors.push(
        'O estoque deve ser um numero inteiro maior ou igual a zero.'
      );
    }
  }

  if (!isUpdate || body.category !== undefined) {
    if (
      !body.category ||
      typeof body.category !== 'string' ||
      body.category.trim().length < 2
    ) {
      errors.push('A categoria do produto e obrigatoria.');
    }
  }

  return errors;
}

function authenticateBasic(
  state: SandboxState,
  authHeader?: string
): { user?: SandboxUser; errorResponse?: SandboxResponse } {
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return {
      errorResponse: respond(401, {
        erro: 'Acesso nao autorizado. Envie as credenciais no formato Basic Auth.',
      }),
    };
  }

  const base64Credentials = authHeader.slice(6).trim();
  const decoded = decodeBase64(base64Credentials);
  if (!decoded) {
    return {
      errorResponse: respond(401, {
        erro: 'Formato de credenciais invalido.',
      }),
    };
  }

  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) {
    return {
      errorResponse: respond(401, {
        erro: 'Formato de credenciais invalido.',
      }),
    };
  }

  const email = decoded.slice(0, separatorIndex).trim().toLowerCase();
  const password = decoded.slice(separatorIndex + 1);

  const user = state.users.find(
    (u) => u.email === email && u.passwordPlain === password
  );

  if (!user) {
    return {
      errorResponse: respond(401, {
        erro: 'E-mail ou senha invalidos.',
      }),
    };
  }

  return { user };
}

function parseJsonBody(
  bodyText?: string
): { data?: Record<string, unknown>; error?: SandboxResponse } {
  if (!bodyText || !bodyText.trim()) {
    return { data: {} };
  }

  try {
    const parsed = JSON.parse(bodyText);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {
        error: respond(400, {
          erro: 'O corpo da requisicao deve ser um objeto JSON valido.',
        }),
      };
    }
    return { data: parsed as Record<string, unknown> };
  } catch {
    return {
      error: respond(400, {
        erro: 'JSON malformado no corpo da requisicao.',
      }),
    };
  }
}

export function executeSandboxRequest(
  state: SandboxState,
  request: SandboxRequest
): { nextState: SandboxState; response: SandboxResponse } {
  const [rawPath, rawQuery = ''] = request.path.trim().split('?');
  const path = rawPath.replace(/\/+$/, '') || '/';
  const queryParams = new URLSearchParams(rawQuery);
  const method = request.method;

  // GET /api/health
  if (method === 'GET' && path === '/api/health') {
    return {
      nextState: state,
      response: respond(200, {
        status: 'ok',
        mensagem: 'API RESTful MVC em funcionamento.',
      }),
    };
  }

  // POST /api/auth/register
  if (method === 'POST' && path === '/api/auth/register') {
    const parsed = parseJsonBody(request.bodyText);
    if (parsed.error) return { nextState: state, response: parsed.error };
    const { name, email, password } = parsed.data!;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return {
        nextState: state,
        response: respond(400, {
          erro: 'O nome e obrigatorio e precisa ter pelo menos 2 caracteres.',
        }),
      };
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return {
        nextState: state,
        response: respond(400, {
          erro: 'Informe um e-mail valido.',
        }),
      };
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return {
        nextState: state,
        response: respond(400, {
          erro: 'A senha e obrigatoria e deve ter no minimo 6 caracteres.',
        }),
      };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const exists = state.users.some((u) => u.email === normalizedEmail);

    if (exists) {
      return {
        nextState: state,
        response: respond(400, {
          erro: 'Ja existe um usuario cadastrado com este e-mail.',
        }),
      };
    }

    const now = new Date().toISOString();
    const newUser: SandboxUser = {
      id: state.nextUserId,
      name: name.trim(),
      email: normalizedEmail,
      passwordPlain: password,
      role: 'student',
      created_at: now,
    };

    const nextState: SandboxState = {
      ...state,
      users: [...state.users, newUser],
      nextUserId: state.nextUserId + 1,
    };

    return {
      nextState,
      response: respond(201, {
        mensagem: 'Usuario cadastrado com sucesso.',
        usuario: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          created_at: newUser.created_at,
        },
      }),
    };
  }

  // POST /api/auth/login
  if (method === 'POST' && path === '/api/auth/login') {
    const parsed = parseJsonBody(request.bodyText);
    if (parsed.error) return { nextState: state, response: parsed.error };
    const { email, password } = parsed.data!;

    if (!email || !password) {
      return {
        nextState: state,
        response: respond(400, {
          erro: 'Informe e-mail e senha para entrar.',
        }),
      };
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = state.users.find(
      (u) => u.email === normalizedEmail && u.passwordPlain === String(password)
    );

    if (!user) {
      return {
        nextState: state,
        response: respond(401, {
          erro: 'E-mail ou senha incorretos.',
        }),
      };
    }

    return {
      nextState: state,
      response: respond(200, {
        mensagem: 'Login realizado com sucesso.',
        usuario: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        authorization_header: encodeBasicAuth(normalizedEmail, String(password)),
      }),
    };
  }

  // GET /api/produtos
  if (method === 'GET' && path === '/api/produtos') {
    const category = queryParams.get('category')?.trim().toLowerCase();
    const search = queryParams.get('search')?.trim().toLowerCase();

    const filtered = state.products
      .filter((p) => {
        if (category && p.category.toLowerCase() !== category) return false;
        if (search && !p.name.toLowerCase().includes(search)) return false;
        return true;
      })
      .sort((a, b) => b.id - a.id)
      .map((product) => {
        const owner = state.users.find((u) => u.id === product.user_id);
        return {
          ...product,
          owner: owner
            ? { id: owner.id, name: owner.name, email: owner.email }
            : null,
        };
      });

    return {
      nextState: state,
      response: respond(200, {
        total: filtered.length,
        produtos: filtered,
      }),
    };
  }

  // POST /api/produtos
  if (method === 'POST' && path === '/api/produtos') {
    const auth = authenticateBasic(state, request.authHeader);
    if (auth.errorResponse) {
      return { nextState: state, response: auth.errorResponse };
    }

    const parsed = parseJsonBody(request.bodyText);
    if (parsed.error) return { nextState: state, response: parsed.error };
    const body = parsed.data!;

    const validationErrors = validateProductPayload(body, false);
    if (validationErrors.length > 0) {
      return {
        nextState: state,
        response: respond(400, {
          erro: 'Dados invalidos para cadastro do produto.',
          detalhes: validationErrors,
        }),
      };
    }

    const now = new Date().toISOString();
    const created: SandboxProduct = {
      id: state.nextProductId,
      name: String(body.name).trim(),
      description: body.description ? String(body.description).trim() : null,
      price: Number(body.price).toFixed(2),
      stock: Number(body.stock),
      category: String(body.category).trim(),
      active: body.active !== undefined ? Boolean(body.active) : true,
      user_id: auth.user!.id,
      created_at: now,
      updated_at: now,
    };

    const nextState: SandboxState = {
      ...state,
      products: [...state.products, created],
      nextProductId: state.nextProductId + 1,
    };

    return {
      nextState,
      response: respond(201, {
        mensagem: 'Produto cadastrado com sucesso.',
        produto: created,
      }),
    };
  }

  // /api/produtos/:id (GET, PUT, DELETE)
  if (path.startsWith('/api/produtos/')) {
    const rawId = path.slice('/api/produtos/'.length);
    const productId = Number(rawId);

    if (method === 'GET') {
      if (!rawId || !Number.isInteger(productId) || productId <= 0) {
        return {
          nextState: state,
          response: respond(400, {
            erro: 'ID do produto invalido. Informe um numero inteiro positivo.',
          }),
        };
      }

      const product = state.products.find((p) => p.id === productId);
      if (!product) {
        return {
          nextState: state,
          response: respond(404, {
            erro: `Produto com ID ${productId} nao encontrado.`,
          }),
        };
      }

      const owner = state.users.find((u) => u.id === product.user_id);
      return {
        nextState: state,
        response: respond(200, {
          ...product,
          owner: owner
            ? { id: owner.id, name: owner.name, email: owner.email }
            : null,
        }),
      };
    }

    if (method === 'PUT') {
      const auth = authenticateBasic(state, request.authHeader);
      if (auth.errorResponse) {
        return { nextState: state, response: auth.errorResponse };
      }

      if (!rawId || !Number.isInteger(productId) || productId <= 0) {
        return {
          nextState: state,
          response: respond(400, {
            erro: 'ID do produto invalido.',
          }),
        };
      }

      const existingIndex = state.products.findIndex((p) => p.id === productId);
      if (existingIndex === -1) {
        return {
          nextState: state,
          response: respond(404, {
            erro: `Produto com ID ${productId} nao encontrado.`,
          }),
        };
      }

      const existing = state.products[existingIndex];
      if (
        existing.user_id &&
        existing.user_id !== auth.user!.id &&
        auth.user!.role !== 'admin'
      ) {
        return {
          nextState: state,
          response: respond(403, {
            erro: 'Voce nao tem permissao para atualizar este produto.',
          }),
        };
      }

      const parsed = parseJsonBody(request.bodyText);
      if (parsed.error) return { nextState: state, response: parsed.error };
      const body = parsed.data!;

      const validationErrors = validateProductPayload(body, true);
      if (validationErrors.length > 0) {
        return {
          nextState: state,
          response: respond(400, {
            erro: 'Dados invalidos para atualizacao.',
            detalhes: validationErrors,
          }),
        };
      }

      const updated: SandboxProduct = {
        ...existing,
        name: body.name !== undefined ? String(body.name).trim() : existing.name,
        description:
          body.description !== undefined
            ? String(body.description).trim()
            : existing.description,
        price:
          body.price !== undefined
            ? Number(body.price).toFixed(2)
            : existing.price,
        stock: body.stock !== undefined ? Number(body.stock) : existing.stock,
        category:
          body.category !== undefined
            ? String(body.category).trim()
            : existing.category,
        active:
          body.active !== undefined ? Boolean(body.active) : existing.active,
        updated_at: new Date().toISOString(),
      };

      const nextProducts = [...state.products];
      nextProducts[existingIndex] = updated;

      return {
        nextState: { ...state, products: nextProducts },
        response: respond(200, {
          mensagem: 'Produto atualizado com sucesso.',
          produto: updated,
        }),
      };
    }

    if (method === 'DELETE') {
      const auth = authenticateBasic(state, request.authHeader);
      if (auth.errorResponse) {
        return { nextState: state, response: auth.errorResponse };
      }

      if (!rawId || !Number.isInteger(productId) || productId <= 0) {
        return {
          nextState: state,
          response: respond(400, {
            erro: 'ID do produto invalido.',
          }),
        };
      }

      const existing = state.products.find((p) => p.id === productId);
      if (!existing) {
        return {
          nextState: state,
          response: respond(404, {
            erro: `Produto com ID ${productId} nao encontrado.`,
          }),
        };
      }

      if (
        existing.user_id &&
        existing.user_id !== auth.user!.id &&
        auth.user!.role !== 'admin'
      ) {
        return {
          nextState: state,
          response: respond(403, {
            erro: 'Voce nao tem permissao para excluir este produto.',
          }),
        };
      }

      return {
        nextState: {
          ...state,
          products: state.products.filter((p) => p.id !== productId),
        },
        response: respond(200, {
          mensagem: `Produto "${existing.name}" (ID ${productId}) removido com sucesso.`,
        }),
      };
    }
  }

  // GET /api/users
  if (method === 'GET' && path === '/api/users') {
    const auth = authenticateBasic(state, request.authHeader);
    if (auth.errorResponse) {
      return { nextState: state, response: auth.errorResponse };
    }

    const publicUsers = state.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      created_at: u.created_at,
    }));

    return {
      nextState: state,
      response: respond(200, {
        total: publicUsers.length,
        usuarios: publicUsers,
      }),
    };
  }

  // /api/users/:id (GET, PUT, DELETE)
  if (path.startsWith('/api/users/')) {
    const auth = authenticateBasic(state, request.authHeader);
    if (auth.errorResponse) {
      return { nextState: state, response: auth.errorResponse };
    }

    const rawId = path.slice('/api/users/'.length);
    const userId = Number(rawId);

    if (!rawId || !Number.isInteger(userId) || userId <= 0) {
      return {
        nextState: state,
        response: respond(400, {
          erro: 'ID do usuario invalido.',
        }),
      };
    }

    if (method === 'GET') {
      const user = state.users.find((u) => u.id === userId);
      if (!user) {
        return {
          nextState: state,
          response: respond(404, {
            erro: `Usuario com ID ${userId} nao encontrado.`,
          }),
        };
      }

      return {
        nextState: state,
        response: respond(200, {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        }),
      };
    }

    if (method === 'PUT') {
      if (auth.user!.id !== userId && auth.user!.role !== 'admin') {
        return {
          nextState: state,
          response: respond(403, {
            erro: 'Voce nao tem permissao para atualizar outro usuario.',
          }),
        };
      }

      const existingIndex = state.users.findIndex((u) => u.id === userId);
      if (existingIndex === -1) {
        return {
          nextState: state,
          response: respond(404, {
            erro: `Usuario com ID ${userId} nao encontrado.`,
          }),
        };
      }

      const parsed = parseJsonBody(request.bodyText);
      if (parsed.error) return { nextState: state, response: parsed.error };
      const { name, email, password } = parsed.data!;
      const errors: string[] = [];

      if (
        name !== undefined &&
        (typeof name !== 'string' || name.trim().length < 2)
      ) {
        errors.push('O nome deve ter pelo menos 2 caracteres.');
      }
      if (
        email !== undefined &&
        (typeof email !== 'string' || !email.includes('@'))
      ) {
        errors.push('Informe um e-mail valido.');
      }
      if (
        password !== undefined &&
        (typeof password !== 'string' || password.length < 6)
      ) {
        errors.push('A nova senha deve ter pelo menos 6 caracteres.');
      }

      if (errors.length > 0) {
        return {
          nextState: state,
          response: respond(400, {
            erro: 'Dados invalidos para atualizacao do usuario.',
            detalhes: errors,
          }),
        };
      }

      const existing = state.users[existingIndex];
      const nextEmail =
        email !== undefined ? String(email).trim().toLowerCase() : existing.email;

      if (
        nextEmail !== existing.email &&
        state.users.some((u) => u.email === nextEmail)
      ) {
        return {
          nextState: state,
          response: respond(400, {
            erro: 'Este e-mail ja esta sendo usado por outro usuario.',
          }),
        };
      }

      const updated: SandboxUser = {
        ...existing,
        name: name !== undefined ? String(name).trim() : existing.name,
        email: nextEmail,
        passwordPlain:
          password !== undefined ? String(password) : existing.passwordPlain,
      };

      const nextUsers = [...state.users];
      nextUsers[existingIndex] = updated;

      return {
        nextState: { ...state, users: nextUsers },
        response: respond(200, {
          mensagem: 'Usuario atualizado com sucesso.',
          usuario: {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
          },
        }),
      };
    }

    if (method === 'DELETE') {
      if (auth.user!.id !== userId && auth.user!.role !== 'admin') {
        return {
          nextState: state,
          response: respond(403, {
            erro: 'Voce nao tem permissao para excluir outro usuario.',
          }),
        };
      }

      const existing = state.users.find((u) => u.id === userId);
      if (!existing) {
        return {
          nextState: state,
          response: respond(404, {
            erro: `Usuario com ID ${userId} nao encontrado.`,
          }),
        };
      }

      return {
        nextState: {
          ...state,
          users: state.users.filter((u) => u.id !== userId),
        },
        response: respond(200, {
          mensagem: `Usuario "${existing.name}" (ID ${userId}) removido com sucesso.`,
        }),
      };
    }
  }

  return {
    nextState: state,
    response: respond(404, {
      erro: `Rota ${method} ${path} nao encontrada.`,
    }),
  };
}
