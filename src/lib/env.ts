function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env.local (local) or set it in the Vercel project settings.`,
    );
  }
  return value;
}

export function getSupabaseEnv() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey: required("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  };
}

export function getStaffEmails(): string[] {
  return [
    process.env.STAFF_EMAIL?.trim().toLowerCase(),
    process.env.DAS_EMAIL?.trim().toLowerCase(),
  ].filter((email): email is string => Boolean(email));
}

export function isAllowedStaffEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = getStaffEmails();
  if (allowed.length === 0) {
    // Fallback matches login mapping defaults when env not set yet.
    return (
      email.toLowerCase() === "staff@matrimony.app" ||
      email.toLowerCase() === "das@matrimony.app"
    );
  }
  return allowed.includes(email.trim().toLowerCase());
}
