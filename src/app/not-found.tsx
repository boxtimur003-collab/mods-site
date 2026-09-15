import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 animate-fade-in">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Virion Mods"
            width={120}
            height={120}
            className="rounded-2xl opacity-80"
          />
          <div className="absolute inset-0 rounded-2xl blur-3xl bg-purple-500/40 -z-10" />
        </div>

        <h1 className="text-7xl sm:text-9xl font-bold neon-text mb-4">
          404
        </h1>
        <p className="text-xl text-[var(--text-primary)] mb-2">
          Страница не найдена
        </p>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          Возможно, она была удалена или ты ошибся в адресе
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn-gradient px-6 py-3 rounded-lg font-medium text-white"
          >
            ← На главную
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 rounded-lg font-medium glass-card hover:border-[var(--accent)]"
          >
            О сайте
          </Link>
        </div>
      </div>
    </div>
  );
}