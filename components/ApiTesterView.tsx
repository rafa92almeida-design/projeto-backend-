'use client';

import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Send,
  ShieldAlert,
} from 'lucide-react';
import {
  encodeBasicAuth,
  executeSandboxRequest,
  type HttpMethod,
  type SandboxResponse,
  type SandboxState,
} from '@/lib/api-sandbox';

interface ApiTesterViewProps {
  sandboxState: SandboxState;
  onUpdateState: (next: SandboxState) => void;
}

interface EndpointPreset {
  id: string;
  label: string;
  method: HttpMethod;
  path: string;
  requiresAuth: boolean;
  description: string;
  defaultBody?: string;
}

const ENDPOINT_PRESETS: EndpointPreset[] = [
  {
    id: 'list-products',
    label: 'Listar produtos',
    method: 'GET',
    path: '/api/produtos',
    requiresAuth: false,
    description:
      'Retorna todos os produtos cadastrados. Suporta ?category= e ?search=.',
  },
  {
    id: 'get-product',
    label: 'Buscar produto por ID',
    method: 'GET',
    path: '/api/produtos/1',
    requiresAuth: false,
    description:
      'Busca um produto específico pelo ID. Retorna 400 se ID inválido ou 404 se não existir.',
  },
  {
    id: 'create-product',
    label: 'Criar novo produto',
    method: 'POST',
    path: '/api/produtos',
    requiresAuth: true,
    description:
      'Valida os dados de entrada e cria um novo registro na tabela products.',
    defaultBody: JSON.stringify(
      {
        name: 'Webcam Full HD 1080p',
        description: 'Camera com microfone integrado para reunioes',
        price: 249.9,
        stock: 10,
        category: 'Perifericos',
        active: true,
      },
      null,
      2
    ),
  },
  {
    id: 'update-product',
    label: 'Atualizar produto',
    method: 'PUT',
    path: '/api/produtos/1',
    requiresAuth: true,
    description:
      'Atualiza preço, estoque ou informações de um produto existente.',
    defaultBody: JSON.stringify(
      {
        name: 'Teclado Mecanico ABNT2 Pro',
        price: 329.9,
        stock: 18,
      },
      null,
      2
    ),
  },
  {
    id: 'delete-product',
    label: 'Remover produto',
    method: 'DELETE',
    path: '/api/produtos/4',
    requiresAuth: true,
    description: 'Exclui o produto informado da tabela products no MySQL.',
  },
  {
    id: 'auth-register',
    label: 'Cadastrar usuário',
    method: 'POST',
    path: '/api/auth/register',
    requiresAuth: false,
    description:
      'Cria um novo usuário na tabela users com validação de e-mail e senha.',
    defaultBody: JSON.stringify(
      {
        name: 'Lucas Ferreira',
        email: 'lucas@curso.dev',
        password: 'minhasenha123',
      },
      null,
      2
    ),
  },
  {
    id: 'auth-login',
    label: 'Fazer login (Basic Auth)',
    method: 'POST',
    path: '/api/auth/login',
    requiresAuth: false,
    description:
      'Valida credenciais e devolve o header Authorization Basic pronto.',
    defaultBody: JSON.stringify(
      {
        email: 'aluno@exemplo.com',
        password: '123456',
      },
      null,
      2
    ),
  },
  {
    id: 'list-users',
    label: 'Listar usuários',
    method: 'GET',
    path: '/api/users',
    requiresAuth: true,
    description:
      'Lista os usuários cadastrados sem expor o campo password_hash.',
  },
  {
    id: 'update-user',
    label: 'Atualizar usuário',
    method: 'PUT',
    path: '/api/users/1',
    requiresAuth: true,
    description:
      'Atualiza o próprio usuário (ou retorna 403 se tentar alterar outra conta).',
    defaultBody: JSON.stringify(
      {
        name: 'Rafael Almeida Silva',
      },
      null,
      2
    ),
  },
  {
    id: 'delete-user',
    label: 'Remover usuário',
    method: 'DELETE',
    path: '/api/users/2',
    requiresAuth: true,
    description:
      'Exclui o usuário informado (exige ser o próprio usuário ou admin).',
  },
  {
    id: 'health',
    label: 'Verificar saúde da API',
    method: 'GET',
    path: '/api/health',
    requiresAuth: false,
    description: 'Endpoint simples para checar se o Express está respondendo.',
  },
];

function getMethodStyle(method: HttpMethod) {
  switch (method) {
    case 'GET':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'POST':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'PUT':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'DELETE':
      return 'bg-red-50 text-red-800 border-red-200';
  }
}

