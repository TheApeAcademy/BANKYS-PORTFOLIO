import Link from "next/link";
import { PageHeader, Card, EmptyState, LivePill } from "@/components/ui";
import { formatMoney, formatDateTime } from "@zebraish/lib/format";
import { getKpiSummary, getRevenueTrend, getActivityFeed, getStudioActivity, type StudioActivity } from "@/lib/actions/dashboard";
import { CountUp } from "@/components/CountUp";
import { RevenueChart } from "@/components/RevenueChart";
import { LivePoller } from "@/components/LivePoller";

const GREEN = "#17c98d";
const BLUE = "#3d7ef0";

function moneyByCurrency(amounts: Record<string, number>): string {
  const entries = Object.entries(amounts);
  if (entries.length === 0) return formatMoney(0);
  return entries.map(([currency, amount]) => formatMoney(amount, currency)).join(" · ");
}

/** Smooth line through the 14-day visitor counts, on a 700x160 viewBox. */
function visitsPath(values: number[], max: number) {
  const X = (i: number) => (i / Math.max(1, values.length - 1)) * 700;
  const Y = (v: number) => 150 - (v / max) * 135;
  return values
    .map((v, i) => {
      if (!i) return `M0 ${Y(v)}`;
      const x0 = X(i - 1), x1 = X(i), c = (x1 - x0) / 2;
      return `C${x0 + c} ${Y(values[i - 1])} ${x1 - c} ${Y(v)} ${x1} ${Y(v)}`;
    })
    .join(" ");
}

const PAGE_NAMES: Record<string, string> = {
  "/": "Intro",
  "/studio": "Studio",
  "/world": "World",
  "/collaborate": "Collaborate",
  "/login": "Collaborator sign-in",
  "/track": "Tracker link",
  "/terms": "Terms",
  "/privacy": "Privacy",
  "/cookies": "Cookies",
  "/aviso-legal": "Aviso legal",
};
function pageName(path: string) {
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];
  const w = /^\/work\/([^/]+)/.exec(path);
  if (w) return `Case study · ${w[1].charAt(0).toUpperCase()}${w[1].slice(1)}`;
  return path;
}

function Stat({ label, value, sub, format = "integer" }: { label: string; value: number; sub?: React.ReactNode; format?: "integer" | "percent" }) {
  return (
    <Card className="h-full">
      <p className="kicker">{label}</p>
      <p className="tabular-nums mt-3 text-3xl font-black tracking-[-.03em]">
        <CountUp value={value} format={format} />
      </p>
      {sub ? <p className="mt-1.5 text-xs text-fg-muted">{sub}</p> : null}
    </Card>
  );
}

