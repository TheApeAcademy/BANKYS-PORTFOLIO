"use client";

import { getApplicationAttachmentUrl } from "@/lib/actions/collaborators";
import { buttonGhostCls } from "@/components/ui";

type Attachment = { storage_path: string; file_name: string; file_size: number };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ApplicationAttachments({ attachments }: { attachments: Attachment[] }) {
  async function handleDownload(storagePath: string) {
    const url = await getApplicationAttachmentUrl(storagePath);
    if (url) window.open(url, "_blank");
  }

  if (!attachments.length) return null;

  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <p className="text-fg">Attachments:</p>
      {attachments.map((a) => (
        <div key={a.storage_path} className="flex items-center justify-between gap-2 text-xs">
          <span className="truncate text-fg-muted">
            {a.file_name} <span className="text-fg-muted/70">({formatBytes(a.file_size)})</span>
          </span>
          <button
            type="button"
            onClick={() => handleDownload(a.storage_path)}
            className={`${buttonGhostCls} shrink-0 px-2.5 py-1 text-xs`}
          >
            Download
          </button>
        </div>
      ))}
    </div>
  );
}
