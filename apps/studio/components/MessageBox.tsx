"use client";

import { useState, useRef } from "react";
import { sendClientMessage, getProjectMessages, type TrackerMessage } from "@/lib/actions/messages";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function MessageBox({ token, initialMessages }: { token: string; initialMessages: TrackerMessage[] }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await sendClientMessage({ error: null }, formData);

    if (result.error) {
      setError(result.error);
    } else {
      formRef.current?.reset();
      setMessages(await getProjectMessages(token));
    }
    setPending(false);
  }

  return (
    <div>
      <div className="mb-3 flex max-h-72 flex-col gap-2 overflow-y-auto">
        {messages.length > 0 ? (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.sender_type === "client" ? "self-end bg-accent text-white" : "self-start bg-bg-raised text-fg"
              }`}
            >
              <p>{m.body}</p>
              <p className={`mt-1 text-xs ${m.sender_type === "client" ? "text-white/70" : "text-fg-muted"}`}>
                {m.sender_type === "admin" ? t("messages.fromZebraish") : m.sender_label}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-fg-muted">{t("messages.empty")}</p>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2">
        <input type="hidden" name="token" value={token} />
        <input
          name="body"
          placeholder={t("messages.placeholder")}
          required
          className="w-full rounded-lg border border-border bg-bg-raised px-3.5 py-2.5 text-sm text-fg outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? t("messages.sending") : t("messages.send")}
        </button>
      </form>
      {error ? <p className="mt-2 text-xs text-excluded">{error}</p> : null}
    </div>
  );
}
