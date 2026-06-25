/* ============================================================
   Admin · Dashboard (Command Center)  →  window.AdminDashboard
   Row 1: Upcoming Calls · Needs Attention · Recent Comments
   Row 2: Calls to Schedule · Documents to Review · Documents to Create
   Row 3: Recent Comments (extended feed)
   ============================================================ */

function ACard({ title, icon, link, onLink, children, borderLeft, style }) {
  const { Icons } = window;
  const IconCmp = icon ? Icons[icon] : null;
  return (
    <Card style={{ borderRadius: 10, ...(borderLeft ? { borderLeft: `3px solid ${borderLeft}` } : {}), ...style }}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <div className="row" style={{ gap: 8 }}>
          {IconCmp && <span style={{ color: borderLeft || "var(--text-secondary)", display: "flex" }}><IconCmp size={16} /></span>}
          <span style={{ fontSize: 13, fontWeight: 600, color: borderLeft || "var(--text-primary)" }}>{title}</span>
        </div>
        {link && <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={onLink}>{link}</button>}
      </div>
      {children}
    </Card>
  );
}

const ADMIN_COMMENTS = [
  { id: "ac1", who: "Kate Wade", initials: "KW", color: "var(--purple)", on: "Résumé — Draft v1", client: "Maya Chen", when: "2h ago", unread: true, role: "Team", text: "First draft is looking great — please review the executive summary." },
  { id: "ac2", who: "Mimi Bishop", initials: "MB", color: "var(--purple)", on: "LinkedIn Audit", client: "Priya Nair", when: "5h ago", unread: true, role: "Team", text: "A few questions on headline direction before I finalize." },
  { id: "ac3", who: "Maya Chen", initials: "MC", color: "#C8005A", on: "Résumé — Draft v1", client: "Maya Chen", when: "2h ago", unread: true, role: "Client", text: "Love the direction! A few small edits on the opening paragraph." },
  { id: "ac4", who: "Lourdes H-D", initials: "LH", color: "var(--purple)", on: "Cover Letter Template", client: "Sarah Klein", when: "1d ago", unread: false, role: "Team", text: "Template approved — moving to final." },
];

function RecentCommentsCard({ navigate }) {
  const [tab, setTab] = React.useState("All");
  const filtered = tab === "All" ? ADMIN_COMMENTS : ADMIN_COMMENTS.filter(c => c.role === tab);
  const shown = filtered.slice(0, 3);
  return (
    <ACard title="Recent Comments" icon="MessageCircle" link="View all \u2192" onLink={() => navigate("#/admin/inbox")}>
      <div style={{ display: "flex", gap: 4, marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
        {["All", "Client", "Team"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 6, cursor: "pointer", border: "none", background: tab === t ? "var(--purple)" : "transparent", color: tab === t ? "#fff" : "var(--text-muted)" }}>{t}</button>
        ))}
      </div>
      {shown.map((c, i) => (
        <div key={c.id} className="row" style={{ gap: 10, padding: "6px 0", borderTop: i ? "0.5px solid var(--border-light)" : "none", alignItems: "flex-start" }}>
          <div style={{ position: "relative", flex: "0 0 28px" }}>
            <Avatar initials={c.initials} color={c.role === "Client" ? "#C8005A" : "var(--purple)"} size={28} />
            {c.unread && <span style={{ position: "absolute", right: -1, bottom: -1, width: 6, height: 6, borderRadius: 99, background: "#C8005A", border: "1.5px solid #fff" }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12 }}><span style={{ fontWeight: 600 }}>{c.who}</span><span className="meta"> · {c.when}</span></div>
            <div style={{ fontSize: 11, color: "#C8005A", fontWeight: 500 }}>on {c.on}</div>
            <div style={{ fontSize: 12, color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.text}</div>
          </div>
        </div>
      ))}
      {shown.length === 0 && <div className="meta" style={{ textAlign: "center", padding: "12px 0" }}>No {tab.toLowerCase()} comments</div>}
    </ACard>
  );
}
/* Client-portal-style task card for admin queues */
function AdminQueueCard({ title, icon, accent, tasks, emptyText, onTaskClick }) {
  const { Icons } = window;
  const HeadIcon = Icons[icon];
  return (
    <Card style={{ borderRadius: 10, borderLeft: `3px solid ${accent}`, padding: 0, overflow: "hidden" }}>
      <div className="row" style={{ gap: 8, padding: "14px 16px 10px" }}>
        <span style={{ color: accent, display: "flex" }}><HeadIcon size={15} /></span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".6px", textTransform: "uppercase", color: "var(--text-secondary)" }}>{title}</span>
      </div>
      {tasks.length ? tasks.map((t, i) => (
        <div key={i} className="row" style={{ gap: 12, padding: "12px 16px", borderTop: "0.5px solid var(--border-light)", cursor: "pointer" }} onClick={() => onTaskClick && onTaskClick(t)}>
          <span style={{ width: 36, height: 36, borderRadius: 99, flex: "0 0 36px", background: t.iconBg, color: t.iconFg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {React.createElement(Icons[t.icon] || Icons.FileText, { size: 16 })}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{t.title}</div>
            <div className="row" style={{ gap: 8, marginTop: 5, flexWrap: "wrap" }}>
              <Badge status={t.status} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              <span>{t.client}</span>
              {t.due && <><span>·</span><span style={{ color: "var(--text-muted)" }}>{t.due}</span></>}
            </div>
          </div>
          <button className="btn btn-secondary" style={{ flex: "0 0 auto", padding: "7px 12px" }} onClick={(e) => { e.stopPropagation(); onTaskClick && onTaskClick(t); }}>{t.action}</button>
        </div>
      )) : (
        <div style={{ padding: "20px 16px", textAlign: "center" }}><span className="meta">{emptyText}</span></div>
      )}
    </Card>
  );
}

