import { type ReactNode, useMemo, useState } from "react";

import { fetchFleet, useLoad } from "./api";
import { BRAND, VERSION } from "./brand";
import { DagLink, Empty, GradeBadge, Loading, Mascot, MiniRing, ScoreRing, brandEyebrow } from "./components";
import type { FleetDag, Grade } from "./types";

const GRADES: Grade[] = ["A", "B", "C", "D", "F"];
const GRADE_LABEL: Record<Grade, string> = { A: "Shining", B: "Steady", C: "Dim", D: "Flickering", F: "Out" };
const HEADLINE: Record<Grade, string> = {
  A: "The whole fleet is shining.",
  B: "The fleet burns steady.",
  C: "The fleet glows dimly.",
  D: "The fleet is flickering.",
  F: "The fleet has gone dark.",
};
const SORTS = [
  { id: "worst", label: "Needs care" },
  { id: "best", label: "Healthiest" },
  { id: "name", label: "A–Z" },
] as const;
type Sort = (typeof SORTS)[number]["id"];
const MAX_CHIPS = 3;
const MAX_COMMON = 6;

function gradeFor(score: number): Grade {
  return score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
}

export function FleetView() {
  const { data, error, reload } = useLoad((s) => fetchFleet(s), []);
  if (error)
    return (
      <Empty
        title="Couldn't load the fleet"
        body={error}
        action={
          <button className="dagwick-btn" onClick={reload}>
            Try again
          </button>
        }
      />
    );
  if (!data) return <Loading label="Checking every DAG…" />;
  if (data.dags.length === 0)
    return <Empty title="No DAGs yet" body="Once Airflow parses a DAG you can read, it shows up here." />;
  return <Fleet dags={data.dags} truncated={data.truncated} />;
}

