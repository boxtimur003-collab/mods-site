// ⚠️ Вставь сюда свой UID из Firebase Auth
export const ADMIN_UID = 'y6miA2r25kgYa01xzc24sgSkmH62';

export function isAdmin(uid: string | null | undefined): boolean {
  return uid === ADMIN_UID;
}