function AdminDashboard() {
  const { navigate, showToast } = useAdmin();
  const { ADM, Icons } = window;
  const [range, setRange] = React.useState("Today");
  const [activeTask, setActiveTask] = React.useState(null);

  const behind = ADM.PROJECTS.filter((p) => p.status === "Behind");
  const onTrack = ADM.PROJECTS.filter((p) => p.status === "On Track").length;
  const onboarding = ADM.CLIENTS.filter((c) => c.phase === "Onboarding").length;

  const callsToSchedule = [
    { icon: "Calendar", iconBg: "rgba(130,17,255,0.1)", iconFg: "var(--purple)", title: "Schedule Working Session #2", status: "Action Required", client: "Maya Chen", due: "Apr 30", action: "Book Session" },
    { icon: "Calendar", iconBg: "rgba(130,17,255,0.1)", iconFg: "var(--purple)", title: "Schedule Working Session #1", status: "Action Required", client: "Priya Nair", due: "May 2", action: "Book Session" },
  ];
  const docsToReview = [
    { icon: "FileText", iconBg: "rgba(200,0,90,0.1)", iconFg: "#C8005A", title: "Review Résumé — Draft v1", status: "Ready for Review", client: "Maya Chen", due: "Apr 28", action: "Review Draft" },
    { icon: "FileText", iconBg: "rgba(200,0,90,0.1)", iconFg: "#C8005A", title: "Review Cover Letter Template", status: "Ready for Review", client: "Sarah Klein", due: "May 1", action: "Review Draft" },
  ];
  const docsToCreate = [
    { icon: "FilePlus", iconBg: "rgba(0,160,108,0.1)", iconFg: "#00A06C", title: "Career Strategy Doc", status: "Not Started", client: "Dana Okafor", due: "May 3", action: "Open Doc" },
    { icon: "FilePlus", iconBg: "rgba(0,160,108,0.1)", iconFg: "#00A06C", title: "LinkedIn Audit", status: "In Progress", client: "Priya Nair", due: "May 5", action: "Open Doc" },
  ];

  const recent = ADMIN_COMMENTS.slice(0, 3);

  return (
    <div>
      {activeTask && React.createElement(window.AdminTaskModal, { task: activeTask, onClose: () => setActiveTask(null) })}
      <AdminHeader icon="Home" title="Command Center" subtitle="Your birds-eye view of all active work" />
      <div className="admin-body">

        {/* ROW 1 — four info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <ACard title="Upcoming Calls" icon="Calendar" link="View schedule →" onLink={() => navigate("#/admin/schedule")}>
            {[{ c: "Maya Chen", t: "2:00 PM", review: true }, { c: "Tessa Wright", t: "4:00 PM", review: false }].map((m, i) => (
              <div key={i} className="row between" style={{ padding: "9px 0", borderTop: i ? "0.5px solid var(--border-light)" : "none" }}>
                <div className="row" style={{ gap: 10 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 99, background: "rgba(130,17,255,0.1)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 32px" }}><Icons.Video size={15} /></span>
                  <div><div style={{ fontSize: 13, fontWeight: 600 }}>{m.c}</div><div className="meta">{m.t}</div></div>
                  {m.review && <span className="badge" style={{ background: "rgba(255,140,0,0.1)", color: "#B85C00" }}>Needs Review</span>}
                </div>
                <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => showToast("Opening Zoom\u2026")}>Join Zoom</button>
              </div>
            ))}
          </ACard>

          <ACard title="Needs Attention" icon="Info" borderLeft="#E53935">
            {behind.length ? behind.map((p) => (
              <div key={p.id} className="row between clickable" style={{ padding: "9px 0", borderTop: "0.5px solid var(--border-light)", cursor: "pointer" }} onClick={() => navigate("#/admin/projects/" + p.id)}>
                <div className="row" style={{ gap: 9 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{p.client}</span>
                  <span className="badge" style={{ background: ADM.phaseColor(p.phase) + "1f", color: ADM.phaseColor(p.phase), fontWeight: 600 }}>{p.phase}</span>
                </div>
                <span className="row" style={{ gap: 6, fontSize: 12, color: "#888" }}>{p.writer}<span style={{ width: 7, height: 7, borderRadius: 99, background: "#E53935" }} /></span>
              </div>
            )) : <EmptyState icon="CircleCheck" title="All projects on track" />}

          </ACard>

          {/* Project Stats */}
          <ACard title="Project Stats" icon="BarChart">
            {[
              { label: "On Track",       count: onTrack,              dot: "#00A06C" },
              { label: "Overdue",        count: behind.length,        dot: "#E53935" },
              { label: "At Risk",        count: 3,                    dot: "#E57300" },
              { label: "90-day Support", count: 1,                    dot: "#1A8A9A" },
            ].map((r, i) => (
              <div key={r.label} className="row between" style={{ height: 36, borderTop: i ? "1px solid var(--border-light)" : "none", paddingTop: i ? 0 : 0 }}>
                <div className="row" style={{ gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: r.dot, flex: "0 0 8px" }} />
                  <span style={{ fontSize: 13 }}>{r.label}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{r.count}</span>
              </div>
            ))}
            <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right", marginTop: 8 }}>{ADM.PROJECTS.length} active projects</div>
          </ACard>

          {/* Recent Comments — tabbed */}
          <RecentCommentsCard navigate={navigate} />
        </div>

        {/* Section label */}
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", margin: "20px 0 10px" }}>Today's Action Items</div>

        {/* ROW 2 — four task queue cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <AdminQueueCard title="Calls to Schedule" icon="Phone" accent="var(--purple)" tasks={callsToSchedule} emptyText="No calls to schedule" onTaskClick={setActiveTask} />
          <AdminQueueCard title="Documents to Review" icon="Eye" accent="#C8005A" tasks={docsToReview} emptyText="All caught up!" onTaskClick={setActiveTask} />
          <AdminQueueCard title="Documents to Create" icon="FilePlus" accent="#00A06C" tasks={docsToCreate} emptyText="No documents in queue" onTaskClick={setActiveTask} />

          {/* Writer Capacity */}
          <Card style={{ borderRadius: 10, borderLeft: "3px solid #E57300", padding: 0, overflow: "hidden" }}>
            <div className="row" style={{ gap: 8, padding: "14px 16px 10px" }}>
              <span style={{ color: "#E57300", display: "flex" }}><Icons.Users size={15} /></span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".6px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Writer Capacity</span>
            </div>
            {[{ name: "Lourdes H-D", init: "LH", cur: 3, max: 8 }, { name: "Jhoneth B.", init: "JB", cur: 6, max: 8 }, { name: "Kate Wade", init: "KW", cur: 8, max: 8 }, { name: "Mimi Bishop", init: "MB", cur: 1, max: 8 }].map((w, i) => {
              const pct = Math.round((w.cur / w.max) * 100);
              const barColor = pct <= 50 ? "#00A06C" : pct <= 80 ? "#E57300" : "#E53935";
              const overloaded = pct > 80;
              return (
                <div key={i} style={{ padding: "10px 16px", borderTop: "0.5px solid var(--border-light)" }}>
                  <div className="row between" style={{ marginBottom: 5 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <Avatar initials={w.init} color="var(--purple)" size={24} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{w.name}</span>
                    </div>
                    <div className="row" style={{ gap: 6 }}>
                      <span style={{ fontSize: 12, color: "#888" }}>{w.cur}/{w.max}</span>
                      {overloaded && <span title="Overloaded — reassign tasks" style={{ color: "#E53935", display: "flex", cursor: "help" }}><Icons.Flag size={14} /></span>}
                    </div>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "#F0F0F0", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: barColor, borderRadius: 3, transition: "width .3s" }} />
                  </div>
                </div>
              );
            })}
            <div style={{ padding: "10px 16px" }}>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate("#/admin/team")}>View all \u2192</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminDashboard, ACard });
