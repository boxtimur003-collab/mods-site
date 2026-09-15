import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Header from '@/components/Header';
import Cursor from '@/components/Cursor';

export const metadata: Metadata = {
  title: {
    default: 'Virion Mods — моды для игр',
    template: '%s | Virion Mods',
  },
  description: 'Скачивай моды для игр — свежие версии, удобный поиск, быстрая загрузка.',
  keywords: ['моды', 'mods', 'игры', 'скачать', 'virion mods'],
  openGraph: {
    title: 'Virion Mods — моды для игр',
    description: 'Скачивай моды для игр — свежие версии, удобный поиск, быстрая загрузка.',
    url: 'https://mods-site-seven.vercel.app',
    siteName: 'Virion Mods',
    images: [
      {
        url: 'https://mods-site-seven.vercel.app/logo.png',
        width: 1024,
        height: 1024,
        alt: 'Virion Mods',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Virion Mods — моды для игр',
    description: 'Скачивай моды для игр — свежие версии, удобный поиск, быстрая загрузка.',
    images: ['https://mods-site-seven.vercel.app/logo.png'],
  },
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
          <Cursor />
          <Header />
          <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}