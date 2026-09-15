'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { isAdmin } from '@/lib/admin';
import { useToast } from '@/components/Toast';

type ModData = {
  title: string;
  slug: string;
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
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function AdminModPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const params = useParams();
  const modId = params?.id as string;

  const [mod, setMod] = useState<ModData | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  const [version, setVersion] = useState('');
  const [changelog, setChangelog] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin(user.uid)) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!modId || !user || !isAdmin(user.uid)) return;
    (async () => {
      const ref = doc(db, 'mods', modId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setMod(snap.data() as ModData);
      }
      setLoading(false);
    })();
  }, [modId, user]);

  useEffect(() => {
    if (!modId || !user || !isAdmin(user.uid)) return;
    const q = query(
      collection(db, 'mods', modId, 'versions'),
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
    });
    return () => unsub();
  }, [modId, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!mod || !file || !version.trim()) {
      toast.error('Заполни номер версии и выбери файл');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('version', version.trim());
      fd.append('modTitle', mod.title);
      fd.append('modSlug', mod.slug);
      fd.append('changelog', changelog.trim());

      const res = await fetch('/api/create-release', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка создания релиза');

      await addDoc(collection(db, 'mods', modId, 'versions'), {
        version: version.trim(),
        fileUrl: data.downloadUrl,
        fileSize: data.fileSize,
        changelog: changelog.trim(),
        downloads: 0,
        createdAt: serverTimestamp(),
      });

      toast.success(`Версия v${version.trim()} загружена!`);
      setVersion('');
      setChangelog('');
      setFile(null);
      const fileInput = document.getElementById(
        'file-input'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteVersion(v: Version) {
    if (
      !confirm(
        `Удалить версию v${v.version}?\n\nФайл останется в GitHub Releases, но перестанет отображаться на сайте.`
      )
    )
      return;
    try {
      await deleteDoc(doc(db, 'mods', modId, 'versions', v.id));
      toast.success(`Версия v${v.version} удалена`);
    } catch (err) {
      toast.error(
        'Ошибка удаления: ' + (err instanceof Error ? err.message : '')
      );
    }
  }

  if (authLoading || !user || !isAdmin(user.uid) || loading) {
    return (
      <div className="animate-fade-in">
        <div className="h-4 w-32 bg-[var(--bg-secondary)] rounded mb-6 animate-pulse" />
        <div className="h-8 w-64 bg-[var(--bg-secondary)] rounded mb-8 animate-pulse" />
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 h-96 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">Мод не найден</p>
        <Link href="/admin" className="text-[var(--accent-light)]">
          ← Вернуться в админку
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link
        href="/admin"
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-light)] inline-block mb-6"
      >
        ← Назад в админку
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold neon-text mb-2">{mod.title}</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Slug: <code className="text-[var(--accent-light)]">{mod.slug}</code>
          </p>
        </div>
        <Link
          href={`/admin/edit-mod/${modId}`}
          className="px-4 py-2 rounded-lg glass-card hover:border-[var(--accent)] text-sm"
        >
          ✎ Редактировать мод
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Добавить версию</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Номер версии *
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Что нового (changelog)
              </label>
              <textarea
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder={'— Добавлено X\n— Исправлено Y'}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Файл мода * (макс 100 МБ)
              </label>
              <input
                id="file-input"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className="w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--accent)] file:text-white file:cursor-pointer hover:file:bg-[var(--accent-light)] file:transition"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="btn-gradient w-full py-2.5 rounded-lg font-semibold text-white disabled:opacity-50"
            >
              {uploading ? 'Загрузка...' : 'Загрузить версию'}
            </button>
          </form>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">
            Версии ({versions.length})
          </h2>
          {versions.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">
              Пока нет версий
            </p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {versions.map((v, i) => (
                <div
                  key={v.id}
                  className="border border-[var(--border)] rounded-lg p-3 group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold">v{v.version}</span>
                    <div className="flex items-center gap-2">
                      {i === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent)] text-white font-medium">
                          LATEST
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteVersion(v)}
                        className="text-xs px-2 py-1 rounded text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Удалить версию"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {formatSize(v.fileSize)}
                  </div>
                  {v.changelog && (
                    <p className="text-xs text-[var(--text-secondary)] mt-2 whitespace-pre-wrap">
                      {v.changelog}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}