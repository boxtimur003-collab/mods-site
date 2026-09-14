// Превращает ник в "фейковый email" для Firebase Auth
// "box" -> "box@virion.local"
export function nickToEmail(nick: string): string {
  return `${nick.trim().toLowerCase()}@virion.local`;
}

// Проверка ника: латиница, цифры, _, -, 3-20 символов
export function isValidNick(nick: string): boolean {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(nick.trim());
}