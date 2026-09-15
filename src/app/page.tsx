'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Mod = {
  id: string;
  title: string;
  description: string;
  slug: string;
  imageUrl: string;
  createdAt: number;
};

export default function HomePage() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'mods'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: Mod[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          title: data.title || '',
          description: data.description || '',
          slug: data.slug || d.id,
          imageUrl: data.imageUrl || '/logo.png',
          createdAt: data.createdAt?.seconds
            ? data.createdAt.seconds * 1000
            : Date.now(),
        });
      });
      setMods(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold neon-text mb-3">
          Все моды
        </h1>
        <p className="text-[var(--text-secondary)]">
          Скачивай, устанавливай, играй
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="glass-card rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-[var(--bg-secondary)]" />
              <div className="p-5 space-y-2">
                <div className="h-5 bg-[var(--bg-secondary)] rounded w-2/3" />
                <div className="h-4 bg-[var(--bg-secondary)] rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : mods.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center">
          <p className="text-[var(--text-secondary)]">
            Пока нет модов. Загляни позже!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {mods.map((mod) => (
            <Link
              key={mod.id}
              href={`/mods/${mod.slug}`}
              className="group glass-card rounded-xl overflow-hidden hover:border-[var(--accent)] hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden bg-[var(--bg-secondary)]">
                <Image
                  src={mod.imageUrl}
                  alt={mod.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />
              </div>

              <div className="p-5">
                <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--accent-light)] transition-colors">
                  {mod.title}
                </h2>
                <div className="max-h-0 group-hover:max-h-32 overflow-hidden transition-all duration-500 ease-out">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-1">
                    {mod.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}