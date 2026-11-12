'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  createInitialSandboxState,
  type SandboxState,
} from '@/lib/api-sandbox';
import type { MvcFileEntry } from '@/lib/mvc-files';
import CodeExplorerView from './CodeExplorerView';
import ApiTesterView from './ApiTesterView';
import DatabaseSchemaView from './DatabaseSchemaView';
import ReadmeView from './ReadmeView';

type ActiveTab = 'codigo' | 'testador' | 'banco' | 'readme';

interface ProjectWorkspaceProps {
  files: MvcFileEntry[];
  readmeContent: string;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'codigo', label: 'Código Fonte' },
  { id: 'testador', label: 'Testador API' },
  { id: 'banco', label: 'Modelagem MySQL' },
  { id: 'readme', label: 'README.md' },
];

export default function ProjectWorkspace({
  files,
  readmeContent,
}: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('codigo');
  const [sandboxState, setSandboxState] = useState<SandboxState>(() =>
    createInitialSandboxState()
  );

  function handleResetSandbox() {
    setSandboxState(createInitialSandboxState());
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900">
      {/* Top Bar seguindo o contrato estrito de 3 zonas em 1 linha */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-4 py-3 sm:px-6">
          {/* Zona 1: Wordmark em uma linha */}
          <a
            href="#topo"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('codigo');
            }}
            className="text-base font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0"
          >
            API Loja MVC
          </a>

          {/* Zona 2: 4 links de navegação */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-6"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`border-b-2 py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-blue-700 text-blue-700'
                      : 'border-transparent text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zona 3: 1 ação primária */}
          <div className="shrink-0">
            {activeTab === 'testador' ? (
              <button
                type="button"
                onClick={handleResetSandbox}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 whitespace-nowrap shrink-0"
              >
                Resetar Banco
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('testador')}
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
              >
                Testar Endpoints
              </button>
            )}
          </div>
        </div>

        {/* Navegação responsiva no mobile (mantida compacta) */}
        <nav
          aria-label="Navegação móvel"
          className="flex md:hidden items-center gap-4 overflow-x-auto border-t border-zinc-100 px-4 py-2"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`text-xs font-medium whitespace-nowrap shrink-0 ${
                  isActive ? 'text-blue-700 font-semibold' : 'text-zinc-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Conteúdo Principal */}
      <main id="topo" className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'codigo' && (
              <CodeExplorerView files={files} />
            )}
            {activeTab === 'testador' && (
              <ApiTesterView
                sandboxState={sandboxState}
                onUpdateState={setSandboxState}
              />
            )}
            {activeTab === 'banco' && <DatabaseSchemaView />}
            {activeTab === 'readme' && <ReadmeView content={readmeContent} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-5">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            Projeto de Conclusão de Módulo · Node.js, Express, Sequelize e MySQL
          </span>
          <span>Padrão MVC · CRUD Completo + Basic Auth</span>
        </div>
      </footer>
    </div>
  );
}
