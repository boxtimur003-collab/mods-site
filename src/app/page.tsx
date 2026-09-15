'use client';

import { useEffect, useMemo, useState } from 'react';
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
  totalDownloads: number;
};

type SortMode = 'date' | 'title' | 'downloads';
type GridMode = 1 | 2 | 3;

const GRID_KEY = 'virion:grid';

export default function HomePage() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('date');
  const [grid, setGrid] = useState<GridMode>(2);
  const [mounted, setMounted] = useState(false);

  // Загружаем сохранённый выбор сетки
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(GRID_KEY);
    if (saved === '1' || saved === '2' || saved === '3') {
      setGrid(parseInt(saved) as GridMode);
    }
  }, []);

  function changeGrid(g: GridMode) {
    setGrid(g);
    localStorage.setItem(GRID_KEY, String(g));
  }

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
          totalDownloads: data.totalDownloads || 0,
        });
      });
      setMods(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const displayed = useMemo(() => {
    let list = [...mods];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }
    if (sort === 'date') {
      list.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sort === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    } else if (sort === 'downloads') {
      list.sort((a, b) => b.totalDownloads - a.totalDownloads);
    }
    return list;
  }, [mods, search, sort]);

  const gridClass =
    grid === 1
      ? 'grid-cols-1'
      : grid === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

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

      {/* Поиск + сортировка + сетка */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию или описанию..."
            className="w-full pl-11 pr-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xl leading-none px-2"
            >
              ×
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
        >
          <option value="date">Сначала новые</option>
          <option value="title">По названию (А-Я)</option>
          <option value="downloads">По популярности</option>
        </select>

        {/* Переключатель сетки */}
        {mounted && (
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
            {([1, 2, 3] as GridMode[]).map((g) => (
              <button
                key={g}
                onClick={() => changeGrid(g)}
                title={`${g} в ряд`}
                className={`w-10 h-10 rounded flex items-center justify-center transition-all ${
                  grid === g
                    ? 'bg-[var(--accent)] text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {g === 1 && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="2" y="3" width="12" height="10" rx="1" />
                  </svg>
                )}
                {g === 2 && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="3" width="6" height="10" rx="1" />
                    <rect x="9" y="3" width="6" height="10" rx="1" />
                  </svg>
                )}
                {g === 3 && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="3" width="4" height="10" rx="1" />
                    <rect x="6" y="3" width="4" height="10" rx="1" />
                    <rect x="11" y="3" width="4" height="10" rx="1" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className={`grid ${gridClass} gap-6`}>
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
      ) : displayed.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center">
          <p className="text-[var(--text-secondary)]">
            {search
              ? `Ничего не найдено по запросу "${search}"`
              : 'Пока нет модов. Загляни позже!'}
          </p>
        </div>
      ) : (
        <div className={`grid ${gridClass} gap-6`}>
          {displayed.map((mod, i) => (
            <Link
              key={mod.id}
              href={`/mods/${mod.slug}`}
              className="group glass-card rounded-xl overflow-hidden hover:border-[var(--accent)] hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all duration-300 animate-card-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="relative aspect-video overflow-hidden bg-[var(--bg-secondary)]">
                <Image
                  src={mod.imageUrl}
                  alt={mod.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />

                {mod.totalDownloads > 0 && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-medium flex items-center gap-1">
                    <span>⬇</span>
                    <span>{mod.totalDownloads}</span>
                  </div>
                )}
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

      {!loading && displayed.length > 0 && (
        <p className="text-center text-sm text-[var(--text-secondary)] mt-8">
          Показано: {displayed.length} из {mods.length}
        </p>
      )}
    </div>
  );
}