function Split({ title, parts }: { title: string; parts: { label: string; n: number; color: string }[] }) {
  const total = parts.reduce((a, p) => a + p.n, 0);
  return (
    <div>
      <p className="kicker">{title}</p>
      {total ? (
        <>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-[rgba(245,245,247,.06)]" data-grow>
            {parts.map((p) => (
              <span key={p.label} style={{ width: `${(p.n / total) * 100}%`, background: p.color }} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
            {parts.map((p) => (
              <span key={p.label} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                {p.label} {Math.round((p.n / total) * 100)}%
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-2 text-xs text-fg-muted">No visits yet.</p>
      )}
    </div>
  );
}

function StudioLive({ s }: { s: StudioActivity | null }) {
  if (!s) {
    return (
      <Card>
        <EmptyState>Studio activity will appear here as soon as visitors arrive.</EmptyState>
      </Card>
    );
  }
  const e = (k: string) => s.events[k] ?? 0;
  const contacts = e("contact_whatsapp") + e("contact_email") + e("contact_call") + e("contact_instagram") + e("contact_tiktok");
  const introPct = e("intro_started") ? (e("intro_completed") / e("intro_started")) * 100 : 0;
  const delta = s.visits_prev > 0 ? Math.round((s.visits / s.visits_prev - 1) * 100) : null;
  const daily = s.daily.map((d) => d.visits);
  const max = Math.max(...daily, 1) * 1.15;
  const line = visitsPath(daily, max);
  const topMax = Math.max(...s.top_pages.map((p) => p.views), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <Stat label="Visitors today" value={s.visits_today} />
        <Stat
          label={`Visitors · ${s.days} days`}
          value={s.visits}
          sub={
            delta === null ? "First week of data" : (
              <span style={{ color: delta >= 0 ? "#30D158" : "#ff6961" }}>
                {delta >= 0 ? "+" : ""}
                {delta}% vs the week before
              </span>
            )
          }
        />
        <Stat label="Contact taps" value={contacts} sub={`${e("contact_whatsapp")} on WhatsApp`} />
        <Stat label="Intro watched" value={introPct} format="percent" sub={`${e("intro_completed")} of ${e("intro_started")} to the end`} />
        <Stat label="New briefs" value={e("configurator_submitted")} sub={`${e("builder_opened")} builder opens`} />
        <Stat label="Applications" value={s.applications} sub={`${e("collab_apply_opened")} opened the form`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <div className="flex items-baseline justify-between gap-3">
            <p className="kicker">Visitors · last 14 days</p>
            <span className="text-xs text-fg-muted">{s.page_views} page views this week</span>
          </div>
          <svg viewBox="0 0 700 160" preserveAspectRatio="none" className="mt-4 h-40 w-full">
            <defs>
              <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={GREEN} stopOpacity=".35" />
                <stop offset="1" stopColor={GREEN} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[15, 60, 105, 150].map((y) => (
              <line key={y} x1="0" x2="700" y1={y} y2={y} stroke="rgba(245,245,247,.06)" />
            ))}
            <path d={`${line} L700 160 L0 160 Z`} fill="url(#vg)" />
            <path d={line} fill="none" stroke={GREEN} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="mt-2 flex justify-between text-[11px] text-fg-muted">
            <span>{s.daily[0]?.day.slice(5)}</span>
            <span>Today</span>
          </div>
        </Card>

        <Card>
          <p className="kicker">Most visited</p>
          {s.top_pages.length ? (
            <ul className="mt-4 flex flex-col gap-3">
              {s.top_pages.map((p) => (
                <li key={p.path}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{pageName(p.path)}</span>
                    <span className="tabular-nums text-fg-muted">{p.views}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[rgba(245,245,247,.06)]">
                    <div data-grow className="h-full rounded-full" style={{ width: `${(p.views / topMax) * 100}%`, background: `linear-gradient(90deg,${BLUE},${GREEN})` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-fg-muted">No page views yet.</p>
          )}
        </Card>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Split
            title="Devices"
            parts={[
              { label: "Phone", n: s.devices.mobile ?? 0, color: GREEN },
              { label: "Desktop", n: s.devices.desktop ?? 0, color: BLUE },
            ]}
          />
          <Split
            title="Language"
            parts={[
              { label: "Spanish", n: s.langs.es ?? 0, color: "#e8a93c" },
              { label: "English", n: s.langs.en ?? 0, color: "#8b5cf6" },
            ]}
          />
          <div>
            <p className="kicker">Where they came from</p>
            {s.referrers.length ? (
              <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                {s.referrers.map((r) => (
                  <li key={r.host} className="flex justify-between gap-3">
                    <span className="truncate">{r.host}</span>
                    <span className="tabular-nums text-fg-muted">{r.visits}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-fg-muted">Direct visits and shared links so far.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [summary, trend, activity, studio] = await Promise.all([
    getKpiSummary(),
    getRevenueTrend("week", 12),
    getActivityFeed(),
    getStudioActivity(7),
  ]);

  const trendCurrencies = [...new Set(trend.map((p) => p.currency))];
  const primaryCurrency = trendCurrencies[0] ?? "EUR";

  const kpis: { href: string; label: string; node: React.ReactNode }[] = [
    {
      href: "/payments",
      label: "Revenue this month",
      node:
        summary && Object.keys(summary.revenue_this_month).length
          ? Object.entries(summary.revenue_this_month).map(([currency, amount]) => (
              <span key={currency} className="mr-3 inline-block">
                <CountUp value={amount} format="money" currency={currency} />
              </span>
            ))
          : <CountUp value={0} format="money" currency="EUR" />,
    },
    { href: "/projects", label: "Active projects", node: <CountUp value={summary?.active_projects ?? 0} format="integer" /> },
    { href: "/payouts", label: "Pending commission", node: summary ? moneyByCurrency(summary.pending_commission_total) : formatMoney(0) },
    { href: "/payments", label: "Open disputes", node: <CountUp value={summary?.open_disputes ?? 0} format="integer" /> },
    { href: "/projects", label: "Overdue projects", node: <CountUp value={summary?.overdue_projects ?? 0} format="integer" /> },
  ];

  return (
    <div>
      <LivePoller intervalSeconds={20} />

      <PageHeader
        title="Overview"
        description="Money, projects and everything happening on the studio right now. Refreshes by itself."
        action={<LivePill />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href}>
            <Card className="h-full">
              <p className="kicker">{k.label}</p>
              <p className="tabular-nums mt-3 text-3xl font-black tracking-[-.03em]">{k.node}</p>
            </Card>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <div data-reveal className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="kicker flex items-center gap-3">
              <span className="h-px w-7 bg-[rgba(245,245,247,.3)]" aria-hidden />
              The studio, live
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-[-.03em]">Who&apos;s on the site</h2>
          </div>
          {process.env.NEXT_PUBLIC_STUDIO_URL ? (
            <a href={`${process.env.NEXT_PUBLIC_STUDIO_URL}/studio`} target="_blank" rel="noreferrer" className="btn text-xs font-semibold text-fg-muted hover:text-fg">
              Open the studio →
            </a>
          ) : null}
        </div>
        <StudioLive s={studio} />
      </section>

      <section className="mt-12">
        <p data-reveal className="kicker mb-4">Revenue · trailing 12 weeks ({primaryCurrency})</p>
        <Card>
          <RevenueChart points={trend} currency={primaryCurrency} />
        </Card>
      </section>

      <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          { href: "/payouts", title: "Sunday payout review", body: "Review this week's pending commissions and mark payouts paid." },
          { href: "/projects", title: "Projects & payments", body: "Full client detail, search, filter, and manual payment entry." },
          { href: "/collaborators", title: "Collaborators", body: "Terms, commission rates, and running totals." },
        ].map((q) => (
          <Link key={q.href + q.title} href={q.href}>
            <Card className="h-full">
              <p className="font-bold">{q.title} →</p>
              <p className="mt-1.5 text-sm text-fg-muted">{q.body}</p>
            </Card>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <p data-reveal className="kicker mb-4">Live activity · studio and Bureau</p>
        <Card className="p-0">
          {activity.length ? (
            <ul className="divide-y divide-[rgba(245,245,247,.07)]">
              {activity.map((row) => {
                const fromStudio = row.id.startsWith("activity-");
                const content = (
                  <div className="flex items-center justify-between gap-4 px-6 py-3.5 text-sm">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: fromStudio ? GREEN : BLUE }} aria-hidden />
                      <span className="min-w-0">
                        <span className="font-medium first-letter:uppercase">{row.label}</span>
                        {row.detail ? <span className="text-fg-muted"> · {row.detail}</span> : null}
                      </span>
                    </div>
                    <div className="shrink-0 text-xs text-fg-muted">{formatDateTime(row.occurred_at)}</div>
                  </div>
                );
                return (
                  <li key={row.id}>
                    {row.href ? (
                      <Link href={row.href} className="block transition hover:bg-[rgba(245,245,247,.04)]">
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState>No activity yet.</EmptyState>
          )}
        </Card>
      </section>
    </div>
  );
}
