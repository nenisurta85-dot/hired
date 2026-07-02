/* ============================================================
   Admin · Dashboard (Command Center)  →  window.AdminDashboard
   Layout:
     Banner  — full-width hero with HiREd brand art
     Row 1   — Upcoming Calls | Recent Comments | Writer Capacity
     Row 2   — Focus Right Now (wide) | Projects (narrow, dark)
   ============================================================ */

function ACard({ title, icon, link, onLink, children, borderLeft, style }) {
  const { Icons } = window;
  const IconCmp = icon ? Icons[icon] : null;
  return (
    <Card style={{ borderRadius: 12, ...(borderLeft ? { borderLeft: `3px solid ${borderLeft}` } : {}), ...style }}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <div className="row" style={{ gap: 8 }}>
          {IconCmp && <span style={{ color: borderLeft || "var(--text-secondary)", display: "flex" }}><IconCmp size={16} /></span>}
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".7px", textTransform: "uppercase", color: "var(--text-secondary)" }}>{title}</span>
        </div>
        {link && <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={onLink}>{link}</button>}
      </div>
      {children}
    </Card>
  );
}

/* ---------- Comments data ---------- */
const ADMIN_COMMENTS = [
  { id: "ac1", who: "Priya Nair", initials: "PR", color: "#C8005A", on: "Résumé — Draft v2", client: "Priya Nair", when: "2h ago", unread: true, role: "Client", text: "Love the summary section but I think we need to re…" },
  { id: "ac2", who: "Maya Chen", initials: "MC", color: "#C8005A", on: "Cover Letter Template", client: "Maya Chen", when: "4h ago", unread: true, role: "Client", text: "This feels much more like me. Can we adjust the ope…" },
  { id: "ac3", who: "Dana Okafor", initials: "DO", color: "#888", on: "LinkedIn Profile", client: "Dana Okafor", when: "1d ago", unread: false, role: "Client", text: "The headline is perfect. Happy with everything here…" },
  { id: "ac4", who: "Kate Wade", initials: "KW", color: "var(--purple)", on: "Résumé — Draft v1", client: "Maya Chen", when: "2h ago", unread: true, role: "Team", text: "First draft is looking great — please review the executive summary." },
];

