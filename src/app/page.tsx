import { AuthButton } from "@/components/auth-button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-ink">
            Security Scanner Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            Sign in, scan a public domain or IP, and generate a structured security report.
          </p>
        </div>
        <AuthButton />
      </header>
    </main>
  );
}
