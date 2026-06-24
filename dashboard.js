/* ============================================================
   Dashboard screen  →  window.Dashboard
   Two-column: main (timeline + tasks + upsell) | sticky right
   ============================================================ */

function YourTasks() {
  const { dashTasks, openTask, completeDash, navigate } = usePortal();
  return (
    <Card>
      <div className="row between" style={{ marginBottom: 14 }}>
        <div className="row" style={{ gap: 10 }}>
          <span className="label">Your Tasks</span>
          <span className="meta">3 action items</span>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("#/tasks")}>View all →</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {dashTasks.map((t) => (
          <TaskCard key={t.id} task={t} onOpen={openTask} onComplete={() => completeDash(t.id)} />
        ))}
      </div>
    </Card>
  );
}

function UpcomingSessions() {
  const { showToast, navigate } = usePortal();
  const I = window.Icons;
  return (
    <Card style={{ marginBottom: 16 }}>
      <div className="label" style={{ marginBottom: 12 }}>Upcoming Sessions</div>
      <div className="row" style={{ gap: 11, alignItems: "flex-start" }}>
        <span style={{ width: 32, height: 32, borderRadius: 99, background: "var(--purple-light)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 32px" }}><I.Video size={16} /></span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Working Session #2</div>
          <div className="meta" style={{ marginTop: 2 }}>Thu, May 1 at 2:00 PM</div>
          <div className="small" style={{ marginTop: 1 }}>60 min</div>
        </div>
      </div>
      <button className="btn btn-primary btn-block" style={{ height: 38, marginTop: 12 }} onClick={() => showToast("Opening Zoom…")}>
        <I.Video size={15} /> Join on Zoom
      </button>
      <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={() => navigate("#/sessions")}>Reschedule</button>
      <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => navigate("#/sessions")}>Reschedule or view all sessions →</button>
    </Card>
  );
}

function DashComment({ c, onOpen }) {
  const { navigate } = usePortal();
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 0", borderTop: "0.5px solid var(--border-light)" }}>
      <div style={{ position: "relative", flex: "0 0 28px" }}>
        <div style={{ width: 28, height: 28, borderRadius: 99, background: c.unread ? "var(--raspberry)" : "#A19EA6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>{c.initials}</div>
        {c.unread && <span style={{ position: "absolute", right: -1, bottom: -1, width: 6, height: 6, borderRadius: 99, background: "var(--raspberry)", border: "1.5px solid #fff" }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12 }}>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.who}</span>
          <span className="meta"> · {c.when}</span>
        </div>
        <button onClick={() => (c.taskId ? onOpen(c.taskId) : navigate("#/comments"))} style={{ background: "none", border: "none", padding: "1px 0", display: "block", fontSize: 11, color: c.unread ? "var(--raspberry)" : "#4A4547", fontWeight: 500, cursor: "pointer" }}>
          on {c.on}
        </button>
        <div style={{ fontSize: 12, color: "#888", lineHeight: 1.45, marginTop: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.text}</div>
      </div>
    </div>
  );
}

function RecentComments() {
  const { comments, openTaskById, navigate } = usePortal();
  return (
    <Card>
      <div className="label" style={{ marginBottom: 4 }}>Recent Comments</div>
      {comments.map((c) => <DashComment key={c.id} c={c} onOpen={openTaskById} />)}
      <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => navigate("#/comments")}>View all comments →</button>
    </Card>
  );
}

function AddBanner() {
  const { openAddons } = usePortal();
  return (
    <div style={{ background: "var(--page-bg)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12, padding: "14px 16px", marginTop: 14, boxShadow: "var(--shadow-card)" }}>
      <div className="row between" style={{ gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="row" style={{ gap: 8, fontSize: 14, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <span style={{ color: "var(--raspberry)" }}>✦</span> Want to add something to your package?
          </div>
          <div className="meta" style={{ marginTop: 4 }}>Interview prep, LinkedIn optimization, cover letters — you can add services anytime.</div>
        </div>
        <button onClick={openAddons} style={{ background: "none", border: "none", color: "var(--raspberry)", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
          View Add-ons & Upgrades →
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Timeline />
        <div style={{ marginTop: 14 }}>
          <YourTasks />
          <AddBanner />
        </div>
      </div>
      <div style={{ width: 300, flexShrink: 0, position: "sticky", top: 0 }}>
        <UpcomingSessions />
        <RecentComments />
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
