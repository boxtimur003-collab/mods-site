'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { nickToEmail, isValidNick } from '@/lib/nick';
import Particles from '@/components/Particles';

export default function LoginPage() {
  const [nick, setNick] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isValidNick(nick)) {
      setError('Ник: 3-20 символов, только латиница, цифры, _ и -');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, nickToEmail(nick), password);
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      if (
        msg.includes('invalid-credential') ||
        msg.includes('wrong-password') ||
        msg.includes('user-not-found')
      ) {
        setError('Неверный ник или пароль');
      } else if (msg.includes('too-many-requests')) {
        setError('Слишком много попыток. Попробуй позже.');
      } else {
        setError('Ошибка входа. Попробуй ещё раз.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 animate-fade-in relative">
      <Particles count={40} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <Image
              src="/logo.png"
              alt="Virion Mods"
              width={80}
              height={80}
              className="rounded-2xl mx-auto"
            />
            <div className="absolute inset-0 rounded-2xl blur-2xl bg-purple-500/50 -z-10" />
          </div>
          <h1 className="text-3xl font-bold neon-text mt-4">Вход</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Войди в свой аккаунт Virion Mods
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(124,58,237,0.2)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Ник
              </label>
              <input
                type="text"
                placeholder="Твой ник"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Пароль
              </label>
              <input
                type="password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-sm text-red-400 animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Загрузка...' : 'Войти'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-light)]"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}