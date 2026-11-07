/** Username -> Auth email for shared staff logins */
export const STAFF_ACCOUNTS: Record<string, string> = {
  staff: process.env.STAFF_EMAIL ?? "staff@matrimony.app",
  das: process.env.DAS_EMAIL ?? "das@matrimony.app",
};

export function staffEmailForUsername(username: string): string | null {
  return STAFF_ACCOUNTS[username.trim().toLowerCase()] ?? null;
}
