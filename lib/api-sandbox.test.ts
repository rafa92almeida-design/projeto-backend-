import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialSandboxState,
  encodeBasicAuth,
  executeSandboxRequest,
} from './api-sandbox';

test('GET /api/health retorna 200 OK', () => {
  const state = createInitialSandboxState();
  const { response } = executeSandboxRequest(state, {
    method: 'GET',
    path: '/api/health',
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    status: 'ok',
    mensagem: 'API RESTful MVC em funcionamento.',
  });
});

test('GET /api/produtos lista e filtra produtos corretamente', () => {
  const state = createInitialSandboxState();

  const allRes = executeSandboxRequest(state, {
    method: 'GET',
    path: '/api/produtos',
  });
  assert.equal(allRes.response.status, 200);
  assert.equal((allRes.response.body as { total: number }).total, 4);

  const filteredRes = executeSandboxRequest(state, {
    method: 'GET',
    path: '/api/produtos?category=Monitores',
  });
  assert.equal(filteredRes.response.status, 200);
  assert.equal((filteredRes.response.body as { total: number }).total, 1);
});

test('GET /api/produtos/:id valida ID invalido (400) e inexistente (404)', () => {
  const state = createInitialSandboxState();

  const invalidRes = executeSandboxRequest(state, {
    method: 'GET',
    path: '/api/produtos/abc',
  });
  assert.equal(invalidRes.response.status, 400);

  const notFoundRes = executeSandboxRequest(state, {
    method: 'GET',
    path: '/api/produtos/999',
  });
  assert.equal(notFoundRes.response.status, 404);
});

test('POST /api/produtos exige Basic Auth (401), valida entrada (400) e cria (201)', () => {
  const state = createInitialSandboxState();
  const authHeader = encodeBasicAuth('aluno@exemplo.com', '123456');

  const unauthRes = executeSandboxRequest(state, {
    method: 'POST',
    path: '/api/produtos',
    bodyText: JSON.stringify({
      name: 'Webcam Full HD',
      price: 220,
      stock: 5,
      category: 'Perifericos',
    }),
  });
  assert.equal(unauthRes.response.status, 401);

  const invalidBodyRes = executeSandboxRequest(state, {
    method: 'POST',
    path: '/api/produtos',
    authHeader,
    bodyText: JSON.stringify({
      name: 'A',
      price: -10,
      stock: -1,
      category: '',
    }),
  });
  assert.equal(invalidBodyRes.response.status, 400);

  const createdRes = executeSandboxRequest(state, {
    method: 'POST',
    path: '/api/produtos',
    authHeader,
    bodyText: JSON.stringify({
      name: 'Webcam Full HD',
      price: 220,
      stock: 5,
      category: 'Perifericos',
    }),
  });
  assert.equal(createdRes.response.status, 201);
  assert.equal(createdRes.nextState.products.length, 5);
});

test('PUT e DELETE /api/produtos/:id atualizam e removem o produto com 200 OK', () => {
  const state = createInitialSandboxState();
  const authHeader = encodeBasicAuth('aluno@exemplo.com', '123456');

  const updateRes = executeSandboxRequest(state, {
    method: 'PUT',
    path: '/api/produtos/1',
    authHeader,
    bodyText: JSON.stringify({
      price: 310.5,
      stock: 20,
    }),
  });
  assert.equal(updateRes.response.status, 200);
  const updatedProduct = updateRes.nextState.products.find((p) => p.id === 1);
  assert.equal(updatedProduct?.price, '310.50');
  assert.equal(updatedProduct?.stock, 20);

  const deleteRes = executeSandboxRequest(updateRes.nextState, {
    method: 'DELETE',
    path: '/api/produtos/1',
    authHeader,
  });
  assert.equal(deleteRes.response.status, 200);
  assert.equal(deleteRes.nextState.products.length, 3);
});

test('POST /api/auth/register e /api/auth/login permitem cadastrar e autenticar novo usuario', () => {
  const state = createInitialSandboxState();

  const registerRes = executeSandboxRequest(state, {
    method: 'POST',
    path: '/api/auth/register',
    bodyText: JSON.stringify({
      name: 'Marina Costa',
      email: 'marina@escola.dev',
      password: 'segredo123',
    }),
  });
  assert.equal(registerRes.response.status, 201);
  assert.equal(registerRes.nextState.users.length, 2);

  const loginRes = executeSandboxRequest(registerRes.nextState, {
    method: 'POST',
    path: '/api/auth/login',
    bodyText: JSON.stringify({
      email: 'marina@escola.dev',
      password: 'segredo123',
    }),
  });
  assert.equal(loginRes.response.status, 200);
  assert.ok(
    (loginRes.response.body as { authorization_header: string }).authorization_header.startsWith(
      'Basic '
    )
  );
});

test('GET/PUT/DELETE /api/users e autorizacao 403 entre usuarios funcionam corretamente', () => {
  const initialState = createInitialSandboxState();
  const ownerAuth = encodeBasicAuth('aluno@exemplo.com', '123456');

  // Cadastra segundo usuário
  const reg = executeSandboxRequest(initialState, {
    method: 'POST',
    path: '/api/auth/register',
    bodyText: JSON.stringify({
      name: 'Outro Aluno',
      email: 'outro@escola.dev',
      password: 'password123',
    }),
  });
  assert.equal(reg.response.status, 201);
  const otherAuth = encodeBasicAuth('outro@escola.dev', 'password123');

  // Lista usuários autenticado (sem expor senha)
  const listUsers = executeSandboxRequest(reg.nextState, {
    method: 'GET',
    path: '/api/users',
    authHeader: ownerAuth,
  });
  assert.equal(listUsers.response.status, 200);
  const usersList = (listUsers.response.body as { usuarios: Array<Record<string, unknown>> }).usuarios;
  assert.equal(usersList.length, 2);
  assert.equal(usersList[0].passwordPlain, undefined);

  // Outro usuário tentando editar produto do usuário 1 -> 403 Forbidden
  const forbiddenProductEdit = executeSandboxRequest(reg.nextState, {
    method: 'PUT',
    path: '/api/produtos/1',
    authHeader: otherAuth,
    bodyText: JSON.stringify({ price: 99 }),
  });
  assert.equal(forbiddenProductEdit.response.status, 403);

  // Outro usuário tentando editar usuário 1 -> 403 Forbidden
  const forbiddenUserEdit = executeSandboxRequest(reg.nextState, {
    method: 'PUT',
    path: '/api/users/1',
    authHeader: otherAuth,
    bodyText: JSON.stringify({ name: 'Hack' }),
  });
  assert.equal(forbiddenUserEdit.response.status, 403);

  // Usuário 2 atualiza e remove a própria conta -> 200 OK
  const selfUpdate = executeSandboxRequest(reg.nextState, {
    method: 'PUT',
    path: '/api/users/2',
    authHeader: otherAuth,
    bodyText: JSON.stringify({ name: 'Outro Aluno Atualizado' }),
  });
  assert.equal(selfUpdate.response.status, 200);

  const selfDelete = executeSandboxRequest(selfUpdate.nextState, {
    method: 'DELETE',
    path: '/api/users/2',
    authHeader: otherAuth,
  });
  assert.equal(selfDelete.response.status, 200);
  assert.equal(selfDelete.nextState.users.length, 1);
});
