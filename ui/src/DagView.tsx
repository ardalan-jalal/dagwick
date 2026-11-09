import { type ReactNode, useMemo, useState } from "react";

import { fetchScore, useLoad } from "./api";
import { BRAND, VERSION } from "./brand";
import { CodeBlock, Empty, Loading, Mascot, ScoreRing, brandEyebrow } from "./components";
import type { CheckResult, Grade, ScoreReport, Status } from "./types";

export const CATEGORY_LABEL: Record<string, string> = {
  reliability: "Reliability",
  observability: "Observability",
  scheduling: "Scheduling",
  ownership: "Ownership",
  structure: "Structure",
};
const STATUS_ORDER: Record<Status, number> = { fail: 0, warn: 1, pass: 2, skip: 3 };
const HEADLINE: Record<Grade, string> = {
  A: "Shining bright. This DAG is in great shape.",
  B: "A steady flame. A few small things to polish.",
  C: "Burning, but dimly. Some important habits are missing.",
  D: "Flickering. This DAG needs attention soon.",
  F: "The lamp has gone out. Start with the red items below.",
};
const THRESHOLDS: [Grade, number][] = [
  ["A", 90],
  ["B", 75],
  ["C", 60],
  ["D", 40],
];

type Filter = "attention" | "all" | "passed";

const gain = (c: CheckResult) => c.weight - c.points;
const byPriority = (a: CheckResult, b: CheckResult) =>
  STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || gain(b) - gain(a);

export function DagView({ dagId }: { dagId: string }) {
  const { data, error, reload } = useLoad((s) => fetchScore(dagId, s), [dagId]);
  if (error)
    return (
      <Empty
        title="Couldn't check this DAG"
        body={error}
        action={
          <button className="dagwick-btn" onClick={reload}>
            Try again
          </button>
        }
      />
    );
  if (!data) return <Loading />;
  return <Report key={data.dag_id} report={data} />;
}

/** Cheapest set of fixes (largest gains first) that reaches the next grade. */
function nextGoal(report: ScoreReport) {
  const next = [...THRESHOLDS].reverse().find(([, t]) => t > report.score);
  if (!next) return undefined;
  const [grade, threshold] = next;
  let needed = (threshold / 100) * report.max_points - report.points;
  const picks: CheckResult[] = [];
  const open = report.checks.filter((c) => c.status === "fail" || c.status === "warn").sort((a, b) => gain(b) - gain(a));
  for (const c of open) {
    if (needed <= 1e-9) break;
    picks.push(c);
    needed -= gain(c);
  }
  return needed <= 1e-9 ? { grade, picks } : undefined;
}

