'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { isAdmin } from '@/lib/admin';

export default function NewModPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin(user.uid)) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!slug || slug === autoSlug(title)) {
      setSlug(autoSlug(title));
    }
  }, [title]);

  function autoSlug(s: string) {
    return s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-яё]+/gi, '-')
      .replace(/^-+|-+$/g, '');
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Введите название');
      return;
    }
    if (!imageFile) {
      setError('Выберите картинку');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', imageFile);
      const imgRes = await fetch('/api/upload-image', {
        method: 'POST',
        body: fd,
      });
      const imgData = await imgRes.json();
      if (!imgRes.ok)
        throw new Error(imgData.error || 'Ошибка загрузки картинки');

      await addDoc(collection(db, 'mods'), {
        title: title.trim(),
        description: description.trim(),
        slug: slug.trim() || autoSlug(title),
        imageUrl: imgData.imageUrl,
        createdAt: serverTimestamp(),
      });

      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setUploading(false);
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
    <div className="animate-fade-in max-w-2xl mx-auto">
      <Link
        href="/admin"
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-light)] inline-block mb-6"
      >
        ← Назад в админку
      </Link>

      <h1 className="text-3xl font-bold neon-text mb-8">Новый мод</h1>

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
            placeholder="Например: Super Weapons Mod"
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
            placeholder="Что делает этот мод..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_15px_rgba(124,58,237,0.4)] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Slug (для ссылок и тегов релизов)
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="super-weapons-mod"
            className="w-full px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_15px_rgba(124,58,237,0.4)]"
          />
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Только латиница, цифры и дефисы. Генерируется автоматически.
          </p>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Картинка мода * (макс 5 МБ)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
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
          disabled={uploading}
          className="btn-gradient w-full py-3 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Загрузка...' : 'Создать мод'}
        </button>
      </form>
    </div>
  );
}