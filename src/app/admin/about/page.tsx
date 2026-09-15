'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { isAdmin } from '@/lib/admin';

const DEFAULT_ABOUT = {
  title: 'Что такое Virion Mods?',
  text: 'Virion Mods — это удобная платформа для скачивания модификаций автора Virion.',
  authorName: 'Virion',
  authorUrl: 'https://t.me/virionDEV',
  contacts: '@kt1w_X',
};

export default function AdminAboutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorUrl, setAuthorUrl] = useState('');
  const [contacts, setContacts] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin(user.uid)) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !isAdmin(user.uid)) return;
    (async () => {
      const snap = await getDoc(doc(db, 'settings', 'about'));
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title || DEFAULT_ABOUT.title);
        setText(data.text || DEFAULT_ABOUT.text);
        setAuthorName(data.authorName || DEFAULT_ABOUT.authorName);
        setAuthorUrl(data.authorUrl || DEFAULT_ABOUT.authorUrl);
        setContacts(data.contacts || DEFAULT_ABOUT.contacts);
      } else {
        setTitle(DEFAULT_ABOUT.title);
        setText(DEFAULT_ABOUT.text);
        setAuthorName(DEFAULT_ABOUT.authorName);
        setAuthorUrl(DEFAULT_ABOUT.authorUrl);
        setContacts(DEFAULT_ABOUT.contacts);
      }
      setLoading(false);
    })();
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);

    try {
      await setDoc(doc(db, 'settings', 'about'), {
        title: title.trim(),
        text: text.trim(),
        authorName: authorName.trim(),
        authorUrl: authorUrl.trim(),
        contacts: contacts.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user || !isAdmin(user.uid) || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[var(--text-secondary)]">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <Link
        href="/admin"
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-light)] inline-block mb-6"
      >
        ← Назад в админку
      </Link>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold neon-text">Редактор «О сайте»</h1>
        <Link
          href="/about"
          target="_blank"
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-light)]"
        >
          Открыть страницу ↗
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-6 sm:p-8 space-y-5"
      >
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Заголовок
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Текст (многострочный)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              Имя автора
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              Ссылка автора
            </label>
            <input
              type="url"
              value={authorUrl}
              onChange={(e) => setAuthorUrl(e.target.value)}
              placeholder="https://t.me/virionDEV"
              className="w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Контакты (Telegram-ник)
          </label>
          <input
            type="text"
            value={contacts}
            onChange={(e) => setContacts(e.target.value)}
            placeholder="@kt1w_X"
            className="w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
          />
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Символ @ не обязателен — добавим автоматически
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2 text-sm text-green-400 animate-fade-in">
            ✓ Сохранено!
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-gradient w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
}