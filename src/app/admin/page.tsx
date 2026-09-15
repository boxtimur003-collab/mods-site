'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { isAdmin } from '@/lib/admin';
import { useToast } from '@/components/Toast';

type Mod = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: number;
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin(user.uid)) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !isAdmin(user.uid)) return;
    const q = query(collection(db, 'mods'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: Mod[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          title: data.title || '',
          description: data.description || '',
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
  }, [user]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Удалить мод "${title}"?`)) return;
    try {
      await deleteDoc(doc(db, 'mods', id));
      toast.success(`Мод "${title}" удалён`);
    } catch (err) {
      toast.error(
        'Ошибка удаления: ' + (err instanceof Error ? err.message : '')
      );
    }
  }

  if (authLoading || !user || !isAdmin(user.uid)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[var(--text-secondary)]">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text">Админ-панель</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Управление модами
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/admin/about"
            className="px-4 py-2.5 rounded-lg glass-card hover:border-[var(--accent)] text-sm"
          >
            ✎ О сайте
          </Link>
          <Link
            href="/admin/new-mod"
            className="btn-gradient px-5 py-2.5 rounded-lg text-sm font-medium text-white"
          >
            + Добавить мод
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="glass-card rounded-xl overflow-hidden flex animate-pulse"
            >
              <div className="w-28 h-28 bg-[var(--bg-secondary)] flex-shrink-0" />
              <div className="flex-1 p-4 space-y-2">
                <div className="h-4 bg-[var(--bg-secondary)] rounded w-2/3" />
                <div className="h-3 bg-[var(--bg-secondary)] rounded w-full" />
                <div className="h-3 bg-[var(--bg-secondary)] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : mods.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center">
          <p className="text-[var(--text-secondary)] mb-4">
            Пока нет ни одного мода
          </p>
          <Link
            href="/admin/new-mod"
            className="inline-block btn-gradient px-5 py-2.5 rounded-lg text-sm font-medium text-white"
          >
            Создать первый мод
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mods.map((mod) => (
            <div
              key={mod.id}
              className="glass-card rounded-xl overflow-hidden flex"
            >
              <div className="relative w-28 h-28 flex-shrink-0 bg-[var(--bg-secondary)]">
                <Image
                  src={mod.imageUrl}
                  alt={mod.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold mb-1">{mod.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                    {mod.description}
                  </p>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Link
                    href={`/admin/mod/${mod.id}`}
                    className="px-3 py-1.5 text-xs rounded glass-card hover:border-[var(--accent)]"
                  >
                    Версии
                  </Link>
                  <Link
                    href={`/admin/edit-mod/${mod.id}`}
                    className="px-3 py-1.5 text-xs rounded glass-card hover:border-[var(--accent)]"
                  >
                    Изменить
                  </Link>
                  <button
                    onClick={() => handleDelete(mod.id, mod.title)}
                    className="px-3 py-1.5 text-xs rounded glass-card text-red-400 hover:border-red-500/50 hover:bg-red-500/10"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}