// Scoped under .dagwick so nothing leaks into Airflow's UI. Dark mode follows
// Airflow's own theme switch (Chakra sets class="dark" on <html>).
export const STYLES = `
.dagwick {
  --dagwick-bg: #ffffff;
  --dagwick-surface: #f8f7f4;
  --dagwick-border: #e7e3dc;
  --dagwick-text: #1d2129;
  --dagwick-muted: #6b6f78;
  --dagwick-pass: #15803d;
  --dagwick-pass-bg: #edf7f0;
  --dagwick-warn: #b45309;
  --dagwick-warn-bg: #fdf3e2;
  --dagwick-fail: #c2410c;
  --dagwick-fail-bg: #fdece4;
  --dagwick-accent: #d97706;
  /* Small amber text: #d97706 is 3.2:1 on white, below WCAG AA (4.5:1). */
  --dagwick-accent-text: #b45309;
  --dagwick-flame: #f59e0b;
  --dagwick-flame-deep: #ea580c;
  --dagwick-flame-tip: #fbbf24;
  --dagwick-flame-core: #fde68a;
  --dagwick-flame-heart: #fffbe3;
  --dagwick-flame-cool: #60a5fa;
  --dagwick-spark: #f59e0b;
  --dagwick-moon: #f2b632;
  --dagwick-metal: #e0a040;
  --dagwick-metal-dark: #8a5a1c;
  --dagwick-wax: #f5e6cc;
  --dagwick-wax-top: #fff8ea;
  --dagwick-wax-pool: #f0d9ae;
  --dagwick-wax-shade: #d6bb91;
  --dagwick-wax-edge: #cfb48a;
  --dagwick-wick: #3f2a1d;
  --dagwick-ink: #3b1f12;
  --dagwick-mouth: #6b1d0e;
  --dagwick-tongue: #ff8f80;
  --dagwick-blush: #ff8a65;
  --dagwick-tear: #7cc0ff;
  --dagwick-smoke-hi: #cdd1dc;
  --dagwick-smoke-lo: #9ba0b3;
  --dagwick-smoke-ink: #394056;
  --dagwick-shadow: rgba(60, 40, 20, 0.12);
  color: var(--dagwick-text);
  font: inherit;
  padding: 8px 4px 24px;
  width: 100%;
  max-width: 1440px;
  margin-inline: auto;
  box-sizing: border-box;
  container: dagwick / inline-size;
}
html.dark .dagwick {
  --dagwick-bg: #171a21;
  --dagwick-surface: #1e222b;
  --dagwick-border: #2c313c;
  --dagwick-text: #ebe7e0;
  --dagwick-muted: #9a9fab;
  --dagwick-pass: #4ade80;
  --dagwick-pass-bg: rgba(74, 222, 128, 0.1);
  --dagwick-warn: #fbbf24;
  --dagwick-warn-bg: rgba(251, 191, 36, 0.1);
  --dagwick-fail: #fb7c4c;
  --dagwick-fail-bg: rgba(251, 124, 76, 0.12);
  --dagwick-accent: #fbbf24;
  --dagwick-accent-text: #fbbf24;
  --dagwick-shadow: rgba(0, 0, 0, 0.35);
  --dagwick-spark: #fde68a;
  --dagwick-moon: #fde68a;
  --dagwick-wax-edge: transparent;
  --dagwick-smoke-hi: #d9dce8;
  --dagwick-smoke-lo: #a3a8bb;
}
.dagwick * { box-sizing: border-box; }
.dagwick-muted { color: var(--dagwick-muted); }

.dagwick-hero {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 24px;
  align-items: center;
  padding: 20px 24px;
  border: 1px solid var(--dagwick-border);
  border-radius: 16px;
  background:
    radial-gradient(600px 220px at 0% 0%, color-mix(in srgb, var(--dagwick-flame) 14%, transparent), transparent 70%),
    var(--dagwick-bg);
}
.dagwick-hero.dagwick-grade-D, .dagwick-hero.dagwick-grade-F { background: var(--dagwick-bg); }
.dagwick-eyebrow { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--dagwick-muted); }
.dagwick-brand { color: var(--dagwick-accent-text); font-weight: 700; }
.dagwick-dag { margin: 4px 0 6px; font-size: 22px; font-weight: 700; word-break: break-all; }
.dagwick-headline { margin: 0 0 12px; font-size: 15px; }
.dagwick-potential { margin: 10px 0 0; font-size: 13px; color: var(--dagwick-muted); }
.dagwick-potential strong { color: var(--dagwick-accent-text); }
.dagwick-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.dagwick-chip { font-size: 13px; padding: 3px 10px; border-radius: 999px; }
.dagwick-chip--pass { color: var(--dagwick-pass); background: var(--dagwick-pass-bg); }
.dagwick-chip--warn { color: var(--dagwick-warn); background: var(--dagwick-warn-bg); }
.dagwick-chip--fail { color: var(--dagwick-fail); background: var(--dagwick-fail-bg); }
.dagwick-chip--ack { color: var(--dagwick-muted); background: var(--dagwick-surface); }
.dagwick-hero-side { display: flex; flex-direction: column; align-items: center; gap: 12px; }

.dagwick-ring { position: relative; width: 132px; height: 132px; }
.dagwick-ring-track { fill: none; stroke: var(--dagwick-border); stroke-width: 10; }
.dagwick-ring-fill { fill: none; stroke: var(--dagwick-accent); stroke-width: 10; stroke-linecap: round; transition: stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1); }
.dagwick-grade-A .dagwick-ring-fill { stroke: var(--dagwick-pass); }
.dagwick-grade-D .dagwick-ring-fill, .dagwick-grade-F .dagwick-ring-fill { stroke: var(--dagwick-fail); }
.dagwick-ring-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1; }
.dagwick-grade { font-size: 40px; font-weight: 800; }
.dagwick-score { font-size: 13px; color: var(--dagwick-muted); margin-top: 4px; }

.dagwick-btn {
  font: inherit; font-size: 13px; padding: 6px 14px; border-radius: 8px; cursor: pointer;
  color: var(--dagwick-text); background: var(--dagwick-surface); border: 1px solid var(--dagwick-border);
}
.dagwick-btn:hover:not(:disabled) { border-color: var(--dagwick-accent); }
.dagwick-csv { margin-left: auto; }
.dagwick-btn:disabled { opacity: .6; cursor: progress; }
.dagwick-btn:focus-visible, .dagwick-tab:focus-visible { outline: 2px solid var(--dagwick-accent); outline-offset: 2px; }

.dagwick-health { margin: 16px 0; }
.dagwick-health-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; }
.dagwick-health-head .dagwick-muted { font-size: 12px; }
.dagwick-health .dagwick-cats { margin: 8px 0 0; }
.dagwick-health-empty { margin: 6px 0 0; font-size: 13px; }
.dagwick-htile-value { font-size: 20px; font-weight: 800; line-height: 1.2; font-variant-numeric: tabular-nums; }
.dagwick-htile-sub { font-size: 12px; margin-top: 2px; }
.dagwick-htile--pass .dagwick-htile-value { color: var(--dagwick-pass); }
.dagwick-htile--warn .dagwick-htile-value { color: var(--dagwick-warn); }
.dagwick-htile--fail .dagwick-htile-value { color: var(--dagwick-fail); }
.dagwick-health-low { color: var(--dagwick-fail); }
/* Equal columns: every card has the same width at any size; a short last row keeps that width. */
.dagwick-cats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 16px 0; }
.dagwick-cat { min-width: 0; padding: 12px 14px; border: 1px solid var(--dagwick-border); border-radius: 12px; background: var(--dagwick-bg); }
.dagwick-cat-head { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
.dagwick-bar { height: 6px; border-radius: 99px; background: var(--dagwick-border); overflow: hidden; }
.dagwick-bar-fill { height: 100%; border-radius: 99px; transition: width .9s cubic-bezier(.2,.8,.2,1); }

.dagwick-list { border: 1px solid var(--dagwick-border); border-radius: 16px; background: var(--dagwick-bg); }
.dagwick-list > :first-child { border-radius: 15px 15px 0 0; }
.dagwick-rows > li:last-child > .dagwick-row { border-radius: 0 0 15px 15px; }
.dagwick-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.dagwick-tabs { display: flex; gap: 4px; padding: 8px; border-bottom: 1px solid var(--dagwick-border); background: var(--dagwick-surface); flex-wrap: wrap; }
.dagwick-tab { font: inherit; font-size: 13px; padding: 6px 12px; border-radius: 8px; border: 0; background: transparent; color: var(--dagwick-muted); cursor: pointer; }
.dagwick-tab.is-active { background: var(--dagwick-bg); color: var(--dagwick-text); box-shadow: 0 1px 2px var(--dagwick-shadow); }
.dagwick-count { margin-left: 4px; font-size: 11px; padding: 1px 6px; border-radius: 99px; background: var(--dagwick-border); color: var(--dagwick-text); }
.dagwick-checks { list-style: none; margin: 0; padding: 0; }
.dagwick-check { display: flex; gap: 14px; padding: 14px 18px; border-top: 1px solid var(--dagwick-border); }
.dagwick-check:first-child { border-top: 0; }
.dagwick-icon { flex: none; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-size: 13px; font-weight: 700; }
.dagwick-check--pass .dagwick-icon { color: var(--dagwick-pass); background: var(--dagwick-pass-bg); }
.dagwick-check--warn .dagwick-icon { color: var(--dagwick-warn); background: var(--dagwick-warn-bg); }
.dagwick-check--fail .dagwick-icon { color: var(--dagwick-fail); background: var(--dagwick-fail-bg); }
.dagwick-check--skip .dagwick-icon { color: var(--dagwick-muted); background: var(--dagwick-surface); }
.dagwick-check--skip { opacity: .7; }
.dagwick-check--ack .dagwick-icon { color: var(--dagwick-muted); background: var(--dagwick-surface); }
.dagwick-check--ack { opacity: .8; }
.dagwick-ack { margin-top: 6px; font-size: 13px; }
.dagwick-ack-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--dagwick-muted); margin-right: 6px; }
.dagwick-ack-note { margin-top: 6px; font-size: 12px; color: var(--dagwick-warn); }
.dagwick-check-body { flex: 1; min-width: 0; }
.dagwick-check-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.dagwick-check-title { font-weight: 600; }
.dagwick-tag { font-size: 11px; padding: 1px 8px; border-radius: 99px; border: 1px solid var(--dagwick-border); color: var(--dagwick-muted); }
.dagwick-tag--pack { border-style: dashed; }
.dagwick-pts { margin-left: auto; font-size: 12px; color: var(--dagwick-muted); font-variant-numeric: tabular-nums; }
.dagwick-check-msg { font-size: 14px; color: var(--dagwick-muted); margin-top: 2px; }
.dagwick-fix { margin-top: 8px; font-size: 13px; padding: 8px 12px; border-radius: 8px; background: var(--dagwick-surface); border-left: 3px solid var(--dagwick-accent); }
.dagwick-fix-label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--dagwick-accent-text); margin-bottom: 2px; }
.dagwick-dispute { display: inline-block; margin-top: 6px; font-size: 12px; color: var(--dagwick-muted); text-decoration: underline; text-underline-offset: 2px; }
.dagwick-dispute:hover, .dagwick-dispute:focus-visible { color: var(--dagwick-accent-text); }
.dagwick-clear { padding: 28px; text-align: center; color: var(--dagwick-muted); }
.dagwick-foot { font-size: 12px; margin-top: 12px; text-align: right; }
.dagwick-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 48px 16px; text-align: center; }
.dagwick-empty h3 { margin: 8px 0 0; }

/* Mascot + speech bubble */
.dagwick-mascot { position: relative; display: flex; flex-direction: column; align-items: center; }
.dagwick-bubble {
  position: relative; margin-bottom: -2px; padding: 5px 12px; border-radius: 12px; font-size: 13px; white-space: nowrap;
  background: var(--dagwick-surface); border: 1px solid var(--dagwick-border); box-shadow: 0 2px 6px var(--dagwick-shadow);
  animation: dagwick-pop .5s cubic-bezier(.2,1.4,.4,1) both;
}
.dagwick-bubble::after {
  content: ""; position: absolute; left: 50%; bottom: -6px; width: 10px; height: 10px; transform: translateX(-50%) rotate(45deg);
  background: var(--dagwick-surface); border-right: 1px solid var(--dagwick-border); border-bottom: 1px solid var(--dagwick-border);
}
@keyframes dagwick-pop { from { opacity: 0; transform: scale(.6) translateY(6px); } to { opacity: 1; transform: none; } }

/* Grade badges */
.dagwick-badge { display: inline-grid; place-items: center; min-width: 26px; height: 26px; padding: 0 6px; border-radius: 8px; font-weight: 800; font-size: 14px; color: #fff; }
/* The 700 shades, so the white letter is at least 4.5:1 (WCAG AA) even on the small badges. */
.dagwick-badge--A { background: #15803d; } .dagwick-badge--B { background: #4d7c0f; } .dagwick-badge--C { background: #b45309; }
.dagwick-badge--D { background: #c2410c; } .dagwick-badge--F { background: #b91c1c; }
.dagwick-ring.dagwick-grade-B .dagwick-ring-fill { stroke: #84cc16; }

/* Next goal */
.dagwick-goal {
  display: flex; align-items: center; gap: 12px 16px; flex-wrap: wrap; margin-top: 16px; padding: 12px 16px; border-radius: 12px;
  border: 1px dashed color-mix(in srgb, var(--dagwick-accent) 55%, transparent);
  background: color-mix(in srgb, var(--dagwick-flame) 7%, var(--dagwick-bg));
}
.dagwick-goal-text { display: flex; align-items: center; gap: 8px; font-size: 14px; flex-wrap: wrap; }
.dagwick-goal-step { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--dagwick-accent-text); }
.dagwick-goal-picks { display: flex; gap: 8px; flex-wrap: wrap; margin-left: auto; }
.dagwick-pick {
  font: inherit; font-size: 13px; padding: 4px 10px; border-radius: 99px; cursor: pointer;
  color: var(--dagwick-text); background: var(--dagwick-bg); border: 1px solid var(--dagwick-border);
}
.dagwick-pick:hover { border-color: var(--dagwick-accent); }
.dagwick-pick-gain { color: var(--dagwick-pass); font-weight: 700; margin-left: 2px; }

/* Expandable check rows */
.dagwick-check-head { all: unset; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; width: 100%; cursor: pointer; }
.dagwick-check-head:disabled { cursor: default; }
.dagwick-check-head:focus-visible { outline: 2px solid var(--dagwick-accent); outline-offset: 4px; border-radius: 4px; }
.dagwick-caret { margin-left: 8px; color: var(--dagwick-muted); }
.dagwick-check { transition: background .2s; }
.dagwick-check.is-open { background: color-mix(in srgb, var(--dagwick-surface) 60%, transparent); }
.dagwick-detail { margin-top: 10px; display: flex; flex-direction: column; gap: 10px; animation: dagwick-fade .25s ease both; }
@keyframes dagwick-fade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.dagwick-items { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.dagwick-items-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--dagwick-muted); margin-right: 2px; }
.dagwick-item { font-size: 12px; padding: 2px 8px; border-radius: 6px; background: var(--dagwick-fail-bg); color: var(--dagwick-fail); }
.dagwick-check--warn .dagwick-item { background: var(--dagwick-warn-bg); color: var(--dagwick-warn); }
.dagwick-more { all: unset; font-size: 12px; color: var(--dagwick-accent-text); cursor: pointer; }
.dagwick-fix { margin-top: 0; }
.dagwick-code { position: relative; margin-top: 8px; }
.dagwick-code pre {
  margin: 0; padding: 10px 70px 10px 12px; border-radius: 8px; overflow-x: auto; font-size: 12.5px; line-height: 1.5;
  background: #11131a; color: #f3e9d7; border: 1px solid #262a35;
}
.dagwick-copy {
  position: absolute; top: 6px; right: 6px; font: inherit; font-size: 11px; padding: 3px 8px; border-radius: 6px; cursor: pointer;
  color: #f3e9d7; background: #262a35; border: 1px solid #343947;
}
.dagwick-copy:hover { border-color: var(--dagwick-flame); }

@container dagwick (max-width: 720px) {
  .dagwick-goal-picks { margin-left: 0; }
  .dagwick-history { grid-template-columns: 1fr; }
}

/* Score history */
.dagwick-section { margin: 16px 0; }
.dagwick-section-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; }
.dagwick-section-head .dagwick-muted { font-size: 12px; }
.dagwick-section-empty { margin: 6px 0 0; font-size: 13px; }
.dagwick-history { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); gap: 16px; margin-top: 8px; padding: 12px 14px; border: 1px solid var(--dagwick-border); border-radius: 12px; background: var(--dagwick-bg); }
.dagwick-spark { width: 100%; height: 64px; display: block; }
.dagwick-spark-dot { fill: var(--dagwick-accent); }
.dagwick-spark-dot--A, .dagwick-spark-dot--B { fill: var(--dagwick-pass); }
.dagwick-spark-dot--D, .dagwick-spark-dot--F { fill: var(--dagwick-fail); }
.dagwick-changes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
.dagwick-changes li { display: flex; flex-direction: column; gap: 2px; }
.dagwick-change-head { display: flex; gap: 8px; align-items: baseline; }
.dagwick-up { color: var(--dagwick-pass); }
.dagwick-down { color: var(--dagwick-fail); }

/* Fleet */
.dagwick-badge--sm { min-width: 20px; height: 20px; font-size: 11px; border-radius: 6px; }
.dagwick-badge--lg { min-width: 38px; height: 38px; font-size: 20px; border-radius: 11px; }
.dagwick-ring-caption { font-size: 12px; }
.dagwick-stats { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
.dagwick-stat {
  display: flex; flex-direction: column; min-width: 104px; padding: 8px 14px; border-radius: 10px;
  background: color-mix(in srgb, var(--dagwick-surface) 80%, transparent); border: 1px solid var(--dagwick-border);
}
.dagwick-stat-value { font-size: 20px; font-weight: 800; line-height: 1.2; font-variant-numeric: tabular-nums; }
.dagwick-stat-label { font-size: 12px; color: var(--dagwick-muted); }
.dagwick-stat--fail .dagwick-stat-value { color: var(--dagwick-fail); }
.dagwick-stat--pass .dagwick-stat-value { color: var(--dagwick-pass); }

.dagwick-grades { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 16px 0; }
.dagwick-gcard {
  font: inherit; color: inherit; text-align: left; cursor: pointer; position: relative; overflow: hidden;
  display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; align-items: center;
  padding: 12px 14px 16px; border-radius: 12px; border: 1px solid var(--dagwick-border); background: var(--dagwick-bg);
  transition: border-color .15s, transform .15s, opacity .2s, box-shadow .15s;
}
.dagwick-gcard:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px var(--dagwick-shadow); }
.dagwick-gcard:disabled { cursor: default; opacity: .45; }
.dagwick-gcard.is-dim { opacity: .5; }
.dagwick-gcard.is-active { border-color: var(--dagwick-accent); box-shadow: 0 0 0 1px var(--dagwick-accent) inset; }
.dagwick-gcard:focus-visible { outline: 2px solid var(--dagwick-accent); outline-offset: 2px; }
.dagwick-gcard-text { display: flex; flex-direction: column; line-height: 1.15; }
.dagwick-gcard-n { font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; }
.dagwick-gcard-text .dagwick-muted { font-size: 12px; }
.dagwick-gcard-bar { position: absolute; left: 0; right: 0; bottom: 0; height: 4px; background: var(--dagwick-border); }
.dagwick-gcard-bar > div { height: 100%; transition: width .6s cubic-bezier(.2,.8,.2,1); }
.dagwick-gcard--A .dagwick-gcard-bar > div { background: #16a34a; } .dagwick-gcard--B .dagwick-gcard-bar > div { background: #65a30d; }
.dagwick-gcard--C .dagwick-gcard-bar > div { background: #d97706; } .dagwick-gcard--D .dagwick-gcard-bar > div { background: #ea580c; }
.dagwick-gcard--F .dagwick-gcard-bar > div { background: #dc2626; }

.dagwick-btn--quiet { font-size: 12.5px; padding: 4px 12px; }
.dagwick-select {
  flex: 0 1 190px; min-width: 130px; max-width: 100%; font: inherit; font-size: 14px; padding: 7px 30px 7px 12px; border-radius: 8px; cursor: pointer;
  color: var(--dagwick-text); background-color: var(--dagwick-bg); border: 1px solid var(--dagwick-border); outline: none;
  appearance: none; background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position: calc(100% - 15px) 52%, calc(100% - 10px) 52%; background-size: 5px 5px; background-repeat: no-repeat;
}
.dagwick-select:focus-visible { border-color: var(--dagwick-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--dagwick-accent) 25%, transparent); }
.dagwick-select.is-set { border-color: var(--dagwick-accent); font-weight: 600; }
.dagwick-dd { position: relative; flex: 0 0 180px; width: 180px; }
.dagwick-select:disabled { cursor: default; opacity: .55; }
.dagwick-toolbar .dagwick-csv { margin-left: auto; }
@container dagwick (max-width: 720px) {
  .dagwick-dd { flex: 1 1 100%; width: 100%; }
  .dagwick-toolbar .dagwick-csv { margin-left: 0; }
}
.dagwick-dd > .dagwick-select { width: 100%; text-align: left; }
.dagwick-dd-value { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dagwick-dd-list {
  position: absolute; z-index: 30; top: calc(100% + 6px); left: 0; min-width: max(100%, 240px); max-height: 320px; overflow-y: auto;
  margin: 0; padding: 6px; list-style: none; color: var(--dagwick-text); background: var(--dagwick-bg); outline: none;
  border: 1px solid var(--dagwick-border); border-radius: 12px; scrollbar-width: thin;
  box-shadow: 0 14px 34px var(--dagwick-shadow), 0 2px 6px var(--dagwick-shadow);
  transform-origin: top left; animation: dagwick-dd-in .14s ease-out;
}
@keyframes dagwick-dd-in { from { opacity: 0; transform: translateY(-4px) scale(.98); } }
.dagwick-dd-opt {
  display: grid; grid-template-columns: 14px minmax(0, 1fr) auto; align-items: center; gap: 8px;
  padding: 7px 10px; border-radius: 8px; cursor: pointer; font-size: 13.5px; line-height: 1.3;
}
.dagwick-dd-opt.is-active { background: color-mix(in srgb, var(--dagwick-accent) 13%, transparent); }
.dagwick-dd-opt[aria-selected="true"] .dagwick-dd-name { font-weight: 700; }
.dagwick-dd-check { color: var(--dagwick-accent-text); font-size: 12px; font-weight: 800; }
.dagwick-dd-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dagwick-dd-count {
  min-width: 26px; text-align: center; padding: 1px 8px; border-radius: 999px; font-size: 11.5px; font-weight: 600;
  font-variant-numeric: tabular-nums; color: var(--dagwick-muted); background: var(--dagwick-surface); border: 1px solid var(--dagwick-border);
}
.dagwick-dd-opt.is-active .dagwick-dd-count { color: var(--dagwick-text); }
.dagwick-dd-sep { height: 1px; margin: 4px 6px; background: var(--dagwick-border); }
@media (prefers-reduced-motion: reduce) { .dagwick-dd-list { animation: none; } }
.dagwick-fleet-grid { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; align-items: start; }
.dagwick-toolbar { display: flex; gap: 10px; align-items: center; padding: 10px; border-bottom: 1px solid var(--dagwick-border); background: var(--dagwick-surface); flex-wrap: wrap; }
.dagwick-search-wrap { position: relative; flex: 0 0 260px; width: 260px; color: var(--dagwick-muted); }
.dagwick-search-wrap svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.dagwick-search {
  width: 100%; font: inherit; font-size: 14px; padding: 7px 12px 7px 34px; border-radius: 8px;
  color: var(--dagwick-text); background: var(--dagwick-bg); border: 1px solid var(--dagwick-border); outline: none;
}
.dagwick-search:focus { border-color: var(--dagwick-accent); }
/* After the base rule above, so it wins at narrow widths. */
@container dagwick (max-width: 720px) { .dagwick-search-wrap { flex: 1 1 100%; width: 100%; } }
.dagwick-seg { display: inline-flex; padding: 3px; gap: 2px; border-radius: 9px; background: var(--dagwick-bg); border: 1px solid var(--dagwick-border); }
.dagwick-seg button { font: inherit; font-size: 13px; padding: 5px 12px; border-radius: 6px; border: 0; cursor: pointer; background: transparent; color: var(--dagwick-muted); }
.dagwick-seg button.is-active { background: var(--dagwick-surface); color: var(--dagwick-text); box-shadow: 0 1px 2px var(--dagwick-shadow); }
.dagwick-seg button:focus-visible { outline: 2px solid var(--dagwick-accent); outline-offset: 1px; }
.dagwick-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 8px 14px; font-size: 13px; border-bottom: 1px solid var(--dagwick-border); }
.dagwick-fchip {
  font: inherit; font-size: 12px; padding: 3px 10px; border-radius: 99px; cursor: pointer;
  color: var(--dagwick-accent); background: color-mix(in srgb, var(--dagwick-flame) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--dagwick-accent) 40%, transparent);
}

.dagwick-rows { list-style: none; margin: 0; padding: 0; }
.dagwick-rows li + li { border-top: 1px solid var(--dagwick-border); }
.dagwick-row {
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; gap: 14px; align-items: center;
  padding: 12px 16px 12px 13px; color: inherit; text-decoration: none; border-left: 3px solid transparent;
  transition: background .15s;
}
.dagwick-row--A { border-left-color: #16a34a; } .dagwick-row--B { border-left-color: #65a30d; } .dagwick-row--C { border-left-color: #d97706; }
.dagwick-row--D { border-left-color: #ea580c; } .dagwick-row--F { border-left-color: #dc2626; }
.dagwick-row:hover { background: var(--dagwick-surface); }
.dagwick-row:hover .dagwick-row-name { color: var(--dagwick-accent); }
.dagwick-row:hover .dagwick-row-go { transform: translateX(3px); color: var(--dagwick-accent); }
.dagwick-row:focus-visible { outline: 2px solid var(--dagwick-accent); outline-offset: -2px; }
.dagwick-row-main { min-width: 0; }
.dagwick-row-title { display: flex; align-items: center; gap: 8px; }
.dagwick-row-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dagwick-row-sub { font-size: 12.5px; display: flex; gap: 10px; flex-wrap: wrap; margin-top: 1px; }
.dagwick-row-sub span + span::before { content: "·"; margin-right: 10px; }
.dagwick-row-issues { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 7px; }
.dagwick-ichip { font-size: 11.5px; padding: 2px 8px; border-radius: 6px; white-space: nowrap; }
.dagwick-ichip--fail { color: var(--dagwick-fail); background: var(--dagwick-fail-bg); }
.dagwick-ichip--warn { color: var(--dagwick-warn); background: var(--dagwick-warn-bg); }
.dagwick-ichip--more { color: var(--dagwick-muted); background: var(--dagwick-surface); }
.dagwick-row-go { font-size: 22px; color: var(--dagwick-muted); transition: transform .15s, color .15s; }
.dagwick-mini { position: relative; width: 46px; height: 46px; flex: none; }
.dagwick-mini .dagwick-ring-track { stroke-width: 5; }
.dagwick-mini .dagwick-ring-fill { stroke-width: 5; }
.dagwick-mini span { position: absolute; inset: 0; display: grid; place-items: center; font-size: 13px; font-weight: 800; font-variant-numeric: tabular-nums; }

.dagwick-side { position: sticky; top: 12px; }
.dagwick-side-card { padding: 16px; border: 1px solid var(--dagwick-border); border-radius: 16px; background: var(--dagwick-bg); }
.dagwick-side-title { margin: 0 0 12px; font-size: 14px; font-weight: 700; }
.dagwick-side-empty { margin: 0; font-size: 13px; }
.dagwick-side-hint { margin: 12px 0 0; font-size: 12px; }
.dagwick-common { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.dagwick-common-item { all: unset; box-sizing: border-box; display: block; width: 100%; cursor: pointer; padding: 8px 10px; border-radius: 10px; border: 1px solid transparent; }
.dagwick-common-item:hover { background: var(--dagwick-surface); }
.dagwick-common-item.is-active { background: var(--dagwick-surface); border-color: var(--dagwick-accent); }
.dagwick-common-item:focus-visible { outline: 2px solid var(--dagwick-accent); }
.dagwick-common-head { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; margin-bottom: 6px; }
.dagwick-common-head .dagwick-muted { font-variant-numeric: tabular-nums; }

@container dagwick (max-width: 1100px) {
  .dagwick-fleet-grid { grid-template-columns: minmax(0, 1fr); }
  .dagwick-side { position: static; order: -1; }
}
@container dagwick (max-width: 720px) {
  .dagwick-grades { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .dagwick-gcard { grid-template-columns: 1fr; justify-items: start; }
  .dagwick-side { order: 0; }
  .dagwick-row { grid-template-columns: auto minmax(0, 1fr) auto; }
  .dagwick-row-go { display: none; }
}

/* Seasonal moods: decoration only, behind the hero content */
.dagwick-hero { position: relative; overflow: hidden; isolation: isolate; }
.dagwick-hero > :not(.dagwick-fx) { position: relative; z-index: 1; }
/* container-type lets the scenes move in cqw/cqh (the scene's own size) with translate,
   which the GPU animates without laying the page out again on every frame. */
.dagwick-fx { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; border-radius: inherit; container-type: size; }
.dagwick-season-halloween { --dagwick-flame: #22c55e; --dagwick-flame-deep: #15803d; --dagwick-flame-tip: #4ade80; --dagwick-flame-core: #d9f99d; --dagwick-flame-heart: #f7fee7; --dagwick-spark: #a3e635; }
.dagwick-season-newroz { --dagwick-flame: #f97316; --dagwick-flame-deep: #dc2626; --dagwick-flame-tip: #fb923c; --dagwick-flame-core: #fde68a; }

.dagwick-fx--christmas { background: linear-gradient(180deg, rgba(37, 66, 122, .35), transparent 80%); }
.dagwick-fx--halloween { background: radial-gradient(420px 220px at 55% 0%, rgba(124, 58, 237, .28), transparent 70%), linear-gradient(180deg, rgba(42, 22, 64, .45), transparent 90%); }
.dagwick-fx--newroz { background: linear-gradient(180deg, rgba(30, 58, 95, .28), rgba(120, 50, 70, .28)); }
.dagwick-fx--ramadan { background: linear-gradient(180deg, rgba(15, 60, 80, .4), transparent 90%); }
.dagwick-fx--eid { background: radial-gradient(500px 200px at 50% 0%, rgba(233, 196, 106, .18), transparent 70%); }
.dagwick-fx--new-year, .dagwick-fx--birthday { background: radial-gradient(500px 220px at 50% 0%, rgba(192, 132, 252, .16), transparent 70%); }
.dagwick-fx--language-day { background: radial-gradient(500px 220px at 50% 100%, rgba(251, 191, 36, .12), transparent 70%); }
.dagwick-fx--diwali { background: radial-gradient(600px 200px at 50% 100%, rgba(245, 158, 11, .22), transparent 70%), linear-gradient(180deg, rgba(76, 29, 149, .22), transparent 90%); }
.dagwick-fx--lantern-festival { background: radial-gradient(500px 220px at 50% 0%, rgba(220, 38, 38, .2), transparent 70%), linear-gradient(180deg, rgba(30, 27, 75, .3), transparent 90%); }
.dagwick-fx--carsema-sor { background: linear-gradient(180deg, rgba(254, 215, 170, .16), transparent 70%); }

.dagwick-flake { position: absolute; top: 0; border-radius: 50%; background: #fff; box-shadow: 0 0 4px rgba(255, 255, 255, .7);
  animation-name: dagwick-fall, dagwick-sway; animation-timing-function: linear, ease-in-out;
  animation-iteration-count: infinite; animation-direction: normal, alternate; }
html:not(.dark) .dagwick-flake { background: #a9c9ea; box-shadow: none; }
.dagwick-snowbank { position: absolute; left: 0; bottom: 0; width: 100%; height: 16px; fill: #f8fbff; opacity: .9; }
html:not(.dark) .dagwick-snowbank { fill: #dceaf8; }
@keyframes dagwick-fall { from { translate: 0 -8cqh; } to { translate: 0 108cqh; } }
@keyframes dagwick-sway { from { transform: translateX(-10px); } to { transform: translateX(10px); } }

.dagwick-moon { position: absolute; right: 30%; top: 14px; width: 54px; height: 54px; border-radius: 50%;
  background: radial-gradient(circle at 38% 38%, #fffbea, #f5e6b8 60%, #e3cf8f); box-shadow: 0 0 40px rgba(245, 230, 184, .45); }
.dagwick-bat { position: absolute; left: 0; animation: dagwick-fly linear infinite; }
.dagwick-bat-bob { display: block; animation: dagwick-bob 1.6s ease-in-out infinite alternate; }
.dagwick-bat svg { display: block; fill: #140b22; stroke: #140b22; filter: drop-shadow(0 0 2px rgba(190, 242, 100, .45)); }
html:not(.dark) .dagwick-bat svg { filter: none; }
.dagwick-wing-l, .dagwick-wing-r { transform-box: view-box; transform-origin: 20px 10px; animation: dagwick-flap .2s ease-in-out infinite alternate; }
@keyframes dagwick-fly { from { translate: -8cqw 0; } to { translate: 108cqw 0; } }
@keyframes dagwick-bob { from { transform: translateY(-9px); } to { transform: translateY(9px); } }
@keyframes dagwick-flap { from { transform: scaleY(1); } to { transform: scaleY(.25); } }

.dagwick-confetti { position: absolute; top: 0; width: 7px; height: 4px; border-radius: 1px;
  animation-name: dagwick-fall, dagwick-spin; animation-timing-function: linear; animation-iteration-count: infinite; }
@keyframes dagwick-spin { to { transform: rotate(360deg); } }
.dagwick-firework { position: absolute; width: 0; height: 0; animation: dagwick-burst 3.3s ease-out infinite; }
.dagwick-firework i { position: absolute; width: 4px; height: 4px; border-radius: 50%; }
@keyframes dagwick-burst { 0% { transform: scale(.2); opacity: 0; } 15% { opacity: 1; } 60% { transform: scale(1.2); opacity: .9; } 100% { transform: scale(1.6); opacity: 0; } }
.dagwick-balloon { position: absolute; bottom: 0; width: 22px; height: 28px; border-radius: 50% 50% 46% 46%; opacity: .85; animation: dagwick-rise linear infinite; }
.dagwick-balloon::after { content: ""; position: absolute; left: 50%; top: 100%; width: 1px; height: 24px; background: rgba(160, 160, 160, .6); }
@keyframes dagwick-rise { from { translate: 0 60px; } to { translate: 0 -110cqh; } }

.dagwick-ember { position: absolute; bottom: 0; width: 4px; height: 4px; border-radius: 50%; background: #fdba74; box-shadow: 0 0 6px #fb923c; animation: dagwick-ember linear infinite; }
@keyframes dagwick-ember { 0% { translate: 0 -12cqh; opacity: 0; transform: translateX(0); } 15% { opacity: 1; } 100% { translate: 0 -95cqh; opacity: 0; transform: translateX(16px); } }
.dagwick-mountains { position: absolute; left: 0; bottom: 0; width: 100%; height: 55%; }
.dagwick-mountains .far { fill: rgba(80, 44, 74, .55); }
.dagwick-mountains .near { fill: rgba(36, 20, 40, .85); }
html:not(.dark) .dagwick-mountains .far { fill: rgba(140, 100, 120, .22); }
html:not(.dark) .dagwick-mountains .near { fill: rgba(110, 70, 90, .3); }
.dagwick-fire { position: absolute; width: 14px; height: 20px; margin: -20px 0 0 -7px; border-radius: 50% 50% 45% 45% / 62% 62% 38% 38%;
  background: radial-gradient(circle at 50% 72%, #fff1b8 0 18%, #fbbf24 38%, #f97316 62%, #dc2626 100%);
  box-shadow: 0 0 14px 4px rgba(249, 115, 22, .55), 0 0 40px 10px rgba(249, 115, 22, .2);
  transform-origin: 50% 100%; animation: dagwick-flicker .45s ease-in-out infinite alternate; }
@keyframes dagwick-flicker { from { transform: scaleY(.8); } to { transform: scaleY(1.12); } }
.dagwick-govend { position: absolute; left: 54%; bottom: 0; display: flex; }
.dagwick-dancer { display: block; margin: 0 -2px; animation: dagwick-govend 1.1s ease-in-out infinite; }
.dagwick-dancer svg { display: block; overflow: visible; }
@keyframes dagwick-govend { 0%, 100% { transform: translateY(0) rotate(0); } 25% { transform: translateY(-3px) rotate(-4deg); } 75% { transform: translateY(-1px) rotate(4deg); } }

.dagwick-star { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #fde68a; box-shadow: 0 0 6px #fde68a; animation: dagwick-twinkle ease-in-out infinite; }
@keyframes dagwick-twinkle { 0%, 100% { opacity: .2; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.3); } }
.dagwick-hanging span { position: absolute; top: 0; display: flex; flex-direction: column; align-items: center; transform-origin: top center; animation: dagwick-swing 3s ease-in-out infinite alternate; }
.dagwick-hanging span::before { content: ""; width: 1px; flex: 1; background: #e9c46a; }
@keyframes dagwick-swing { from { transform: rotate(-5deg); } to { transform: rotate(5deg); } }
.dagwick-bunting { position: absolute; top: 0; left: 0; width: 100%; height: 34px; }
.dagwick-marigolds { position: absolute; top: 0; left: 0; width: 100%; height: 40px; }
.dagwick-diya { position: absolute; bottom: 4px; display: flex; flex-direction: column; align-items: center; translate: -50% 0; }
.dagwick-diya svg { display: block; }
.dagwick-diya-flame { width: 7px; height: 11px; margin: 0 4px -2px 0; border-radius: 50% 50% 45% 45% / 62% 62% 38% 38%;
  background: radial-gradient(circle at 50% 72%, #fff7d6 0 22%, #fbbf24 45%, #f97316 80%);
  box-shadow: 0 0 10px 3px rgba(251, 191, 36, .5); transform-origin: 50% 100%; animation: dagwick-flicker .45s ease-in-out infinite alternate; }
.dagwick-sky-lantern { position: absolute; bottom: 0; width: 14px; height: 17px; border-radius: 40% 40% 30% 30% / 30% 30% 50% 50%; opacity: 0;
  background: linear-gradient(180deg, #fde68a, #f59e0b 60%, #c2410c); box-shadow: 0 0 14px 3px rgba(251, 191, 36, .45); animation: dagwick-sky linear infinite; }
@keyframes dagwick-sky { 0% { translate: 0 30px; opacity: 0; } 12% { opacity: .9; } 80% { opacity: .7; } 100% { translate: 22px -110cqh; opacity: 0; } }
.dagwick-hanging--red span::before { background: #facc15; }
.dagwick-hanging--red svg { filter: drop-shadow(0 0 6px rgba(248, 113, 113, .5)); }
.dagwick-sunrise { position: absolute; right: 18%; top: -50px; width: 120px; height: 120px; border-radius: 50%;
  background: radial-gradient(circle, rgba(253, 224, 71, .55), rgba(251, 146, 60, .18) 55%, transparent 70%); }
.dagwick-meadow { position: absolute; left: 0; bottom: 0; width: 100%; height: 30px; }
.dagwick-meadow .ground { fill: rgba(22, 101, 52, .35); }
html:not(.dark) .dagwick-meadow .ground { fill: rgba(22, 163, 74, .18); }
.dagwick-poppy { position: absolute; bottom: 0; display: flex; flex-direction: column; align-items: center; transform-origin: 50% 100%; animation: dagwick-poppy 3s ease-in-out infinite alternate; }
.dagwick-poppy svg { order: -1; display: block; }
.dagwick-poppy::after { content: ""; width: 1.6px; flex: 1; background: #15803d; }
@keyframes dagwick-poppy { from { rotate: -6deg; } to { rotate: 6deg; } }
.dagwick-eggs { position: absolute; bottom: 2px; }
.dagwick-letter { position: absolute; bottom: 0; color: var(--dagwick-accent); opacity: 0; font-weight: 700; animation: dagwick-letter linear infinite; }
@keyframes dagwick-letter { 0% { translate: 0 10cqh; opacity: 0; } 15% { opacity: .3; } 85% { opacity: .2; } 100% { translate: 0 -105cqh; opacity: 0; } }

.dagwick-greeting {
  display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; margin-bottom: 8px; padding: 4px 6px 4px 12px;
  border-radius: 999px; font-size: 13px; border: 1px solid var(--dagwick-border);
  background: color-mix(in srgb, var(--dagwick-bg) 72%, transparent); backdrop-filter: blur(4px);
}
.dagwick-greeting-hide { font: inherit; font-size: 12px; padding: 2px 9px; border-radius: 999px; border: 0; cursor: pointer; background: var(--dagwick-surface); color: var(--dagwick-muted); }
.dagwick-greeting-hide:hover { color: var(--dagwick-text); }
.dagwick-greeting-show { all: unset; display: inline-block; margin-bottom: 8px; font-size: 12px; color: var(--dagwick-muted); cursor: pointer; }
.dagwick-greeting-show:hover { color: var(--dagwick-accent); }
.dagwick-greeting-hide:focus-visible, .dagwick-greeting-show:focus-visible { outline: 2px solid var(--dagwick-accent); outline-offset: 2px; }

/* Page tabs (Fleet | Themes), like Airflow's own Dags | Dag Runs | Task Instances */
.dagwick-pagetabs { display: flex; gap: 4px; border-bottom: 1px solid var(--dagwick-border); margin: 0 0 18px; }
.dagwick-pagetab {
  all: unset; cursor: pointer; padding: 8px 14px 10px; font-size: 17px; font-weight: 600;
  color: var(--dagwick-muted); border-bottom: 3px solid transparent; margin-bottom: -1px;
}
.dagwick-pagetab:hover { color: var(--dagwick-text); }
.dagwick-pagetab.is-active { color: var(--dagwick-text); border-bottom-color: var(--dagwick-accent); }
.dagwick-pagetab:focus-visible { outline: 2px solid var(--dagwick-accent); outline-offset: 2px; border-radius: 4px; }

/* Themes page */
.dagwick-themes { display: grid; gap: 18px; }
.dagwick-themes-head h2 { margin: 0 0 4px; font-size: 20px; }
.dagwick-themes-head p { margin: 0; max-width: 70ch; }
.dagwick-theme-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 560px), 1fr)); gap: 14px; }
.dagwick-theme {
  display: grid; grid-template-columns: 200px 1fr; gap: 18px; padding: 16px;
  border: 1px solid var(--dagwick-border); border-radius: 14px; background: var(--dagwick-surface);
}
.dagwick-theme-scene { width: 100%; height: auto; border-radius: 10px; display: block; }
.dagwick-theme-body { display: grid; gap: 6px; align-content: start; min-width: 0; }
.dagwick-theme-body p { margin: 0; font-size: 13.5px; }
.dagwick-theme-title { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.dagwick-theme-title h3 { margin: 0; font-size: 16px; }
.dagwick-theme-dates { font-weight: 600; font-variant-numeric: tabular-nums; }
.dagwick-theme-status { font-size: 11.5px; font-weight: 700; padding: 2px 9px; border-radius: 999px; }
.dagwick-theme-status.is-on { color: var(--dagwick-pass); background: var(--dagwick-pass-bg); }
.dagwick-theme-status.is-off { color: var(--dagwick-fail); background: var(--dagwick-fail-bg); }
.dagwick-theme-status.is-idle { color: var(--dagwick-muted); background: var(--dagwick-bg); border: 1px solid var(--dagwick-border); }
.dagwick-theme-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 6px; }
.dagwick-theme { transition: border-color .25s ease, box-shadow .25s ease; }
.dagwick-theme.is-on { border-color: color-mix(in srgb, var(--dagwick-accent) 55%, var(--dagwick-border)); box-shadow: 0 0 0 1px color-mix(in srgb, var(--dagwick-accent) 25%, transparent); }
.dagwick-theme-status { transition: color .25s ease, background-color .25s ease; }
.dagwick-theme-settings {
  display: flex; align-items: center; padding: 14px 16px; max-width: 760px;
  border: 1px solid var(--dagwick-border); border-radius: 14px; background: var(--dagwick-surface);
}
.dagwick-switch-text { display: grid; gap: 2px; }
.dagwick-switch-text strong { font-size: 14px; }
.dagwick-switch-text small { font-size: 12.5px; }
.dagwick-switch input:disabled + .dagwick-switch-track { opacity: .6; }
.dagwick-btn-primary { background: var(--dagwick-accent); border-color: var(--dagwick-accent); color: #1d1405; font-weight: 600; }
.dagwick-btn-primary:hover:not(:disabled) { filter: brightness(1.06); }
.dagwick-btn { transition: background-color .2s ease, border-color .2s ease, opacity .2s ease, filter .2s ease; }
.dagwick-btn:disabled { opacity: .65; cursor: progress; }
.dagwick-theme-problem { margin: 0; color: var(--dagwick-fail); font-size: 13.5px; }
.dagwick-theme-notice { margin: 0; min-height: 1.4em; font-size: 13.5px; color: var(--dagwick-muted); }
.dagwick-switch { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; cursor: pointer; }
.dagwick-switch input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.dagwick-switch-track {
  flex: none; width: 34px; height: 20px; border-radius: 999px; background: var(--dagwick-border); position: relative; transition: background .15s;
}
.dagwick-switch-track::after {
  content: ""; position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%;
  background: #fff; transition: transform .15s; box-shadow: 0 1px 2px rgba(0,0,0,.25);
}
.dagwick-switch input:checked + .dagwick-switch-track { background: var(--dagwick-accent); }
.dagwick-switch input:checked + .dagwick-switch-track::after { transform: translateX(14px); }
.dagwick-switch input:focus-visible + .dagwick-switch-track { outline: 2px solid var(--dagwick-accent); outline-offset: 2px; }
@container dagwick (max-width: 560px) { .dagwick-theme { grid-template-columns: 1fr; } }

/* The mascot: Wick, a little flame (keyframes are prefixed dagwick-m-) */
.dagwick-wick { flex: none; overflow: visible; }
.dagwick-spirit { transform-box: fill-box; transform-origin: 50% 100%; animation: dagwick-m-ignite .7s cubic-bezier(.2, 1.5, .4, 1) both; }
.dagwick-loading .dagwick-spirit { animation: dagwick-m-kindle 1.1s ease-in-out infinite alternate; }
.dagwick-hop { transform-box: fill-box; transform-origin: 50% 100%; }
.dagwick-wick:hover .dagwick-hop { animation: dagwick-m-hop .55s cubic-bezier(.3, 1.4, .5, 1); }
.dagwick-flame { transform-box: fill-box; transform-origin: 50% 100%; animation: dagwick-m-sway 2.8s ease-in-out infinite; }
.dagwick-core { transform-box: fill-box; transform-origin: 50% 100%; animation: dagwick-m-pulse 1.7s ease-in-out infinite; }
.dagwick-licks path { transform-box: fill-box; transform-origin: 50% 100%; animation: dagwick-m-lick 1.1s ease-in-out infinite alternate; }
.dagwick-arm { transform-box: fill-box; transform-origin: 85% 100%; animation: dagwick-m-cheer 1.5s ease-in-out infinite alternate; }
.dagwick-arm + .dagwick-arm { transform-origin: 15% 100%; animation-name: dagwick-m-cheer-r; }
.dagwick-licks path:nth-child(2) { animation-delay: -.5s; }
.dagwick-glow { transform-box: fill-box; transform-origin: center; animation: dagwick-m-breathe 3s ease-in-out infinite; }
.dagwick-sparkles path { transform-box: fill-box; transform-origin: center; animation: dagwick-m-twinkle 2.2s ease-in-out infinite; }
.dagwick-sparkles path:nth-child(2) { animation-delay: .55s; }
.dagwick-sparkles path:nth-child(3) { animation-delay: 1.1s; }
.dagwick-sparkles path:nth-child(4) { animation-delay: 1.65s; }
.dagwick-eyes { transform-box: fill-box; transform-origin: center; animation: dagwick-m-blink 4.2s infinite; }
.dagwick-wick--calm .dagwick-flame { animation-duration: 3.8s; }
.dagwick-wick--worried .dagwick-flame { animation: dagwick-m-shiver .9s ease-in-out infinite; }
.dagwick-wick--worried .dagwick-glow { animation: dagwick-m-gutter 1.3s steps(3) infinite; }
.dagwick-sweat { transform-box: fill-box; animation: dagwick-m-sweat 2.4s ease-in infinite; }
.dagwick-ghost { transform-box: fill-box; transform-origin: 50% 100%; animation: dagwick-m-drift 4s ease-in-out infinite; }
.dagwick-puff { transform-box: fill-box; transform-origin: center; animation: dagwick-m-puff 3.4s ease-out infinite; }
.dagwick-puff:nth-child(2) { animation-delay: 1.1s; }
.dagwick-puff:nth-child(3) { animation-delay: 2.2s; }
.dagwick-wick .dagwick-ember { transform-box: fill-box; transform-origin: center; animation: dagwick-m-ember 2s ease-in-out infinite; }
.dagwick-ember-halo { transform-box: fill-box; transform-origin: center; animation: dagwick-m-halo 2s ease-in-out infinite; }
.dagwick-spider { transform-box: fill-box; transform-origin: 50% 0; animation: dagwick-m-dangle 3.2s ease-in-out infinite; }
.dagwick-wick--out .dagwick-vessel { filter: brightness(.86) saturate(.85); }
@keyframes dagwick-m-ignite { from { opacity: 0; transform: scale(.2); } to { opacity: 1; transform: scale(1); } }
@keyframes dagwick-m-kindle { from { opacity: .7; transform: scale(.7); } to { opacity: 1; transform: scale(1); } }
@keyframes dagwick-m-hop { 0%,100% { transform: translateY(0) scale(1); } 35% { transform: translateY(-7px) scale(.97, 1.04); } 70% { transform: translateY(0) scale(1.03, .97); } }
@keyframes dagwick-m-sway { 0%,100% { transform: rotate(-2.2deg) scaleY(1); } 50% { transform: rotate(2.2deg) scaleY(1.035); } }
@keyframes dagwick-m-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03, 1.045); } }
@keyframes dagwick-m-cheer { from { transform: rotate(7deg) scaleY(.94); } to { transform: rotate(-9deg) scaleY(1.06); } }
@keyframes dagwick-m-cheer-r { from { transform: rotate(-7deg) scaleY(.94); } to { transform: rotate(9deg) scaleY(1.06); } }
@keyframes dagwick-m-lick { from { transform: scaleY(.82) rotate(-4deg); } to { transform: scaleY(1.12) rotate(5deg); } }
@keyframes dagwick-m-breathe { 0%,100% { opacity: .85; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
@keyframes dagwick-m-twinkle { 0%,100% { opacity: .15; transform: scale(.5); } 50% { opacity: 1; transform: scale(1) rotate(20deg); } }
@keyframes dagwick-m-blink { 0%,92%,100% { transform: scaleY(1); } 95% { transform: scaleY(.1); } }
@keyframes dagwick-m-shiver { 0%,100% { transform: rotate(-3deg) scale(1, .97); } 20% { transform: rotate(2deg) scale(.985, 1.02); } 40% { transform: rotate(-1.5deg) scale(1.01, .96); } 60% { transform: rotate(3.2deg) scale(.99, 1.03); } 80% { transform: rotate(-2.4deg) scale(1, .98); } }
@keyframes dagwick-m-gutter { 0%,100% { opacity: .9; } 50% { opacity: .45; } }
@keyframes dagwick-m-sweat { 0% { opacity: 0; transform: translateY(-3px); } 20% { opacity: 1; } 75% { opacity: 1; transform: translateY(9px); } 100% { opacity: 0; transform: translateY(12px); } }
@keyframes dagwick-m-drift { 0%,100% { transform: translate(0, 0) rotate(-1.5deg); } 50% { transform: translate(1px, -2.5px) rotate(1.5deg); } }
@keyframes dagwick-m-puff { 0% { opacity: 0; transform: translateY(8px) scale(.5); } 30% { opacity: .55; } 100% { opacity: 0; transform: translateY(-12px) scale(1.25); } }
@keyframes dagwick-m-ember { 0%,100% { opacity: .6; transform: scale(.85); } 50% { opacity: 1; transform: scale(1.15); } }
@keyframes dagwick-m-halo { 0%,100% { opacity: .15; transform: scale(.8); } 50% { opacity: .4; transform: scale(1.2); } }
@keyframes dagwick-m-dangle { 0%,100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
@media (prefers-reduced-motion: reduce) { .dagwick * { animation: none !important; transition: none !important; } }

@container dagwick (max-width: 720px) {
  .dagwick-hero { grid-template-columns: auto auto; justify-content: center; justify-items: center; text-align: center; gap: 16px 32px; }
  .dagwick-hero-text { grid-column: 1 / -1; order: 1; }
  .dagwick-chips, .dagwick-stats { justify-content: center; }
}

/* Dagwick's sidebar icon: when Dagwick's own page is open, Airflow highlights its item and
   turns that item's icon white, so ours turns white too. (Not on a DAG's Dagwick tab: there
   the highlighted item is "Dags".) */
body:has(.dagwick-navpage) [data-testid="nav-sidebar"] img[src*="/dagwick/static/icon"] {
  filter: brightness(0) invert(1);
}

/* Phones and a narrow DAG panel: shrink Wick and the ring so both fit side by side. */
@container dagwick (max-width: 440px) {
  .dagwick-hero { gap: 12px 16px; padding: 16px 12px; }
  .dagwick-hero .dagwick-wick { width: 104px; height: 104px; }
  .dagwick-hero .dagwick-bubble { white-space: normal; max-width: 120px; }
  .dagwick-hero .dagwick-ring, .dagwick-hero .dagwick-ring svg { width: 104px; height: 104px; }
  .dagwick-hero .dagwick-grade { font-size: 32px; }
}
`;
