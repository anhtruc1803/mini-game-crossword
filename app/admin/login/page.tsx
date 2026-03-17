"use client";

import { useState } from "react";
import { signIn } from "@/features/admin/auth";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-sm space-y-6 rounded-xl bg-[var(--card)] p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t.admin.login}</h2>
          <LanguageSwitcher />
        </div>
        {error && (
          <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[var(--muted-foreground)]">
              {t.common.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--muted-foreground)]">
              {t.common.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--primary)] py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t.admin.signingIn : t.admin.signIn}
          </button>
        </form>
      </div>
    </main>
  );
}
