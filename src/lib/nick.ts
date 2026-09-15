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