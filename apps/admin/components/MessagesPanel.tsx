"use client";

import { useActionState, useEffect } from "react";
import { sendAdminMessage, markMessagesRead, type ActionState } from "@/lib/actions/messages";
import { inputCls, buttonCls } from "@/components/ui";
import { formatDateTime } from "@zebraish/lib/format";

const initialState: ActionState = { error: null };

type MessageRow = {
  id: string;
  sender_type: "admin" | "client" | "system";
  sender_label: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export function MessagesPanel({ projectId, messages }: { projectId: string; messages: MessageRow[] }) {
  const [state, action, pending] = useActionState(sendAdminMessage, initialState);
  const hasUnread = messages.some((m) => m.sender_type === "client" && !m.read_at);

  useEffect(() => {
    if (hasUnread) markMessagesRead(projectId);
  }, [projectId, hasUnread]);

  return (
    <div>
      <div className="mb-4 flex max-h-96 flex-col gap-3 overflow-y-auto">
        {messages.length > 0 ? (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.sender_type === "admin" ? "self-end bg-accent text-white" : "self-start bg-bg-raised text-fg"
              }`}
            >
              <p>{m.body}</p>
              <p className={`mt-1 text-xs ${m.sender_type === "admin" ? "text-white/70" : "text-fg-muted"}`}>
                {m.sender_label} · {formatDateTime(m.created_at)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-fg-muted">No messages yet.</p>
        )}
      </div>

      <form action={action} className="flex gap-2">
        <input type="hidden" name="project_id" value={projectId} />
        <input name="body" placeholder="Write a message to the client…" required className={inputCls} />
        <button type="submit" disabled={pending} className={buttonCls}>
          {pending ? "Sending…" : "Send"}
        </button>
      </form>
      {state.error ? <p className="mt-2 text-xs text-excluded">{state.error}</p> : null}
    </div>
  );
}