/* ---------- Upcoming Calls card ---------- */
function UpcomingCallsCard({ navigate, showToast }) {
  const { Icons } = window;
  const calls = [
    { client: "Maya Chen", initials: "MC", color: "#C8005A", time: "2:00 PM", badge: "Review!" },
    { client: "Tessa Wright", initials: "TW", color: "#555", time: "4:00 PM", badge: null },
    { client: "Tessa Wright", initials: "TW", color: "#555", time: "4:00 PM", badge: null },
    { client: "Tessa Wright", initials: "TW", color: "#555", time: "4:00 PM", badge: null },
  ];
  return (
    <Card style={{ padding: "18px 18px 6px" }}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".7px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Upcoming Calls</span>
      </div>
      {calls.map((c, i) => (
        <div key={i} className="row between" style={{ padding: "9px 0", borderTop: i ? "0.5px solid var(--border-light)" : "none", alignItems: "center", borderRadius: 8, transition: "background .12s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(130,17,255,0.03)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <div className="row" style={{ gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 99, background: c.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flex: "0 0 32px" }}>{c.initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{c.client}</div>
              <div className="meta" style={{ fontSize: 12 }}>{c.time}</div>
            </div>
          </div>
          {c.badge && (
            <span style={{ background: "rgba(200,0,90,0.12)", color: "#C8005A", fontSize: 11, fontWeight: 600, borderRadius: 99, padding: "2px 8px", marginRight: 8, whiteSpace: "nowrap" }}>{c.badge}</span>
          )}
          {c.badge
            ? <button className="btn btn-ghost" style={{ fontSize: 12, color: "var(--purple)", fontWeight: 600, whiteSpace: "nowrap" }} onClick={() => showToast("Opening Zoom…")}>Join Zoom →</button>
            : <button className="btn btn-ghost" style={{ fontSize: 12, whiteSpace: "nowrap" }} onClick={() => showToast("Opening Zoom…")}>Join →</button>
          }
        </div>
      ))}
    </Card>
  );
}

/* ---------- Recent Comments card ---------- */
function RecentCommentsCard({ navigate, setActiveTask }) {
  const [tab, setTab] = React.useState("All");
  const filtered = tab === "All" ? ADMIN_COMMENTS : ADMIN_COMMENTS.filter(c => c.role === tab);
  const shown = filtered.slice(0, 3);

  const openCommentTask = (c) => {
    const allT = Object.values((window.ADM.TASKS_BY_PHASE) || {}).flat();
    const words = c.on.toLowerCase().split(/[\s—\-]+/).filter(w => w.length > 3);
    const found = allT.find(t => words.some(w => t.title.toLowerCase().includes(w)));
    const task = found || { id: "c-" + c.id, title: c.on, client: c.client, status: "in_progress" };
    setActiveTask(task);
  };

  return (
    <Card style={{ padding: "18px 18px 10px" }}>
      <div className="row between" style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".7px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Recent Comments</span>
        <div style={{ display: "flex", gap: 4 }}>
          {["All", "Client", "Team"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 99, cursor: "pointer", border: "1px solid", background: tab === t ? "var(--purple)" : "transparent", color: tab === t ? "#fff" : "var(--text-muted)", borderColor: tab === t ? "var(--purple)" : "var(--border)" }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {shown.map((c, i) => (
        <div key={c.id} className="row" style={{ gap: 10, padding: "8px 6px", borderTop: i ? "0.5px solid var(--border-light)" : "none", alignItems: "flex-start", borderRadius: 8, cursor: "pointer", transition: "background .12s" }}
          onClick={() => openCommentTask(c)}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(130,17,255,0.03)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <div style={{ position: "relative", flex: "0 0 28px" }}>
            <div style={{ width: 28, height: 28, borderRadius: 99, background: c.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{c.initials}</div>
            {c.unread && <span style={{ position: "absolute", right: -1, bottom: -1, width: 6, height: 6, borderRadius: 99, background: "#C8005A", border: "1.5px solid #fff" }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12 }}><span style={{ fontWeight: 600 }}>{c.who}</span><span className="meta"> · {c.when}</span></div>
            <div style={{ fontSize: 11, color: "var(--purple)", fontWeight: 500, marginBottom: 2 }}>{c.on}</div>
            <div style={{ fontSize: 12, color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.text}</div>
          </div>
        </div>
      ))}
      {shown.length === 0 && <div className="meta" style={{ textAlign: "center", padding: "12px 0" }}>No {tab.toLowerCase()} comments</div>}
    </Card>
  );
}

/* ---------- Writer Capacity card ---------- */
function WriterCapacityCard({ navigate }) {
  const { ADM, Icons } = window;

  const pkgMap = {};
  (ADM.PACKAGES || []).forEach((p) => { pkgMap[p.name] = p; });

  // Mock self-available flags (writer-controlled from their own account)
  const SELF_AVAILABLE = { "lh": true, "mb": true };

  const team = (ADM.TEAM || []).filter((m) =>
    m.status === "Active" && m.roles && (m.roles.includes("writer") || m.roles.includes("editor"))
  );

  const getWriterCounts = (member) => {
    const projects = (ADM.PROJECTS || []).filter((p) =>
      p.writer === member.name || p.editor === member.name
    );
    const counts = { alacarte: 0, day15: 0, day30: 0 };
    projects.forEach((p) => {
      const pkg = pkgMap[p.pkg] || {};
      if (pkg.alc) { counts.alacarte++; }
      else {
        const w = parseInt((pkg.weeks || "0").replace(/[^0-9]/g, ""));
        if (w <= 2) counts.day15++;
        else counts.day30++;
      }
    });
    return counts;
  };

  const goToWriter = (member) => {
    window._expandTeamMember = member.name;
    navigate("#/admin/team");
  };

  const GRID = { display: "grid", gridTemplateColumns: "1fr 72px 72px 72px", alignItems: "center" };
  const colStyle = { textAlign: "right", fontVariantNumeric: "tabular-nums" };

  return (
    <Card style={{ padding: "18px 18px 10px" }}>
      <div className="row between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".7px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Writer Capacity</span>
      </div>

      {/* Column headers */}
      <div style={{ ...GRID, padding: "0 6px", marginBottom: 2 }}>
        <div />
        <div style={{ ...colStyle, fontSize: 10, fontWeight: 600, color: "#8211FF", textTransform: "uppercase", letterSpacing: ".5px" }}>À la carte</div>
        <div style={{ ...colStyle, fontSize: 10, fontWeight: 600, color: "#378ADD", textTransform: "uppercase", letterSpacing: ".5px" }}>15-day</div>
        <div style={{ ...colStyle, fontSize: 10, fontWeight: 600, color: "#BA7517", textTransform: "uppercase", letterSpacing: ".5px" }}>30-day</div>
      </div>

      {team.map((member) => {
        const counts = getWriterCounts(member);
        const total = counts.alacarte + counts.day15 + counts.day30;
        const overloaded = total >= 8;
        const isEditor = member.roles.includes("editor") && !member.roles.includes("writer");
        const firstName = member.name.split(" ")[0];
        return (
          <div key={member.id} style={{ padding: "9px 6px", borderTop: "0.5px solid var(--border-light)", borderRadius: 8, cursor: "pointer", transition: "background .12s" }}
            onClick={() => goToWriter(member)}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(130,17,255,0.03)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ ...GRID, marginBottom: 7 }}>
              <div className="row" style={{ gap: 8, minWidth: 0 }}>
                <div style={{ width: 26, height: 26, borderRadius: 99, background: member.color || "var(--purple)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{member.initials}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: overloaded ? "#E53935" : "var(--purple)", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 2 }}>{firstName}</span>
                {isEditor && <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 6, padding: "2px 7px", background: "rgba(130,17,255,0.1)", color: "#8211FF", flexShrink: 0 }}>Editor</span>}
                {!overloaded && SELF_AVAILABLE[member.id] && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, borderRadius: 99, padding: "2px 8px", background: "rgba(0,160,108,0.12)", color: "#00A06C", flexShrink: 0 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00A06C", display: "inline-block" }} />
                    Available
                  </span>
                )}
                {overloaded && <span style={{ color: "#E53935", display: "flex", flexShrink: 0 }}><Icons.Flag size={13} /></span>}
              </div>
              <div style={{ ...colStyle, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{counts.alacarte}</div>
              <div style={{ ...colStyle, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{counts.day15}</div>
              <div style={{ ...colStyle, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{counts.day30}</div>
            </div>
            <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", background: "#F0F0F0" }}>
              <div style={{ width: ((counts.alacarte / 8) * 100) + "%", background: "#8211FF", flexShrink: 0 }} />
              <div style={{ width: ((counts.day15 / 8) * 100) + "%", background: "#378ADD", flexShrink: 0 }} />
              <div style={{ width: ((counts.day30 / 8) * 100) + "%", background: "#BA7517", flexShrink: 0 }} />
            </div>
          </div>
        );
      })}
    </Card>
  );
}

/* ---------- Focus Right Now card ---------- */
function FocusRightNow({ setActiveTask }) {
  const [tab, setTab] = React.useState("All");
  const { Icons } = window;

  const allTasks = [
    { type: "Review", title: "Review Resume", client: "Maya Chen", status: "overdue", due: "Apr 3", overdue: true, action: "Review Draft", borderColor: "#E53935", dot: "#E53935", badge: "Review", badgeBg: "rgba(229,57,53,0.1)", badgeFg: "#C0241F", icon: "Eye", iconBg: "rgba(229,57,53,0.1)", iconFg: "#E53935" },
    { type: "Call", title: "Schedule call", client: "Maya Chen", status: "action required", due: "Apr 28", action: "Book", borderColor: "#E57300", dot: "#E57300", badge: "Call", badgeBg: "rgba(229,115,0,0.12)", badgeFg: "#B85C00", icon: "Calendar", iconBg: "rgba(229,115,0,0.1)", iconFg: "#E57300" },
    { type: "Call", title: "Schedule call", client: "Maya Chen", status: "action required", due: "Apr 28", action: "Book", borderColor: "#E57300", dot: "#E57300", badge: "Call", badgeBg: "rgba(229,115,0,0.12)", badgeFg: "#B85C00", icon: "Calendar", iconBg: "rgba(229,115,0,0.1)", iconFg: "#E57300" },
    { type: "Review", title: "Review doc", client: "Maya Chen", status: "ready", due: "Apr 28", action: "Review", borderColor: "#8211FF", dot: "#8211FF", badge: "Review", badgeBg: "rgba(130,17,255,0.1)", badgeFg: "#6009CC", icon: "Eye", iconBg: "rgba(130,17,255,0.08)", iconFg: "var(--purple)" },
    { type: "Review", title: "Review doc", client: "Maya Chen", status: "ready", due: "Apr 28", action: "Review", borderColor: "#8211FF", dot: "#8211FF", badge: "Review", badgeBg: "rgba(130,17,255,0.1)", badgeFg: "#6009CC", icon: "Eye", iconBg: "rgba(130,17,255,0.08)", iconFg: "var(--purple)" },
    { type: "Create", title: "Create doc", client: "Dana Okafor", status: "not started", due: "Apr 28", action: "Open", borderColor: "#00A06C", dot: "#00A06C", badge: "Create", badgeBg: "rgba(0,160,108,0.1)", badgeFg: "#007A52", icon: "FilePlus", iconBg: "rgba(0,160,108,0.1)", iconFg: "#00A06C" },
    { type: "Email", title: "Email — Maya Chen", client: "Maya Chen", status: "in progress", due: "Apr 30", action: "Open", borderColor: "#185FA5", dot: "#185FA5", badge: "Email", badgeBg: "rgba(24,95,165,0.1)", badgeFg: "#0C447C", icon: "Mail", iconBg: "rgba(24,95,165,0.08)", iconFg: "#185FA5" },
    { type: "Email", title: "Email — Dana Okafor", client: "Dana Okafor", status: "not started", due: "May 2", action: "Open", borderColor: "#185FA5", dot: "#185FA5", badge: "Email", badgeBg: "rgba(24,95,165,0.1)", badgeFg: "#0C447C", icon: "Mail", iconBg: "rgba(24,95,165,0.08)", iconFg: "#185FA5" },
  ];

  const filtered = tab === "All" ? allTasks : allTasks.filter(t => t.type === tab);

  return (
    <Card style={{ padding: "18px 18px 6px" }}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <div className="row" style={{ gap: 8 }}>
          <span style={{ color: "var(--raspberry)", display: "flex" }}><Icons.Sparkle size={15} /></span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".7px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Focus Right Now</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["All", "Call", "Review", "Create", "Email"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ fontSize: 11, fontWeight: 500, padding: "4px 11px", borderRadius: 99, cursor: "pointer", border: "1px solid", background: tab === t ? "var(--purple)" : "transparent", color: tab === t ? "#fff" : "var(--text-muted)", borderColor: tab === t ? "var(--purple)" : "var(--border)" }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
        {filtered.map((t, i) => {
          const cardBg = t.overdue ? "rgba(229,57,53,0.03)" : "#fff";
          const cardBorder = t.overdue ? "0.5px solid rgba(229,57,53,0.18)" : "1px solid var(--border)";
          const dueFg = t.overdue ? "#E53935" : "var(--text-primary)";
          return (
            <div key={i} onClick={() => setActiveTask(t)}
              style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", borderLeft: `3px solid ${t.borderColor}`, borderRadius: 10, background: cardBg, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: cardBorder, borderLeftColor: t.borderColor, transition: "box-shadow .15s, transform .15s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.11)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = ""; }}>
              <div style={{ width: 8, height: 8, borderRadius: 99, background: t.dot, flex: "0 0 8px" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {t.overdue && <span style={{ fontSize: 13, lineHeight: 1 }}>⚠️</span>}
                  <span>{t.title}</span>
                  {t.overdue && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "#FDEAEA", color: "#C0241F" }}>Overdue</span>}
                  <span style={{ background: t.badgeBg, color: t.badgeFg, fontSize: 10, fontWeight: 600, borderRadius: 99, padding: "2px 8px" }}>{t.badge}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{t.client} · {t.status}</div>
              </div>
              {t.due && <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 12, color: dueFg, whiteSpace: "nowrap", pointerEvents: "none" }}>Due date: <span style={{ fontWeight: 600 }}>{t.due}</span></span>}
              <button className="btn btn-secondary" style={{ flex: "0 0 auto", padding: "6px 14px", fontSize: 12 }}
                onClick={(e) => { e.stopPropagation(); setActiveTask(t); }}>{t.action}</button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------- Projects summary card (dark) — Admin / Admin Assistant ---------- */
function ProjectsCard({ navigate, style }) {
  const { ADM } = window;
  const behind = ADM.PROJECTS.filter(p => p.status === "Behind").length;
  const onTrack = ADM.PROJECTS.filter(p => p.status === "On Track").length;
  const rows = [
    { label: "Overdue",    count: behind,   dot: "#E53935", key: "behind" },
    { label: "At Risk",    count: 1,        dot: "#E57300", key: "risk" },
    { label: "On Track",   count: onTrack,  dot: "#00A06C", key: "on-track" },
    { label: "90-day",     count: 3,        dot: "#1A8A9A", key: "90day" },
  ];
  return (
    <div style={{ background: "#2D1060", borderRadius: 12, padding: "18px 18px 10px", boxShadow: "0 2px 8px rgba(0,0,0,0.25)", transition: "box-shadow .15s ease, transform .15s ease", ...style }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.35)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)"; e.currentTarget.style.transform = ""; }}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".7px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Projects</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.key} className="row between" style={{ padding: "11px 6px", borderTop: i ? "0.5px solid rgba(255,255,255,0.08)" : "none", alignItems: "center", borderRadius: 8, cursor: "pointer", transition: "background .12s" }}
          onClick={() => { window._projectFilter = r.label; navigate("#/admin/projects"); }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <div className="row" style={{ gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: r.dot, flex: "0 0 8px" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{r.count}</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{r.label}</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); window._projectFilter = r.label; navigate("#/admin/projects"); }}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 12, cursor: "pointer", fontWeight: 600, transition: "color .12s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}>
            View →
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------- My Projects card (dark) — Writer role ---------- */
function WriterProjectsCard({ navigate, style }) {
  const STATUS_COLOR = {
    "Overdue":     "#F26D6D",
    "At Risk":     "#F5A524",
    "On Track":    "#31D0AA",
    "Offboarding": "#59B0F5",
    "90-day":      "#C58BF2",
  };
  const today = new Date();
  const parseDate = (s) => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d) ? null : d;
  };
  const daysLeft = (endStr) => {
    const end = parseDate(endStr);
    if (!end) return null;
    return Math.max(0, Math.ceil((end - today) / 86400000));
  };

  const WRITER_PROJECTS = [
    { id: "p4", name: "Dana Okafor",  status: "On Track",    done: 18, total: 30, end: "May 22, 2026" },
    { id: "p1", name: "Maya Chen",    status: "Overdue",     done: 12, total: 30, end: "May 22, 2026" },
    { id: "p2", name: "Sarah Klein",  status: "At Risk",     done: 25, total: 30, end: "May 22, 2026" },
    { id: "p6", name: "Tessa Wright", status: "Offboarding", done: 14, total: 15, end: "Jul 14, 2026" },
  ];
  const shown = WRITER_PROJECTS.slice(0, 8);

  return (
    <div style={{ background: "#2D1060", borderRadius: 12, padding: "18px 18px 10px", boxShadow: "0 2px 8px rgba(0,0,0,0.25)", ...style }}>
      <div className="row between" style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".7px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>My Projects</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.08)", borderRadius: 99, padding: "2px 8px" }}>{shown.length}</span>
      </div>
      {shown.map((p, i) => {
        const pct = Math.round((p.done / p.total) * 100);
        const color = STATUS_COLOR[p.status] || "#888";
        const dl = p.status === "Offboarding" ? daysLeft(p.end) : null;
        const statusLabel = dl !== null ? `${p.status} · ${dl} days left` : p.status;
        return (
          <div key={p.id}
            style={{ padding: "10px 6px", borderTop: i ? "0.5px solid rgba(255,255,255,0.08)" : "none", borderRadius: 8, cursor: "pointer", transition: "background .12s" }}
            onClick={() => navigate("#/admin/projects/" + p.id)}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: color, flex: "0 0 8px", marginBottom: 1 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.name} <span style={{ fontWeight: 500, color, fontSize: 12 }}>({statusLabel})</span>
              </span>
              <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.55)", flexShrink: 0 }}>{p.done}/{p.total}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)", overflow: "hidden", marginLeft: 16 }}>
              <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: 2, transition: "width .3s" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- HiREd Hero Banner ---------- */
function DashboardBanner({ userName }) {
  const today = new Date();
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dateStr = `${days[today.getDay()]}, ${months[today.getMonth()]} ${today.getDate()}`;

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      height: 110,
      background: "linear-gradient(135deg, #1A0840 0%, #2D1060 40%, #3B1878 70%, #2A0F5C 100%)",
    }}>
      {/* Background art — faint illustrated layer */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }} viewBox="0 0 900 110" preserveAspectRatio="xMidYMid slice">
        {/* Guitar silhouette */}
        <ellipse cx="340" cy="75" rx="28" ry="22" fill="none" stroke="#9B6FD8" strokeWidth="2.5"/>
        <ellipse cx="340" cy="75" rx="14" ry="11" fill="none" stroke="#9B6FD8" strokeWidth="1.5"/>
        <rect x="337" y="20" width="6" height="40" rx="3" fill="none" stroke="#9B6FD8" strokeWidth="2"/>
        <line x1="320" y1="22" x2="360" y2="22" stroke="#9B6FD8" strokeWidth="1.5"/>
        {[0,1,2,3,4,5].map(n => <line key={n} x1="315" y1={55+n*4} x2="365" y2={55+n*4} stroke="#9B6FD8" strokeWidth="0.8"/>)}
        {/* Palm tree */}
        <line x1="610" y1="110" x2="610" y2="45" stroke="#9B6FD8" strokeWidth="3"/>
        <path d="M610,48 C595,35 575,38 570,50 C585,42 600,48 610,48Z" fill="#9B6FD8"/>
        <path d="M610,48 C625,35 645,38 650,50 C635,42 620,48 610,48Z" fill="#9B6FD8"/>
        <path d="M610,48 C605,30 610,18 620,15 C615,28 610,38 610,48Z" fill="#9B6FD8"/>
        {/* Smiley */}
        <circle cx="480" cy="62" r="22" fill="none" stroke="#9B6FD8" strokeWidth="2"/>
        <circle cx="472" cy="56" r="3" fill="#9B6FD8"/>
        <circle cx="488" cy="56" r="3" fill="#9B6FD8"/>
        <path d="M472,70 Q480,78 488,70" fill="none" stroke="#9B6FD8" strokeWidth="2" strokeLinecap="round"/>
        {/* Lightning bolt */}
        <path d="M200,20 L192,48 L200,48 L192,80 L210,45 L200,45Z" fill="#9B6FD8"/>
      </svg>

      {/* Stars */}
      {[
        { x: 415, y: 18, s: 18, rot: 15 },
        { x: 445, y: 8, s: 12, rot: -10 },
        { x: 460, y: 28, s: 22, rot: 5 },
      ].map((st, i) => (
        <svg key={i} style={{ position: "absolute", left: st.x, top: st.y, transform: `rotate(${st.rot}deg)` }} width={st.s} height={st.s} viewBox="0 0 24 24">
          <path d="M12 2 L14.5 9.5 L22 9.5 L16 14.5 L18.5 22 L12 17.5 L5.5 22 L8 14.5 L2 9.5 L9.5 9.5Z" fill="#1A0840" stroke="#9B6FD8" strokeWidth="1.5"/>
        </svg>
      ))}

      {/* HiREd text — right side */}
      <div style={{
        position: "absolute",
        right: 24,
        top: "50%",
        transform: "translateY(-50%)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 900,
        fontSize: 52,
        color: "rgba(130,17,255,0.35)",
        letterSpacing: "-1px",
        lineHeight: 1,
        userSelect: "none",
        textTransform: "uppercase",
      }}>HiREd</div>

      {/* Text content */}
      <div style={{ position: "relative", zIndex: 1, padding: "22px 28px" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 5 }}>
          Good morning, <span style={{ color: "#C8005A" }}>{userName || "Kate"}</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
          {dateStr} · 2 calls today · Kate is at capacity
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Dashboard ---------- */
function AdminDashboard() {
  const { navigate, showToast, role } = useAdmin();
  const { ADM, Icons } = window;
  const [activeTask, setActiveTask] = React.useState(null);

  return (
    <div>
      {activeTask && React.createElement(window.AdminTaskModal, { task: activeTask, onClose: () => setActiveTask(null) })}
      <div className="admin-body" style={{ maxWidth: "none" }}>

        {/* Hero banner — full width, bleeds past admin-body padding */}
        <div style={{ margin: "-24px -32px 24px" }}>
          <DashboardBanner userName="Kate" />
        </div>

        {/* Two-column outer grid: left (content) + right (sidebar — Writer + Projects same width) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 30%", gap: 16 }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Upcoming + Comments side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <UpcomingCallsCard navigate={navigate} showToast={showToast} />
              <RecentCommentsCard navigate={navigate} setActiveTask={setActiveTask} />
            </div>
            {/* Focus Right Now full left-column width */}
            <FocusRightNow setActiveTask={setActiveTask} />
          </div>

          {/* Right column — both cards share identical width */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "stretch" }}>
            {role !== "Writer" && <WriterCapacityCard navigate={navigate} />}
            {role === "Writer"
              ? <WriterProjectsCard navigate={navigate} style={{ flex: 1 }} />
              : <ProjectsCard navigate={navigate} style={{ flex: 1 }} />
            }
          </div>

        </div>

      </div>
    </div>
  );
}

Object.assign(window, { AdminDashboard, ACard });
