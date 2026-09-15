export function nickToEmail(nick: string): string {
  return `${nick.trim().toLowerCase()}@virion.local`;
}

export function isValidNick(nick: string): boolean {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(nick.trim());
}

export function getNickFromEmail(email: string | null | undefined): string {
  if (!email) return 'user';
  return email.split('@')[0];
}

// Транслитерация русских букв в латиницу
const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
  я: 'ya',
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-') // всё кроме латиницы и цифр → дефис
    .replace(/^-+|-+$/g, '')     // обрезаем дефисы по краям
    .slice(0, 60);               // ограничим длину
}