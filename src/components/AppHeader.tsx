import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  showHome?: boolean;
};

export function AppHeader({
  title = "SSK Pragati Pratishthana, Bengaluru",
  subtitle,
  showHome = true,
}: AppHeaderProps) {
  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo size="md" />
          <div className="min-w-0">
            <p className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-[var(--ink)] sm:text-2xl">
              {title}
            </p>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-[var(--muted)] sm:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {showHome ? (
            <Link href="/" className="btn-secondary">
              Home
            </Link>
          ) : null}
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn-secondary">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
