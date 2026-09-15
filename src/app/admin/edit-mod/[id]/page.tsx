'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { isAdmin } from '@/lib/admin';

export default function EditModPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const modId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin(user.uid)) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!modId || !user || !isAdmin(user.uid)) return;
    (async () => {
      const snap = await getDoc(doc(db, 'mods', modId));
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title || '');
        setDescription(data.description || '');
        setSlug(data.slug || '');
        setCurrentImageUrl(data.imageUrl || '');
        setImagePreview(data.imageUrl || '');
      }
      setLoading(false);
    })();
  }, [modId, user]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Введите название');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = currentImageUrl;

      // Если выбрана новая картинка — загружаем
      if (newImageFile) {
        const fd = new FormData();
        fd.append('file', newImageFile);
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка загрузки картинки');
        imageUrl = data.imageUrl;
      }

      await updateDoc(doc(db, 'mods', modId), {
        title: title.trim(),
        description: description.trim(),
        slug: slug.trim(),
        imageUrl,
      });

      router.push(`/admin/mod/${modId}`);
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
        href={`/admin/mod/${modId}`}
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-light)] inline-block mb-6"
      >
        ← Назад к моду
      </Link>

      <h1 className="text-3xl font-bold neon-text mb-8">Редактировать мод</h1>

      <form
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-6 sm:p-8 space-y-5"
      >
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Название мода *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_15px_rgba(124,58,237,0.4)]"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Краткое описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_15px_rgba(124,58,237,0.4)] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_15px_rgba(124,58,237,0.4)]"
          />
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            ⚠️ Меняй аккуратно — все ссылки на мод изменятся
          </p>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Картинка мода (оставь пустым, чтобы не менять)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--accent)] file:text-white file:cursor-pointer hover:file:bg-[var(--accent-light)] file:transition"
          />
          {imagePreview && (
            <div className="mt-3 relative w-full aspect-video rounded-lg overflow-hidden border border-[var(--border)]">
              <Image
                src={imagePreview}
                alt="Превью"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-gradient w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
}