'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type AboutData = {
  title: string;
  text: string;
  authorName: string;
  authorUrl: string;
  contacts: string;
};

const DEFAULT_ABOUT: AboutData = {
  title: 'Что такое Virion Mods?',
  text: 'Virion Mods — это удобная платформа для скачивания модификаций автора Virion.',
  authorName: 'Virion',
  authorUrl: 'https://t.me/virionDEV',
  contacts: '@kt1w_X',
};

export default function AboutPage() {
  const [about, setAbout] = useState<AboutData>(DEFAULT_ABOUT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'about'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAbout({
          title: data.title || DEFAULT_ABOUT.title,
          text: data.text || DEFAULT_ABOUT.text,
          authorName: data.authorName || DEFAULT_ABOUT.authorName,
          authorUrl: data.authorUrl || DEFAULT_ABOUT.authorUrl,
          contacts: data.contacts || DEFAULT_ABOUT.contacts,
        });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="relative inline-block mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Virion Mods"
            width={100}
            height={100}
            className="rounded-2xl"
          />
          <div className="absolute inset-0 rounded-2xl blur-3xl bg-purple-500/50 -z-10" />
        </div>
        <h1 className="text-4xl font-bold neon-text mb-3">О сайте</h1>
        <p className="text-[var(--text-secondary)]">
          Virion Mods — твоя площадка для модов
        </p>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-8 space-y-4 animate-pulse">
          <div className="h-8 bg-[var(--bg-secondary)] rounded w-1/2" />
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-full" />
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4" />
          <div className="h-6 bg-[var(--bg-secondary)] rounded w-1/3 mt-6" />
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-2/3" />
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-3 text-[var(--accent-light)]">
              {about.title}
            </h2>
            <p className="text-[var(--text-secondary)] whitespace-pre-wrap">
              {about.text}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-[var(--accent-light)]">
              Автор
            </h2>
            <p className="text-[var(--text-secondary)]">
              {about.authorName} —{' '}
              <a
                href={about.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-light)] hover:underline"
              >
                {about.authorUrl.replace('https://', '')}
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-[var(--accent-light)]">
              Для связи и предложений
            </h2>
            <p className="text-[var(--text-secondary)]">
              Telegram:{' '}
              <a
                href={`https://t.me/${about.contacts.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-light)] hover:underline"
              >
                {about.contacts}
              </a>
            </p>
          </section>
        </div>
      )}

      <div className="text-center mt-8">
        <Link
          href="/"
          className="inline-block btn-gradient px-6 py-3 rounded-lg font-medium text-white"
        >
          К модам →
        </Link>
      </div>
    </div>
  );
}