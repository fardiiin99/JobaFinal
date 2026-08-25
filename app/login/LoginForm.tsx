"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Supabase returns the same message for a wrong password and an
        // unknown address, which is what we want — a different message
        // for each would let someone enumerate valid accounts.
        setError(authError.message);
        return;
      }

      // Refresh so middleware sees the new session cookie.
      router.replace(next);
      router.refresh();
    });
  }

  const field =
    "mt-1.5 w-full rounded-joba border border-line bg-white px-4 py-3 text-[15px] outline-none focus:border-hibiscus";

  return (
    <form action={onSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="block text-[13px] font-semibold text-ink-soft">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={field}
        />
      </label>

      <label className="block">
        <span className="block text-[13px] font-semibold text-ink-soft">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={field}
        />
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-joba border border-hibiscus bg-blush px-4 py-3 text-[14px] text-maroon"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-hibiscus px-8 py-3.5 font-semibold text-white transition-colors duration-300 ease-joba hover:bg-maroon disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
