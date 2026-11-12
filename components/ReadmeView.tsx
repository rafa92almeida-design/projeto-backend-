'use client';

import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

interface ReadmeViewProps {
  content: string;
}

export default function ReadmeView({ content }: ReadmeViewProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyReadme() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencioso
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Documentação do Projeto (README.md)
          </h1>
          <p className="text-sm text-zinc-600">
            Guia completo de instalação local, configuração do .env, criação do
            banco MySQL, migrations e endpoints.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyReadme}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-100 whitespace-nowrap shrink-0 sm:self-auto"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
              <span>README copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
              <span>Copiar README.md</span>
            </>
          )}
        </button>
      </div>

      <article className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h2 className="mb-4 text-xl font-bold tracking-tight text-zinc-900">
                {children}
              </h2>
            ),
            h2: ({ children }) => (
              <h3 className="mt-8 mb-3 border-b border-zinc-100 pb-2 text-lg font-semibold text-zinc-900">
                {children}
              </h3>
            ),
            h3: ({ children }) => (
              <h4 className="mt-5 mb-2 text-sm font-semibold text-zinc-900">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="mb-3 text-sm leading-relaxed text-zinc-700">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm text-zinc-700">
                {children}
              </ul>
            ),
            hr: () => <hr className="my-6 border-zinc-200" />,
            code: ({ children, className }) => {
              const isBlock = Boolean(className);
              if (isBlock) {
                return (
                  <code className="block font-mono text-xs leading-relaxed text-zinc-100">
                    {children}
                  </code>
                );
              }
              return (
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-900">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="mb-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-zinc-100">
                {children}
              </pre>
            ),
            table: ({ children }) => (
              <div className="mb-5 overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 font-semibold">{children}</th>
            ),
            td: ({ children }) => (
              <td className="border-b border-zinc-100 px-3 py-2 text-zinc-700">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </Markdown>
      </article>
    </div>
  );
}
