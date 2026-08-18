import { notFound } from "next/navigation";
import { createClient } from "@zebraish/lib/supabase/server";
import { updateProjectType, updateStep, updateOption, deleteOption, addOption, publishCatalogueVersion } from "@/lib/actions/catalogue";
import { Card, PageHeader, EmptyState, inputCls, buttonCls, buttonGhostCls, buttonDangerCls } from "@/components/ui";
import { formatDateTime } from "@zebraish/lib/format";

export default async function CatalogueVersionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: version } = await supabase.from("catalogue_versions").select("*").eq("id", id).single();
  if (!version) notFound();

  const { data: projectTypes } = await supabase
    .from("catalogue_project_types")
    .select("*")
    .eq("version_id", id)
    .order("type_order");

  const { data: steps } = await supabase
    .from("catalogue_steps")
    .select("*")
    .eq("version_id", id)
    .order("step_order");

  const { data: options } = await supabase
    .from("catalogue_options")
    .select("*")
    .in("step_id", (steps ?? []).map((s) => s.id))
    .order("option_order");

  const editable = version.published_at === null;
  const stepsByType = new Map<string, typeof steps>();
  for (const s of steps ?? []) {
    if (!stepsByType.has(s.project_type_id)) stepsByType.set(s.project_type_id, []);
    stepsByType.get(s.project_type_id)!.push(s);
  }
  const optionsByStep = new Map<string, typeof options>();
  for (const o of options ?? []) {
    if (!optionsByStep.has(o.step_id)) optionsByStep.set(o.step_id, []);
    optionsByStep.get(o.step_id)!.push(o);
  }

  return (
    <div>
      <PageHeader
        title={`Catalogue v${version.version_number}`}
        description={
          version.is_active
            ? "Active version — this is the canonical catalogue content (pricing still computed from code until the cutover phase)."
            : editable
              ? "Draft — editable. Publishing locks its content permanently."
              : `Published ${formatDateTime(version.published_at)} — content is immutable.`
        }
        action={
          editable ? (
            <form action={publishCatalogueVersion.bind(null, version.id)}>
              <button type="submit" className={buttonCls}>
                Publish &amp; activate
              </button>
            </form>
          ) : null
        }
      />

      {version.notes ? <p className="mb-6 text-sm text-fg-muted">{version.notes}</p> : null}

      <div className="flex flex-col gap-4">
        {(projectTypes ?? []).map((pt) => (
          <Card key={pt.id} className="p-0">
            <details>
              <summary className="cursor-pointer select-none px-5 py-4 text-sm font-medium">
                {pt.label} <span className="font-normal text-fg-muted">({(stepsByType.get(pt.type_id) ?? []).length} steps)</span>
              </summary>
              <div className="border-t border-border p-5">
                {editable ? (
                  <form action={updateProjectType.bind(null, pt.id, version.id)} className="mb-5 flex flex-wrap items-end gap-2 border-b border-border pb-5">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-fg-muted">Label</label>
                      <input name="label" defaultValue={pt.label} className={inputCls} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-fg-muted">Helper</label>
                      <input name="helper" defaultValue={pt.helper} className={`${inputCls} min-w-[20rem]`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-fg-muted">Base price</label>
                      <input name="base_price" type="number" step="0.01" defaultValue={pt.base_price ?? ""} className={`${inputCls} max-w-[8rem]`} />
                    </div>
                    <button type="submit" className={buttonGhostCls}>
                      Save
                    </button>
                  </form>
                ) : null}

                <div className="flex flex-col gap-3">
                  {(stepsByType.get(pt.type_id) ?? []).map((step) => (
                    <details key={step.id} className="rounded-lg border border-border">
                      <summary className="cursor-pointer select-none px-4 py-3 text-sm">
                        {step.question}{" "}
                        <span className="font-normal text-fg-muted">
                          — {step.role} · {step.step_type} · {(optionsByStep.get(step.id) ?? []).length} options
                        </span>
                      </summary>
                      <div className="border-t border-border p-4">
                        {editable ? (
                          <form action={updateStep.bind(null, step.id, version.id)} className="mb-4 flex flex-wrap items-end gap-2 border-b border-border pb-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-fg-muted">Question</label>
                              <input name="question" defaultValue={step.question} className={`${inputCls} min-w-[16rem]`} />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-fg-muted">Helper</label>
                              <input name="helper" defaultValue={step.helper ?? ""} className={`${inputCls} min-w-[16rem]`} />
                            </div>
                            <label className="flex items-center gap-1.5 pb-2 text-xs text-fg-muted">
                              <input type="checkbox" name="optional" defaultChecked={step.optional} />
                              Optional
                            </label>
                            <button type="submit" className={buttonGhostCls}>
                              Save
                            </button>
                          </form>
                        ) : null}

                        {(optionsByStep.get(step.id) ?? []).length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {(optionsByStep.get(step.id) ?? []).map((opt) =>
                              editable ? (
                                <form
                                  key={opt.id}
                                  action={updateOption.bind(null, opt.id, version.id)}
                                  className="flex flex-wrap items-center gap-2 text-sm"
                                >
                                  <input name="label" defaultValue={opt.label} className={`${inputCls} max-w-xs`} />
                                  <input
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    defaultValue={opt.price ?? ""}
                                    placeholder="price"
                                    className={`${inputCls} max-w-[7rem]`}
                                  />
                                  <input
                                    name="multiplier"
                                    type="number"
                                    step="0.01"
                                    defaultValue={opt.multiplier ?? ""}
                                    placeholder="×"
                                    className={`${inputCls} max-w-[5rem]`}
                                  />
                                  <button type="submit" className={buttonGhostCls}>
                                    Save
                                  </button>
                                  <button
                                    type="submit"
                                    formAction={deleteOption.bind(null, opt.id, version.id)}
                                    className={buttonDangerCls}
                                  >
                                    Delete
                                  </button>
                                </form>
                              ) : (
                                <div key={opt.id} className="flex justify-between text-sm">
                                  <span className="text-fg-muted">{opt.label}</span>
                                  <span className="tabular-nums">
                                    {opt.price != null ? `€${opt.price}` : opt.multiplier != null ? `×${opt.multiplier}` : "—"}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <EmptyState>No options on this step.</EmptyState>
                        )}

                        {editable ? (
                          <form action={addOption.bind(null, step.id, version.id)} className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4 text-sm">
                            <input name="option_key" placeholder="option_key" required className={`${inputCls} max-w-[10rem]`} />
                            <input name="label" placeholder="Label" required className={`${inputCls} max-w-xs`} />
                            <input name="price" type="number" step="0.01" placeholder="price" className={`${inputCls} max-w-[7rem]`} />
                            <button type="submit" className={buttonGhostCls}>
                              Add option
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </details>
          </Card>
        ))}
      </div>
    </div>
  );
}
