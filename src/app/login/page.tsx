'use client';

import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      // Переводим частые ошибки Firebase на русский
      if (msg.includes('invalid-credential') || msg.includes('wrong-password')) {
        setError('Неверный email или пароль');
      } else if (msg.includes('user-not-found')) {
        setError('Пользователь не найден');
      } else if (msg.includes('email-already-in-use')) {
        setError('Этот email уже зарегистрирован');
      } else if (msg.includes('weak-password')) {
        setError('Пароль должен быть минимум 6 символов');
      } else if (msg.includes('invalid-email')) {
        setError('Неверный формат email');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Логотип сверху */}
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
          <h1 className="text-3xl font-bold neon-text mt-4">
            {isRegister ? 'Регистрация' : 'Вход'}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {isRegister
              ? 'Создай аккаунт Virion Mods'
              : 'Добро пожаловать обратно'}
          </p>
        </div>

        {/* Стеклянная карточка */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(124,58,237,0.2)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              {loading
                ? 'Загрузка...'
                : isRegister
                ? 'Создать аккаунт'
                : 'Войти'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-light)] transition-colors"
            >
              {isRegister
                ? '← Уже есть аккаунт? Войти'
                : 'Нет аккаунта? Зарегистрироваться →'}
            </button>
          </div>
        </div>

        {/* Ссылка назад */}
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