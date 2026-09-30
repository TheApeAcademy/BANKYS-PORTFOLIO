import { formatMoney } from "@zebraish/lib/format";
import { getKpiSummary, getRevenueTrend } from "@/lib/actions/dashboard";
import { getCurrentRevenueGoals, getTopServices, getActivityHeatmap, getFunnelSummary } from "@/lib/actions/analytics";
import { SetGoalForm } from "@/components/SetGoalForm";
import { CountUp } from "@/components/CountUp";

// Analytics, redesigned from the Claude Design handoff (Analytics.dc.html,
// glass variant) and wired to the live reporting RPCs.

const tint = (pct: number) => `color-mix(in srgb, var(--fg) ${pct}%, transparent)`;
const BLUE = "#3d7ef0";
const GREEN = "#17c98d";
const SERVICE_COLORS = ["#e0295f", "#e8a93c", GREEN, BLUE, tint(50)];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PAGE_CSS =
  "@keyframes livep{0%,100%{box-shadow:0 0 0 0 rgba(48,209,88,.6)}50%{box-shadow:0 0 0 5px rgba(48,209,88,0)}}" +
  ".zb-an-top{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:18px}" +
  "@media (max-width:900px){.zb-an-top{grid-template-columns:minmax(0,1fr)}}";

// Surface comes from the shared studio .glass class (globals.css); this is layout only.
const card: React.CSSProperties = {
  borderRadius: 22,
  padding: "24px 26px",
  display: "flex",
  flexDirection: "column",
  gap: 14,
};
const cardTitle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: tint(55) };
const empty: React.CSSProperties = { fontSize: 13, color: tint(45), margin: 0 };

function pct(actual: number, target: number) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((actual / target) * 100));
}

// Smooth SVG path through a week of daily values, on a 700x220 viewBox.
function weekPath(values: number[], max: number) {
  const X = (i: number) => (i / 6) * 700;
  const Y = (v: number) => 210 - (v / max) * 190;
  return values
    .map((v, i) => {
      if (!i) return `M0 ${Y(v)}`;
      const x0 = X(i - 1), x1 = X(i), c = (x1 - x0) / 2;
      return `C${x0 + c} ${Y(values[i - 1])} ${x1 - c} ${Y(v)} ${x1} ${Y(v)}`;
    })
    .join(" ");
}

