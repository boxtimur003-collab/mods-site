import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'О сайте — Virion Mods',
  description: 'Virion Mods — платформа для публикации и скачивания модов',
};

export default function AboutPage() {
  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="relative inline-block mb-4">
          <Image
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

      <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold mb-3 text-[var(--accent-light)]">
            Что такое Virion Mods?
          </h2>
          <p className="text-[var(--text-secondary)]">
            Virion Mods — это удобная платформа для публикации и скачивания
            модификаций. Мы храним файлы в надёжном месте, следим за версиями
            и делаем процесс установки максимально простым.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-[var(--accent-light)]">
            Как это работает?
          </h2>
          <ul className="text-[var(--text-secondary)] space-y-2 list-none">
            <li className="flex gap-3">
              <span className="text-[var(--accent)] font-bold">01.</span>
              <span>
                Открой <Link href="/" className="text-[var(--accent-light)] hover:underline">главную</Link> и выбери мод
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--accent)] font-bold">02.</span>
              <span>Перейди на страницу мода и выбери нужную версию</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--accent)] font-bold">03.</span>
              <span>Скачай файл кнопкой «Скачать»</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--accent)] font-bold">04.</span>
              <span>Установи мод по инструкции из файла</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-[var(--accent-light)]">
            Технологии
          </h2>
          <p className="text-[var(--text-secondary)]">
            Сайт построен на Next.js, Firebase и Vercel. Файлы и картинки
            хранятся в GitHub, что обеспечивает высокую скорость скачивания
            и надёжность.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3 text-[var(--accent-light)]">
            Контакты
          </h2>
          <p className="text-[var(--text-secondary)]">
            По вопросам сотрудничества и добавления модов — пиши на почту{' '}
            <a
              href="mailto:contact@virionmods.ru"
              className="text-[var(--accent-light)] hover:underline"
            >
              contact@virionmods.ru
            </a>
          </p>
        </section>
      </div>

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