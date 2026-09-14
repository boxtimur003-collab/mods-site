'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    setMenuOpen(false);
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Логотип + название */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="Virion Mods"
              width={40}
              height={40}
              className="rounded-lg group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 rounded-lg blur-md bg-purple-500/40 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </div>
          <span className="text-xl font-bold neon-text">Virion Mods</span>
        </Link>

        {/* Навигация + вход */}
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-light)] px-3 py-2"
          >
            Главная
          </Link>
          <Link
            href="/about"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-light)] px-3 py-2"
          >
            О сайте
          </Link>

          {loading ? (
            <div className="w-20 h-9 rounded bg-[var(--bg-card)] animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card hover:border-[var(--accent)]"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-xs font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="text-sm max-w-[120px] truncate hidden sm:block">
                  {user.email}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-card rounded-lg py-2 animate-fade-in">
                  <div className="px-4 py-2 text-xs text-[var(--text-secondary)] border-b border-[var(--border)]">
                    Вы вошли как
                    <div className="text-[var(--text-primary)] truncate">
                      {user.email}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-gradient px-5 py-2 rounded-lg text-sm font-medium text-white"
            >
              Войти
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}