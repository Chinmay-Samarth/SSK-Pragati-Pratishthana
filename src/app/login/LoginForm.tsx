"use client";

import { useActionState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

type LoginFormProps = {
  unauthorized?: boolean;
};

export function LoginForm({ unauthorized = false }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="relative w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:p-10">
      <div className="flex flex-col items-center text-center">
        <BrandLogo size="lg" />
        <p className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--ink)] sm:text-3xl">
          SSK Pragati Pratishthana, Bengaluru
        </p>
        <p className="mt-2 text-lg text-[var(--muted)]">Staff login</p>
      </div>

      <form action={formAction} className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-[var(--ink)]">
            Username
          </span>
          <input
            name="username"
            autoComplete="username"
            className="field"
            placeholder="staff"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-[var(--ink)]">
            Password
          </span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className="field"
            placeholder="Enter password"
            minLength={6}
            required
          />
        </label>

        {unauthorized ? (
          <p className="rounded-xl bg-[var(--danger-bg)] px-4 py-3 text-base text-[var(--danger-text)]">
            This account is not allowed. Use a staff login.
          </p>
        ) : null}

        {state.error ? (
          <p className="rounded-xl bg-[var(--danger-bg)] px-4 py-3 text-base text-[var(--danger-text)]">
            {state.error}
          </p>
        ) : null}

        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
