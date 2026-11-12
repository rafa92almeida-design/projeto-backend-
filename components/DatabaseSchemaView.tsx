'use client';

import { ArrowRight, Database, Key, Layers } from 'lucide-react';

interface ColumnSpec {
  name: string;
  type: string;
  constraint: string;
  notes: string;
}

const USERS_COLUMNS: ColumnSpec[] = [
  {
    name: 'id',
    type: 'INT',
    constraint: 'PK · AUTO_INCREMENT',
    notes: 'Identificador único do usuário',
  },
  {
    name: 'name',
    type: 'VARCHAR(100)',
    constraint: 'NOT NULL',
    notes: 'Nome completo (mín. 2 caracteres)',
  },
  {
    name: 'email',
    type: 'VARCHAR(150)',
    constraint: 'NOT NULL · UNIQUE',
    notes: 'E-mail usado no login e Basic Auth',
  },
  {
    name: 'password_hash',
    type: 'VARCHAR(255)',
    constraint: 'NOT NULL',
    notes: 'Hash gerado via crypto.scryptSync (salt:hash)',
  },
  {
    name: 'role',
    type: "ENUM('admin','student')",
    constraint: "DEFAULT 'student'",
    notes: 'Nível de permissão preparado para expansão',
  },
  {
    name: 'created_at / updated_at',
    type: 'DATETIME',
    constraint: 'NOT NULL',
    notes: 'Timestamps automáticos do Sequelize',
  },
];

const PRODUCTS_COLUMNS: ColumnSpec[] = [
  {
    name: 'id',
    type: 'INT',
    constraint: 'PK · AUTO_INCREMENT',
    notes: 'Identificador único do produto',
  },
  {
    name: 'name',
    type: 'VARCHAR(120)',
    constraint: 'NOT NULL',
    notes: 'Nome do item (mín. 2 caracteres)',
  },
  {
    name: 'description',
    type: 'TEXT',
    constraint: 'NULL',
    notes: 'Descrição opcional detalhada',
  },
  {
    name: 'price',
    type: 'DECIMAL(10, 2)',
    constraint: 'NOT NULL',
    notes: 'Preço com precisão decimal (> 0)',
  },
  {
    name: 'stock',
    type: 'INT',
    constraint: 'NOT NULL · DEFAULT 0',
    notes: 'Quantidade em estoque (>= 0)',
  },
  {
    name: 'category',
    type: 'VARCHAR(60)',
    constraint: 'NOT NULL',
    notes: 'Categoria usada no filtro ?category=',
  },
  {
    name: 'active',
    type: 'TINYINT(1)',
    constraint: 'NOT NULL · DEFAULT 1',
    notes: 'Indica se o produto está ativo no catálogo',
  },
  {
    name: 'user_id',
    type: 'INT',
    constraint: 'FK -> users(id)',
    notes: 'ON UPDATE CASCADE · ON DELETE SET NULL',
  },
];

const MVC_FLOW_STEPS = [
  {
    step: '01',
    title: 'Routes (src/routes)',
    detail:
      'Recebe a requisição HTTP (ex: POST /api/produtos) e direciona para o controller correto.',
  },
  {
    step: '02',
    title: 'Middleware (src/middlewares)',
    detail:
      'Nas rotas protegidas, decodifica o cabeçalho Basic Auth e valida o usuário no MySQL.',
  },
  {
    step: '03',
    title: 'Controller (src/controllers)',
    detail:
      'Valida os campos do req.body, aplica a regra de negócio e escolhe o status HTTP (200, 201, 400, 404).',
  },
  {
    step: '04',
    title: 'Model & MySQL (src/models)',
    detail:
      'O Sequelize converte os métodos findAll, findByPk, create, update e destroy em SQL seguro.',
  },
];

export default function DatabaseSchemaView() {
  return (
    <div className="space-y-8">
      <section className="space-y-1.5 border-b border-zinc-200 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Modelagem do Banco de Dados MySQL e Fluxo MVC
        </h1>
        <p className="max-w-2xl text-sm text-zinc-600">
          Estrutura relacional criada via Sequelize Migrations, com
          relacionamento 1:N entre usuários e produtos e fluxo de execução em
          camadas.
        </p>
      </section>

      {/* Fluxo MVC */}
      <section aria-label="Fluxo de requisição MVC" className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-700" aria-hidden="true" />
          <h2 className="text-base font-semibold text-zinc-900">
            Ciclo de uma Requisição no Padrão MVC
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {MVC_FLOW_STEPS.map((item, idx) => (
            <div
              key={item.step}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 space-y-2"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-blue-700">
                  <span className="font-semibold tabular-nums">
                    Etapa {item.step}
                  </span>
                  {idx < MVC_FLOW_STEPS.length - 1 && (
                    <ArrowRight
                      className="hidden h-3.5 w-3.5 text-zinc-400 xl:block"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-zinc-600">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabelas MySQL */}
      <section aria-label="Tabelas do banco de dados" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-zinc-900">
              Tabelas Relacionais (loja_mvc_db)
            </h2>
          </div>
          <span className="text-xs text-zinc-500">
            Relacionamento 1:N · users (1) — products (N)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Tabela users */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-zinc-600" aria-hidden="true" />
                <h3 className="font-mono text-sm font-semibold text-zinc-900">
                  users
                </h3>
              </div>
              <span className="text-xs text-zinc-500">Model: User.js</span>
            </div>

            <div className="overflow-x-auto p-4">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="py-2 pr-3 font-medium">Coluna</th>
                    <th className="py-2 pr-3 font-medium">Tipo MySQL</th>
                    <th className="py-2 pr-3 font-medium">Restrições</th>
                    <th className="py-2 font-medium">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {USERS_COLUMNS.map((col) => (
                    <tr key={col.name}>
                      <td className="py-2.5 pr-3 font-mono font-medium text-zinc-900">
                        {col.name}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-blue-800 whitespace-nowrap">
                        {col.type}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-[11px] text-zinc-600">
                        {col.constraint}
                      </td>
                      <td className="py-2.5 text-zinc-600">{col.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela products */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-zinc-600" aria-hidden="true" />
                <h3 className="font-mono text-sm font-semibold text-zinc-900">
                  products
                </h3>
              </div>
              <span className="text-xs text-zinc-500">Model: Product.js</span>
            </div>

            <div className="overflow-x-auto p-4">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="py-2 pr-3 font-medium">Coluna</th>
                    <th className="py-2 pr-3 font-medium">Tipo MySQL</th>
                    <th className="py-2 pr-3 font-medium">Restrições</th>
                    <th className="py-2 font-medium">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {PRODUCTS_COLUMNS.map((col) => (
                    <tr key={col.name}>
                      <td className="py-2.5 pr-3 font-mono font-medium text-zinc-900">
                        {col.name}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-blue-800">
                        {col.type}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-[11px] text-zinc-600">
                        {col.constraint}
                      </td>
                      <td className="py-2.5 text-zinc-600">{col.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
