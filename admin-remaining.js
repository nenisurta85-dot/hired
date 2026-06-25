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
  const [tab, setTab] = React.useState("By Client");
  const [me, setMe] = React.useState(false);
  const tabs = [["My Tasks", 3], ["By Client", ADM.PROJECTS.length], ["Board", 24]];

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
                {items.map((t, i) => (
                  <div key={i} style={{ background: "#fff", border: "0.5px solid var(--border)", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t.title}</div>
                    <div className="row between">
                      <div className="row" style={{ gap: 7 }}>
                        <span className="meta">{t.client}</span>
                        <span className="badge" style={{ background: ADM.phaseColor(t.phase) + "1f", color: ADM.phaseColor(t.phase), fontWeight: 600, fontSize: 10 }}>{t.phase}</span>
                      </div>
                      <Avatar initials={initials2(t.assignee)} color="#B9B4C7" size={20} />
                    </div>
                  </div>
                ))}
                {items.length === 0 && <div className="meta" style={{ textAlign: "center", padding: "12px 0" }}>Empty</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const [openClients, setOpenClients] = React.useState({});
  const toggleClient = (name) => setOpenClients((prev) => ({ ...prev, [name]: !prev[name] }));

  const clientGroups = ADM.CLIENTS.map((c) => ({
    client: c,
    projects: ADM.PROJECTS.filter((p) => p.client === c.name),
  })).filter((g) => g.projects.length > 0);

  const ByClient = () => (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      {clientGroups.map(({ client, projects }, i) => {
        const allTasks = projects.reduce((acc, p) => { const pr = ADM.phaseProgress(p.phase); return { done: acc.done + pr.done, total: acc.total + pr.total }; }, { done: 0, total: 0 });
        const pct = allTasks.total ? (allTasks.done / allTasks.total) * 100 : 0;
        const isOpen = openClients[client.name];
        return (
          <div key={client.id} style={{ borderTop: i ? "0.5px solid var(--border-light)" : "none" }}>
            <div className="row clickable" style={{ gap: 14, padding: "13px 16px", cursor: "pointer" }} onClick={() => toggleClient(client.name)}>
              <span style={{ width: 9, height: 9, borderRadius: 99, background: "#00A06C", flex: "0 0 9px" }} />
              <span style={{ fontSize: 13, fontWeight: 600, width: 160 }}>{client.name}</span>
              <span className="pbar" style={{ flex: 1, height: 8 }}><div style={{ width: pct + "%", background: "var(--purple)" }} /></span>
              <span className="meta" style={{ width: 80, textAlign: "right" }}>{allTasks.done}/{allTasks.total} tasks</span>
              <span style={{ color: "#AAA", display: "flex", transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}><Icons.ChevronDown size={14} /></span>
            </div>
            {isOpen && (
              <div style={{ padding: "0 16px 12px 36px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="label" style={{ marginBottom: 4 }}>PROJECTS</div>
                {projects.map((p) => {
                  const pr = ADM.phaseProgress(p.phase);
                  const ppct = pr.total ? (pr.done / pr.total) * 100 : 0;
                  return (
                    <div key={p.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", boxShadow: "var(--shadow-card)" }}>
                      <div className="row between" style={{ marginBottom: 6 }}>
                        <div className="row" style={{ gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name || p.client + " Project"}</span>
                          <span className="badge" style={{ background: ADM.phaseColor(p.phase) + "1f", color: ADM.phaseColor(p.phase), fontWeight: 600 }}>{p.phase}</span>
                          <APill status={p.status} />
                        </div>
                        <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => useAdmin}>View Project ↗</button>
                      </div>
                      <div className="meta" style={{ marginBottom: 8 }}>Writer: {p.writer} · Producer: {p.producer || "—"} · Started {p.start}</div>
                      <div className="row" style={{ gap: 12, alignItems: "center" }}>
                        <span className="pbar" style={{ flex: 1, height: 6 }}><div style={{ width: ppct + "%", background: "var(--purple)", height: "100%", borderRadius: 4 }} /></span>
                        <span className="meta" style={{ whiteSpace: "nowrap" }}>{pr.done}/{pr.total} tasks</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );

  const TaskTable = ({ rows }) => (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <table className="atable">
        <thead><tr>{["", "Title", "Client", "Assignee", "Due", "Status", "Phase"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((t, i) => (
            <tr key={i} className="clickable">
              <td style={{ width: 30 }}><span style={{ width: 18, height: 18, borderRadius: 99, border: "1.5px solid #CFC9DD", display: "inline-block" }} /></td>
              <td style={{ fontWeight: 500 }}>{t.title}</td>
              <td style={{ color: "#888" }}>{t.client}</td>
              <td><div className="row" style={{ gap: 7, color: "#888", fontSize: 12 }}><Avatar initials={initials2(t.assignee)} color="#B9B4C7" size={20} /> {t.assignee}</div></td>
              <td style={{ color: "#888", fontSize: 12 }}>{t.due}</td>
              <td><APill status={t.status} /></td>
              <td><span className="badge" style={{ background: ADM.phaseColor(t.phase) + "1f", color: ADM.phaseColor(t.phase), fontWeight: 600 }}>{t.phase}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <EmptyState icon="CircleCheck" title="All caught up!" desc="No deliverables pending review." />}
    </Card>
  );

  return (
    <div>
      <AdminHeader icon="ListChecks" title="Tasks" subtitle="Task management across all projects" />
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "0 32px" }}>
        <div className="tabs" style={{ marginBottom: 0, border: "none" }}>
          {tabs.map(([t, n]) => <button key={t} className={"tab" + (t === tab ? " active" : "")} onClick={() => setTab(t)}>{t} <span style={{ color: "#BBB" }}>[{n}]</span></button>)}
        </div>
      </div>
      <FilterBar onSearch={null}
        right={<>
          <ToggleChip on={me} onToggle={() => setMe((v) => !v)} icon="User" color="var(--raspberry)">Me</ToggleChip>
          <button className="fpill" style={{ background: "var(--purple)", color: "#fff", borderColor: "var(--purple)" }} onClick={() => showToast("New task…")}><Icons.Plus size={13} /> New Task</button>
        </>}>
        <FilterPill label="Client" options={ADM.CLIENTS.map((c) => c.name)} active="All" onChange={() => {}} />
        <FilterPill label="Phase" options={ADM.PHASES} active="All" onChange={() => {}} />
        <FilterPill label="Task Type" options={["Deliverable", "Call", "Client Action", "Internal"]} active="All" onChange={() => {}} />
      </FilterBar>
      <div className="admin-body">
        {tab === "My Tasks" && <TaskTable rows={flatTasks().filter((t) => t.assignee === "Lourdes H-D")} />}
        {tab === "By Client" && <ByClient />}
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
