'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Mod = {
  id: string;
  title: string;
  description: string;
  slug: string;
  imageUrl: string;
};

type Version = {
  id: string;
  version: string;
  fileUrl: string;
  fileSize: number;
  changelog: string;
  createdAt: number;
};

function formatSize(bytes: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatDate(ms: number) {
  const d = new Date(ms);
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ModPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [mod, setMod] = useState<Mod | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const q = query(collection(db, 'mods'), where('slug', '==', slug));
      const snap = await getDocs(q);
      if (snap.empty) {
        setLoading(false);
        return;
      }
      const d = snap.docs[0];
      const data = d.data();
      setMod({
        id: d.id,
        title: data.title || '',
        description: data.description || '',
        slug: data.slug || d.id,
        imageUrl: data.imageUrl || '/logo.png',
      });
    })();
  }, [slug]);

  useEffect(() => {
    if (!mod?.id) return;
    const q = query(
      collection(db, 'mods', mod.id, 'versions'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: Version[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          version: data.version || '',
          fileUrl: data.fileUrl || '',
          fileSize: data.fileSize || 0,
          changelog: data.changelog || '',
          createdAt: data.createdAt?.seconds
            ? data.createdAt.seconds * 1000
            : Date.now(),
        });
      });
      setVersions(list);
      setLoading(false);
    });
    return () => unsub();
  }, [mod?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[var(--text-secondary)]">Загрузка...</div>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h1 className="text-2xl font-bold mb-4">Мод не найден</h1>
        <Link href="/" className="text-[var(--accent-light)] hover:underline">
          ← Вернуться на главную
        </Link>
      </div>
    );
  }

  const latestId = versions[0]?.id;

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-light)] mb-6 transition-colors"
      >
        <span className="text-lg">←</span> Вернуться к модам
      </button>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-1">
          <div className="relative aspect-video rounded-xl overflow-hidden glass-card">
            <Image
              src={mod.imageUrl}
              alt={mod.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-bold neon-text mb-3">
            {mod.title}
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {mod.description}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">
          Версии{' '}
          <span className="text-[var(--text-secondary)] text-base font-normal">
            ({versions.length})
          </span>
        </h2>

        {versions.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center text-[var(--text-secondary)]">
            Пока нет доступных версий
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((v) => {
              const isLatest = v.id === latestId;
              return (
                <div
                  key={v.id}
                  className={`glass-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
                    isLatest
                      ? 'border-[var(--accent)] shadow-[0_0_20px_rgba(124,58,237,0.25)]'
                      : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="text-lg font-bold">v{v.version}</span>
                      {isLatest && (
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent)] text-white font-semibold tracking-wider">
                          LATEST
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                      <span>{formatSize(v.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDate(v.createdAt)}</span>
                    </div>
                    {v.changelog && (
                      <p className="text-sm text-[var(--text-secondary)] mt-2 whitespace-pre-wrap">
                        {v.changelog}
                      </p>
                    )}
                  </div>

                  <a
                    href={v.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-medium text-white whitespace-nowrap text-center"
                  >
                    ↓ Скачать
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}