function Report({ report }: { report: ScoreReport }) {
  const attention = report.counts.fail + report.counts.warn;
  const [filter, setFilter] = useState<Filter>(attention ? "attention" : "all");
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const actionable = report.checks.filter((c) => c.fix).sort(byPriority);
    const failing = actionable.filter((c) => c.status === "fail");
    return new Set((failing.length ? failing : actionable.slice(0, 2)).map((c) => c.id));
  });
  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const categories = useMemo(() => summarise(report.checks), [report]);
  const goal = useMemo(() => nextGoal(report), [report]);
  const visible = useMemo(
    () =>
      report.checks
        .filter((c) =>
          filter === "all" ? true : filter === "passed" ? c.status === "pass" : c.status === "fail" || c.status === "warn",
        )
        .sort(byPriority),
    [report, filter],
  );

  const jumpTo = (id: string) => {
    setFilter("attention");
    setOpenIds((prev) => new Set(prev).add(id));
    requestAnimationFrame(() =>
      document.getElementById(`dagwick-check-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  };

  return (
    <>
      <section className={`dagwick-hero dagwick-grade-${report.grade}`}>
        <Mascot grade={report.grade} />
        <div className="dagwick-hero-text">
          {brandEyebrow("DAG health")}
          <h2 className="dagwick-dag">{report.dag_id}</h2>
          <p className="dagwick-headline">{HEADLINE[report.grade]}</p>
          <div className="dagwick-chips">
            <Chip status="pass" n={report.counts.pass} label="passing" />
            <Chip status="warn" n={report.counts.warn} label="to improve" />
            <Chip status="fail" n={report.counts.fail} label="failing" />
          </div>
        </div>
        <div className="dagwick-hero-side">
          <ScoreRing score={report.score} grade={report.grade} />
        </div>
      </section>

      {goal ? (
        <section className="dagwick-goal">
          <div className="dagwick-goal-text">
            <span className="dagwick-goal-step">Next step</span>
            Fix {goal.picks.length === 1 ? "this check" : `these ${goal.picks.length} checks`} to reach{" "}
            <span className={`dagwick-badge dagwick-badge--${goal.grade}`}>{goal.grade}</span>
          </div>
          <div className="dagwick-goal-picks">
            {goal.picks.map((c) => (
              <button key={c.id} className="dagwick-pick" onClick={() => jumpTo(c.id)}>
                {c.title} <span className="dagwick-pick-gain">+{gain(c).toFixed(c.points % 1 ? 1 : 0)}</span>
              </button>
            ))}
          </div>
        </section>
      ) : report.score < 100 ? (
        <section className="dagwick-goal dagwick-goal--top">
          <div className="dagwick-goal-text">
            <span className="dagwick-goal-step">Top grade</span> Polish the last {attention} item
            {attention === 1 ? "" : "s"} for a perfect 100.
          </div>
        </section>
      ) : null}

      <section className="dagwick-cats" aria-label="Score by category">
        {categories.map((c) => (
          <div key={c.id} className="dagwick-cat">
            <div className="dagwick-cat-head">
              <span>{CATEGORY_LABEL[c.id] ?? c.id}</span>
              <span className="dagwick-muted">{Math.round(c.pct)}%</span>
            </div>
            <div className="dagwick-bar">
              <div className="dagwick-bar-fill" style={{ width: `${c.pct}%`, background: barColor(c.pct) }} />
            </div>
          </div>
        ))}
      </section>

      <section className="dagwick-list">
        <div className="dagwick-tabs" role="tablist">
          <Tab active={filter === "attention"} onClick={() => setFilter("attention")}>
            Needs attention <span className="dagwick-count">{attention}</span>
          </Tab>
          <Tab active={filter === "all"} onClick={() => setFilter("all")}>
            All checks <span className="dagwick-count">{report.checks.length}</span>
          </Tab>
          <Tab active={filter === "passed"} onClick={() => setFilter("passed")}>
            Passed <span className="dagwick-count">{report.counts.pass}</span>
          </Tab>
        </div>
        {visible.length === 0 ? (
          <div className="dagwick-clear">Nothing here. Every check in this view is passing. ✨</div>
        ) : (
          <ul className="dagwick-checks">
            {visible.map((c) => (
              <CheckRow key={c.id} check={c} open={openIds.has(c.id)} onToggle={() => toggle(c.id)} />
            ))}
          </ul>
        )}
      </section>
      <footer className="dagwick-foot dagwick-muted">
        {report.points} / {report.max_points} points · scored automatically from the latest parsed version of this DAG · {BRAND} {VERSION}
      </footer>
    </>
  );
}

const ICON: Record<Status, string> = { pass: "✓", warn: "!", fail: "✕", skip: "–" };
const MAX_ITEMS = 8;

function CheckRow({ check, open, onToggle }: { check: CheckResult; open: boolean; onToggle: () => void }) {
  const [allItems, setAllItems] = useState(false);
  const actionable = Boolean(check.fix);
  const items = allItems ? check.items : check.items.slice(0, MAX_ITEMS);
  return (
    <li
      id={`dagwick-check-${check.id}`}
      className={`dagwick-check dagwick-check--${check.status}${open && actionable ? " is-open" : ""}`}
    >
      <span className="dagwick-icon" aria-label={check.status}>
        {ICON[check.status]}
      </span>
      <div className="dagwick-check-body">
        <button
          className="dagwick-check-head"
          onClick={actionable ? onToggle : undefined}
          disabled={!actionable}
          aria-expanded={actionable ? open : undefined}
        >
          <span className="dagwick-check-title">{check.title}</span>
          <span className="dagwick-tag">{CATEGORY_LABEL[check.category] ?? check.category}</span>
          <span className="dagwick-pts">
            {check.status === "skip" ? "n/a" : `${check.points} / ${check.weight}`}
            {actionable && <span className="dagwick-caret">{open ? "▾" : "▸"}</span>}
          </span>
        </button>
        <div className="dagwick-check-msg">{check.message}</div>
        {open && actionable && (
          <div className="dagwick-detail">
            {check.items.length > 0 && (
              <div className="dagwick-items">
                <span className="dagwick-items-label">Affected</span>
                {items.map((t) => (
                  <code key={t} className="dagwick-item">
                    {t}
                  </code>
                ))}
                {check.items.length > MAX_ITEMS && (
                  <button className="dagwick-more" onClick={() => setAllItems(!allItems)}>
                    {allItems ? "show less" : `+${check.items.length - MAX_ITEMS} more`}
                  </button>
                )}
              </div>
            )}
            <div className="dagwick-fix">
              <span className="dagwick-fix-label">How to fix</span>
              {check.fix}
              {check.example && <CodeBlock code={check.example} />}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

function Chip({ status, n, label }: { status: Status; n: number; label: string }) {
  return (
    <span className={`dagwick-chip dagwick-chip--${status}`}>
      <strong>{n}</strong> {label}
    </span>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button role="tab" aria-selected={active} className={`dagwick-tab${active ? " is-active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function summarise(checks: CheckResult[]) {
  const by = new Map<string, { earned: number; possible: number }>();
  for (const c of checks) {
    if (c.status === "skip") continue;
    const v = by.get(c.category) ?? { earned: 0, possible: 0 };
    v.earned += c.points;
    v.possible += c.weight;
    by.set(c.category, v);
  }
  return Object.keys(CATEGORY_LABEL)
    .filter((id) => by.has(id))
    .concat([...by.keys()].filter((id) => !(id in CATEGORY_LABEL)))
    .map((id) => {
      const v = by.get(id)!;
      return { id, pct: v.possible ? (v.earned / v.possible) * 100 : 0 };
    });
}

export function barColor(pct: number) {
  return pct >= 90 ? "var(--dagwick-pass)" : pct >= 60 ? "var(--dagwick-warn)" : "var(--dagwick-fail)";
}
