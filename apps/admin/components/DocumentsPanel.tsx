"use client";

import { useActionState } from "react";
import { uploadDocument, deleteDocument, getDocumentDownloadUrl, type ActionState } from "@/lib/actions/documents";
import { inputCls, buttonCls, buttonGhostCls } from "@/components/ui";
import { formatDate } from "@zebraish/lib/format";

const initialState: ActionState = { error: null };

const CATEGORIES = ["brief", "image", "contract", "deliverable", "source"] as const;

type DocumentRow = {
  id: string;
  category: string;
  file_name: string;
  file_size: number | null;
  storage_path: string;
  uploaded_at: string;
  uploaded_by: string;
};

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsPanel({ projectId, documents }: { projectId: string; documents: DocumentRow[] }) {
  const [state, action, pending] = useActionState(uploadDocument, initialState);

  async function handleDownload(storagePath: string) {
    const url = await getDocumentDownloadUrl(storagePath);
    if (url) window.open(url, "_blank");
  }

  async function handleDelete(documentId: string, storagePath: string) {
    await deleteDocument(documentId, projectId, storagePath);
  }

  return (
    <div>
      <form action={action} className="mb-4 flex flex-wrap items-end gap-2">
        <input type="hidden" name="project_id" value={projectId} />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">Category</label>
          <select name="category" required className={inputCls} defaultValue="">
            <option value="" disabled>
              Choose
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-fg-muted">File</label>
          <input type="file" name="file" required className="text-sm" />
        </div>
        <button type="submit" disabled={pending} className={buttonCls}>
          {pending ? "Uploading…" : "Upload"}
        </button>
      </form>
      {state.error ? <p className="mb-3 text-xs text-excluded">{state.error}</p> : null}

      {documents.length > 0 ? (
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <div>
                <p className="text-fg">
                  {d.file_name} <span className="text-xs capitalize text-fg-muted">({d.category})</span>
                </p>
                <p className="text-xs text-fg-muted">
                  {formatBytes(d.file_size)} · uploaded {formatDate(d.uploaded_at)} by {d.uploaded_by}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => handleDownload(d.storage_path)} className={buttonGhostCls}>
                  Download
                </button>
                <button type="button" onClick={() => handleDelete(d.id, d.storage_path)} className={buttonGhostCls}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-fg-muted">No documents uploaded yet.</p>
      )}
    </div>
  );
}
