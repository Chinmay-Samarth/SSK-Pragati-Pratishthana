import { LoginForm } from "./LoginForm";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(166,61,47,0.22),_transparent_55%),linear-gradient(160deg,#12151a_0%,#1a1514_50%,#12151a_100%)]" />
      <div className="relative">
        <LoginForm unauthorized={params.error === "unauthorized"} />
      </div>
    </main>
  );
}
