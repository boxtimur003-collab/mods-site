import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Virion Mods',
  description: 'Моды для игр — Virion Mods',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <Header />
          <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}