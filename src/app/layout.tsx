import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mods Site',
  description: 'Сайт с модами',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        <AuthProvider>
          <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold hover:text-blue-400">
              Mods Site
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm font-medium"
            >
              Войти
            </Link>
          </header>
          <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}