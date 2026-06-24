/* ============================================================
   Project Timeline (dashboard)  →  window.Timeline
   Open by default · click a node → inline detail below the bar
   ============================================================ */

function TLCheckbox({ state }) {
  const { Icons } = window;
  if (state === "done") {
    return <span style={{ width: 16, height: 16, borderRadius: 99, background: "var(--green)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 16px" }}><Icons.Check size={11} /></span>;
  }
  const border = state === "active" ? "var(--purple)" : "#D0CEC8";
  return <span style={{ width: 16, height: 16, borderRadius: 99, border: `1.5px solid ${border}`, flex: "0 0 16px" }} />;
}

function NodeDot({ node }) {
  if (node.type === "call") {
    const sz = node.state === "upcoming" ? 12 : 10;
    const bg = node.state === "upcoming" ? "var(--purple)" : "#B4B2A9";
    return <span style={{ width: sz, height: sz, background: bg, transform: "rotate(45deg)", display: "block" }} />;
  }
  if (node.state === "active") {
    return (
      <span style={{ width: 22, height: 22, borderRadius: 99, background: "#fff", border: "2px solid var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 3px rgba(130,17,255,0.15)" }}>
        <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--purple)" }} />
      </span>
    );
  }
  if (node.state === "done") {
    return <span style={{ width: 14, height: 14, borderRadius: 99, background: "#555" }} />;
  }
  return <span style={{ width: 14, height: 14, borderRadius: 99, background: "#fff", border: "1.5px solid #D0CEC8" }} />;
}

function PhaseDetail({ node }) {
  const { Icons } = window;
  const { openTaskById, showToast, navigate } = usePortal();
  const isCall = node.type === "call";
  const tasks = node.tasks || [];
  const shown = tasks.slice(0, 4);
  return (
    <div style={{ borderTop: "0.5px solid var(--border-light)", marginTop: 16, paddingTop: 16, animation: "fade .15s ease" }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{isCall ? node.session.title : node.label}</div>
      <div style={{ fontSize: 11, color: "#AAA", marginTop: 2 }}>{isCall ? `${node.session.when} · ${node.session.duration}` : (node.date || "Timing TBD")}</div>

      {shown.length > 0 && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          {shown.map((t, i) => (
            <button key={i} onClick={() => t.taskId && openTaskById(t.taskId)}
              style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "none", border: "none", textAlign: "left", padding: 0, cursor: t.taskId ? "pointer" : "default", color: "inherit" }}>
              <TLCheckbox state={t.state} />
              <span style={{ fontSize: 13, color: t.state === "future" ? "#999" : "var(--text-primary)", lineHeight: 1.25 }}>{t.name}</span>
            </button>
          ))}
          {tasks.length > 4 && (
            <button className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={() => navigate("#/tasks")}>+ {tasks.length - 4} more →</button>
          )}
        </div>
      )}

      {isCall && (
        <div className="row" style={{ gap: 10, marginTop: 14, paddingTop: shown.length ? 14 : 0, borderTop: shown.length ? "0.5px solid var(--border-light)" : "none" }}>
          {node.state === "upcoming" ? (
            <>
              <button className="btn btn-zoom" onClick={() => showToast("Opening Zoom…")}><Icons.Video size={15} /> Join on Zoom</button>
              <button className="btn btn-secondary" onClick={() => navigate("#/sessions")}>Reschedule</button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={() => navigate("#/sessions")}>View session details</button>
          )}
        </div>
      )}
    </div>
  );
}

function Timeline() {
  const { GHH, Icons } = window;
  const nodes = GHH.TIMELINE;
  const N = nodes.length;
  const [open, setOpen] = React.useState(true);  // open by default
  const [active, setActive] = React.useState(null); // no detail until a node is clicked
  const [hint, setHint] = React.useState(true);

  const center = (i) => ((i + 0.5) / N) * 100;
  let doneIdx = 0;
  nodes.forEach((n, i) => { if (n.state === "done" || n.state === "active" || n.state === "past") doneIdx = i; });
  const startIdx = 0; // timeline now starts at Start Project

  const clickNode = (i) => setActive((p) => (p === i ? null : i));

  return (
    <Card style={{ padding: 0 }}>
      {/* Header */}
      <div className="row between" style={{ padding: "16px 18px", flexWrap: "wrap", gap: 8 }}>
        <div className="row" style={{ gap: 12 }}>
          <span className="label">Project Timeline</span>
          <span className="meta">Week 2 of 6 · On Track</span>
        </div>
        <button className="btn btn-ghost" onClick={() => setOpen((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          Timeline {open ? <Icons.ChevronUp size={13} /> : <Icons.ChevronDown size={13} />}
        </button>
      </div>

      {open && (
        <div style={{ padding: "4px 18px 18px" }}>
          {/* Rail */}
          <div style={{ position: "relative" }}>
            {/* Labels */}
            <div style={{ display: "flex" }}>
              {nodes.map((n) => (
                <div key={n.key} style={{ flex: 1, textAlign: "center", padding: "0 4px" }}>
                  <div style={{ fontSize: 12, fontWeight: n.state === "active" ? 700 : 500, color: n.state === "active" ? "var(--purple)" : "#7a7a7a", lineHeight: 1.2 }}>{n.label}</div>
                  {n.date && <div className="small" style={{ marginTop: 2 }}>{n.date}</div>}
                </div>
              ))}
            </div>

            {/* Track */}
            <div style={{ position: "relative", height: 30, marginTop: 10 }}>
              {/* solid grey base */}
              <div style={{ position: "absolute", top: "50%", left: `${center(0)}%`, right: `${center(0)}%`, height: 2, background: "#D0CEC8", transform: "translateY(-50%)" }} />
              {/* purple done line */}
              <div style={{ position: "absolute", top: "50%", left: `${center(0)}%`, width: `${Math.max(0, center(doneIdx) - center(0))}%`, height: 2, background: "var(--purple)", transform: "translateY(-50%)" }} />
              <div style={{ display: "flex", position: "relative", height: "100%" }}>
                {nodes.map((n, i) => (
                  <div key={n.key} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <button onClick={() => clickNode(i)} title={n.label}
                      style={{ background: "none", border: "none", padding: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 99 }}>
                      <NodeDot node={n} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Target end */}
            <div style={{ textAlign: "right", marginTop: 2 }}>
              <span className="meta">Target End: {GHH.TARGET_END}</span>
            </div>
          </div>

          {/* Hint banner — until dismissed or a node is opened */}
          {hint && active === null && (
            <div className="row between" style={{ background: "var(--page-bg)", borderRadius: 6, padding: "7px 10px", marginTop: 14 }}>
              <span className="row" style={{ gap: 7, fontSize: 11, color: "#888" }}>
                <Icons.Info size={13} /> Click any phase or call to see details
              </span>
              <button className="btn btn-ghost" style={{ color: "#888", fontSize: 11 }} onClick={() => setHint(false)}>Got it ✕</button>
            </div>
          )}

          {/* Inline detail */}
          {active !== null && <PhaseDetail node={nodes[active]} />}
        </div>
      )}
    </Card>
  );
}

Object.assign(window, { Timeline });
