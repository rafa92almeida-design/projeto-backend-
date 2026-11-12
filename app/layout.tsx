import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'API Loja MVC — Projeto Backend Node.js & Express',
  description:
    'Explorador de código MVC, modelagem MySQL com Sequelize, documentação e testador interativo de endpoints RESTful.',
  openGraph: {
    title: 'API Loja MVC — Projeto Backend Node.js & Express',
    description:
      'Explorador de código MVC, modelagem MySQL com Sequelize, documentação e testador interativo de endpoints RESTful.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'API Loja MVC — Projeto Backend Node.js & Express',
    description:
      'Explorador de código MVC, modelagem MySQL com Sequelize, documentação e testador interativo de endpoints RESTful.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900"
      >
        {children}
      </body>
    </html>
  );
}
