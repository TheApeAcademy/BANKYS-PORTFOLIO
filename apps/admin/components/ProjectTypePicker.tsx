"use client";

import { useActionState } from "react";
import { setProjectType, type ActionState } from "@/lib/actions/project-stages";
import { inputCls, buttonCls } from "@/components/ui";

const initial: ActionState = { error: null };

export function ProjectTypePicker({
  projectId,
  options,
}: {
  projectId: string;
  options: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState(setProjectType, initial);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="project_id" value={projectId} />
      <select name="project_type" required className={`${inputCls} max-w-xs`} defaultValue="">
        <option value="" disabled>
          Choose a project type
        </option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <button type="submit" disabled={pending} className={buttonCls}>
        {pending ? "Saving…" : "Set type & generate stages"}
      </button>
      {state.error ? <p className="w-full text-xs text-excluded">{state.error}</p> : null}
    </form>
  );
}
