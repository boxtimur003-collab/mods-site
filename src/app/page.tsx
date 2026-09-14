import Link from 'next/link';
import Image from 'next/image';

// Временные заглушки — потом заменим данными из Firestore
const mockMods = [
  {
    id: '1',
    title: 'Пример мода №1',
    description: 'Краткое описание мода. Что он делает, зачем нужен и как его использовать.',
    imageUrl: '/logo.png',
  },
  {
    id: '2',
    title: 'Пример мода №2',
    description: 'Ещё один мод с интересным функционалом и красивым дизайном.',
    imageUrl: '/logo.png',
  },
  {
    id: '3',
    title: 'Пример мода №3',
    description: 'Описание третьего мода — тут может быть что угодно интересное.',
    imageUrl: '/logo.png',
  },
  {
    id: '4',
    title: 'Пример мода №4',
    description: 'Четвёртый мод, демонстрирующий сетку в 2 столбца.',
    imageUrl: '/logo.png',
  },
];

export default function HomePage() {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {mockMods.map((mod) => (
          <Link
            key={mod.id}
            href={`/mods/${mod.id}`}
            className="group glass-card rounded-xl overflow-hidden hover:border-[var(--accent)] hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all duration-300"
          >
            {/* Картинка 16:9 */}
            <div className="relative aspect-video overflow-hidden bg-[var(--bg-secondary)]">
              <Image
                src={mod.imageUrl}
                alt={mod.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent" />
            </div>

            {/* Текст с плавным разворотом */}
            <div className="p-5">
              <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--accent-light)] transition-colors">
                {mod.title}
              </h2>
              {/* Описание плавно раскрывается при hover */}
              <div className="max-h-0 group-hover:max-h-32 overflow-hidden transition-all duration-500 ease-out">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-1">
                  {mod.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}