function Fleet({ dags, truncated }: { dags: FleetDag[]; truncated: boolean }) {
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState<Grade>();
  const [issue, setIssue] = useState<{ id: string; title: string }>();
  const [sort, setSort] = useState<Sort>("worst");

  const avg = dags.reduce((s, d) => s + d.score, 0) / dags.length;
  const avgGrade = gradeFor(avg);
  const dist = useMemo(
    () => Object.fromEntries(GRADES.map((g) => [g, dags.filter((d) => d.grade === g).length])) as Record<Grade, number>,
    [dags],
  );
  const healthy = dist.A + dist.B;
  const needsCare = dags.length - healthy;

  const common = useMemo(() => {
    const by = new Map<string, { id: string; title: string; dags: number; fails: number }>();
    for (const d of dags)
      for (const i of d.issues) {
        const v = by.get(i.id) ?? { id: i.id, title: i.title, dags: 0, fails: 0 };
        v.dags += 1;
        if (i.status === "fail") v.fails += 1;
        by.set(i.id, v);
      }
    return [...by.values()].sort((a, b) => b.dags - a.dags || b.fails - a.fails).slice(0, MAX_COMMON);
  }, [dags]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dags
      .filter(
        (d) =>
          (!grade || d.grade === grade) &&
          (!issue || d.issues.some((i) => i.id === issue.id)) &&
          (!q || d.dag_id.toLowerCase().includes(q) || d.owners.toLowerCase().includes(q)),
      )
      .sort((a, b) =>
        sort === "name" ? a.dag_id.localeCompare(b.dag_id) : sort === "best" ? b.score - a.score : a.score - b.score,
      );
  }, [dags, query, grade, issue, sort]);

  const filtered = Boolean(grade || issue || query.trim());

  return (
    <>
      <section className={`dagwick-hero dagwick-grade-${avgGrade}`}>
        <Mascot grade={avgGrade} />
        <div className="dagwick-hero-text">
          {brandEyebrow("Fleet health")}
          <h2 className="dagwick-dag">All DAGs</h2>
          <p className="dagwick-headline">
            {HEADLINE[avgGrade]}{" "}
            {needsCare === 0
              ? "Every DAG is healthy."
              : `${needsCare} of ${dags.length} ${dags.length === 1 ? "DAG needs" : "DAGs need"} care.`}
          </p>
          <div className="dagwick-stats">
            <Stat value={dags.length} label="DAGs" />
            <Stat value={(Math.floor(avg * 10) / 10).toFixed(1)} label="average score" />
            <Stat value={needsCare} label="need care (C–F)" tone={needsCare ? "fail" : undefined} />
            <Stat value={healthy} label="healthy (A–B)" tone={healthy ? "pass" : undefined} />
          </div>
        </div>
        <div className="dagwick-hero-side">
          <ScoreRing score={avg} grade={avgGrade} />
          <span className="dagwick-muted dagwick-ring-caption">fleet average</span>
        </div>
      </section>

      <section className="dagwick-grades" aria-label="Filter by grade">
        {GRADES.map((g) => {
          const n = dist[g];
          const active = grade === g;
          return (
            <button
              key={g}
              className={`dagwick-gcard dagwick-gcard--${g}${active ? " is-active" : ""}${grade && !active ? " is-dim" : ""}`}
              disabled={n === 0}
              onClick={() => setGrade(active ? undefined : g)}
              aria-pressed={active}
            >
              <GradeBadge grade={g} size="lg" />
              <div className="dagwick-gcard-text">
                <span className="dagwick-gcard-n">{n}</span>
                <span className="dagwick-muted">{GRADE_LABEL[g]}</span>
              </div>
              <div className="dagwick-gcard-bar">
                <div style={{ width: `${(n / dags.length) * 100}%` }} />
              </div>
            </button>
          );
        })}
      </section>

      <div className="dagwick-fleet-grid">
        <section className="dagwick-list">
          <div className="dagwick-toolbar">
            <div className="dagwick-search-wrap">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                className="dagwick-search"
                type="search"
                placeholder="Search DAGs or owners"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search DAGs"
              />
            </div>
            <div className="dagwick-seg" role="radiogroup" aria-label="Sort">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  role="radio"
                  aria-checked={sort === s.id}
                  className={sort === s.id ? "is-active" : ""}
                  onClick={() => setSort(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {filtered && (
            <div className="dagwick-filters">
              <span className="dagwick-muted">
                {rows.length} of {dags.length} DAGs
              </span>
              {grade && <FilterChip onClear={() => setGrade(undefined)}>Grade {grade}</FilterChip>}
              {issue && <FilterChip onClear={() => setIssue(undefined)}>{issue.title}</FilterChip>}
              {query.trim() && <FilterChip onClear={() => setQuery("")}>“{query.trim()}”</FilterChip>}
            </div>
          )}
          {rows.length === 0 ? (
            <div className="dagwick-clear">No DAG matches.</div>
          ) : (
            <ul className="dagwick-rows">
              {rows.map((d) => (
                <li key={d.dag_id}>
                  <DagLink dagId={d.dag_id} className={`dagwick-row dagwick-row--${d.grade}`}>
                    <MiniRing score={d.score} grade={d.grade} />
                    <div className="dagwick-row-main">
                      <div className="dagwick-row-title">
                        <span className="dagwick-row-name">{d.dag_id}</span>
                        {d.is_paused && <span className="dagwick-tag">paused</span>}
                      </div>
                      <div className="dagwick-row-sub dagwick-muted">
                        {d.owners && <span>{d.owners}</span>}
                        <span>
                          {d.counts.fail + d.counts.warn === 0
                            ? "All checks passing"
                            : `${d.counts.fail} failing · ${d.counts.warn} to improve`}
                        </span>
                      </div>
                      {d.issues.length > 0 && (
                        <div className="dagwick-row-issues">
                          {d.issues.slice(0, MAX_CHIPS).map((i) => (
                            <span key={i.id} className={`dagwick-ichip dagwick-ichip--${i.status}`}>
                              {i.title}
                            </span>
                          ))}
                          {d.issues.length > MAX_CHIPS && (
                            <span className="dagwick-ichip dagwick-ichip--more">+{d.issues.length - MAX_CHIPS}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <GradeBadge grade={d.grade} />
                    <span className="dagwick-row-go" aria-hidden="true">
                      ›
                    </span>
                  </DagLink>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="dagwick-side">
          <div className="dagwick-side-card">
            <h3 className="dagwick-side-title">Most common issues</h3>
            {common.length === 0 ? (
              <p className="dagwick-muted dagwick-side-empty">No issues anywhere. ✨</p>
            ) : (
              <ul className="dagwick-common">
                {common.map((c) => {
                  const active = issue?.id === c.id;
                  return (
                    <li key={c.id}>
                      <button
                        className={`dagwick-common-item${active ? " is-active" : ""}`}
                        onClick={() => setIssue(active ? undefined : { id: c.id, title: c.title })}
                        aria-pressed={active}
                      >
                        <div className="dagwick-common-head">
                          <span>{c.title}</span>
                          <span className="dagwick-muted">
                            {c.dags}/{dags.length}
                          </span>
                        </div>
                        <div className="dagwick-bar">
                          <div
                            className="dagwick-bar-fill"
                            style={{
                              width: `${(c.dags / dags.length) * 100}%`,
                              background: c.fails >= c.dags / 2 ? "var(--dagwick-fail)" : "var(--dagwick-warn)",
                            }}
                          />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="dagwick-side-hint dagwick-muted">Click an issue to see which DAGs have it.</p>
          </div>
        </aside>
      </div>
      <footer className="dagwick-foot dagwick-muted">
        {truncated ? `Showing the first ${dags.length} DAGs. ` : ""}Scored automatically from the latest parsed
        version of each DAG. · {BRAND} {VERSION}
      </footer>
    </>
  );
}

function Stat({ value, label, tone }: { value: ReactNode; label: string; tone?: "pass" | "fail" }) {
  return (
    <div className={`dagwick-stat${tone ? ` dagwick-stat--${tone}` : ""}`}>
      <span className="dagwick-stat-value">{value}</span>
      <span className="dagwick-stat-label">{label}</span>
    </div>
  );
}

function FilterChip({ children, onClear }: { children: ReactNode; onClear: () => void }) {
  return (
    <button className="dagwick-fchip" onClick={onClear} aria-label="Remove filter">
      {children} <span aria-hidden="true">✕</span>
    </button>
  );
}
