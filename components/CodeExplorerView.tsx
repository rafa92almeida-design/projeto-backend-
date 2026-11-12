'use client';

import { useState } from 'react';
import { Check, Copy, FileCode2, FolderOpen } from 'lucide-react';
import type { MvcFileEntry } from '@/lib/mvc-files';

interface CodeExplorerViewProps {
  files: MvcFileEntry[];
}

const LAYER_ORDER: MvcFileEntry['layer'][] = [
  'Configuração',
  'Models e Migrations',
  'Middlewares',
  'Controllers',
  'Rotas',
  'Entrada e Docs',
];

export default function CodeExplorerView({
  files,
}: CodeExplorerViewProps) {
  const [selectedId, setSelectedId] = useState<string>('product-controller');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedFile =
    files.find((f) => f.id === selectedId) ?? files[0];

  const lines = selectedFile.content.split('\n');

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopiedId(selectedFile.id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === selectedFile.id ? null : prev));
      }, 2000);
    } catch {
      // Fallback silencioso caso o clipboard não esteja disponível no contexto
    }
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho introdutório da seção */}
      <section className="border-b border-zinc-200 pb-6">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-medium text-blue-700">
            Projeto de Conclusão de Módulo · Arquitetura MVC
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl text-balance">
            API RESTful de Catálogo de Produtos em Node.js, Express e MySQL
          </h1>
          <p className="text-sm leading-relaxed text-zinc-600">
            Código completo e comentado em português, organizado em camadas MVC
            simples com Sequelize ORM, validações de entrada, códigos HTTP
            padronizados e autenticação Basic Auth.
          </p>
        </div>
      </section>

      {/* Grade principal: Árvore de pastas MVC (esquerda) + Visualizador de código (direita) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] items-start">
        <aside
          aria-label="Estrutura de arquivos MVC"
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <div className="mb-3 flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <h2 className="text-xs font-semibold text-zinc-900">
              Estrutura de Pastas (MVC)
            </h2>
            <span className="text-xs text-zinc-500 tabular-nums">
              {files.length} arquivos
            </span>
          </div>

          <nav className="space-y-4">
            {LAYER_ORDER.map((layer) => {
              const layerFiles = files.filter((f) => f.layer === layer);
              if (layerFiles.length === 0) return null;

              return (
                <div key={layer} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-zinc-500">
                    <FolderOpen className="h-3.5 w-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
                    <span>{layer}</span>
                  </div>
                  <ul className="space-y-0.5">
                    {layerFiles.map((file) => {
                      const isActive = file.id === selectedFile.id;
                      return (
                        <li key={file.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(file.id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                              isActive
                                ? 'bg-blue-50 font-semibold text-blue-800'
                                : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                            }`}
                          >
                            <FileCode2
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isActive ? 'text-blue-700' : 'text-zinc-400'
                              }`}
                              aria-hidden="true"
                            />
                            <span className="truncate font-mono">
                              {file.fileName}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Painel do arquivo selecionado */}
        <section
          aria-label="Visualizador de código-fonte"
          className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white"
        >
          <div className="flex flex-col gap-3 border-b border-zinc-200 bg-zinc-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span>{selectedFile.layer}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{lines.length} linhas</span>
              </div>
              <h2 className="truncate font-mono text-sm font-semibold text-zinc-900">
                {selectedFile.filePath}
              </h2>
              <p className="text-xs leading-relaxed text-zinc-600">
                {selectedFile.summary}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap shrink-0 sm:self-center"
            >
              {copiedId === selectedFile.id ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                  <span>Código copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                  <span>Copiar código</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto bg-zinc-950 p-5 text-zinc-100">
            <table className="w-full border-collapse font-mono text-[13px] leading-6 [font-variant-ligatures:none]">
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index} className="hover:bg-zinc-900/70">
                    <td className="w-10 select-none pr-4 text-right text-xs text-zinc-500 tabular-nums align-top">
                      {index + 1}
                    </td>
                    <td className="whitespace-pre text-zinc-100">
                      {line || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
