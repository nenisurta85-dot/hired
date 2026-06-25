/* ============================================================
   Admin · remaining screens
   Tasks, Documents, Schedule, Inbox, Team, Packages,
   TaskTemplates, KnowledgeBase, AdminSettings
   ============================================================ */

const initials2 = (name) => name.split(" ").map((w) => w[0]).join("").slice(0, 2);

/* ---------------- TASKS ---------------- */
function flatTasks() {
  const { ADM } = window;
  const out = [];
  ADM.PROJECTS.forEach((p) => {
    Object.keys(ADM.TASKS_BY_PHASE).forEach((ph) => {
      (ADM.TASKS_BY_PHASE[ph] || []).forEach((t) => {
        out.push({ ...t, client: p.client, phase: ph, project: p.name });
      });
    });
  });
  return out;
}

function AdminTasks() {
  const { ADM, Icons } = window;
  const { showToast } = useAdmin();
  const [tab, setTab] = React.useState("My Tasks");
  const [me, setMe] = React.useState(false);
  const [selClient, setSelClient] = React.useState("All");
  const [selProject, setSelProject] = React.useState("All");
  const [activeTask, setActiveTask] = React.useState(null);
  const [showCompleted, setShowCompleted] = React.useState(false);
  const tabs = [["My Tasks", 3], ["Board", 24]];

  const clientNames = ADM.CLIENTS.map((c) => c.name);
  const projectsForClient = selClient === "All" ? [] : ADM.PROJECTS.filter((p) => p.client === selClient);

  const filteredTasks = React.useMemo(() => {
    const all = flatTasks();
    if (selClient === "All") return all;
    return all.filter((t) => t.client === selClient && (selProject === "All" || t.project === selProject));
  }, [selClient, selProject]);

  const myTaskRows = React.useMemo(() => {
    const seen = new Set();
    const deduped = flatTasks().filter((t) => {
      if (seen.has(t.title)) return false;
      seen.add(t.title);
      if (!showCompleted && t.status === "complete") return false;
      return true;
    });
    const isCall = (t) => /schedule|call|session|zoom/.test((t.title || "").toLowerCase());
    const isUpload = (t) => /upload|submit|provide|create/.test((t.title || "").toLowerCase()) && !isCall(t);
    const isReview = (t) => /review/.test((t.title || "").toLowerCase()) && !isCall(t);
    const calls = deduped.filter(isCall);
    const uploads = deduped.filter(isUpload);
    const reviews = deduped.filter(isReview);
    const others = deduped.filter((t) => !isCall(t) && !isUpload(t) && !isReview(t));
    const picked = new Set();
    const result = [];
    [calls[0], uploads[0], reviews[0], others[0]].forEach((t) => {
      if (t) { picked.add(t.title); result.push(t); }
    });
    for (const t of deduped) {
      if (result.length >= 10) break;
      if (!picked.has(t.title)) { picked.add(t.title); result.push(t); }
    }
    return result;
  }, [showCompleted]);

  const TYPE_COLOR = (title) => {
    const tt = (title || "").toLowerCase();
    return /schedule|call|session|zoom/.test(tt) ? "#E57300" : /review/.test(tt) ? "var(--purple)" : "#00A06C";
  };
  const TYPE_ICON = (title) => {
    const tt = (title || "").toLowerCase();
    return /schedule|call|session|zoom/.test(tt) ? "Calendar" : /review/.test(tt) ? "Eye" : "FilePlus";
  };
  const STATUS_BORDER = { "Ready for Review": "#C8005A", "Action Required": "#854F0B", "Upload Needed": "#0F9E75", "Not Started": "#AAAAAA", "In Progress": "#185FA5", "Complete": "#0F9E75", "overdue": "#E53935", "in_progress": "#185FA5", "not_started": "#AAAAAA", "complete": "#0F9E75" };
  const STATUS_STYLE = { "Ready for Review": { bg: "#FBEAF0", fg: "#C8005A" }, "Action Required": { bg: "#FAEEDA", fg: "#854F0B" }, "Upload Needed": { bg: "#E8F5EE", fg: "#0F6E56" }, "Not Started": { bg: "#F1EFE8", fg: "#5F5E5A" }, "Complete": { bg: "#E8F5EE", fg: "#0F9E75" }, "In Progress": { bg: "#E6F1FB", fg: "#185FA5" }, "overdue": { bg: "#FDEAEA", fg: "#E53935" }, "in_progress": { bg: "#E6F1FB", fg: "#185FA5" }, "not_started": { bg: "#F1EFE8", fg: "#5F5E5A" }, "complete": { bg: "#E8F5EE", fg: "#0F9E75" } };
  const STATUS_LABEL = { "overdue": "Overdue", "in_progress": "In Progress", "not_started": "Not Started", "complete": "Complete" };
  const ACTION_LABEL = (title) => {
    const tt = (title || "").toLowerCase();
    return /schedule|call|session/.test(tt) ? "Book Session" : /review/.test(tt) ? "Review Draft" : "Create";
  };

  const TaskCards = ({ rows }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((t, i) => {
        const border = TYPE_COLOR(t.title);
        const badge = STATUS_STYLE[t.status] || { bg: "#F1EFE8", fg: "#5F5E5A" };
        const label = STATUS_LABEL[t.status] || t.status;
        const iconName = TYPE_ICON(t.title);
        const IconCmp = Icons[iconName] || Icons.FileText;
        const iconBg = border === "#E57300" ? "rgba(229,115,0,0.1)" : border === "var(--purple)" ? "rgba(130,17,255,0.08)" : "rgba(0,160,108,0.1)";
        return (
          <div key={i} className="task-card clickable" style={{ borderLeft: `3px solid ${border}` }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTask(t); }}>
            <div className="task-icon" style={{ background: iconBg, color: border }}><IconCmp size={16} /></div>
            <div className="task-body">
              <div className="task-title">
                {t.title}
                <span className="badge" style={{ background: badge.bg, color: badge.fg, fontSize: 10 }}>{label}</span>
              </div>
              {t.client && <div className="task-desc">{t.client} · {t.phase}</div>}
              {t.due && <div style={{ fontSize: 11, color: "#AAAAAA", marginTop: 2 }}>Due {t.due}</div>}
            </div>
            <div className="task-actions" onClick={(e) => e.stopPropagation()}>
              <button className="btn btn-secondary" style={{ fontSize: 12 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTask(t); }}>{ACTION_LABEL(t.title)}</button>
            </div>
          </div>
        );
      })}
      {rows.length === 0 && <EmptyState icon="CircleCheck" title="All caught up!" desc="No tasks assigned to you." />}
    </div>
  );

  const Board = () => {
    const cols = ["Not Started", "In Progress", "Overdue", "Complete"];
    const map = { "Not Started": "not_started", "In Progress": "in_progress", "Overdue": "overdue", "Complete": "complete" };
    const all = flatTasks();
    return (
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", overflowX: "auto" }} className="scrollbar-thin">
        {cols.map((col) => {
          const items = all.filter((t) => t.status === map[col]).slice(0, 6);
          return (
            <div key={col} style={{ flex: 1, minWidth: 240, background: "#F8F7FF", borderRadius: 10, padding: 12 }}>
              <div className="row between" style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{col}</span>
                <span className="badge" style={{ background: "#fff", color: "#888", fontSize: 10 }}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((t, i) => {
                  const typeColor = TYPE_COLOR(t.title);
                  return (
                    <div key={i} style={{ background: "#fff", border: "0.5px solid var(--border)", borderLeft: `3px solid ${typeColor}`, borderRadius: 8, padding: 12, cursor: "pointer" }} onClick={() => setActiveTask(t)}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t.title}</div>
                      <div className="row between" style={{ marginTop: 4 }}>
                        <div className="row" style={{ gap: 7 }}>
                          <span className="meta">{t.client}</span>
                          <span className="badge" style={{ background: ADM.phaseColor(t.phase) + "1f", color: ADM.phaseColor(t.phase), fontWeight: 600, fontSize: 10 }}>{t.phase}</span>
                        </div>
                      </div>
                      {t.due && <div style={{ fontSize: 11, color: "#AAAAAA", marginTop: 6 }}>Due {t.due}</div>}
                    </div>
                  );
                })}
                {items.length === 0 && <div className="meta" style={{ textAlign: "center", padding: "12px 0" }}>Empty</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const projectTasksToShow = selClient !== "All" && selProject !== "All" ? filteredTasks : null;

  return (
    <div>
      {activeTask && React.createElement(window.AdminTaskModal, { task: activeTask, onClose: () => setActiveTask(null) })}
      <AdminHeader icon="ListChecks" title="Tasks" subtitle="Task management across all projects" />
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "0 32px" }}>
        <div className="tabs" style={{ marginBottom: 0, border: "none" }}>
          {tabs.map(([t, n]) => <button key={t} className={"tab" + (t === tab ? " active" : "")} onClick={() => setTab(t)}>{t} <span style={{ color: "#BBB" }}>[{n}]</span></button>)}
        </div>
      </div>
      <FilterBar onSearch={null}
        right={<>
          <ToggleChip on={showCompleted} onToggle={() => setShowCompleted((v) => !v)} icon="CircleCheck" color="#00A06C">Show Completed</ToggleChip>
          {(selClient !== "All" || selProject !== "All") && (
            <button className="fpill" style={{ color: "#888", gap: 4 }} onClick={() => { setSelClient("All"); setSelProject("All"); }}>
              <Icons.X size={12} /> Clear filters
            </button>
          )}
          <button className="fpill" style={{ background: "var(--purple)", color: "#fff", borderColor: "var(--purple)" }} onClick={() => showToast("New task…")}><Icons.Plus size={13} /> New Task</button>
        </>}>
        <FilterPill label="Client" options={clientNames} active={selClient} onChange={(v) => { setSelClient(v); setSelProject("All"); }} />
        {selClient !== "All" && <FilterPill label="Project" options={projectsForClient.map((p) => p.name)} active={selProject} onChange={setSelProject} />}
        <FilterPill label="Phase" options={ADM.PHASES} active="All" onChange={() => {}} />
        <FilterPill label="Task Type" options={["Call", "Review", "Upload", "Deliverable", "Other"]} active="All" onChange={() => {}} />
      </FilterBar>
      {projectTasksToShow && (
        <div className="admin-body" style={{ paddingBottom: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-muted)", marginBottom: 10 }}>{selProject} — Tasks</div>
          <TaskCards rows={projectTasksToShow} />
        </div>
      )}
      <div className="admin-body">
        {tab === "My Tasks" && <TaskCards rows={myTaskRows} />}
        {tab === "Board" && <Board />}
      </div>
    </div>
  );
}

/* ---------------- DOCUMENTS ---------------- */
function AdminDocuments() {
  const { ADM, Icons } = window;
  const { showToast } = useAdmin();
  const [tab, setTab] = React.useState("All");
  const [search, setSearch] = React.useState("");
  const tabs = [["All", ADM.DOCS.length], ["Deliverables", ADM.DOCS.filter((d) => d.dir === "GHH to Client").length], ["Uploads", ADM.DOCS.filter((d) => d.dir === "Client to GHH").length]];

  let docs = ADM.DOCS.filter((d) =>
    (tab === "All" || (tab === "Deliverables" ? d.dir === "GHH to Client" : d.dir === "Client to GHH")) &&
    (!search || d.name.toLowerCase().includes(search.toLowerCase()))
  );
  const byClient = {};
  docs.forEach((d) => { (byClient[d.client] = byClient[d.client] || []).push(d); });

  return (
    <div>
      <AdminHeader icon="FileText" title="Documents" subtitle="All deliverables and uploads" action={{ label: "+ New Document", onClick: () => showToast("New document…") }} />
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "0 32px" }}>
        <div className="tabs" style={{ marginBottom: 0, border: "none" }}>
          {tabs.map(([t, n]) => <button key={t} className={"tab" + (t === tab ? " active" : "")} onClick={() => setTab(t)}>{t} <span style={{ color: "#BBB" }}>[{n}]</span></button>)}
        </div>
      </div>
      <FilterBar search={search} onSearch={setSearch}>
        <FilterPill label="Status" options={["not_started", "overdue", "complete", "in_progress"]} optionLabels={{ not_started: "Not Started", in_progress: "In Progress", overdue: "Overdue", complete: "Complete" }} active="All" onChange={() => {}} />
        <FilterPill label="Type" options={["Resume", "LinkedIn Audit", "Cover Letter Template"]} active="All" onChange={() => {}} />
      </FilterBar>
      <div className="admin-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {Object.keys(byClient).map((cl) => (
          <Card key={cl} style={{ padding: 0, overflow: "hidden" }}>
            <div className="row between" style={{ padding: "12px 16px", background: "#FAF9F6", borderBottom: "0.5px solid var(--border-light)" }}>
              <span className="row" style={{ gap: 8, fontSize: 13, fontWeight: 600 }}><Icons.ChevronDown size={14} /> {cl} <span className="meta">{byClient[cl].length} docs</span></span>
              <span className="meta">0/{byClient[cl].length} reviewed</span>
            </div>
            <table className="atable">
              <tbody>
                {byClient[cl].map((d) => (
                  <tr key={d.id} className="clickable">
                    <td style={{ fontWeight: 500 }}><span className="row" style={{ gap: 7 }}><Icons.FileText size={15} /> {d.name}</span></td>
                    <td><span className="badge" style={{ background: "var(--review-bg)", color: "var(--raspberry)" }}>{d.type}</span></td>
                    <td><APill status={d.status} /></td>
                    <td style={{ color: "#888" }}>{d.version}</td>
                    <td style={{ color: "#888" }}>{d.modified}</td>
                    <td onClick={(e) => e.stopPropagation()}><button className="icon-btn" style={{ border: "none" }}>⋯</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- SCHEDULE ---------------- */
function AdminSchedule() {
  const { ADM, Icons } = window;
  const { navigate, showToast } = useAdmin();
  const [clientFilter, setClientFilter] = React.useState("All");
  const [projectFilter, setProjectFilter] = React.useState("All");
  const [typeFilter, setTypeFilter] = React.useState("All");
  const [range, setRange] = React.useState("Week");
  const [cancelConfirm, setCancelConfirm] = React.useState(null);
  const [calMonth, setCalMonth] = React.useState(new Date(2026, 3, 1));
  const [pillPopover, setPillPopover] = React.useState(null);

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const MeetingCard = ({ m }) => {
    const cancelling = cancelConfirm === m.id;
    return (
      <Card style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 36, height: 36, borderRadius: 99, background: "rgba(130,17,255,0.08)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icons.Video size={16} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div onClick={() => navigate("#/admin/projects/" + (m.projectId || "p1"))}
              style={{ fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--purple)"; e.currentTarget.style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.textDecoration = "none"; }}>
              {m.title}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{m.client}{m.when ? " · " + m.when : ""}</div>
            {cancelling && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Cancel this meeting?</span>
                <button onClick={() => { setCancelConfirm(null); showToast("Meeting cancelled."); }}
                  style={{ fontSize: 12, fontWeight: 500, color: "#E53935", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Yes, cancel</button>
                <button onClick={() => setCancelConfirm(null)}
                  style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Keep it</button>
              </div>
            )}
          </div>
          {!cancelling && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <button className="btn btn-primary" style={{ borderRadius: 8, padding: "0 14px", height: 34, fontSize: 12, fontWeight: 600 }} onClick={() => showToast("Opening Zoom…")}>Join Call</button>
              <button className="btn" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "transparent", borderRadius: 8, padding: "0 12px", height: 34, fontSize: 12, cursor: "pointer" }} onClick={() => showToast("Reschedule…")}>Reschedule</button>
              <button onClick={() => setCancelConfirm(m.id)}
                style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--text-muted)", padding: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#E53935"; e.currentTarget.style.borderColor = "#E53935"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}>
                <Icons.X size={14} />
              </button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const calMeetings = [
    { id: "cm1", date: new Date(2026, 4, 1), time: "2:00 PM", clientName: "Maya Chen", title: "Working Session #2", projectId: "p1", needsReview: false },
    { id: "cm2", date: new Date(2026, 4, 3), time: "11:00 AM", clientName: "Sarah Klein", title: "Working Session #1", projectId: "p2", needsReview: false },
    { id: "cm3", date: new Date(2026, 4, 6), time: "9:30 AM", clientName: "Dana Okafor", title: "Working Session #2", projectId: "p4", needsReview: false },
    { id: "cm4", date: new Date(2026, 4, 7), time: "2:00 PM", clientName: "Maya Chen", title: "Résumé Review Call", projectId: "p1", needsReview: true },
    { id: "cm5", date: new Date(2026, 4, 12), time: "4:00 PM", clientName: "Tessa Wright", title: "Intro Call", projectId: "p3", needsReview: false },
  ];

  const CalendarGrid = () => {
    const [currentDate, setCurrentDate] = React.useState(new Date(2026, 4, 1));
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array(firstDay).fill(null).concat(
      Array.from({ length: daysInMonth }, (_, i) => i + 1)
    );
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    const today = new Date();

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            style={{ width: 32, height: 32, border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--purple)"; e.currentTarget.style.color = "var(--purple)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "inherit"; }}>
            <Icons.ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 600, minWidth: 160 }}>{monthName}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            style={{ width: 32, height: 32, border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--purple)"; e.currentTarget.style.color = "var(--purple)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "inherit"; }}>
            <Icons.ChevronRight size={14} />
          </button>
          <button onClick={() => setCurrentDate(new Date(2026, 4, 1))}
            style={{ marginLeft: "auto", border: "1px solid var(--border)", borderRadius: 20, padding: "4px 14px", fontSize: 12, cursor: "pointer", background: "white" }}>Today</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", gap: 1, background: "var(--border)" }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} style={{ background: "#F8F7FF", padding: "8px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{d}</div>
          ))}
          {days.map((day, i) => {
            const isToday = day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            const dayMeetings = day ? calMeetings.filter(m => {
              return m.date.getDate() === day && m.date.getMonth() === month && m.date.getFullYear() === year;
            }) : [];
            const shown = dayMeetings.slice(0, 2);
            const extra = dayMeetings.length - 2;
            return (
              <div key={i} style={{ background: !day ? "#FAFAFA" : isToday ? "#F8F6FF" : "white", minHeight: 100, padding: 8, opacity: day ? 1 : 0.4 }}>
                {day && (
                  <>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isToday ? "var(--purple)" : "transparent", color: isToday ? "white" : "var(--text-primary)", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{day}</div>
                    {shown.map(m => (
                      <div key={m.id}
                        onClick={() => { setPillPopover(pillPopover === m.id ? null : m.id); }}
                        style={{ position: "relative", background: m.needsReview ? "rgba(229,57,53,0.08)" : "rgba(130,17,255,0.08)", borderLeft: "2px solid " + (m.needsReview ? "#E53935" : "var(--purple)"), borderRadius: 4, padding: "3px 6px", fontSize: 11, color: m.needsReview ? "#E53935" : "var(--purple)", fontWeight: 500, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>
                        <Icons.Video size={10} style={{ flexShrink: 0, display: "inline", marginRight: 3 }} />{m.time} · {m.clientName}
                        {pillPopover === m.id && (
                          <div style={{ position: "fixed", zIndex: 200, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.14)", padding: 14, width: 240, left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
                            onClick={(e) => e.stopPropagation()}>
                            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{m.title}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>{m.clientName} · {m.time}</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                              <button className="btn btn-primary" style={{ borderRadius: 8, padding: "0 12px", height: 30, fontSize: 12 }} onClick={() => showToast("Opening Zoom…")}>Join Call</button>
                              <button className="btn" style={{ border: "1px solid var(--border)", background: "transparent", borderRadius: 8, padding: "0 10px", height: 30, fontSize: 12, cursor: "pointer" }} onClick={() => showToast("Reschedule…")}>Reschedule</button>
                              <button style={{ width: 30, height: 30, border: "1px solid var(--border)", borderRadius: 8, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }} onClick={() => { setPillPopover(null); showToast("Meeting cancelled."); }}><Icons.X size={12} /></button>
                            </div>
                            <button onClick={() => { setPillPopover(null); navigate("#/admin/projects/" + m.projectId); }}
                              style={{ fontSize: 12, color: "var(--purple)", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 500 }}>→ View Project</button>
                          </div>
                        )}
                      </div>
                    ))}
                    {extra > 0 && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>+{extra} more</div>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };


  return (
    <div>
      <AdminHeader icon="Calendar" title="Schedule" subtitle="Upcoming meetings" action={{ label: "↻ Sync Zoom", onClick: () => showToast("Syncing Zoom…") }} />
      <div className="admin-body">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <FilterPill label="All Clients" options={ADM.CLIENTS.map((c) => c.name)} active={clientFilter} onChange={setClientFilter} />
          <FilterPill label="All Projects" options={ADM.PROJECTS.map((p) => p.name)} active={projectFilter} onChange={setProjectFilter} />
          <FilterPill label="All Types" options={["Working Session", "Intro Call", "Review Call"]} active={typeFilter} onChange={setTypeFilter} />
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {["Today", "Week", "Month"].map((r) => (
              <button key={r} onClick={() => setRange(r)}
                style={{ border: range === r ? "1px solid var(--purple)" : "1px solid var(--border)", borderRadius: 20, padding: "5px 14px", fontSize: 12, cursor: "pointer", background: range === r ? "var(--purple)" : "transparent", color: range === r ? "#fff" : "var(--text-secondary)", fontFamily: "inherit" }}>{r}</button>
            ))}
          </div>
        </div>

        {range === "Month" ? <CalendarGrid /> : (
          <div>
            {ADM.MEETINGS_REVIEW.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#B85C00" }}>Needs Review</span>
                  <span className="badge" style={{ background: "rgba(255,100,0,0.1)", color: "#B85C00" }}>{ADM.MEETINGS_REVIEW.length}</span>
                </div>
                {ADM.MEETINGS_REVIEW.map((m) => <MeetingCard key={m.id} m={m} />)}
              </div>
            )}
            {ADM.MEETINGS_WEEKS.map((wk) => (
              <div key={wk.week} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 10 }}>{wk.week}</div>
                {wk.items.map((m) => <MeetingCard key={m.id} m={m} />)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- INBOX ---------------- */
function AdminInbox() {
  const { Icons } = window;
  const { showToast } = useAdmin();
  const [tab, setTab] = React.useState("All");
  return (
    <div>
      <AdminHeader icon="Inbox" title="Inbox" subtitle="Threaded conversations" />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ width: 260, flex: "0 0 260px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "#fff" }}>
          <div style={{ padding: 14 }}><button className="btn btn-primary btn-block" onClick={() => showToast("New thread…")}><Icons.Plus size={14} /> New Thread</button></div>
          <div className="tabs" style={{ padding: "0 14px", marginBottom: 10 }}>{["All", "Documents", "General"].map((t) => <button key={t} className={"tab" + (t === tab ? " active" : "")} onClick={() => setTab(t)}>{t} <span style={{ color: "#BBB" }}>[0]</span></button>)}</div>
          <div style={{ padding: "0 14px 14px" }}><input className="input" placeholder="Search threads..." /></div>
          <div style={{ flex: 1 }}><EmptyState icon="MessageCircle" title="No threads found." /></div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EmptyState icon="MessageCircle" title="Select a thread to view messages" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- TEAM ---------------- */
function AdminTeam() {
  const { ADM, Icons } = window;
  const [search, setSearch] = React.useState("");
  const roleBg = { admin: "#8211FF", writer: "#00A06C", editor: "#FF6B35" };
  const rows = ADM.TEAM.filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <AdminHeader icon="User" title="Team" subtitle="Team members and workload" />
      <div className="admin-body">
        <div style={{ marginBottom: 14, maxWidth: 320, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#AAA" }}><Icons.Search size={15} /></span>
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table className="atable">
            <thead><tr>{["Name", "Email", "Roles", "Small / Big", "Status", ""].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((t) => {
                return (
                  <tr key={t.id} className="clickable">
                    <td><div className="row" style={{ gap: 9 }}><Avatar initials={t.initials} color={t.color} size={28} /><span style={{ fontWeight: 600 }}>{t.name}</span></div></td>
                    <td style={{ color: "#888" }}>{t.email}</td>
                    <td><div className="row" style={{ gap: 5 }}>{t.roles.map((r) => <span key={r} className="badge" style={{ background: roleBg[r], color: "#fff", fontSize: 10 }}>{r}</span>)}</div></td>
                    <td><div className="row" style={{ gap: 6 }}><span>{t.cap}</span>{t.flagged && <span title="Flagged" style={{ color: "#E53935", display: "flex" }}><Icons.Flag size={14} /></span>}</div></td>
                    <td><APill status={t.status} /></td>
                    <td onClick={(e) => e.stopPropagation()}><button className="icon-btn" style={{ border: "none" }}>⋯</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- PACKAGES ---------------- */
function AdminPackages() {
  const { ADM } = window;
  const { showToast } = useAdmin();
  const PkgCard = ({ p }) => (
    <div style={{ background: "#fff", border: "0.5px solid var(--border)", borderRadius: 10, padding: 16, transition: "border-color .15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--purple)")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
      <div className="row between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
        <div className="row" style={{ gap: 6 }}>
          {p.active && <span className="badge" style={{ background: "rgba(0,160,108,0.12)", color: "#00A06C", fontSize: 10 }}>Active</span>}
          <span className="badge" style={{ background: p.alc ? "rgba(200,0,90,0.1)" : "var(--purple-light)", color: p.alc ? "var(--raspberry)" : "var(--purple)", fontSize: 10 }}>{p.alc ? "À La Carte" : "Package"}</span>
        </div>
      </div>
      <div className="meta" style={{ marginBottom: 12, lineHeight: 1.4 }}>{p.tagline}</div>
      <div className="row between">
        <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{p.price}</span>
        <span className="meta">{p.weeks}</span>
      </div>
    </div>
  );
  return (
    <div>
      <AdminHeader icon="Briefcase" title="Packages" subtitle="Service packages and add-ons" action={{ label: "+ New Package", onClick: () => showToast("New package…") }} />
      <div className="admin-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {ADM.PACKAGES.map((p) => <PkgCard key={p.id} p={p} />)}
        </div>
        <div className="row between" style={{ margin: "26px 0 14px" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>À La Carte</span>
          <button className="btn btn-secondary" onClick={() => showToast("New à la carte item…")}>+ New À La Carte Item</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {ADM.ALACARTE.map((a) => (
            <div key={a.id} style={{ background: "#fff", border: "0.5px solid var(--border)", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{a.name}</div>
              <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{a.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- TASK TEMPLATES ---------------- */
function AdminTemplates() {
  const { ADM, Icons } = window;
  const { showToast } = useAdmin();
  const tabs = Object.keys(ADM.TEMPLATES);
  const [tab, setTab] = React.useState(tabs[0]);
  const [search, setSearch] = React.useState("");
  const rows = (ADM.TEMPLATES[tab] || []).filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <AdminHeader icon="ListChecks" title="Task Templates" subtitle="Reusable task templates by package" action={{ label: "+ New Template", onClick: () => showToast("New template…") }} />
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "0 32px" }}>
        <div className="tabs" style={{ marginBottom: 0, border: "none" }}>{tabs.map((t) => <button key={t} className={"tab" + (t === tab ? " active" : "")} onClick={() => setTab(t)}>{t}</button>)}</div>
      </div>
      <FilterBar search={search} onSearch={setSearch} />
      <div className="admin-body">
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {rows.length ? (
            <table className="atable">
              <thead><tr>{["Title", "Week", "Responsibility", "Duration", "Client Visible", "Task Type", "Order", "Active"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((t, i) => (
                  <tr key={i} className="clickable">
                    <td style={{ fontWeight: 500 }}>{t.title}</td>
                    <td style={{ color: "#888" }}>{t.week}</td>
                    <td><span className="badge" style={{ background: "#F1EFE8", color: "#5F5E5A" }}>{t.resp}</span></td>
                    <td style={{ color: "#888" }}>{t.dur}</td>
                    <td>{t.vis ? <span style={{ color: "#00A06C" }}><Icons.Check size={15} /></span> : <span style={{ color: "#CCC" }}><Icons.X size={14} /></span>}</td>
                    <td style={{ color: "#888" }}>{t.type}</td>
                    <td style={{ color: "#888" }}>{t.order}</td>
                    <td>{t.active ? <APill status="Active" /> : <APill status="Inactive" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState icon="ListChecks" title="No templates found." desc="Add a template for this package." />}
        </Card>
      </div>
    </div>
  );
}

/* ---------------- KNOWLEDGE BASE ---------------- */
function AdminKB() {
  const { ADM, Icons } = window;
  const { showToast } = useAdmin();
  const tabs = Object.keys(ADM.KB);
  const [tab, setTab] = React.useState(tabs[0]);
  const items = ADM.KB[tab] || [];
  return (
    <div>
      <AdminHeader icon="Lightbulb" title="Knowledge Base" subtitle="Internal resource library" action={{ label: "+ Upload Resource", onClick: () => showToast("Upload resource…") }} />
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "0 32px" }}>
        <div className="tabs" style={{ marginBottom: 0, border: "none" }}>{tabs.map((t) => <button key={t} className={"tab" + (t === tab ? " active" : "")} onClick={() => setTab(t)}>{t} <span style={{ color: "#BBB" }}>[{ADM.KB[t].length}]</span></button>)}</div>
      </div>
      <div className="admin-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {items.map((r, i) => (
            <div key={i} style={{ background: "#fff", border: "0.5px solid var(--border)", borderRadius: 10, padding: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--purple-light)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}><Icons.FileText size={16} /></div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{r.title}</div>
              <div className="row between">
                <span className="badge" style={{ background: "var(--review-bg)", color: "var(--raspberry)", fontSize: 10 }}>{r.type}</span>
                <span className="small">{r.date}</span>
              </div>
              <div className="row" style={{ gap: 6, marginTop: 12 }}>
                <button className="icon-btn" onClick={() => showToast("Edit")}><Icons.Settings size={14} /></button>
                <button className="icon-btn" onClick={() => showToast("Download")}><Icons.Download size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminTasks, AdminDocuments, AdminSchedule, AdminInbox, AdminTeam, AdminPackages, AdminTemplates, AdminKB });

/* Shared upload area used inside AdminTaskModal for Upload-type tasks */
function UploadSection({ showToast, Icons, MOCK_UPLOADS }) {
  const [dragOver, setDragOver] = React.useState(false);
  const [uploaded, setUploaded] = React.useState(MOCK_UPLOADS || []);
  const inputRef = React.useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    const newEntries = files.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(0) + " KB", date: "just now" }));
    setUploaded(prev => [...newEntries, ...prev]);
    showToast(`${files.length} file${files.length > 1 ? "s" : ""} uploaded.`);
  };

  const handleBrowse = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newEntries = files.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(0) + " KB", date: "just now" }));
    setUploaded(prev => [...newEntries, ...prev]);
    showToast(`${files.length} file${files.length > 1 ? "s" : ""} uploaded.`);
    e.target.value = "";
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 6 }}>Upload Files</div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current && inputRef.current.click()}
        style={{ border: `2px dashed ${dragOver ? "#00A06C" : "var(--border)"}`, borderRadius: 10, padding: "24px 16px", background: dragOver ? "rgba(0,160,108,0.05)" : "#F4FBF7", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", transition: "border-color 150ms, background 150ms", marginBottom: uploaded.length ? 10 : 0 }}>
        <span style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,160,108,0.1)", color: "#00A06C", display: "flex", alignItems: "center", justifyContent: "center" }}><Icons.Upload size={18} /></span>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#00A06C" }}>Drop files here or browse</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>PDF, DOCX, PNG, JPG — max 20 MB</div>
        </div>
        <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={handleBrowse} />
      </div>
      {uploaded.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {uploaded.map((f, i) => (
            <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(0,160,108,0.08)", color: "#00A06C", display: "flex", alignItems: "center", justifyContent: "center" }}><Icons.FileText size={14} /></span>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</div><div className="meta">{f.size} · Uploaded {f.date}</div></div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={(e) => { e.stopPropagation(); showToast("Downloading…"); }}
                  style={{ display: "flex", alignItems: "center", gap: 5, border: "1.5px solid var(--border)", color: "var(--text-muted)", background: "transparent", borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>
                  <Icons.Download size={12} /> Download
                </button>
                <button onClick={(e) => { e.stopPropagation(); setUploaded(prev => prev.filter((_, j) => j !== i)); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, border: "1.5px solid var(--border)", color: "#E53935", background: "transparent", borderRadius: 99, fontSize: 12, cursor: "pointer" }}>
                  <Icons.X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Expose a standalone AdminTaskModal for use from other admin screens */
window.AdminTaskModal = function StandaloneAdminTaskModal({ task, onClose }) {
  const { Icons } = window;
  const { showToast } = useAdmin();
  const [status, setStatus] = React.useState(task.status || "not_started");
  const [description, setDescription] = React.useState("");
  const [commentFilter, setCommentFilter] = React.useState("All");
  const [commentText, setCommentText] = React.useState("");
  const [comments, setComments] = React.useState([
    { id: 1, who: "Kate Wade", init: "KW", role: "Team", when: "2h ago", text: "Draft v1 is with the editor. Targeting client delivery by Thursday." },
    { id: 2, who: "Maya Chen", init: "MC", role: "Client", when: "5h ago", text: "Looks great so far! Can we adjust the executive summary section?" },
  ]);
  const [editingComment, setEditingComment] = React.useState(null);
  const [editCommentText, setEditCommentText] = React.useState("");
  const [hoverComment, setHoverComment] = React.useState(null);
  const [bookingLink, setBookingLink] = React.useState("");
  const DEFAULT_SUBS_SA = [
    { id: "d0", done: false, assignee: "Editor" },
    { id: "d1", done: false, assignee: "Writer" },
  ];
  const [subs, setSubs] = React.useState(
    (task?.sub?.length ? task.sub : DEFAULT_SUBS_SA).map((s, i) => ({ ...s, id: s.id ?? i, done: s.done || false }))
  );

  const tt = (task.title || "").toLowerCase();
  const isCall = /schedule|call|session|zoom/.test(tt);
  const isUpload = /upload|submit|provide|create/.test(tt) && !isCall;

  const STATUS_OPTIONS = ["not_started", "in_progress", "overdue", "complete"];
  const STATUS_LABELS = { not_started: "Not Started", in_progress: "In Progress", overdue: "Overdue", complete: "Complete" };

  const MOCK_UPLOADS = [
    { name: "Resume_v1.pdf", size: "142 KB", date: "Apr 3" },
    { name: "LinkedIn_screenshot.png", size: "88 KB", date: "Apr 3" },
  ];

  const subRows = [
    { init: "KW", role: "Editor", name: "Kate Wade", sub: subs.find(s => (s.assignee || "").includes("Editor")) || subs[0] },
    { init: "MB", role: "Writer", name: "Mimi Bishop", sub: subs.find(s => (s.assignee || "").includes("Writer")) || subs[1] },
  ].filter(r => r.sub);

  const filteredComments = commentFilter === "All" ? comments : comments.filter(c => c.role === commentFilter);

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    setComments(prev => [{ id: Date.now(), who: "Lourdes H-D", init: "LH", role: "Team", when: "just now", text: commentText.trim() }, ...prev]);
    setCommentText("");
  };

  const FieldLabel = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 6 }}>{children}</div>
  );

  React.useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: 560, maxHeight: "90vh", overflowY: "auto", padding: "28px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.16)" }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20, flex: 1, lineHeight: 1.3 }}>{task.title || "Untitled task"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {task.client && <span className="meta">{task.client}{task.phase ? " · " + task.phase : ""}</span>}
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}><Icons.X size={20} /></button>
          </div>
        </div>

        {/* Status + Due Date */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 180 }}>
            <FieldLabel>Status</FieldLabel>
            <select value={status} onChange={e => setStatus(e.target.value)}
              style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff", outline: "none", cursor: "pointer", fontFamily: "inherit" }}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>Due Date</FieldLabel>
            <input type="text" defaultValue={task.due || ""} placeholder="e.g. May 3"
              style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
        </div>

        {/* Go to Zoom — Call tasks only */}
        {isCall && (
          <div style={{ marginBottom: 20 }}>
            <button onClick={() => showToast("Opening Zoom…")}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--purple)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" }}>
              <Icons.Video size={15} /> Go to Zoom
            </button>
          </div>
        )}

        {/* Type-specific section */}
        {isCall ? null : isUpload ? (
          <div style={{ marginBottom: 20 }}>
            <FieldLabel>Documents</FieldLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", background: "#F8F7FF" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(130,17,255,0.08)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icons.FileText size={15} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Version to work</div><div className="meta">Working draft</div></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => showToast("Opening Google Docs…")}
                      style={{ border: "1.5px solid var(--purple)", color: "var(--purple)", background: "transparent", borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>Open in Google Docs</button>
                    <button onClick={() => showToast("Downloading…")}
                      style={{ display: "flex", alignItems: "center", gap: 6, border: "1.5px solid var(--purple)", color: "var(--purple)", background: "transparent", borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
                      <Icons.Download size={13} /> Download
                    </button>
                  </div>
                </div>
                <button onClick={() => showToast("Published to client.")}
                  style={{ fontSize: 12, fontWeight: 600, color: "#C8005A", background: "#FFF5F9", border: "1.5px solid #F5C0D2", borderRadius: 8, padding: "7px 14px", cursor: "pointer", width: "100%", textAlign: "center" }}>
                  Publish to client
                </button>
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", background: "#FAF9F7" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,160,108,0.08)", color: "#00A06C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icons.Eye size={15} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Version to review</div><div className="meta">Client-facing copy</div></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => showToast("Opening Google Docs…")}
                      style={{ border: "1.5px solid var(--border)", color: "var(--text-secondary)", background: "transparent", borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>Open in Google Docs</button>
                    <button onClick={() => showToast("Downloading…")}
                      style={{ display: "flex", alignItems: "center", gap: 6, border: "1.5px solid var(--border)", color: "var(--text-secondary)", background: "transparent", borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
                      <Icons.Download size={13} /> Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <FieldLabel>Documents</FieldLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", background: "#F8F7FF" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(130,17,255,0.08)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icons.FileText size={15} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Version to work</div><div className="meta">Working draft</div></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => showToast("Opening Google Docs…")}
                      style={{ border: "1.5px solid var(--purple)", color: "var(--purple)", background: "transparent", borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>Open in Google Docs</button>
                    <button onClick={() => showToast("Downloading…")}
                      style={{ display: "flex", alignItems: "center", gap: 6, border: "1.5px solid var(--purple)", color: "var(--purple)", background: "transparent", borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
                      <Icons.Download size={13} /> Download
                    </button>
                  </div>
                </div>
                <button onClick={() => showToast("Published to client.")}
                  style={{ fontSize: 12, fontWeight: 600, color: "#C8005A", background: "#FFF5F9", border: "1.5px solid #F5C0D2", borderRadius: 8, padding: "7px 14px", cursor: "pointer", width: "100%", textAlign: "center" }}>
                  Publish to client
                </button>
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", background: "#FAF9F7" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,160,108,0.08)", color: "#00A06C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icons.Eye size={15} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Version to review</div><div className="meta">Client-facing copy</div></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => showToast("Opening Google Docs…")}
                      style={{ border: "1.5px solid var(--border)", color: "var(--text-secondary)", background: "transparent", borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>Open in Google Docs</button>
                    <button onClick={() => showToast("Downloading…")}
                      style={{ display: "flex", alignItems: "center", gap: 6, border: "1.5px solid var(--border)", color: "var(--text-secondary)", background: "transparent", borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
                      <Icons.Download size={13} /> Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subtasks — hidden for Call tasks */}
        {!isCall && subRows.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <FieldLabel>Subtasks</FieldLabel>
            <div style={{ background: "#F8F7FF", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {subRows.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 48 }}>
                  <Avatar initials={r.init} color="var(--purple)" size={28} />
                  <div style={{ minWidth: 50 }}><span style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.role}</span></div>
                  <div style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{r.name}</div>
                  {r.sub.done ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => setSubs(prev => prev.map(s => s.id === r.sub.id ? { ...s, done: false } : s))}
                        style={{ fontSize: 12, color: "#E53935", background: "transparent", border: "none", cursor: "pointer", fontWeight: 500 }}>Reopen</button>
                      <span className="badge" style={{ background: "rgba(0,160,108,0.12)", color: "#00A06C", fontWeight: 600 }}>Complete</span>
                      <span style={{ width: 20, height: 20, borderRadius: 99, background: "#00A06C", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icons.Check size={11} style={{ color: "#fff" }} /></span>
                    </div>
                  ) : (
                    <button onClick={() => setSubs(prev => prev.map(s => s.id === r.sub.id ? { ...s, done: true } : s))}
                      style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px", height: 30, fontSize: 12, color: "var(--text-muted)", background: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--purple)"; e.currentTarget.style.color = "var(--purple)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                      Mark as Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <FieldLabel>Notes (Internal)</FieldLabel>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add internal notes..."
            style={{ width: "100%", minHeight: 80, border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.5 }} />
        </div>

        {/* Comments */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>Comments</div>
            <div style={{ display: "flex", gap: 4 }}>
              {["All","Client","Team"].map(f => (
                <button key={f} onClick={() => setCommentFilter(f)}
                  style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: commentFilter === f ? "none" : "1px solid var(--border)", background: commentFilter === f ? "var(--purple)" : "transparent", color: commentFilter === f ? "#fff" : "var(--text-muted)", cursor: "pointer", fontFamily: "inherit" }}>{f}</button>
              ))}
            </div>
          </div>
          {filteredComments.map((cm) => (
            <div key={cm.id} style={{ display: "flex", gap: 10, marginBottom: 14, position: "relative" }}
              onMouseEnter={() => setHoverComment(cm.id)} onMouseLeave={() => setHoverComment(null)}>
              <Avatar initials={cm.init} color={cm.role === "Client" ? "#C8005A" : "var(--purple)"} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}><span style={{ fontWeight: 600 }}>{cm.who}</span><span style={{ fontSize: 11, color: "var(--text-muted)" }}> · {cm.when}</span></div>
                {editingComment === cm.id ? (
                  <div style={{ marginTop: 4 }}>
                    <textarea autoFocus value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)}
                      style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 6, padding: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <button className="btn btn-primary" style={{ borderRadius: 6, padding: "0 12px", height: 28, fontSize: 12 }} onClick={() => { setComments(prev => prev.map(c => c.id === cm.id ? { ...c, text: editCommentText } : c)); setEditingComment(null); }}>Save</button>
                      <button className="btn btn-ghost" style={{ padding: "0 12px", height: 28, fontSize: 12 }} onClick={() => setEditingComment(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, marginTop: 2, lineHeight: 1.5, color: "var(--text-primary)" }}>{cm.text}</div>
                )}
              </div>
              {hoverComment === cm.id && !editingComment && (
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", flexDirection: "column", position: "absolute", right: 0, top: 0, background: "#fff", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", minWidth: 80, zIndex: 10 }}>
                    <button style={{ padding: "6px 14px", fontSize: 12, border: "none", background: "none", cursor: "pointer", textAlign: "left" }} onClick={() => { setEditCommentText(cm.text); setEditingComment(cm.id); }}>Edit</button>
                    <button style={{ padding: "6px 14px", fontSize: 12, border: "none", background: "none", cursor: "pointer", color: "#E53935", textAlign: "left" }} onClick={() => setComments(prev => prev.filter(c => c.id !== cm.id))}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 8 }}>
            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..."
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
              rows={2}
              style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none" }} />
            <button onClick={handleSendComment} disabled={!commentText.trim()}
              style={{ width: 34, height: 34, borderRadius: 99, background: "var(--purple)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: commentText.trim() ? 1 : 0.35, flexShrink: 0 }}>
              <Icons.Send size={14} />
            </button>
          </div>
        </div>

        {/* Footer — no Publish to client */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button className="btn btn-ghost" style={{ color: "var(--purple)", fontSize: 13 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ borderRadius: 8, padding: "0 20px", height: 38, fontSize: 13, fontWeight: 600 }}
            onClick={() => { showToast("Changes saved."); onClose(); }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};
