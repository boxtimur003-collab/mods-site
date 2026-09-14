export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Все моды</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-zinc-800 rounded p-4">
          <p className="text-zinc-500">Список модов появится здесь.</p>
        </div>
        <div className="border border-zinc-800 rounded p-4">
          <p className="text-zinc-500">Пока что тут пусто.</p>
        </div>
      </div>
    </div>
  );
}