function getStatusBannerStyle(status: number) {
  if (status >= 200 && status < 300) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  }
  if (status === 401) {
    return 'border-amber-200 bg-amber-50 text-amber-900';
  }
  return 'border-red-200 bg-red-50 text-red-900';
}

export default function ApiTesterView({
  sandboxState,
  onUpdateState,
}: ApiTesterViewProps) {
  const [selectedPresetId, setSelectedPresetId] =
    useState<string>('list-products');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [requestPath, setRequestPath] = useState<string>('/api/produtos');
  const [bodyText, setBodyText] = useState<string>('');
  const [useBasicAuth, setUseBasicAuth] = useState<boolean>(true);
  const [authEmail, setAuthEmail] = useState<string>('aluno@exemplo.com');
  const [authPassword, setAuthPassword] = useState<string>('123456');
  const [lastResponse, setLastResponse] = useState<SandboxResponse | null>(
    null
  );

  const selectedPreset =
    ENDPOINT_PRESETS.find((p) => p.id === selectedPresetId) ??
    ENDPOINT_PRESETS[0];

  function handleSelectPreset(preset: EndpointPreset) {
    setSelectedPresetId(preset.id);
    setMethod(preset.method);
    setRequestPath(preset.path);
    setBodyText(preset.defaultBody ?? '');
    setLastResponse(null);
  }

  function handleSendRequest(e: React.FormEvent) {
    e.preventDefault();
    const authHeader = useBasicAuth
      ? encodeBasicAuth(authEmail, authPassword)
      : undefined;

    const result = executeSandboxRequest(sandboxState, {
      method,
      path: requestPath,
      authHeader,
      bodyText: method === 'POST' || method === 'PUT' ? bodyText : undefined,
    });

    onUpdateState(result.nextState);
    setLastResponse(result.response);
  }

  function handleLoadInvalidBody() {
    setBodyText(
      JSON.stringify(
        {
          name: 'A',
          price: -15,
          stock: -2,
          category: '',
        },
        null,
        2
      )
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <section className="border-b border-zinc-200 pb-6">
        <div className="max-w-3xl space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Testador Interativo da API RESTful
          </h1>
          <p className="text-sm text-zinc-600">
            Execute requisições reais contra o simulador das regras dos
            controllers, validações de entrada, autenticação Basic Auth e banco
            simulado em memória.
          </p>
        </div>
      </section>

      {/* Grid do Testador */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[270px_minmax(0,1fr)] items-start">
        {/* Lista de endpoints */}
        <aside
          aria-label="Lista de endpoints da API"
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <h2 className="mb-3 border-b border-zinc-100 pb-2.5 text-xs font-semibold text-zinc-900">
            Endpoints Disponíveis
          </h2>
          <ul className="space-y-1">
            {ENDPOINT_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <li key={preset.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex w-full flex-col gap-1 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-950'
                        : 'hover:bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[11px] font-semibold ${getMethodStyle(
                          preset.method
                        )}`}
                      >
                        {preset.method}
                      </span>
                      {preset.requiresAuth && (
                        <span className="text-[11px] text-zinc-500">
                          Basic Auth
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium">{preset.label}</span>
                    <span className="truncate font-mono text-[11px] text-zinc-500">
                      {preset.path}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Formulário de Requisição + Resposta */}
        <div className="min-w-0 space-y-6">
          <form
            onSubmit={handleSendRequest}
            className="rounded-xl border border-zinc-200 bg-white p-5 space-y-5"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span>{selectedPreset.label}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {selectedPreset.requiresAuth
                    ? 'Rota protegida por Basic Auth'
                    : 'Rota pública'}
                </span>
              </div>
              <p className="text-sm text-zinc-700">
                {selectedPreset.description}
              </p>
            </div>

            {/* Barra de Método + URL */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="sm:w-32">
                <label htmlFor="http-method" className="sr-only">
                  Método HTTP
                </label>
                <select
                  id="http-method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 font-mono text-xs font-semibold text-zinc-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div className="flex-1">
                <label htmlFor="endpoint-path" className="sr-only">
                  Caminho do endpoint
                </label>
                <input
                  id="endpoint-path"
                  type="text"
                  value={requestPath}
                  onChange={(e) => setRequestPath(e.target.value)}
                  placeholder="/api/produtos"
                  className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 font-mono text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap shrink-0"
              >
                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Enviar requisição</span>
              </button>
            </div>

            {/* Configuração de Basic Auth */}
            <div className="rounded-lg bg-zinc-50 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useBasicAuth}
                    onChange={(e) => setUseBasicAuth(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-700 focus:ring-blue-600"
                  />
                  <KeyRound className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                  <span>Enviar cabeçalho Authorization: Basic Auth</span>
                </label>

                <span className="text-xs text-zinc-500">
                  Desmarque para testar erro 401
                </span>
              </div>

              {useBasicAuth && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="auth-email"
                      className="mb-1 block text-xs font-medium text-zinc-700"
                    >
                      E-mail
                    </label>
                    <input
                      id="auth-email"
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="auth-password"
                      className="mb-1 block text-xs font-medium text-zinc-700"
                    >
                      Senha
                    </label>
                    <input
                      id="auth-password"
                      type="text"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 font-mono text-xs text-zinc-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Editor JSON Body para POST / PUT */}
            {(method === 'POST' || method === 'PUT') && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="json-body"
                    className="text-xs font-semibold text-zinc-800"
                  >
                    Corpo da Requisição (JSON)
                  </label>
                  <div className="flex items-center gap-2">
                    {requestPath.startsWith('/api/produtos') && (
                      <button
                        type="button"
                        onClick={handleLoadInvalidBody}
                        className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                      >
                        Testar payload inválido (400)
                      </button>
                    )}
                    {selectedPreset.defaultBody && (
                      <button
                        type="button"
                        onClick={() =>
                          setBodyText(selectedPreset.defaultBody ?? '')
                        }
                        className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                      >
                        Restaurar exemplo
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="json-body"
                  rows={8}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-950 p-3.5 font-mono text-xs leading-relaxed text-zinc-100 [font-variant-ligatures:none] focus:border-blue-600 focus:outline-none"
                />
              </div>
            )}
          </form>

          {/* Resposta HTTP */}
          <section
            aria-label="Resposta da API"
            aria-live="polite"
            className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-semibold text-zinc-900">
                Resposta HTTP
              </h2>
              {lastResponse && (
                <div
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-semibold tabular-nums ${getStatusBannerStyle(
                    lastResponse.status
                  )}`}
                >
                  {lastResponse.status >= 200 && lastResponse.status < 300 ? (
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : lastResponse.status === 401 ? (
                    <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>
                    HTTP {lastResponse.status} {lastResponse.statusText}
                  </span>
                </div>
              )}
            </div>

            {lastResponse ? (
              <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-100 [font-variant-ligatures:none]">
                {JSON.stringify(lastResponse.body, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-zinc-500">
                Clique em &quot;Enviar requisição&quot; para visualizar o status
                HTTP e o JSON retornado pelo controller.
              </p>
            )}
          </section>

          {/* Estado atual das tabelas MySQL simuladas */}
          <section
            aria-label="Visualização das tabelas do banco"
            className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">
                  Estado Atual da Tabela <span className="font-mono">products</span>
                </h2>
                <p className="text-xs text-zinc-500">
                  Atualizado em tempo real após chamadas POST, PUT ou DELETE.
                </p>
              </div>
              <span className="text-xs font-medium text-zinc-600 tabular-nums">
                {sandboxState.products.length} registros ·{' '}
                {sandboxState.users.length} usuário(s)
              </span>
            </div>

            {sandboxState.products.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center space-y-2">
                <p className="text-sm font-medium text-zinc-700">
                  Nenhum produto cadastrado na tabela.
                </p>
                <p className="text-xs text-zinc-500">
                  Use o endpoint POST /api/produtos ou resete os dados de teste.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500">
                      <th className="py-2 pr-3 font-medium">ID</th>
                      <th className="py-2 pr-3 font-medium">Nome</th>
                      <th className="py-2 pr-3 font-medium">Categoria</th>
                      <th className="py-2 pr-3 font-medium text-right">
                        Preço (R$)
                      </th>
                      <th className="py-2 pr-3 font-medium text-right">
                        Estoque
                      </th>
                      <th className="py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {sandboxState.products.map((product) => (
                      <tr key={product.id} className="hover:bg-zinc-50">
                        <td className="py-2.5 pr-3 font-mono text-zinc-500 tabular-nums">
                          {product.id}
                        </td>
                        <td className="py-2.5 pr-3 font-medium text-zinc-900">
                          {product.name}
                        </td>
                        <td className="py-2.5 pr-3 text-zinc-600">
                          {product.category}
                        </td>
                        <td className="py-2.5 pr-3 text-right font-mono text-zinc-900 tabular-nums">
                          {product.price}
                        </td>
                        <td className="py-2.5 pr-3 text-right font-mono text-zinc-900 tabular-nums">
                          {product.stock}
                        </td>
                        <td className="py-2.5 text-zinc-700">
                          {product.active ? 'Ativo' : 'Inativo'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