export default async function AnalyticsPage() {
  const [summary, goals, services, heatmapCells, funnelStages, dayTrend] = await Promise.all([
    getKpiSummary(),
    getCurrentRevenueGoals(),
    getTopServices(),
    getActivityHeatmap(),
    getFunnelSummary(),
    getRevenueTrend("day", 14),
  ]);

  const revenueThisMonth = summary?.revenue_this_month ?? {};
  const currency = goals[0]?.currency ?? dayTrend[0]?.currency ?? "EUR";

  // Last 14 days of revenue in one currency: the first 7 are last week, the rest this week.
  const byDay = new Map(
    dayTrend.filter((d) => d.currency === currency).map((d) => [d.period_start.slice(0, 10), Number(d.revenue)]),
  );
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - 13 + i);
    return { key: d.toISOString().slice(0, 10), label: DAY_LABELS[d.getUTCDay()] };
  });
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const lastWeek = days.slice(0, 7).map((d) => byDay.get(d.key) ?? 0);
  const thisWeek = days.slice(7).map((d) => byDay.get(d.key) ?? 0);
  const wk = sum(thisWeek), lwk = sum(lastWeek);
  const delta = lwk > 0 ? Math.round((wk / lwk - 1) * 100) : null;
  const max = Math.max(...thisWeek, ...lastWeek, 1) * 1.1;
  const thisPath = weekPath(thisWeek, max);

  const goal = goals.find((g) => g.currency === currency) ?? goals[0];
  const goalHave = goal ? (revenueThisMonth[goal.currency] ?? 0) : 0;
  const goalPct = goal ? pct(goalHave, goal.target_amount) : 0;
  const now = new Date();
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

  const maxRequested = Math.max(...services.map((s) => s.requested_count), 1);
  const funnelTop = Math.max(funnelStages[0]?.event_count ?? 0, 1);

  // Day-of-week x hour-of-day activity, scaled to four intensity steps.
  const heatMax = Math.max(...heatmapCells.map((c) => c.event_count), 1);
  const heatAt = new Map(heatmapCells.map((c) => [`${c.day_of_week}-${c.hour_of_day}`, c.event_count]));
  const heatTotal = sum(heatmapCells.map((c) => c.event_count));
  const heatAlpha = (n: number) => {
    const r = n / heatMax;
    return n === 0 ? 0.06 : r < 0.34 ? 0.3 : r < 0.67 ? 0.6 : 1;
  };

  const minis = [
    { k: "Active projects", v: summary?.active_projects ?? 0 },
    { k: "Overdue", v: summary?.overdue_projects ?? 0 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, color: "var(--fg)" }}>
      <style>{PAGE_CSS}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "clamp(30px,4vw,44px)", fontWeight: 900, letterSpacing: "-.035em", textTransform: "uppercase", lineHeight: .95 }}>Analytics</div>
          <div style={{ fontSize: 13, color: tint(50) }}>
            Goals, service demand, and funnel health. The 10-second view of the business.
          </div>
        </div>
        <span
          style={{
            display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 500, color: tint(70),
            padding: "7px 12px", borderRadius: 100, background: tint(5), border: `1px solid ${tint(8)}`,
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#30D158", animation: "livep 2s infinite" }} />
          Live
        </span>
      </div>

      <div className="zb-an-top">
        <div className="glass" style={{ ...card, gap: 6, padding: "24px 26px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={cardTitle}>Revenue this week</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1 }}><CountUp value={wk} format="money" currency={currency} /></span>
                {delta !== null ? (
                  <span
                    style={{
                      fontSize: 13, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                      color: delta >= 0 ? "#30D158" : "#ff6961",
                      background: delta >= 0 ? "rgba(48,209,88,.12)" : "rgba(255,105,97,.12)",
                    }}
                  >
                    {delta >= 0 ? "+" : ""}
                    {delta}%
                  </span>
                ) : null}
              </div>
              <div style={{ fontSize: 12, color: tint(40), marginTop: 6 }}>vs {formatMoney(lwk, currency)} last week</div>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11, color: tint(55) }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 2, background: BLUE }} />
                This week
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 2, background: tint(35) }} />
                Last week
              </span>
            </div>
          </div>
          <svg viewBox="0 0 700 220" preserveAspectRatio="none" style={{ width: "100%", height: 220, marginTop: 10 }}>
            <defs>
              <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={BLUE} stopOpacity=".35" />
                <stop offset="1" stopColor={BLUE} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[20, 83, 146, 210].map((y) => (
              <line key={y} x1="0" x2="700" y1={y} y2={y} stroke={tint(6)} />
            ))}
            <path d={weekPath(lastWeek, max)} fill="none" stroke={tint(30)} strokeWidth="1.5" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            <path d={`${thisPath} L700 220 L0 220 Z`} fill="url(#ag)" />
            <path d={thisPath} fill="none" stroke={BLUE} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: tint(35) }}>
            {days.slice(7).map((d) => (
              <span key={d.key}>{d.label}</span>
            ))}
          </div>
        </div>

        <div className="glass" style={card}>
          <div style={cardTitle}>Revenue goal · this month</div>
          {goal ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1 }}><CountUp value={goalHave} format="money" currency={goal.currency} /></span>
                <span style={{ fontSize: 14, color: tint(45) }}>/ {formatMoney(goal.target_amount, goal.currency)}</span>
              </div>
              <div style={{ height: 10, borderRadius: 10, background: tint(6), overflow: "hidden" }}>
                <div
                  data-grow
                  style={{
                    height: "100%", width: `${goalPct}%`, borderRadius: 10,
                    backgroundImage: `repeating-linear-gradient(90deg,${GREEN} 0 8px,rgba(23,201,141,.6) 8px 11px)`,
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: tint(50) }}>
                <span>{goalPct}% reached</span>
                <span>{daysLeft} days left</span>
              </div>
            </>
          ) : (
            <p style={empty}>No goal set for this month yet.</p>
          )}
          <div style={{ paddingTop: 12, borderTop: `1px solid ${tint(8)}` }}>
            <SetGoalForm defaultCurrency={currency} />
          </div>
          <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {minis.map((m) => (
              <div key={m.k} style={{ borderRadius: 14, background: tint(3), border: `1px solid ${tint(6)}`, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: tint(50) }}>{m.k}</div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", marginTop: 2 }}><CountUp value={m.v} format="integer" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", gap: 18 }}>
        <div className="glass" style={card}>
          <div style={cardTitle}>Top services</div>
          {services.length ? (
            services.slice(0, 6).map((s, i) => {
              const rev = s.revenue[currency];
              return (
                <div key={s.project_type} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{s.label.replaceAll("_", " ")}</span>
                    <span style={{ color: tint(50), textAlign: "right" }}>
                      {s.requested_count} requests{rev ? ` · ${formatMoney(rev, currency)}` : ""}
                      {s.growth_pct ? ` · ${s.growth_pct > 0 ? "+" : ""}${s.growth_pct}%` : ""}
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 6, background: tint(5) }}>
                    <div
                      data-grow
                      style={{
                        height: "100%", borderRadius: 6, background: SERVICE_COLORS[i % SERVICE_COLORS.length],
                        width: `${Math.max(2, Math.round((s.requested_count / maxRequested) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p style={empty}>No projects yet.</p>
          )}
        </div>

        <div className="glass" style={{ ...card, gap: 10 }}>
          <div style={cardTitle}>Checkout funnel</div>
          {funnelStages.length ? (
            funnelStages.map((f) => (
              <div key={f.stage_order} style={{ display: "grid", gridTemplateColumns: "110px 1fr 48px", alignItems: "center", gap: 12, fontSize: 12 }}>
                <span style={{ color: tint(70) }}>{f.stage_label}</span>
                <div style={{ height: 26, borderRadius: 7, background: tint(4), overflow: "hidden" }}>
                  <div
                    data-grow
                    style={{
                      height: "100%", borderRadius: 7, width: `${Math.round((f.event_count / funnelTop) * 100)}%`,
                      background: "linear-gradient(90deg,rgba(61,126,240,.8),rgba(61,126,240,.35))",
                    }}
                  />
                </div>
                <span style={{ textAlign: "right", fontWeight: 600 }}><CountUp value={f.event_count} format="integer" /></span>
              </div>
            ))
          ) : (
            <p style={empty}>No funnel activity yet.</p>
          )}
        </div>

        <div className="glass" style={card}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={cardTitle}>Activity · by day and hour</span>
            <span style={{ fontSize: 12, color: tint(40) }}>{heatTotal} events</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "28px repeat(24,1fr)", gap: 3, alignItems: "center" }}>
            {DAY_LABELS.map((label, dow) => (
              <div key={label} style={{ display: "contents" }}>
                <span style={{ fontSize: 10, color: tint(40) }}>{label}</span>
                {Array.from({ length: 24 }, (_, h) => {
                  const n = heatAt.get(`${dow}-${h}`) ?? 0;
                  return (
                    <span
                      key={h}
                      data-pop
                      title={`${label} ${String(h).padStart(2, "0")}:00 · ${n} events`}
                      style={{ aspectRatio: "1", borderRadius: 3, background: `rgba(23,201,141,${heatAlpha(n)})`, ["--i" as string]: dow * 24 + h } as React.CSSProperties}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: tint(40) }}>
            Less
            {[0.06, 0.35, 0.7, 1].map((a) => (
              <span key={a} style={{ width: 10, height: 10, borderRadius: 3, background: `rgba(23,201,141,${a})` }} />
            ))}
            More
          </div>
        </div>
      </div>
    </div>
  );
}
