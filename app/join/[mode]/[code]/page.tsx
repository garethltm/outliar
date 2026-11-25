"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Credit } from "@/components/Credit";
import { Logo } from "@/components/Logo";
import { api, loadName, saveName, saveSession } from "@/lib/api";

export default function JoinInvite() {
  const { mode, code: rawCode } = useParams<{ mode: string; code: string }>();
  const router = useRouter();
  const code = String(rawCode || "").replace(/\D/g, "").slice(0, 6);
  const isKingdom = mode === "kingdom";
  const validMode = isKingdom || mode === "undercover";
  const validCode = /^\d{6}$/.test(code);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(loadName());
  }, []);

  async function joinRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validMode || !validCode || !name.trim()) return;

    setBusy(true);
    setError("");
    try {
      const result = await api("POST", {
        action: "join",
        name,
        code,
      });
      saveName(name);
      saveSession({
        code: result.room.code,
        token: result.token,
        role: result.role,
        playerId: result.player?.id || null,
        name: result.player?.name || name,
      });
      router.push("/room/" + result.room.code);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      className={`min-h-screen px-5 py-10 flex items-center justify-center ${
        isKingdom ? "kingdom-theme" : ""
      }`}
    >
      <div className="w-full max-w-md">
        <header className="text-center mb-7">
          <Logo size={42} className="justify-center" />
          <p className="eyebrow mt-4">
            {isKingdom ? "Secret Kingdom invite" : "Undercover invite"}
          </p>
        </header>

        <section className="panel p-5 sm:p-6">
          <h1 className="text-2xl font-bold">
            {validMode
              ? `Join ${isKingdom ? "Secret Kingdom" : "Undercover"}`
              : "Invalid invite"}
          </h1>
          {validCode ? (
            <div className="mt-4">
              <div className="muted text-xs mb-2 tracking-widest">
                ROOM CODE
              </div>
              <div className="codebox">{code}</div>
            </div>
          ) : (
            <p role="alert" className="text-red-300 text-sm mt-4">
              This invite link has an invalid room code.
            </p>
          )}

          {validMode && validCode && (
            <form className="mt-5" onSubmit={joinRoom}>
              <label htmlFor="invite-name" className="text-sm muted">
                Your nickname
              </label>
              <input
                id="invite-name"
                className="field mt-2"
                maxLength={20}
                placeholder="e.g. Alex"
                autoComplete="nickname"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <button
                type="submit"
                className="btn w-full mt-4"
                disabled={busy || !name.trim()}
              >
                {busy ? "Joining…" : "Join room"}
              </button>
            </form>
          )}

          {!validMode && (
            <p role="alert" className="text-red-300 text-sm mt-4">
              This invite link has an unknown game mode.
            </p>
          )}
          {error && (
            <p role="alert" className="text-red-300 text-sm mt-4">
              {error}
            </p>
          )}
        </section>

        <Link
          href="/"
          className="block text-center muted text-sm underline mt-5"
        >
          Back to outLIAR home
        </Link>
        <Credit className="mt-6" />
      </div>
    </main>
  );
}
