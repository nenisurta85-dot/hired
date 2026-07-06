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
  const [selClient, setSelClient] = React.useState("All");
  const [selProject, setSelProject] = React.useState("All");
  const [selPhase, setSelPhase] = React.useState("All");
  const [selTaskType, setSelTaskType] = React.useState("All");
  const [activeTask, setActiveTask] = React.useState(null);
  const [showNewTask, setShowNewTask] = React.useState(false);
  const [showCompleted, setShowCompleted] = React.useState(false);
  const [period, setPeriod] = React.useState("This Week");
  const tabs = [["My Tasks", 3], ["Board", 24]];

  const clientNames = ADM.CLIENTS.map((c) => c.name);
  const projectsForClient = selClient === "All" ? [] : ADM.PROJECTS.filter((p) => p.client === selClient);

  const filteredTasks = React.useMemo(() => {
    const all = flatTasks();
    if (selClient === "All") return all;
    return all.filter((t) => t.client === selClient && (selProject === "All" || t.project === selProject));
  }, [selClient, selProject]);

  const TYPE_COLOR = (title) => {
    const tt = (title || "").toLowerCase();
    return /schedule|call|session|zoom/.test(tt) ? "#E57300" : /review/.test(tt) ? "var(--purple)" : "#00A06C";
  };
  const TYPE_ICON = (title) => {
    const tt = (title || "").toLowerCase();
    return /schedule|call|session|zoom/.test(tt) ? "Calendar" : /review/.test(tt) ? "Eye" : "FilePlus";
  };
  const STATUS_STYLE = { "Ready for Review": { bg: "#FBEAF0", fg: "#C8005A" }, "Action Required": { bg: "#FAEEDA", fg: "#854F0B" }, "Upload Needed": { bg: "#E8F5EE", fg: "#0F6E56" }, "Not Started": { bg: "#F1EFE8", fg: "#5F5E5A" }, "Complete": { bg: "#E8F5EE", fg: "#0F9E75" }, "In Progress": { bg: "#E6F1FB", fg: "#185FA5" }, "overdue": { bg: "#FDEAEA", fg: "#E53935" }, "in_progress": { bg: "#E6F1FB", fg: "#185FA5" }, "not_started": { bg: "#F1EFE8", fg: "#5F5E5A" }, "complete": { bg: "#E8F5EE", fg: "#0F9E75" } };
  const STATUS_LABEL = { "overdue": "Overdue", "in_progress": "In Progress", "not_started": "Not Started", "complete": "Complete" };
  const ACTION_LABEL = (title) => {
    const tt = (title || "").toLowerCase();
    return /schedule|call|session/.test(tt) ? "Book Session" : /review/.test(tt) ? "Review Draft" : "Create";
  };

  /* ---- date helpers ---- */
  const parseTaskDate = (due) => {
    if (!due) return null;
    const now = new Date();
    const d = new Date(due + " " + now.getFullYear());
    if (isNaN(d)) return null;
    // if result is more than 6 months in the past, assume it's a near-future date next year
    if (now - d > 1000 * 60 * 60 * 24 * 180) return new Date(due + " " + (now.getFullYear() + 1));
    return d;
  };
  const getToday = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  /* overdue by actual date: due date is before today AND task is not complete */
  const isDateOverdue = (t) => {
    if (t.status === "complete") return false;
    const d = parseTaskDate(t.due);
    if (!d) return false;
    return d < getToday();
  };
  const isTaskInPeriod = (t) => {
    if (isDateOverdue(t)) return true; // overdue always shown regardless of period
    const d = parseTaskDate(t.due);
    if (!d) return true;
    const today = getToday();
    if (period === "Today") {
      const todayEnd = new Date(today); todayEnd.setDate(today.getDate() + 1);
      return d >= today && d < todayEnd;
    }
    if (period === "This Week") {
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + (7 - today.getDay()));
      return d >= today && d <= weekEnd;
    }
    if (period === "This Month") {
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() && d >= today;
    }
    return true;
  };
  const matchesTaskType = (t) => {
    if (selTaskType === "All") return true;
    const tt = (t.title || "").toLowerCase();
    if (selTaskType === "Call") return /schedule|call|session|zoom/.test(tt);
    if (selTaskType === "Review") return /review/.test(tt) && !/schedule|call|session|zoom/.test(tt);
    if (selTaskType === "Upload") return /upload|submit|provide/.test(tt);
    if (selTaskType === "Deliverable") return /create|write|draft|build/.test(tt);
    return true;
  };

  const [selStatus, setSelStatus] = React.useState("All");
  const [expandedWeeks, setExpandedWeeks] = React.useState({ 0: true, 1: true, 2: true, 3: true });

  /* ---- base filtered tasks (period + client/phase/type filters) ---- */
  const baseTasks = React.useMemo(() => {
    const seen = new Set();
    return flatTasks().filter((t) => {
      if (seen.has(t.title)) return false;
      seen.add(t.title);
      if (selClient !== "All" && t.client !== selClient) return false;
      if (selProject !== "All" && t.project !== selProject) return false;
      if (selPhase !== "All" && t.phase !== selPhase) return false;
      if (!matchesTaskType(t)) return false;
      if (!showCompleted && t.status === "complete") return false;
      return true;
    });
  }, [selClient, selProject, selPhase, selTaskType, showCompleted]);

  /* tasks visible in this period (overdue always included) */
  const periodTasks = React.useMemo(() => baseTasks.filter(isTaskInPeriod), [baseTasks, period]);

  /* apply status filter pill */
  const visibleTasks = React.useMemo(() => {
    if (selStatus === "All") return periodTasks;
    if (selStatus === "Overdue") return periodTasks.filter(t => isDateOverdue(t));
    const map = { "In Progress": "in_progress", "Not Started": "not_started", "Complete": "complete" };
    return periodTasks.filter(t => t.status === (map[selStatus] || selStatus));
  }, [periodTasks, selStatus]);

  /* status groups:
     - Overdue group  = tasks where due date is past (date-overdue), shown with red styling, max 3 + "view all"
     - In Progress    = tasks with status=in_progress that are NOT date-overdue, clean style
     - Not Started    = tasks with status=not_started that are NOT date-overdue, clean style
     When a status filter pill is active, show a flat list instead of groups */
  const statusGroups = React.useMemo(() => {
    const overdueItems = visibleTasks.filter(t => isDateOverdue(t));
    const defs = [
      { key: "overdue",     label: "Overdue",     headerBg: "rgba(229,57,53,0.08)", headerFg: "#C0241F", icon: "⚠️",  tasks: overdueItems, isOverdueGroup: true },
      { key: "in_progress", label: "In Progress",  headerBg: "rgba(24,95,165,0.06)",  headerFg: "#185FA5", icon: null, tasks: visibleTasks.filter(t => t.status === "in_progress") },
      { key: "not_started", label: "Not Started",  headerBg: "rgba(170,170,170,0.08)", headerFg: "#5F5E5A", icon: null, tasks: visibleTasks.filter(t => t.status === "not_started") },
    ];
    if (showCompleted) defs.push({ key: "complete", label: "Complete", headerBg: "rgba(15,158,117,0.07)", headerFg: "#0F7A5C", icon: null, tasks: visibleTasks.filter(t => t.status === "complete") });
    return defs.filter(g => g.tasks.length > 0);
  }, [visibleTasks, showCompleted]);

  /* week buckets for This Month accordion */
  const weekBuckets = React.useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const buckets = [0, 1, 2, 3].map(w => {
      const start = new Date(monthStart); start.setDate(1 + w * 7);
      const end = new Date(start); end.setDate(start.getDate() + 7);
      return { label: "Week " + (w + 1), start, end, tasks: [] };
    });
    visibleTasks.forEach(t => {
      if (isDateOverdue(t)) { buckets[0].tasks.push(t); return; }
      const d = parseTaskDate(t.due);
      if (!d) { buckets[0].tasks.push(t); return; }
      const wi = buckets.findIndex(b => d >= b.start && d < b.end);
      if (wi >= 0) buckets[wi].tasks.push(t);
      else if (d < buckets[0].start) buckets[0].tasks.push(t);
      else buckets[3].tasks.push(t);
    });
    return buckets.filter(b => b.tasks.length > 0);
  }, [visibleTasks]);

  /* ---- Task card components ----
     showOverdue=true  → red border, pink bg, ⚠️ icon, "Overdue" badge + status badge
     showOverdue=false → clean card with only the status badge (In Progress / Not Started / etc.) */
  const TaskCard = ({ t, compact, showOverdue }) => {
    const cardBorder = showOverdue ? "#E53935" : TYPE_COLOR(t.title);
    const statusBadge = STATUS_STYLE[t.status] || { bg: "#F1EFE8", fg: "#5F5E5A" };
    const statusLabel = STATUS_LABEL[t.status] || t.status;
    const iconName = TYPE_ICON(t.title);
    const IconCmp = Icons[iconName] || Icons.FileText;
    const typeColor = TYPE_COLOR(t.title);
    const iconBg = showOverdue ? "rgba(229,57,53,0.1)" : (typeColor === "#E57300" ? "rgba(229,115,0,0.1)" : typeColor === "var(--purple)" ? "rgba(130,17,255,0.08)" : "rgba(0,160,108,0.1)");
    const iconColor = showOverdue ? "#E53935" : typeColor;
    const cardBg = showOverdue ? "rgba(229,57,53,0.03)" : "#fff";

    const dueFg = showOverdue ? "#E53935" : "var(--text-primary)";
    const dueFw = showOverdue ? 600 : 400;

    if (compact) return (
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: cardBg, border: "0.5px solid " + (showOverdue ? "rgba(229,57,53,0.2)" : "var(--border)"), borderLeft: `3px solid ${cardBorder}`, cursor: "pointer", transition: "background .1s" }}
        onClick={() => setActiveTask(t)}
        onMouseEnter={e => e.currentTarget.style.background = showOverdue ? "rgba(229,57,53,0.06)" : "var(--bg)"}
        onMouseLeave={e => e.currentTarget.style.background = cardBg}>
        {showOverdue && <span style={{ fontSize: 12, flexShrink: 0 }}>⚠️</span>}
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
        {t.due && <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 12, color: dueFg, fontWeight: dueFw, whiteSpace: "nowrap", pointerEvents: "none" }}>Due date: <span style={{ fontWeight: 600 }}>{t.due}</span></span>}
        {showOverdue && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "#FDEAEA", color: "#C0241F", whiteSpace: "nowrap", flexShrink: 0 }}>Overdue</span>}
        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: statusBadge.bg, color: statusBadge.fg, whiteSpace: "nowrap", flexShrink: 0 }}>{statusLabel}</span>
        <button className="btn btn-secondary" style={{ fontSize: 11, padding: "3px 10px", flexShrink: 0 }}
          onClick={e => { e.stopPropagation(); setActiveTask(t); }}>{ACTION_LABEL(t.title)}</button>
      </div>
    );
    return (
      <div className="task-card clickable" style={{ position: "relative", borderLeft: `3px solid ${cardBorder}`, background: cardBg, border: showOverdue ? "0.5px solid rgba(229,57,53,0.18)" : undefined }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTask(t); }}>
        <div className="task-icon" style={{ background: iconBg, color: iconColor }}><IconCmp size={16} /></div>
        <div className="task-body">
          <div className="task-title" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {showOverdue && <span style={{ fontSize: 13, lineHeight: 1 }}>⚠️</span>}
            <span>{t.title}</span>
            {showOverdue && <span className="badge" style={{ background: "#FDEAEA", color: "#C0241F", fontSize: 10 }}>Overdue</span>}
            <span className="badge" style={{ background: statusBadge.bg, color: statusBadge.fg, fontSize: 10 }}>{statusLabel}</span>
          </div>
          {t.client && <div className="task-desc">{t.client} · {t.phase}</div>}
        </div>
        {t.due && <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 12, color: dueFg, fontWeight: dueFw, whiteSpace: "nowrap", pointerEvents: "none" }}>Due date: <span style={{ fontWeight: 600 }}>{t.due}</span></span>}
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-secondary" style={{ fontSize: 12 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTask(t); }}>{ACTION_LABEL(t.title)}</button>
        </div>
      </div>
    );
  };

  /* week accordion row */
  const WeekRow = ({ bucket, idx }) => {
    const open = !!expandedWeeks[idx];
    const toggle = () => setExpandedWeeks(prev => ({ ...prev, [idx]: !prev[idx] }));
    const overdueCount = bucket.tasks.filter(t => isDateOverdue(t)).length;
    const inProgressCount = bucket.tasks.filter(t => t.status === "in_progress").length;
    const summary = [
      overdueCount ? overdueCount + " overdue" : null,
      inProgressCount ? inProgressCount + " in progress" : null,
      (!overdueCount && !inProgressCount) ? bucket.tasks.length + " tasks" : null,
    ].filter(Boolean).join(" · ");
    return (
      <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", background: open ? "var(--bg)" : "#fff", cursor: "pointer", userSelect: "none", transition: "background .12s" }}
          onClick={toggle}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
          onMouseLeave={e => e.currentTarget.style.background = open ? "var(--bg)" : "#fff"}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", minWidth: 70 }}>{bucket.label}</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", flex: 1 }}>{summary}</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: overdueCount ? "rgba(229,57,53,0.1)" : "var(--purple-light)", color: overdueCount ? "#C0241F" : "var(--purple)" }}>{bucket.tasks.length}</span>
          <span style={{ display: "flex", color: "var(--text-muted)", transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>{React.createElement(Icons.ChevronDown, { size: 14 })}</span>
        </div>
        {open && (
          <div style={{ padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 6, borderTop: "0.5px solid var(--border)" }}>
            {bucket.tasks.map((t, i) => <TaskCard key={i} t={t} compact showOverdue={isDateOverdue(t)} />)}
          </div>
        )}
      </div>
    );
  };

  const STATUS_PILLS = ["All", "Overdue", "In Progress", "Not Started", "Complete"];

  const MyTasksView = () => (
    <div>
      {/* Content */}
      {visibleTasks.length === 0
        ? <EmptyState icon="CircleCheck" title="All caught up!" desc="No tasks for this period." />
        : period === "This Month"
          ? weekBuckets.map((b, i) => <WeekRow key={i} bucket={b} idx={i} />)
          : selStatus !== "All"
            /* Specific pill selected — flat list, no grouping, no overdue treatment */
            ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {visibleTasks.map((t, i) => <TaskCard key={i} t={t} showOverdue={selStatus === "Overdue"} />)}
              </div>
            /* "All" pill — grouped view */
            : statusGroups.map(g => {
                const OVERDUE_MAX = 3;
                const shown = g.isOverdueGroup ? g.tasks.slice(0, OVERDUE_MAX) : g.tasks;
                const hiddenCount = g.isOverdueGroup ? g.tasks.length - OVERDUE_MAX : 0;
                return (
                  <div key={g.key} style={{ marginBottom: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: g.headerBg, marginBottom: 10 }}>
                      {g.icon && <span style={{ fontSize: 13 }}>{g.icon}</span>}
                      <span style={{ fontSize: 12, fontWeight: 700, color: g.headerFg }}>{g.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: g.headerFg, opacity: 0.7 }}>· {g.tasks.length}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {shown.map((t, i) => <TaskCard key={i} t={t} showOverdue={!!g.isOverdueGroup} />)}
                    </div>
                    {hiddenCount > 0 && (
                      <button onClick={() => setSelStatus("Overdue")}
                        style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: "#C0241F", background: "none", border: "none", cursor: "pointer", padding: "4px 0", display: "flex", alignItems: "center", gap: 4 }}>
                        View all {g.tasks.length} overdue →
                      </button>
                    )}
                  </div>
                );
              })
      }
    </div>
  );

  const Board = () => {
    const cols = ["Not Started", "In Progress", "Overdue", "Complete"];
    const map = { "Not Started": "not_started", "In Progress": "in_progress", "Complete": "complete" };
    // Apply attribute + period filters
    let boardTasks = periodTasks;
    if (selStatus !== "All") {
      if (selStatus === "Overdue") boardTasks = boardTasks.filter(t => isDateOverdue(t));
      else if (selStatus === "In Progress") boardTasks = boardTasks.filter(t => t.status === "in_progress");
      else if (selStatus === "Not Started") boardTasks = boardTasks.filter(t => t.status === "not_started");
      else if (selStatus === "Complete") boardTasks = boardTasks.filter(t => t.status === "complete");
    }
    // Overdue column = tasks with past due dates (regardless of status field)
    const overdueTasks = baseTasks.filter(t => isDateOverdue(t) && t.status !== "complete");
    return (
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", overflowX: "auto" }} className="scrollbar-thin">
        {cols.map((col) => {
          const isOverdueCol = col === "Overdue";
          const allItems = isOverdueCol ? overdueTasks : boardTasks.filter((t) => t.status === map[col]);
          const items = isOverdueCol ? allItems.slice(0, 3) : allItems;
          const totalCount = allItems.length;
          return (
            <div key={col} style={{ flex: 1, minWidth: 240, background: "#F8F7FF", borderRadius: 10, padding: 12 }}>
              <div className="row between" style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: isOverdueCol ? "#C0241F" : "inherit" }}>{col}</span>
                <span className="badge" style={{ background: isOverdueCol ? "#FDEAEA" : "#fff", color: isOverdueCol ? "#C0241F" : "#888", fontSize: 10 }}>{totalCount}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((t, i) => {
                  const typeColor = TYPE_COLOR(t.title);
                  const cardBorder = isOverdueCol ? "1px solid rgba(229,57,53,0.35)" : "0.5px solid var(--border)";
                  const cardBorderLeft = isOverdueCol ? "3px solid #E53935" : `3px solid ${typeColor}`;
                  const cardBg = isOverdueCol ? "rgba(229,57,53,0.04)" : "#fff";
                  return (
                    <div key={i} style={{ background: cardBg, border: cardBorder, borderLeft: cardBorderLeft, borderRadius: 8, padding: 12, cursor: "pointer" }} onClick={() => setActiveTask(t)}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 5, marginBottom: 6 }}>
                        {isOverdueCol && <span style={{ flexShrink: 0, fontSize: 13 }}>⚠️</span>}
                        <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{t.title}</div>
                      </div>
                      <div className="row" style={{ gap: 7, flexWrap: "wrap", marginTop: 4 }}>
                        <span className="meta">{t.client}</span>
                        <span className="badge" style={{ background: ADM.phaseColor(t.phase) + "1f", color: ADM.phaseColor(t.phase), fontWeight: 600, fontSize: 10 }}>{t.phase}</span>
                      </div>
                      {t.due && <div style={{ fontSize: 11, color: isOverdueCol ? "#E53935" : "#AAAAAA", fontWeight: isOverdueCol ? 600 : 400, marginTop: 6 }}>Due {t.due}</div>}
                    </div>
                  );
                })}
                {items.length === 0 && <div className="meta" style={{ textAlign: "center", padding: "12px 0" }}>Empty</div>}
                {isOverdueCol && totalCount > 3 && (
                  <button onClick={() => { setTab("My Tasks"); setSelStatus("Overdue"); }}
                    style={{ width: "100%", marginTop: 4, padding: "8px 0", border: "1px solid rgba(229,57,53,0.3)", borderRadius: 8, background: "transparent", color: "#C0241F", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    View all {totalCount} overdue →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const hasFilters = selClient !== "All" || selProject !== "All" || selPhase !== "All" || selTaskType !== "All";

  return (
    <div>
      {activeTask && React.createElement(window.AdminTaskModal, { task: activeTask, onClose: () => setActiveTask(null) })}
      {showNewTask && React.createElement(window.NewTaskModal, { onClose: () => setShowNewTask(false) })}
      <AdminHeader icon="ListChecks" title="Tasks" subtitle="Task management across all projects" />

      {/* Tier 1 — View tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "0 32px" }}>
        <div className="tabs" style={{ marginBottom: 0, border: "none" }}>
          {tabs.map(([t, n]) => <button key={t} className={"tab" + (t === tab ? " active" : "")} onClick={() => setTab(t)}>{t} <span style={{ color: "#BBB" }}>[{n}]</span></button>)}
        </div>
      </div>

      {/* Tier 2 — Attribute filters (left) · actions (right) */}
      <div style={{ background: "#fff", borderBottom: "0.5px solid var(--border)", padding: "10px 32px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <FilterPill label="Client" options={clientNames} active={selClient} onChange={(v) => { setSelClient(v); setSelProject("All"); }} />
        {selClient !== "All" && <FilterPill label="Project" options={projectsForClient.map((p) => p.name)} active={selProject} onChange={setSelProject} />}
        <FilterPill label="Phase" options={ADM.PHASES} active={selPhase} onChange={setSelPhase} />
        <FilterPill label="Task Type" options={["Call", "Review", "Upload", "Deliverable", "Other"]} active={selTaskType} onChange={setSelTaskType} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <ToggleChip on={showCompleted} onToggle={() => setShowCompleted((v) => !v)} icon="CircleCheck" color="#00A06C">Show Completed</ToggleChip>
          {hasFilters && (
            <button className="fpill" style={{ color: "#888", gap: 4 }} onClick={() => { setSelClient("All"); setSelProject("All"); setSelPhase("All"); setSelTaskType("All"); }}>
              <Icons.X size={12} /> Clear filters
            </button>
          )}
          <div style={{ width: 1, height: 22, background: "var(--border)", flexShrink: 0 }} />
          <button className="fpill" style={{ background: "var(--purple)", color: "#fff", borderColor: "var(--purple)" }} onClick={() => setShowNewTask(true)}><Icons.Plus size={13} /> New Task</button>
        </div>
      </div>

      {/* Tier 3 — Time range (left) · Status pills + count (right) */}
      {(tab === "My Tasks" || tab === "Board") && (() => {
        const countMap = { "Overdue": periodTasks.filter(t=>isDateOverdue(t)).length, "In Progress": periodTasks.filter(t=>t.status==="in_progress").length, "Not Started": periodTasks.filter(t=>t.status==="not_started").length, "Complete": periodTasks.filter(t=>t.status==="complete").length };
        const PERIODS = ["Today", "This Week", "This Month"];
        return (
          <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "10px 32px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Segmented time control */}
            <div style={{ display: "flex", flexShrink: 0 }}>
              {PERIODS.map((p, i) => (
                <button key={p} onClick={() => setPeriod(p)}
                  style={{ fontSize: 12, fontWeight: 600, padding: "5px 14px", border: "1.5px solid", cursor: "pointer", transition: "all .12s",
                    background: period === p ? "var(--purple)" : "#fff",
                    color: period === p ? "#fff" : "var(--text-secondary)",
                    borderColor: period === p ? "var(--purple)" : "var(--border)",
                    borderRadius: i === 0 ? "999px 0 0 999px" : i === PERIODS.length - 1 ? "0 999px 999px 0" : 0,
                    marginLeft: i > 0 ? -1 : 0, position: "relative", zIndex: period === p ? 1 : 0 }}>
                  {p}
                </button>
              ))}
            </div>
            {/* Status pills + total count */}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              {STATUS_PILLS.map(s => {
                const active = selStatus === s;
                const count = s === "All" ? periodTasks.length : countMap[s] || 0;
                if (s !== "All" && count === 0) return null;
                return (
                  <button key={s} onClick={() => setSelStatus(s)}
                    style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 99, border: "1.5px solid", cursor: "pointer", transition: "all .12s",
                      background: active ? "var(--purple)" : "#fff",
                      color: active ? "#fff" : "var(--text-secondary)",
                      borderColor: active ? "var(--purple)" : "var(--border)" }}>
                    {s}{s !== "All" ? " · " + count : ""}
                  </button>
                );
              })}
              <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 4, whiteSpace: "nowrap" }}>{visibleTasks.length} task{visibleTasks.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        );
      })()}

      <div className="admin-body">
        {tab === "My Tasks" && <MyTasksView />}
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
    const [showReason, setShowReason] = React.useState(false);

    if (m.cancelled) {
      return (
        <Card style={{ marginBottom: 8, opacity: 0.72, background: "#FAFAFA", border: "1px solid rgba(229,57,53,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 36, height: 36, borderRadius: 99, background: "rgba(229,57,53,0.08)", color: "#C0241F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icons.Video size={16} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", textDecoration: "line-through" }}>{m.title}</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(229,57,53,0.1)", color: "#C0241F", borderRadius: 20, padding: "2px 9px", letterSpacing: "0.03em" }}>Cancelled by client</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{m.client}{m.when ? " · " + m.when : ""}</div>
              {showReason && (
                <div style={{ marginTop: 8, background: "rgba(229,57,53,0.06)", border: "1px solid rgba(229,57,53,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#7A2020", lineHeight: 1.5 }}>
                  {m.cancelReason}
                </div>
              )}
            </div>
            <div style={{ flexShrink: 0 }}>
              <button onClick={() => setShowReason(r => !r)}
                style={{ border: "1px solid rgba(229,57,53,0.4)", borderRadius: 8, padding: "0 14px", height: 34, fontSize: 12, fontWeight: 600, cursor: "pointer", background: showReason ? "rgba(229,57,53,0.08)" : "transparent", color: "#C0241F", fontFamily: "inherit" }}>
                {showReason ? "Hide reason" : "View reason"}
              </button>
            </div>
          </div>
        </Card>
      );
    }

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
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.client}{m.when ? " · " + m.when : ""}</span>
              <button onClick={() => navigate("#/admin/projects/" + (m.projectId || "p1"))}
                style={{ fontSize: 11, fontWeight: 600, color: "var(--purple)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 3 }}>
                <Icons.FolderOpen size={11} /> View Project →
              </button>
            </div>
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
/* ---- Team Member modal (create / edit) ---- */
function TeamMemberModal({ member, onSave, onClose }) {
  const { Icons } = window;
  const isNew = !member;
  const COLORS = ["#8211FF","#C8005A","#185FA5","#0F9E75","#854F0B","#E57300","#1A8A9A","#555"];
  const initials = (name) => name.split(" ").map(w => w[0] || "").join("").toUpperCase().slice(0,2);

  const [form, setForm] = React.useState(member ? { ...member } : {
    name: "", email: "", roles: [], status: "Active", color: COLORS[0], cap: "0 / 5",
  });
  const [rolesOpen, setRolesOpen] = React.useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleRole = (r) => set("roles", form.roles.includes(r) ? form.roles.filter(x => x !== r) : [...form.roles, r]);

  const valid = form.name.trim() && form.email.trim() && form.roles.length > 0;

  const handleSave = () => {
    if (!valid) return;
    const updated = { ...form, initials: initials(form.name), id: member?.id || "tm_" + Date.now() };
    onSave(updated);
  };

  const ROLE_COLORS = { admin: "#8211FF", writer: "#00A06C", "admin assistant": "#185FA5" };
  const ROLE_LABELS = { admin: "Admin", writer: "Writer", "admin assistant": "Admin Assistant" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} onClick={onClose} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 16, width: 480, maxHeight: "90vh", overflowY: "auto", padding: "28px 28px 24px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        {/* Header */}
        <div className="row between" style={{ marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{isNew ? "New Team Member" : "Edit Member"}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{isNew ? "Add someone to the team" : "Update member details"}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", display: "flex" }}><Icons.X size={20} /></button>
        </div>

        {/* Avatar preview */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: 99, background: form.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
            {form.name ? initials(form.name) : "?"}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>Avatar colour</div>
            <div style={{ display: "flex", gap: 7 }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => set("color", c)}
                  style={{ width: 22, height: 22, borderRadius: 99, background: c, border: form.color === c ? "2.5px solid #fff" : "2px solid transparent", outline: form.color === c ? `2.5px solid ${c}` : "none", cursor: "pointer", transition: "outline .1s" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Full Name *</label>
            <input className="input" placeholder="e.g. Jane Smith" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Email *</label>
            <input className="input" type="email" placeholder="jane@getherhired.com" value={form.email} onChange={e => set("email", e.target.value)} />
          </div>

          {/* Roles */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>Roles * <span style={{ fontWeight: 400, color: "#aaa" }}>(select all that apply)</span></label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["admin","writer","admin assistant"].map(r => {
                const active = form.roles.includes(r);
                return (
                  <button key={r} onClick={() => toggleRole(r)}
                    style={{ padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${active ? ROLE_COLORS[r] : "var(--border)"}`, background: active ? ROLE_COLORS[r] : "transparent", color: active ? "#fff" : "var(--text-muted)", transition: "all .12s" }}>
                    {ROLE_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Status</label>
            <select className="input" value={form.status} onChange={e => set("status", e.target.value)}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="row" style={{ gap: 10, marginTop: 28, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!valid} style={{ opacity: valid ? 1 : 0.45 }}>
            {isNew ? "Add Member" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Row actions dropdown ---- */
function TeamRowMenu({ member, onEdit, onToggleStatus, onDelete }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6, fontSize: 18, lineHeight: 1, color: "#888", transition: "background .1s" }}
        onMouseEnter={e => e.currentTarget.style.background = "var(--purple-light)"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}>⋯</button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "110%", background: "#fff", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160, zIndex: 200, overflow: "hidden" }}>
          {[
            { label: "Edit member", icon: "Edit", action: onEdit },
            { label: member.status === "Active" ? "Deactivate" : "Reactivate", icon: "Lock", action: onToggleStatus, color: member.status === "Active" ? "#E57300" : "#00A06C" },
            { label: "Remove", icon: "X", action: onDelete, color: "#E53935" },
          ].map(item => (
            <button key={item.label} onClick={(e) => { e.stopPropagation(); setOpen(false); item.action(); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: item.color || "var(--text-primary)", textAlign: "left", transition: "background .1s" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              {window.Icons[item.icon] && React.createElement(window.Icons[item.icon], { size: 14 })} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Team member expanded detail card ---- */
function TeamMemberDetail({ member, navigate }) {
  const { ADM, Icons } = window;

  const STATUS_STYLE = {
    "On Track":    { bg: "rgba(0,160,108,0.1)",  fg: "#007A52" },
    "Behind":      { bg: "rgba(229,83,53,0.1)",  fg: "#C0391C" },
    "At Risk":     { bg: "rgba(229,115,0,0.1)",  fg: "#A05800" },
    "Overdue":     { bg: "rgba(229,57,53,0.1)",  fg: "#C0241F" },
    "90-day":      { bg: "rgba(26,138,154,0.1)", fg: "#0F6B78" },
    "not_started": { bg: "#F1EFE8", fg: "#5F5E5A" },
    "in_progress": { bg: "#E6F1FB", fg: "#185FA5" },
    "overdue":     { bg: "#FDEAEA", fg: "#E53935" },
    "complete":    { bg: "#E8F5EE", fg: "#0F9E75" },
  };
  const STATUS_LABEL = {
    "not_started": "Not Started",
    "in_progress": "In Progress",
    "overdue":     "Overdue",
    "complete":    "Complete",
  };

  const SBadge = ({ s }) => {
    const st = STATUS_STYLE[s] || { bg: "#F1EFE8", fg: "#888" };
    const label = STATUS_LABEL[s] || s;
    return <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 99, padding: "2px 8px", background: st.bg, color: st.fg, whiteSpace: "nowrap" }}>{label}</span>;
  };

  const projects = (ADM.PROJECTS || []).filter(p =>
    p.writer === member.name || p.editor === member.name
  );

  const allTasks = Object.values(ADM.TASKS_BY_PHASE || {}).flat();
  const tasks = allTasks.filter(t => t.assignee === member.name && t.status !== "complete").slice(0, 8);

  const ColHeader = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--text-muted)", marginBottom: 10 }}>{children}</div>
  );

  return (
    <tr style={{ background: "#F8F7FB" }}>
      <td colSpan={6} style={{ padding: "16px 20px", borderTop: "1px dashed var(--border)" }}>
        <div>
          <ColHeader>Active Projects</ColHeader>
          {projects.length === 0
            ? <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>No active projects</div>
            : projects.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid var(--border-light)", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                  <span style={{ display: "flex", color: "var(--text-muted)", flexShrink: 0 }}><Icons.FolderOpen size={13} /></span>
                  <button onClick={() => navigate("#/admin/projects/" + p.id)}
                    style={{ fontSize: 13, fontWeight: 600, color: "var(--purple)", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </button>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>({p.writer === member.name ? "Writer" : "Editor"})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <SBadge s={p.status} />
                  <button onClick={() => navigate("#/admin/projects/" + p.id)}
                    style={{ fontSize: 11, fontWeight: 600, color: "var(--purple)", background: "none", border: "none", cursor: "pointer", padding: 0, whiteSpace: "nowrap" }}>
                    View →
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </td>
    </tr>
  );
}

/* ---- AdminTeam page ---- */
function AdminTeam() {
  const { Icons } = window;
  const { navigate, showToast } = useAdmin();
  const [members, setMembers] = React.useState([...window.ADM.TEAM]);
  const [search, setSearch] = React.useState("");
  const [modal, setModal] = React.useState(null); // null | "new" | member-object
  const [expandedId, setExpandedId] = React.useState(null);

  React.useEffect(() => {
    if (window._expandTeamMember) {
      const target = window.ADM.TEAM.find(m =>
        m.name === window._expandTeamMember ||
        m.name.toLowerCase().includes(window._expandTeamMember.toLowerCase())
      );
      if (target) setExpandedId(target.id);
      window._expandTeamMember = null;
    }
  }, []);

  const ROLE_BG = { admin: "#8211FF", writer: "#00A06C", editor: "#185FA5", "admin assistant": "#185FA5" };
  const ROLE_DISPLAY = { admin: "Admin", writer: "Writer", editor: "Admin Assistant", "admin assistant": "Admin Assistant" };

  const rows = members.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (updated) => {
    setMembers(prev => {
      const idx = prev.findIndex(m => m.id === updated.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next; }
      return [...prev, updated];
    });
    showToast(modal === "new" ? `${updated.name} added to team` : "Member updated");
    setModal(null);
  };

  const toggleStatus = (id) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: m.status === "Active" ? "Inactive" : "Active" } : m));
    showToast("Status updated");
  };

  const removeMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    showToast("Member removed");
  };

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div>
      {modal && (
        <TeamMemberModal
          member={modal === "new" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      <AdminHeader icon="User" title="Team" subtitle="Team members and workload"
        action={{ label: "+ New Member", onClick: () => setModal("new") }} />
      <div className="admin-body">
        <div style={{ marginBottom: 14, maxWidth: 320, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#AAA" }}><Icons.Search size={15} /></span>
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table className="atable">
            <thead>
              <tr>{["Name","Email","Roles","Capacity","Status",""].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map(t => (
                <React.Fragment key={t.id}>
                  <tr className="clickable" onClick={() => toggleExpand(t.id)}
                    style={{ background: expandedId === t.id ? "rgba(130,17,255,0.03)" : undefined }}>
                    <td>
                      <div className="row" style={{ gap: 9 }}>
                        <Avatar initials={t.initials} color={t.color} size={28} />
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                      </div>
                    </td>
                    <td style={{ color: "#888", fontSize: 13 }}>{t.email}</td>
                    <td>
                      <div className="row" style={{ gap: 5 }}>
                        {t.roles.map(r => <span key={r} className="badge" style={{ background: ROLE_BG[r], color: "#fff", fontSize: 10 }}>{ROLE_DISPLAY[r] || r}</span>)}
                      </div>
                    </td>
                    <td>
                      <div className="row" style={{ gap: 6 }}>
                        <span style={{ fontSize: 13 }}>{t.cap}</span>
                        {t.flagged && <span title="At capacity" style={{ color: "#E53935", display: "flex" }}><Icons.Flag size={14} /></span>}
                      </div>
                    </td>
                    <td><APill status={t.status} /></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="row" style={{ gap: 4, justifyContent: "flex-end" }}>
                        <span style={{ display: "flex", color: "#AAA", transition: "transform .2s", transform: expandedId === t.id ? "rotate(180deg)" : "rotate(0deg)" }}>
                          <Icons.ChevronDown size={15} />
                        </span>
                        <TeamRowMenu
                          member={t}
                          onEdit={() => setModal(t)}
                          onToggleStatus={() => toggleStatus(t.id)}
                          onDelete={() => removeMember(t.id)}
                        />
                      </div>
                    </td>
                  </tr>
                  {expandedId === t.id && <TeamMemberDetail member={t} navigate={navigate} />}
                </React.Fragment>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>No team members match your search</td></tr>
              )}
            </tbody>
          </table>
        </Card>

        {/* Summary bar */}
        <div className="row" style={{ gap: 20, marginTop: 14, padding: "10px 16px", background: "#fff", borderRadius: 10, border: "0.5px solid var(--border)", fontSize: 12, color: "var(--text-muted)" }}>
          <span><b style={{ color: "var(--text-primary)" }}>{members.filter(m => m.status === "Active").length}</b> active</span>
          <span><b style={{ color: "var(--text-primary)" }}>{members.filter(m => m.status === "Inactive").length}</b> inactive</span>
          <span><b style={{ color: "var(--text-primary)" }}>{members.length}</b> total</span>
        </div>

      </div>
    </div>
  );
}

/* ---------------- PACKAGES ---------------- */
const DELIVERABLE_GROUPS = [
  {
    id: "top_level",
    label: "Top Level",
    items: [
      { id: "ssot", name: "Single Source of Truth" },
      { id: "ws-1", name: "Working Session #1" },
      { id: "ws-2", name: "Working Session #2" },
      { id: "ws-3", name: "Working Session #3" },
    ],
  },
  {
    id: "call_1",
    label: "Call 1",
    items: [
      { id: "resume-v1", name: "Resume V1" },
      { id: "cover-letter-template", name: "Cover Letter Template" },
      { id: "cover-letter-scripts", name: "Cover Letter Scripts" },
      { id: "linkedin-audit", name: "LinkedIn Audit" },
      { id: "linkedin-banners", name: "LinkedIn Banners" },
      { id: "toolkit", name: "Toolkit" },
    ],
  },
  {
    id: "call_2",
    label: "Call 2",
    items: [
      { id: "revisions", name: "Revisions to Existing Materials" },
      { id: "job-search-strategy", name: "Job Search Strategy" },
      { id: "exec-brief", name: "1-pg Exec Brief for Networking" },
      { id: "exec-bio", name: "Exec Bio" },
      { id: "stories", name: "Stories" },
      { id: "second-resume", name: "Optional Second Resume / What I Am Looking For Script" },
      { id: "tell-me-about-yourself", name: "So Tell Me About Yourself Script" },
      { id: "salary-analysis", name: "Salary Analysis" },
    ],
  },
];

function NewPackageModal({ onClose }) {
  const { Icons } = window;
  const { showToast } = useAdmin();

  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [weeks, setWeeks] = React.useState("");
  const [status, setStatus] = React.useState("Active");
  const [stripePriceId, setStripePriceId] = React.useState("");

  // selected: set of item ids
  const [selected, setSelected] = React.useState(new Set(["ssot", "ws-1", "ws-2", "resume-v1", "cover-letter-template"]));
  // extra items added per group: { group_id: [{id, name}] }
  const [extras, setExtras] = React.useState({});

  // Add New form state
  const [addingTo, setAddingTo] = React.useState(null); // group id or null
  const [newName, setNewName] = React.useState("");
  const [targetGroup, setTargetGroup] = React.useState("top_level");

  React.useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  const toggleItem = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleAddItem = () => {
    if (!newName.trim()) return;
    const id = slugify(newName) + "_" + targetGroup;
    setExtras(prev => ({ ...prev, [targetGroup]: [...(prev[targetGroup] || []), { id, name: newName.trim() }] }));
    setSelected(prev => { const next = new Set(prev); next.add(id); return next; });
    setNewName("");
    setAddingTo(null);
  };

  const inputStyle = { width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const FL = ({ children }) => <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 5 }}>{children}</div>;

  const CheckItem = ({ item, isNew }) => {
    const checked = selected.has(item.id);
    return (
      <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderTop: "1px solid var(--border-light)", cursor: "pointer", background: isNew ? "rgba(130,17,255,0.03)" : "#fff" }}
        onMouseEnter={e => { if (!isNew) e.currentTarget.style.background = "#FAFAFA"; }}
        onMouseLeave={e => { e.currentTarget.style.background = isNew ? "rgba(130,17,255,0.03)" : "#fff"; }}>
        <input type="checkbox" checked={checked} onChange={() => toggleItem(item.id)} style={{ accentColor: "var(--purple)", width: 15, height: 15, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: checked ? 500 : 400, color: checked ? "var(--text-primary)" : "var(--text-secondary)" }}>{item.name}</span>
        {isNew && <span style={{ fontSize: 9, fontWeight: 700, background: "rgba(130,17,255,0.12)", color: "var(--purple)", borderRadius: 20, padding: "2px 7px" }}>New</span>}
      </label>
    );
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: 560, maxHeight: "90vh", overflowY: "auto", padding: "28px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.16)" }} onClick={e => e.stopPropagation()}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20 }}>New Package</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}><Icons.X size={20} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><FL>Name</FL><input value={name} onChange={e => setName(e.target.value)} placeholder="Package name" style={inputStyle} /></div>
          <div><FL>Description</FL><textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe this package…" rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <FL>Price</FL>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#888" }}>$</span>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" style={{ ...inputStyle, paddingLeft: 24 }} />
              </div>
            </div>
            <div><FL>Duration (weeks)</FL><input type="number" value={weeks} onChange={e => setWeeks(e.target.value)} placeholder="0" style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ maxWidth: "100%" }}>
              <FL>Status</FL>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
            <div>
              <FL>Stripe Price ID</FL>
              <input value={stripePriceId} onChange={e => setStripePriceId(e.target.value)} placeholder="price_..." style={inputStyle} />
            </div>
          </div>

          {/* Deliverables — 3 grouped sections */}
          <div>
            <FL>Deliverables Included</FL>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {DELIVERABLE_GROUPS.map(group => {
                const groupExtras = extras[group.id] || [];
                const allItems = [...group.items, ...groupExtras];
                return (
                  <div key={group.id} style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                    {/* Group header */}
                    <div style={{ background: "#F6F5FB", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "var(--purple)" }}>{group.label}</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{allItems.filter(i => selected.has(i.id)).length}/{allItems.length}</span>
                    </div>
                    {/* Items */}
                    {allItems.map(item => <CheckItem key={item.id} item={item} isNew={groupExtras.some(e => e.id === item.id)} />)}
                  </div>
                );
              })}
            </div>

            {/* Global Add New form */}
            {addingTo ? (
              <div style={{ border: "1px solid var(--purple)", borderRadius: 10, padding: 16, marginTop: 10, background: "#FAF9FF" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--purple)" }}>Add New Deliverable</span>
                  <button onClick={() => { setAddingTo(null); setNewName(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 2 }}><Icons.X size={15} /></button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <FL>Name *</FL>
                    <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleAddItem(); if (e.key === "Escape") { setAddingTo(null); setNewName(""); } }}
                      placeholder="Deliverable name" style={inputStyle} />
                  </div>
                  <div>
                    <FL>Group</FL>
                    <select value={targetGroup} onChange={e => setTargetGroup(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                      {DELIVERABLE_GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                  <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => { setAddingTo(null); setNewName(""); }}>Cancel</button>
                  <button className="btn btn-primary" style={{ fontSize: 12 }} disabled={!newName.trim()} onClick={handleAddItem}>Add</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setAddingTo("new"); setTargetGroup("top_level"); setNewName(""); }}
                style={{ marginTop: 10, background: "none", border: "1px dashed var(--border)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, color: "var(--purple)", cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Icons.Plus size={13} /> Add New Deliverable
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { showToast("Package saved."); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

function NewALaCarteModal({ onClose }) {
  const { ADM } = window;
  const { showToast } = useAdmin();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState(0);
  const [durationWeeks, setDurationWeeks] = React.useState(0);
  const [active, setActive] = React.useState(true);
  const [type, setType] = React.useState("call");
  const [zoomLink, setZoomLink] = React.useState("");
  const [daysAfterPurchase, setDaysAfterPurchase] = React.useState(3);
  const [includeOnboarding, setIncludeOnboarding] = React.useState(false);
  const [addToPackage, setAddToPackage] = React.useState("none");
  const [addToGroup, setAddToGroup] = React.useState("top_level");

  const packages = (ADM.PACKAGES || []).filter((p) => !p.alc);

  const inputStyle = { width: "100%", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const FL = ({ children }) => <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 5 }}>{children}</div>;
  const HR = () => <div style={{ borderTop: "1px solid var(--border)", margin: "16px 0" }} />;
  const Toggle = ({ on, onToggle }) => (
    <div onClick={onToggle} style={{ width: 36, height: 20, borderRadius: 99, background: on ? "var(--purple)" : "#DDD", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background .2s" }}>
      <div style={{ width: 16, height: 16, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: on ? 18 : 2, transition: "left .15s" }} />
    </div>
  );

  const handleCreate = () => {
    if (!name.trim()) { showToast("Name is required"); return; }
    showToast("À la carte item created");
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 480, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
        <div className="row between" style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>New À La Carte Item</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <FL>Name *</FL>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Mock Interview Session" style={inputStyle} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <FL>Description</FL>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this item..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <FL>Price</FL>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$ 0" style={inputStyle} />
          </div>
          <div>
            <FL>Duration (weeks)</FL>
            <input type="number" value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} placeholder="0" style={inputStyle} />
          </div>
        </div>

        <div className="row" style={{ gap: 10, alignItems: "center", marginBottom: 14 }}>
          <Toggle on={active} onToggle={() => setActive(!active)} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Active</span>
        </div>

        <HR />

        <div style={{ marginBottom: 12 }}>
          <FL>Type</FL>
          <div style={{ display: "flex", gap: 20, marginTop: 6 }}>
            {["call", "document"].map((t) => (
              <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                <input type="radio" name="alc-type" checked={type === t} onChange={() => setType(t)} />
                {t === "call" ? "Call" : "Document"}
              </label>
            ))}
          </div>
        </div>

        {type === "call" && (
          <>
            <div style={{ marginBottom: 14 }}>
              <FL>Zoom Link</FL>
              <input value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} placeholder="https://zoom.us/..." style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <FL>Days after purchase</FL>
              <input type="number" value={daysAfterPurchase} onChange={(e) => setDaysAfterPurchase(Number(e.target.value))} style={{ ...inputStyle, width: 100 }} />
            </div>
          </>
        )}

        <div className="row" style={{ gap: 10, alignItems: "center", marginBottom: 4 }}>
          <Toggle on={includeOnboarding} onToggle={() => setIncludeOnboarding(!includeOnboarding)} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Include onboarding step before this</span>
        </div>

        <HR />

        <div style={{ marginBottom: addToPackage !== "none" ? 12 : 20 }}>
          <FL>Add to Package (optional)</FL>
          <select value={addToPackage} onChange={(e) => setAddToPackage(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="none">None — standalone item</option>
            <option disabled>──────────</option>
            {packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {addToPackage !== "none" && (
          <div style={{ marginBottom: 20 }}>
            <FL>Add to Group</FL>
            <select value={addToGroup} onChange={(e) => setAddToGroup(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="top_level">Top Level</option>
              <option value="call_1">Call 1</option>
              <option value="call_2">Call 2</option>
            </select>
          </div>
        )}

        <div className="row" style={{ gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate}>Create Item</button>
        </div>
      </div>
    </div>
  );
}

function PackageDetailModal({ pkg, role, onClose, onEdit }) {
  const { Icons } = window;
  const isReadOnly = role === "Writer" || role === "Admin Assistant";
  React.useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // Build selected set from pkg.selected (if it's a Set or array)
  const selectedSet = pkg.selected
    ? (pkg.selected instanceof Set ? pkg.selected : new Set(pkg.selected))
    : new Set();
  const extras = pkg.extras || {};

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.16)" }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "22px 28px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{pkg.name}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {pkg.active && <span className="badge" style={{ background: "rgba(0,160,108,0.12)", color: "#00A06C", fontSize: 10 }}>Active</span>}
                {!pkg.active && <span className="badge" style={{ background: "#F1EFE8", color: "#888", fontSize: 10 }}>Inactive</span>}
                <span className="badge" style={{ background: pkg.alc ? "rgba(200,0,90,0.1)" : "var(--purple-light)", color: pkg.alc ? "var(--raspberry)" : "var(--purple)", fontSize: 10 }}>{pkg.alc ? "À La Carte" : "Package"}</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4, flexShrink: 0 }}><Icons.X size={20} /></button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 28px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          {pkg.tagline && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 5 }}>Description</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{pkg.tagline}</div>
            </div>
          )}

          {/* Pricing row */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {pkg.price && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 4 }}>Price</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{pkg.price}</div>
              </div>
            )}
            {pkg.weeks && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 4 }}>Duration</div>
                <div style={{ fontSize: 13, fontWeight: 500, paddingTop: 3 }}>{pkg.weeks}</div>
              </div>
            )}
            {pkg.stripePriceId && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 4 }}>Stripe Price ID</div>
                <div style={{ fontSize: 12, fontFamily: "monospace", paddingTop: 3, color: "#555" }}>{pkg.stripePriceId}</div>
              </div>
            )}
          </div>

          {/* Deliverables — only for packages (not à la carte) */}
          {!pkg.alc && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 10 }}>Deliverables Included</div>
              {DELIVERABLE_GROUPS.map(group => {
                const groupExtras = extras[group.id] || [];
                const allItems = [...group.items, ...groupExtras];
                const included = allItems.filter(item => selectedSet.has(item.id));
                if (included.length === 0) return null;
                return (
                  <div key={group.id} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--purple)", marginBottom: 6 }}>{group.label}</div>
                    <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                      {allItems.map((item, idx) => {
                        const checked = selectedSet.has(item.id);
                        return (
                          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderTop: idx > 0 ? "1px solid var(--border-light)" : "none", background: checked ? "#fff" : "#FAFAFA", opacity: checked ? 1 : 0.45 }}>
                            {checked
                              ? <Icons.Check size={14} style={{ color: "#00A06C", flexShrink: 0 }} />
                              : <Icons.Minus size={14} style={{ color: "#CCC", flexShrink: 0 }} />}
                            <span style={{ fontSize: 13, color: checked ? "var(--text-primary)" : "#AAA", fontWeight: checked ? 500 : 400 }}>{item.name}</span>
                            {groupExtras.find(e => e.id === item.id) && <span style={{ fontSize: 9, fontWeight: 700, background: "rgba(130,17,255,0.12)", color: "var(--purple)", borderRadius: 20, padding: "2px 7px", marginLeft: "auto" }}>Custom</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 28px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="btn btn-ghost" style={{ color: "#888" }} onClick={onClose}>Close</button>
          {!isReadOnly && <button className="btn btn-primary" onClick={() => onEdit(pkg)}><Icons.Settings size={14} /> Edit Package</button>}
        </div>
      </div>
    </div>
  );
}

function AdminPackages() {
  const { ADM } = window;
  const { showToast, role } = useAdmin();
  const isWriter = role === "Writer";
  const isReadOnly = role === "Writer" || role === "Admin Assistant";
  const [showModal, setShowModal] = React.useState(false);
  const [showAlcModal, setShowAlcModal] = React.useState(false);
  const [viewPkg, setViewPkg] = React.useState(null);
  const [editPkg, setEditPkg] = React.useState(null);

  const PkgCard = ({ p }) => (
    <div style={{ background: "#fff", border: "0.5px solid var(--border)", borderRadius: 10, padding: 16, transition: "border-color .15s", cursor: "pointer" }}
      onClick={() => setViewPkg(p)}
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
      {showModal && <NewPackageModal onClose={() => setShowModal(false)} />}
      {showAlcModal && <NewALaCarteModal onClose={() => setShowAlcModal(false)} />}
      {viewPkg && <PackageDetailModal pkg={viewPkg} role={role} onClose={() => setViewPkg(null)} onEdit={(p) => { setViewPkg(null); showToast("Edit: " + p.name); }} />}
      <AdminHeader icon="Briefcase" title="Packages" subtitle="Service packages and add-ons" action={isReadOnly ? null : { label: "+ New Package", onClick: () => setShowModal(true) }} />
      <div className="admin-body">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {ADM.PACKAGES.map((p) => <PkgCard key={p.id} p={p} />)}
        </div>
        <div className="row between" style={{ margin: "26px 0 14px" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>À La Carte</span>
          {!isReadOnly && <button className="btn btn-secondary" onClick={() => setShowAlcModal(true)}>+ New À La Carte Item</button>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {ADM.ALACARTE.map((a) => (
            <div key={a.id} style={{ background: "#fff", border: "0.5px solid var(--border)", borderRadius: 10, padding: 16, cursor: "pointer", transition: "border-color .15s" }}
              onClick={() => setViewPkg(a)}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--purple)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
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
function UploadResourceModal({ onClose }) {
  const { Icons } = window;
  const { showToast } = useAdmin();
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("General");
  const [visibility, setVisibility] = React.useState("Everyone");
  const [url, setUrl] = React.useState("");
  React.useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  const inputStyle = { width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const FL = ({ children }) => <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 5 }}>{children}</div>;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: 500, maxHeight: "90vh", overflowY: "auto", padding: "28px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.16)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20 }}>Upload Resource</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}><Icons.X size={20} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><FL>Title</FL><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resource title" style={inputStyle} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><FL>Category</FL>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {["General", "Writer Resources", "Templates", "Training"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><FL>Visible to</FL>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option>Everyone</option><option>Admin only</option><option>Writers only</option>
              </select>
            </div>
          </div>
          <div>
            <FL>Google Doc / Drive URL</FL>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://docs.google.com/…" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { showToast("Resource uploaded."); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

function AdminKB() {
  const { ADM, Icons } = window;
  const { showToast, role } = useAdmin();
  const isWriter = role === "Writer";
  const [showUpload, setShowUpload] = React.useState(false);
  const tabs = Object.keys(ADM.KB);
  const [tab, setTab] = React.useState(tabs[0]);
  const allItems = ADM.KB[tab] || [];
  const items = isWriter ? allItems.filter(r => r.writerLinked) : allItems;
  return (
    <div>
      {showUpload && <UploadResourceModal onClose={() => setShowUpload(false)} />}
      <AdminHeader icon="Lightbulb" title="Knowledge Base" subtitle="Internal resource library" action={isWriter ? null : { label: "+ Upload Resource", onClick: () => setShowUpload(true) }} />
      {isWriter && (
        <div style={{ background: "rgba(130,17,255,0.05)", borderBottom: "1px solid var(--purple-border)", padding: "8px 32px", fontSize: 12, color: "var(--purple)", display: "flex", alignItems: "center", gap: 6 }}>
          <Icons.Info size={13} /> Showing articles linked to your assigned projects and clients only.
        </div>
      )}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "0 32px" }}>
        <div className="tabs" style={{ marginBottom: 0, border: "none" }}>{tabs.map((t) => {
          const count = isWriter ? ADM.KB[t].filter(r => r.writerLinked).length : ADM.KB[t].length;
          return <button key={t} className={"tab" + (t === tab ? " active" : "")} onClick={() => setTab(t)}>{t} <span style={{ color: "#BBB" }}>[{count}]</span></button>;
        })}</div>
      </div>
      <div className="admin-body">
        {items.length === 0
          ? <EmptyState icon="Lightbulb" title="No articles found." desc="No knowledge base articles are linked to your assigned clients or projects." />
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {items.map((r, i) => (
                <div key={i} style={{ background: "#fff", border: "0.5px solid var(--border)", borderRadius: 10, padding: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--purple-light)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}><Icons.FileText size={16} /></div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{r.title}</div>
                  <div className="row between">
                    <span className="badge" style={{ background: "var(--review-bg)", color: "var(--raspberry)", fontSize: 10 }}>{r.type}</span>
                    <span className="small">{r.date}</span>
                  </div>
                  <div className="row" style={{ gap: 6, marginTop: 12 }}>
                    {!isWriter && <button className="icon-btn" onClick={() => showToast("Edit")}><Icons.Settings size={14} /></button>}
                    <button className="icon-btn" onClick={() => showToast("Download")}><Icons.Download size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
        }
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
  const [published, setPublished] = React.useState(() => !!(task.docId && window.DOC_LOCK?.[task.docId]));
  const setLock = (isPublished) => {
    setPublished(isPublished);
    if (task.docId) {
      if (window.DOC_LOCK) window.DOC_LOCK[task.docId] = isPublished;
      window.dispatchEvent(new CustomEvent("doc-lock-change", { detail: { docId: task.docId, published: isPublished } }));
    }
  };
  const DEFAULT_SUBS_SA = [
    { id: "d0", done: false, assignee: "Editor" },
    { id: "d1", done: false, assignee: "Writer" },
  ];
  const [subs, setSubs] = React.useState(
    (task?.sub?.length ? task.sub : DEFAULT_SUBS_SA).map((s, i) => ({ ...s, id: s.id ?? i, done: s.done || false }))
  );

  const tt = (task.title || "").toLowerCase();
  const isEmail = task.type === "Email" || /^email\s*[—–-]/.test(tt);
  const isCall = !isEmail && /schedule|call|session|zoom/.test(tt);
  const isUpload = !isEmail && /upload|submit|provide|create/.test(tt) && !isCall;

  const EMAIL_PLACEHOLDER = `Hi ${task.client || "there"},

Great connecting on our call today! Here's a quick recap of what we covered:

• Reviewed your career history and target roles — focusing on senior ops / COO-track positions
• Aligned on your core narrative: "operational architect who scales teams"
• Agreed on priorities: résumé first, then LinkedIn headline, then cover letter template

Next steps:
1. I'll deliver the first draft of your résumé by May 3rd
2. Please send over any recent performance reviews or promo docs by Apr 30th
3. Our next session is scheduled for May 6th at 2:00 PM

Feel free to reply here with any questions before then.

Warmly,
Kate`;

  const [emailBody, setEmailBody] = React.useState(task.emailBody || EMAIL_PLACEHOLDER);
  const [emailPublished, setEmailPublished] = React.useState(task.emailPublished || false);
  const [recPkgs, setRecPkgs] = React.useState([]);
  const [discountEnabled, setDiscountEnabled] = React.useState(false);
  const DISCOUNT_CODE = "GHH10-24H";

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
      <div style={{ background: "#fff", borderRadius: 16, width: "min(760px, 95vw)", maxHeight: "90vh", overflowY: "auto", padding: "28px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.16)" }} onClick={(e) => e.stopPropagation()}>

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
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--purple)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" }}>
              <Icons.Video size={15} /> Go to Zoom
            </button>
          </div>
        )}

        {/* Email / Summary section — Email tasks only */}
        {isEmail && (() => {
          const allPkgs = (window.ADM?.PACKAGES || []).concat(window.ADM?.ALACARTE || []);
          const togglePkg = (id) => {
            setRecPkgs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
          };
          const selectedObjs = allPkgs.filter(p => recPkgs.includes(p.id));
          const discountLine = discountEnabled ? `\nReply within 24 hours for 10% off — code: ${DISCOUNT_CODE}` : "";
          const pkgLines = selectedObjs.length
            ? "\n\nServices I'd recommend for you:\n" + selectedObjs.map(p => `• ${p.name}${p.price ? " — " + p.price : ""} →`).join("\n") + discountLine
            : (discountEnabled ? "\n" + discountLine : "");

          return (
            <div style={{ marginBottom: 20 }}>
              {/* Multi-select recommended packages */}
              <div style={{ marginBottom: 14 }}>
                <FieldLabel>Recommended packages & à la carte</FieldLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {allPkgs.map(p => {
                    const sel = recPkgs.includes(p.id);
                    return (
                      <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${sel ? "var(--purple)" : "var(--border)"}`, background: sel ? "rgba(130,17,255,0.04)" : "#fff", cursor: "pointer", transition: "border-color .12s, background .12s" }}>
                        <input type="checkbox" checked={sel} onChange={() => togglePkg(p.id)} style={{ accentColor: "var(--purple)", width: 14, height: 14, flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? "var(--purple)" : "var(--text-primary)" }}>{p.name}</span>
                        {p.price && <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", flexShrink: 0 }}>{p.price}</span>}
                        {p.tagline && <span style={{ fontSize: 11, color: "#aaa", flexShrink: 0 }}>{p.tagline}</span>}
                      </label>
                    );
                  })}
                </div>
                {selectedObjs.length > 0 && (
                  <div style={{ marginTop: 10, background: "rgba(130,17,255,0.04)", border: "1px solid var(--purple-border)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", color: "var(--text-muted)", marginBottom: 6 }}>Will appear in email as:</div>
                    {selectedObjs.map(p => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: "var(--purple)", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>{p.name}{p.price ? " — " + p.price : ""} →</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Discount code toggle */}
              <div style={{ marginBottom: 14 }}>
                <FieldLabel>Discount code</FieldLabel>
                <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${discountEnabled ? "#185FA5" : "var(--border)"}`, background: discountEnabled ? "rgba(24,95,165,0.04)" : "#fff", cursor: "pointer", transition: "border-color .12s, background .12s" }}>
                  <input type="checkbox" checked={discountEnabled} onChange={e => setDiscountEnabled(e.target.checked)} style={{ accentColor: "#185FA5", width: 14, height: 14, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: discountEnabled ? 600 : 400, color: discountEnabled ? "#185FA5" : "var(--text-primary)" }}>Include 10% discount — 24-hour reply offer</span>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Code: <span style={{ fontWeight: 700, fontFamily: "monospace", letterSpacing: ".5px" }}>{DISCOUNT_CODE}</span> · Valid if client replies within 24 hours</div>
                  </div>
                </label>
                {discountEnabled && (
                  <div style={{ marginTop: 8, background: "rgba(24,95,165,0.04)", border: "1px solid rgba(24,95,165,0.2)", borderRadius: 8, padding: "9px 14px", fontSize: 12, color: "#185FA5", fontWeight: 500 }}>
                    Will appear in email: "Reply within 24 hours for 10% off — code: <strong>{DISCOUNT_CODE}</strong>"
                  </div>
                )}
              </div>

              <FieldLabel>Email / Summary</FieldLabel>
              <textarea value={emailBody + pkgLines} onChange={e => setEmailBody(e.target.value.replace(pkgLines, ""))}
                style={{ width: "100%", minHeight: 240, border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6, color: "var(--text-primary)" }} />
              <div style={{ marginTop: 6, fontSize: 11, color: "#aaa" }}>Selected packages and discount code are appended automatically below your message.</div>

              <button onClick={() => {
                  setEmailPublished(v => !v);
                  showToast(emailPublished ? "Summary unpublished." : "Summary published to client.");
                }}
                style={{ marginTop: 10, fontSize: 12, fontWeight: 600, borderRadius: 8, padding: "8px 16px", cursor: "pointer", width: "100%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  color: emailPublished ? "#555" : "#C8005A",
                  background: emailPublished ? "#F5F4F2" : "#FFF5F9",
                  border: emailPublished ? "1.5px solid #D0CEC8" : "1.5px solid #F5C0D2" }}>
                {emailPublished ? <><Icons.Check size={13} /> Published to client</> : "Publish to client"}
              </button>
              {emailPublished && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#00A06C", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                  <Icons.CircleCheck size={13} /> Client can see this summary{selectedObjs.length ? " and package recommendations" : ""} in their dashboard.
                </div>
              )}
            </div>
          );
        })()}

        {/* Type-specific section — not shown for Email tasks */}
        {!isEmail && (isCall ? null : isUpload ? (
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
                <button onClick={() => {
                    if (published) {
                      setLock(false);
                      showToast("File locked — client edit closed.");
                    } else {
                      setLock(true);
                      showToast("Published to client — new major version created.");
                    }
                  }}
                  style={{ fontSize: 12, fontWeight: 600, borderRadius: 8, padding: "7px 14px", cursor: "pointer", width: "100%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    color: published ? "#555" : "#C8005A",
                    background: published ? "#F5F4F2" : "#FFF5F9",
                    border: published ? "1.5px solid #D0CEC8" : "1.5px solid #F5C0D2" }}>
                  {published ? <><Icons.Lock size={13} /> Lock file</> : "Publish to client"}
                </button>
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", background: "#FAF9F7" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
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
                {published ? (
                  <button onClick={() => { setLock(false); showToast("File locked — client edit closed."); }}
                    style={{ fontSize: 12, fontWeight: 600, borderRadius: 8, padding: "7px 14px", cursor: "pointer", width: "100%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      color: "#555", background: "#F0EFED", border: "1.5px solid #D0CEC8" }}>
                    <Icons.Lock size={13} /> Lock file
                  </button>
                ) : (
                  <div style={{ fontSize: 12, fontWeight: 600, borderRadius: 8, padding: "7px 14px", width: "100%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    color: "#AAA", background: "#F8F7F5", border: "1.5px solid #E0DDD8", boxSizing: "border-box" }}>
                    <Icons.Lock size={13} /> Locked
                  </div>
                )}
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
                <button onClick={() => {
                    if (published) {
                      setLock(false);
                      showToast("File locked — client edit closed.");
                    } else {
                      setLock(true);
                      showToast("Published to client — new major version created.");
                    }
                  }}
                  style={{ fontSize: 12, fontWeight: 600, borderRadius: 8, padding: "7px 14px", cursor: "pointer", width: "100%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    color: published ? "#555" : "#C8005A",
                    background: published ? "#F5F4F2" : "#FFF5F9",
                    border: published ? "1.5px solid #D0CEC8" : "1.5px solid #F5C0D2" }}>
                  {published ? <><Icons.Lock size={13} /> Lock file</> : "Publish to client"}
                </button>
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", background: "#FAF9F7" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
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
                {published ? (
                  <button onClick={() => { setLock(false); showToast("File locked — client edit closed."); }}
                    style={{ fontSize: 12, fontWeight: 600, borderRadius: 8, padding: "7px 14px", cursor: "pointer", width: "100%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      color: "#555", background: "#F0EFED", border: "1.5px solid #D0CEC8" }}>
                    <Icons.Lock size={13} /> Lock file
                  </button>
                ) : (
                  <div style={{ fontSize: 12, fontWeight: 600, borderRadius: 8, padding: "7px 14px", width: "100%", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    color: "#AAA", background: "#F8F7F5", border: "1.5px solid #E0DDD8", boxSizing: "border-box" }}>
                    <Icons.Lock size={13} /> Locked
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Subtasks — hidden for Call and Email tasks */}
        {!isCall && !isEmail && subRows.length > 0 && (
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

        {/* Comments — hidden for Call and Email tasks */}
        {!isCall && !isEmail && <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 16 }}>
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
        </div>}

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

/* ============================================================
   ProjectTimeline — standalone preview component
   Structures per spec; type switcher shown when lockType is falsy
   ============================================================ */

const PT_CONFIGS = {
  standard_15: {
    label: "15-Day",
    nodes: [
      { id: "interest",    type: "circle",  label: "Initial Interest",                                               state: "done"   },
      { id: "onboard",     type: "circle",  label: "Onboarding",                                                     state: "done"   },
      { id: "start",       type: "circle",  label: "Start Project",  date: "Apr 1",                                  state: "done"   },
      { id: "phase1",      type: "circle",  label: "Phase 1",  sublabel: "Day 4",  state: "active",
        tasks: ["Single Source of Truth"] },
      { id: "call1",       type: "diamond", label: "Call 1",  sublabel: "Working Session #1",  date: "Apr 8",        state: "future", tasks: ["Summary email from Call #1 (due same day)"] },
      { id: "phase2",      type: "circle",  label: "Phase 2",  sublabel: "Day 10",  state: "future",
        tasks: ["Resume V1", "Cover Letter Template", "Cover Letter Scripts", "LinkedIn Audit", "LinkedIn Banners", "Toolkit"] },
      { id: "call2",       type: "diamond", label: "Call 2",  sublabel: "Working Session #2",  date: "Apr 15",       state: "future", tasks: ["Summary email from Call #2 (due same day)"] },
      { id: "end_project", type: "circle",  label: "End Project",    date: "Apr 22",                                  state: "future" },
      { id: "offboard",    type: "circle",  label: "Offboarding",    date: "Apr 22 – Apr 29",  state: "future",
        tasks: ["Revisions to materials", "Final materials"] },
    ],
  },
  standard_30: {
    label: "30-Day",
    nodes: [
      { id: "interest",    type: "circle",  label: "Initial Interest",                                               state: "done"   },
      { id: "onboard",     type: "circle",  label: "Onboarding",                                                     state: "done"   },
      { id: "start",       type: "circle",  label: "Start Project",  date: "Apr 1",                                  state: "done"   },
      { id: "phase1",      type: "circle",  label: "Phase 1",  sublabel: "Day 4",  state: "active",
        tasks: ["Single Source of Truth"] },
      { id: "call1",       type: "diamond", label: "Call 1",  sublabel: "Working Session #1",  date: "Apr 8",        state: "future", tasks: ["Summary email from Call #1 (due same day)"] },
      { id: "phase2",      type: "circle",  label: "Phase 2",  sublabel: "Day 10",  state: "future",
        tasks: ["Resume V1", "Cover Letter Template", "Cover Letter Scripts", "LinkedIn Audit", "LinkedIn Banners", "Toolkit"] },
      { id: "call2",       type: "diamond", label: "Call 2",  sublabel: "Working Session #2",  date: "Apr 15",       state: "future", tasks: ["Summary email from Call #2 (due same day)"] },
      { id: "phase3",      type: "circle",  label: "Phase 3",  sublabel: "Day 17",  state: "future",
        tasks: ["Revisions to existing materials", "Job Search Strategy", "1-pg Exec Brief for Networking", "Exec Bio", "5 Stories", "Optional second resume", "What I Am Looking For Script", "So Tell Me About Yourself Script", "Salary Analysis"] },
      { id: "call3",       type: "diamond", label: "Call 3",  sublabel: "Working Session #3",  date: "Apr 22",       state: "future", tasks: ["Summary email from Call #3 (due same day)"] },
      { id: "phase4",      type: "circle",  label: "Phase 4",  sublabel: "Buffer",  state: "future",
        tasks: ["Revisions to materials"] },
      { id: "end_project", type: "circle",  label: "End Project",    date: "Apr 29",                                  state: "future" },
      { id: "offboard",    type: "circle",  label: "Offboarding",    date: "Apr 29 – May 6",  state: "future",
        tasks: ["Final materials"] },
    ],
  },
  a_la_carte: {
    label: "À La Carte",
    nodes: [
      { id: "interest", type: "circle",  label: "Initial Interest",                                                  state: "done"   },
      { id: "onboard",  type: "circle",  label: "Onboarding",                                                        state: "done"   },
      { id: "start",    type: "circle",  label: "Start Project",  date: "Apr 1",                                     state: "done"   },
      { id: "phase1",   type: "circle",  label: "Phase 1",  state: "active",
        tasks: ["Résumé + Cover Letter", "OR — 1-page Executive Brief", "OR — 10-pt LinkedIn Audit"],
        tasksNote: "Selected item due Day 4 (depends on item selected)", tasksStyle: "or" },
      { id: "call1",    type: "diamond", label: "Call 1",  sublabel: "Working Session #1",  date: "Apr 8",           state: "future", tasks: ["Summary email from Call #1 (due same day)"] },
      { id: "call2",    type: "diamond", label: "Call 2",  sublabel: "Working Session #2",  date: "Apr 15",          state: "future", tasks: ["Summary email from Call #2 (due same day)"] },
      { id: "end",      type: "circle",  label: "Project End",    date: "Apr 22",                                     state: "future" },
    ],
  },
  mock_interview: {
    label: "Mock Interview",
    nodes: [
      { id: "interest", type: "circle",  label: "Initial Interest",                                                  state: "done"   },
      { id: "onboard",  type: "circle",  label: "Onboarding",                                                        state: "done"   },
      { id: "start",    type: "circle",  label: "Start Project",  date: "Apr 1",                                     state: "done"   },
      { id: "call1",    type: "diamond", label: "Call 1",  sublabel: "Mock Interview #1",    date: "Apr 8",          state: "active", tasks: ["Summary email from Call #1 (due same day)"] },
      { id: "call2",    type: "diamond", label: "Call 2",  sublabel: "Mock Interview #2",    date: "Apr 15",         state: "future", tasks: ["Summary email from Call #2 (due same day)"] },
      { id: "end",      type: "circle",  label: "Project End",    date: "Apr 22",                                     state: "future" },
    ],
  },
  coaching_1off: {
    label: "Coaching — 1-off Power Session",
    nodes: [
      { id: "interest", type: "circle",  label: "Initial Interest",                                                  state: "done"   },
      { id: "onboard",  type: "circle",  label: "Onboarding",                                                        state: "done"   },
      { id: "start",    type: "circle",  label: "Start Project",  date: "Apr 1",                                     state: "done"   },
      { id: "call1",    type: "diamond", label: "Call 1",  sublabel: "Coaching Session",     date: "Apr 8",          state: "active", tasks: ["Summary email from Coaching Session (due same day)"] },
      { id: "end",      type: "circle",  label: "Project End",    date: "Apr 15",                                     state: "future" },
      { id: "offboard", type: "circle",  label: "Offboarding",    date: "Apr 15 – Apr 22",                            state: "future" },
    ],
  },
  coaching_momentum: {
    label: "Coaching — Momentum Package",
    nodes: [
      { id: "interest", type: "circle",  label: "Initial Interest",                                                  state: "done"   },
      { id: "onboard",  type: "circle",  label: "Onboarding",                                                        state: "done"   },
      { id: "start",    type: "circle",  label: "Start Project",  date: "Apr 1",                                     state: "done"   },
      { id: "call1",    type: "diamond", label: "Call 1",  sublabel: "Coaching Session #1",  date: "Apr 8",          state: "active", tasks: ["Summary email from Coaching Session (due same day)"] },
      { id: "call2",    type: "diamond", label: "Call 2",  sublabel: "Coaching Session #2",  date: "Apr 15",         state: "future", tasks: ["Summary email from Coaching Session (due same day)"] },
      { id: "call3",    type: "diamond", label: "Call 3",  sublabel: "Coaching Session #3",  date: "Apr 22",         state: "future", tasks: ["Summary email from Coaching Session (due same day)"] },
      { id: "call4",    type: "diamond", label: "Call 4",  sublabel: "Coaching Session #4",  date: "Apr 29",         state: "future", tasks: ["Summary email from Coaching Session (due same day)"] },
      { id: "end",      type: "circle",  label: "Project End",    date: "May 6",                                      state: "future" },
    ],
  },
};

function PTNode({ node, selected, onClick }) {
  const isDone   = node.state === "done";
  const isActive = node.state === "active";
  const isFuture = node.state === "future";
  const isDiamond = node.type === "diamond";
  const isSegment = node.type === "segment";
  const purple = "#8211FF";
  const grey   = "#C8C6C0";

  let shapeStyle;
  if (isSegment) {
    shapeStyle = {
      width: "100%", height: 10, borderRadius: 3,
      background: isFuture ? grey : purple,
      cursor: "pointer",
    };
  } else if (isDiamond) {
    const sz = 18;
    let bg = isFuture ? grey : purple;
    let border = "none", shadow = "none";
    if (isActive) { bg = "#fff"; border = `2.5px solid ${purple}`; shadow = `0 0 0 3px rgba(130,17,255,0.15)`; }
    shapeStyle = {
      width: sz, height: sz, background: bg, border, boxShadow: shadow,
      transform: `rotate(45deg) ${selected ? "scale(1.18)" : ""}`,
      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
    };
  } else {
    const sz = 18;
    let bg = isFuture ? grey : purple;
    let border = "none", shadow = "none";
    if (isActive) { bg = "#fff"; border = `2.5px solid ${purple}`; shadow = `0 0 0 3px rgba(130,17,255,0.15)`; }
    shapeStyle = {
      width: sz, height: sz, borderRadius: 99, background: bg, border, boxShadow: shadow,
      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
      transform: selected ? "scale(1.18)" : "scale(1)",
    };
  }

  const labelColor = isFuture ? "#AAA" : isActive ? purple : "#555";
  const labelWeight = isActive ? 600 : 400;

  return (
    <div onClick={() => onClick(node)}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
        flex: isSegment ? "1 1 40px" : "0 0 auto", minWidth: isSegment ? 24 : 0, cursor: "pointer" }}>
      {isSegment ? (
        <div style={{ width: "100%", display: "flex", alignItems: "center", height: 18 }}>
          <div style={shapeStyle} />
        </div>
      ) : (
        <div style={shapeStyle}>
          {isDone && (
            <span style={{ color: "#fff", fontSize: 9, fontWeight: 700,
              transform: isDiamond ? "rotate(-45deg)" : "none", display: "block", lineHeight: 1 }}>✓</span>
          )}
        </div>
      )}
      <div style={{ textAlign: "center", maxWidth: 68 }}>
        <div style={{ fontSize: 10, color: labelColor, fontWeight: labelWeight, lineHeight: 1.25 }}>{node.label}</div>
        {node.sublabel && <div style={{ fontSize: 9, color: "#AAA", lineHeight: 1.2, marginTop: 2 }}>{node.sublabel}</div>}
        {node.date && <div style={{ fontSize: 9, color: isFuture ? "#BBB" : "#888", lineHeight: 1.2, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{node.date}</div>}
      </div>
    </div>
  );
}

function ProjectTimeline({ lockType }) {
  const typeKeys = Object.keys(PT_CONFIGS);
  const [activeType, setActiveType] = React.useState(typeKeys[0]);
  const [selected, setSelected] = React.useState(null);
  const purple = "#8211FF";

  const config = PT_CONFIGS[activeType];
  const nodes  = config.nodes;

  const handleSelect = (node) => setSelected((p) => p && p.id === node.id ? null : node);

  return (
    <div style={{ padding: "24px 32px" }}>
      {/* Type tabs */}
      {!lockType && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {typeKeys.map((k) => (
            <button key={k} onClick={() => { setActiveType(k); setSelected(null); }}
              style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer",
                border: "1.5px solid",
                background: activeType === k ? purple : "#fff",
                color: activeType === k ? "#fff" : "#555",
                borderColor: activeType === k ? purple : "#D8D5CF" }}>
              {PT_CONFIGS[k].label}
            </button>
          ))}
        </div>
      )}

      {/* Rail card */}
      <div style={{ background: "#fff", border: "1px solid #E8E6E0", borderRadius: 14, padding: "24px 20px 20px", overflowX: "auto" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 20 }}>{config.label}</div>
        <div style={{ display: "flex", alignItems: "flex-start", minWidth: nodes.length * 72 }}>
          {nodes.map((node, i) => (
            <React.Fragment key={node.id}>
              {i > 0 && (
                <div style={{
                  flex: 1, height: 2, alignSelf: "flex-start", marginTop: 8, minWidth: 10,
                  background: node.state === "future" ? "#E0DDD7" : purple,
                }} />
              )}
              <PTNode node={node} selected={selected && selected.id === node.id} onClick={handleSelect} />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ marginTop: 14, background: "#fff", border: "1px solid #E8E6E0", borderRadius: 12, padding: "18px 22px", animation: "fade .15s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{selected.label}</div>
              {selected.sublabel && <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{selected.sublabel}</div>}
            </div>
            {selected.type === "diamond" && (
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button style={{ padding: "5px 12px", fontSize: 12, borderRadius: 7, border: "1px solid #D8D5CF", background: "#fff", cursor: "pointer" }}>Reschedule</button>
                <button style={{ padding: "5px 12px", fontSize: 12, borderRadius: 7, border: "none", background: purple, color: "#fff", cursor: "pointer" }}>Join Zoom</button>
              </div>
            )}
          </div>
          {selected.tasks && selected.tasks.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "#AAA", marginBottom: 8 }}>Tasks</div>
              {selected.tasksStyle === "or" ? (
                <div style={{ border: "1px solid #E8E6E0", borderRadius: 10, overflow: "hidden" }}>
                  {selected.tasks.map((t, i) => {
                    const isOr = t.startsWith("OR —");
                    return (
                      <div key={i}>
                        {isOr && <div style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#AAA", letterSpacing: 1, padding: "4px 0", background: "#F8F7F5", borderTop: "1px solid #E8E6E0", borderBottom: "1px solid #E8E6E0" }}>OR</div>}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#333", padding: "10px 14px", background: "#fff" }}>
                          <div style={{ width: 7, height: 7, borderRadius: 99, background: "#8211FF", flexShrink: 0 }} />
                          {isOr ? t.replace("OR — ", "") : t}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selected.tasks.map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#444" }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: "1.5px solid #C8C6C0", flexShrink: 0 }} />
                      {t}
                    </div>
                  ))}
                </div>
              )}
              {selected.tasksNote && (
                <div style={{ fontSize: 11, color: "#999", marginTop: 8, fontStyle: "italic" }}>{selected.tasksNote}</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AdminTimelineTypes() {
  return (
    <div>
      <AdminHeader icon="Folder" title="Timeline Types" subtitle="Preview of all project timeline structures (sample data — not a real project)." />
      <ProjectTimeline />
    </div>
  );
}
