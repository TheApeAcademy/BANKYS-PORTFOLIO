"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createClient } from "@zebraish/lib/supabase/server";
import { requireAdmin, getActorLabel } from "@zebraish/lib/auth";

export type ActionState = { error: string | null };
const ok: ActionState = { error: null };

export async function uploadDocument(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const actor = await getActorLabel();
  const supabase = await createClient();

  const projectId = String(formData.get("project_id") ?? "");
  const category = String(formData.get("category") ?? "");
  const file = formData.get("file");

  if (!projectId || !category || !(file instanceof File) || file.size === 0) {
    return { error: "Choose a category and a file." };
  }

  const storagePath = `documents/${projectId}/${randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("project-files")
    .upload(storagePath, file, { contentType: file.type || undefined });

  if (uploadError) return { error: uploadError.message };

  const { error: insertError } = await supabase.from("project_documents").insert({
    project_id: projectId,
    category,
    storage_path: storagePath,
    file_name: file.name,
    file_size: file.size,
    uploaded_by: actor,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath(`/projects/${projectId}`);
  return ok;
}

export async function deleteDocument(documentId: string, projectId: string, storagePath: string) {
  await requireAdmin();
  const supabase = await createClient();

  await supabase.storage.from("project-files").remove([storagePath]);
  await supabase.from("project_documents").delete().eq("id", documentId);

  revalidatePath(`/projects/${projectId}`);
}

export async function getDocumentDownloadUrl(storagePath: string): Promise<string | null> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase.storage.from("project-files").createSignedUrl(storagePath, 300);
  if (error || !data) return null;
  return data.signedUrl;
}
