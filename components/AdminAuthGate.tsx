"use client";

import { useState } from "react";

type AdminAuthGateProps = {
  children: React.ReactNode;
};

const STORAGE_KEY = "tour-admin-authed";

export default function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [password, setPassword] = useState("");
  const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  const [message, setMessage] = useState(() =>
    expectedPassword
      ? ""
      : "NEXT_PUBLIC_ADMIN_PASSWORD is not set — demo mode enabled"
  );
  const [isAuthed, setIsAuthed] = useState(() => {
    if (!expectedPassword) {
      return true;
    }
    if (typeof window === "undefined") {
      return false;
    }
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  });

  if (isAuthed) {
      return (
      <div>
        {message ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {message}
          </div>
        ) : null}
        {children}
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.6)] backdrop-blur">
      <h2 className="text-2xl font-semibold text-slate-900">
        Admin Access
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Enter the password to view bookings.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
          placeholder="Password"
        />
        <button
          type="button"
          onClick={() => {
            if (!expectedPassword) {
              setIsAuthed(true);
              setMessage(
                "NEXT_PUBLIC_ADMIN_PASSWORD is not set — demo mode enabled"
              );
              return;
            }

            if (password === expectedPassword) {
              sessionStorage.setItem(STORAGE_KEY, "true");
              setIsAuthed(true);
              setMessage("");
            } else {
              setMessage("Incorrect password.");
            }
          }}
          className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
        >
          Sign in
        </button>
      </div>
      {message ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {message}
        </div>
      ) : null}
    </div>
  );
}
