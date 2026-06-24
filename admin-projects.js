/* ============================================================
   Admin · Projects (list + detail w/ split-view tasks)
   →  window.AdminProjects, window.AdminProjectDetail
   ============================================================ */

/* ---------------- Projects list ---------------- */
function NewProjectModal({ onClose }) {
  const { showToast } = useAdmin();
  const { ADM } = window;
  return (
    <Modal onClose={onClose}>
      <div style={{ width: 380, maxWidth: "100%" }}>
        <ModalHeader title="New Project" onClose={onClose} />
        <div style={{ padding: "4px 20px 0" }}><p className="meta" style={{ margin: "0 0 14px" }}>Create a new project for a client.</p></div>
        <div style={{ padding: "0 20px 8px" }}>
          <div className="field"><label className="field-label">Project Name</label><input className="input" placeholder="First Last Project" /></div>
          <div className="field"><label className="field-label">Client *</label>
            <select className="select"><option>Select client…</option>{ADM.CLIENTS.map((c) => <option key={c.id}>{c.name}</option>)}</select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field"><label className="field-label">Package</label><select className="select">{ADM.PACKAGES.map((p) => <option key={p.id}>{p.name}</option>)}</select></div>
            <div className="field"><label className="field-label">Phase</label><select className="select">{ADM.PHASES.map((p) => <option key={p}>{p}</option>)}</select></div>
            <div className="field"><label className="field-label">Writer</label><select className="select"><option>Unassigned</option>{ADM.TEAM.map((t) => <option key={t.id}>{t.name}</option>)}</select></div>
            <div className="field"><label className="field-label">Producer</label><select className="select"><option>Unassigned</option>{ADM.TEAM.map((t) => <option key={t.id}>{t.name}</option>)}</select></div>
            <div className="field"><label className="field-label">Start Date</label><input className="input" type="date" /></div>
            <div className="field"><label className="field-label">Status</label><select className="select"><option>On Track</option><option>Behind</option></select></div>
          </div>
        </div>
        <div className="row between" style={{ padding: "14px 20px", borderTop: "0.5px solid var(--border-light)" }}>
          <button className="btn btn-ghost" style={{ color: "#888" }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { showToast("Project created."); onClose(); }}>Create</button>
        </div>
      </div>
    </Modal>
  );
}

function AdminProjects() {
  const { navigate } = useAdmin();
  const { ADM, Icons } = window;
  const [search, setSearch] = React.useState("");
  const [phase, setPhase] = React.useState("All");
  const [status, setStatus] = React.useState("All");
  const [pkg, setPkg] = React.useState("All");
  const [modal, setModal] = React.useState(false);

  const rows = ADM.PROJECTS.filter((p) =>
    (phase === "All" || p.phase === phase) &&
    (status === "All" || p.status === status) &&
    (pkg === "All" || p.pkg === pkg) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase()))
  );

  const phaseBadge = (p) => <span className="badge" style={{ background: ADM.phaseColor(p) + "1f", color: ADM.phaseColor(p), fontWeight: 600 }}>{p}</span>;

  return (
    <div>
      <AdminHeader icon="FolderOpen" title="Projects" subtitle="Manage projects" action={{ label: "+ New Project", onClick: () => setModal(true) }} />
      <FilterBar search={search} onSearch={setSearch}
        right={<button className="fpill" style={{ background: "var(--purple)", color: "#fff", borderColor: "var(--purple)" }} onClick={() => setModal(true)}><Icons.Plus size={13} /> New Project</button>}>
        <FilterPill label="Phase" options={ADM.PHASES} active={phase} onChange={setPhase} />
        <FilterPill label="Status" options={["On Track", "Behind"]} active={status} onChange={setStatus} />
        <FilterPill label="Package" options={ADM.PACKAGES.map((p) => p.name)} active={pkg} onChange={setPkg} />
        <button className="fpill"><Icons.ListChecks size={13} /> Columns</button>
      </FilterBar>

      <div className="admin-body">
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table className="atable">
            <thead><tr>
              {["Project", "Client", "Phase", "Status", "Writer", "Start Date", "Proj. End", ""].map((h) => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {rows.map((p) => {
                const c = ADM.CLIENTS.find((x) => x.id === p.clientId);
                return (
                  <tr key={p.id} className="clickable" onClick={() => navigate("#/admin/projects/" + p.id)}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><div className="row" style={{ gap: 8 }}><Avatar initials={c.initials} color={c.color} size={24} /> {p.client}</div></td>
                    <td>{phaseBadge(p.phase)}</td>
                    <td><APill status={p.status} /></td>
                    <td style={{ color: p.writer === "Unassigned" ? "#AAA" : "inherit", fontStyle: p.writer === "Unassigned" ? "italic" : "normal" }}>{p.writer}</td>
                    <td style={{ color: "#888" }}>{p.start}</td>
                    <td style={{ color: "#888" }}>{p.end}</td>
                    <td onClick={(e) => e.stopPropagation()}><button className="icon-btn" style={{ border: "none" }}>⋯</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <EmptyState icon="FolderOpen" title="No projects found" desc="Try adjusting your filters." />}
        </Card>
      </div>
      {modal && <NewProjectModal onClose={() => setModal(false)} />}
    </div>
  );
}

/* ---------------- Sticky timeline bar ---------------- */
function buildTimelineNodes(project) {
  const { ADM } = window;
  const T = ADM.TASKS_BY_PHASE;
  const callTask = (n, title, assignee, due) => [{ n: 1, title, assignee, due, status: n <= 1 ? "complete" : "not_started", done: n <= 1 }];
  return [
    { id: "initial", kind: "diamond", label: "Initial Interest", dates: "—", phaseKey: null, tasks: [] },
    { id: "onboarding", kind: "diamond", label: "Onboarding", dates: "Mar 28 – Apr 2", phaseKey: "Onboarding", tasks: T["Onboarding"] },
    { id: "week1", kind: "circle", label: "Week 1", dates: "Apr 3 – Apr 23", phaseKey: "Week 1", tasks: T["Week 1"] },
    { id: "call1", kind: "call", label: "Call 1", dates: "Apr 24 – 30", phaseKey: null, tasks: callTask(1, "Working Session #1", project.writer, "Apr 24") },
    { id: "week2", kind: "circle", label: "Week 2", dates: "Apr 24 – Apr 30", phaseKey: "Week 2", tasks: T["Week 2"] },
    { id: "call2", kind: "call", label: "Call 2", dates: "May 1 – 7", phaseKey: null, tasks: callTask(2, "Working Session #2", project.writer, "May 1") },
    { id: "week3", kind: "circle", label: "Week 3", dates: "May 8 – May 14", phaseKey: "Week 3", tasks: T["Week 3"] },
    { id: "complete", kind: "circle", label: "Complete", dates: "May 22", phaseKey: "Complete", tasks: T["Complete"] },
  ];
}

function TLNode({ node, state }) {
  // state: done | active | future
  if (node.kind === "call") {
    const done = state === "complete";
    return <span style={{ width: 12, height: 12, transform: "rotate(45deg)", background: done ? "var(--purple)" : "#CCC", flex: "0 0 auto" }} />;
  }
  if (node.kind === "diamond") {
    const done = state === "complete";
    return <span style={{ width: 13, height: 13, transform: "rotate(45deg)", background: done ? "var(--purple)" : "#AAA", flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center" }} />;
  }
  // circle
  if (state === "complete") return <span style={{ width: 16, height: 16, borderRadius: 99, background: "var(--purple)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flex: "0 0 auto" }}>✓</span>;
  if (state === "active") return <span style={{ width: 16, height: 16, borderRadius: 99, background: "#fff", border: "2px solid var(--purple)", boxShadow: "0 0 0 3px rgba(130,17,255,0.15)", flex: "0 0 auto" }} />;
  return <span style={{ width: 14, height: 14, borderRadius: 99, background: "#fff", border: "1.5px solid #CCC", flex: "0 0 auto" }} />;
}

function ProjectTimelineBar({ project, onMore }) {
  const { ADM, Icons } = window;
  const { showToast } = useAdmin();
  const nodes = React.useMemo(() => buildTimelineNodes(project), [project]);
  const curIdx = nodes.findIndex((n) => n.phaseKey === project.phase);
  const activeIdx = curIdx === -1 ? 1 : curIdx;
  const stateOf = (i) => (i < activeIdx ? "complete" : i === activeIdx ? "active" : "future");
  const [active, setActive] = React.useState(null);
  const sel = active != null ? nodes[active] : null;
  const selState = active != null ? stateOf(active) : null;
  const callScheduled = selState && selState !== "future"; // done/active calls are scheduled
  const inits = (name) => name.split(" ").map((w) => w[0]).join("").slice(0, 2);

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 40, background: "#fff", borderBottom: "1px solid var(--border)" }}>
      {/* Node bar */}
      <div style={{ padding: "12px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          {nodes.map((n, i) => {
            const st = stateOf(i);
            return (
              <React.Fragment key={n.id}>
                <button onClick={() => setActive((p) => (p === i ? null : i))} title={n.label}
                  style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", padding: "4px 2px", cursor: "pointer",
                    borderRadius: 6, outline: active === i ? "1px solid var(--purple-border)" : "none" }}>
                  <TLNode node={n} state={st} />
                  <span style={{ fontSize: 12, fontWeight: st === "active" ? 700 : 500, color: st === "active" ? "var(--purple)" : st === "complete" ? "var(--text-primary)" : "#AAA", whiteSpace: "nowrap" }}>{n.label}</span>
                </button>
                {i < nodes.length - 1 && <div style={{ flex: 1, height: 2, margin: "0 7px", background: i < activeIdx ? "var(--purple)" : "var(--border)" }} />}
              </React.Fragment>
            );
          })}
        </div>
        <div className="row" style={{ gap: 10, flex: "0 0 auto" }}>
          <APill status={project.status} />
          <span className="meta">Week {Math.max(1, activeIdx)} of 6</span>
        </div>
      </div>

      {/* Inline detail */}
      {sel && (
        <div style={{ background: "#F8F7FF", borderTop: "1px dashed var(--border)", padding: "14px 32px", animation: "fade .15s ease" }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{sel.label} <span className="meta" style={{ fontWeight: 400 }}>· {sel.dates}</span></div>
          {sel.tasks && sel.tasks.length ? (
            <div style={{ marginTop: 8 }}>
              {sel.tasks.slice(0, 4).map((t, i) => (
                <div key={i} className="row" style={{ gap: 12, height: 36, borderBottom: "1px solid var(--border)" }}>
                  <span style={{ width: 17, height: 17, borderRadius: 99, flex: "0 0 17px", border: t.done ? "none" : "1.5px solid #CFC9DD", background: t.done ? "#00A06C" : "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{t.done ? <Icons.Check size={10} /> : ""}</span>
                  <span style={{ flex: 1, fontSize: 13, textDecoration: t.done ? "line-through" : "none", color: t.done ? "#999" : "inherit" }}>{t.title}</span>
                  <span className="row" style={{ gap: 6, color: "#888", fontSize: 12, flex: "0 0 auto" }}><Avatar initials={inits(t.assignee)} color="#B9B4C7" size={18} /> {t.assignee}</span>
                  <span style={{ color: "#888", fontSize: 12, width: 60, textAlign: "right", flex: "0 0 60px" }}>{t.due}</span>
                </div>
              ))}
              {sel.tasks.length > 4 && (
                <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => (sel.phaseKey && onMore ? onMore(sel.phaseKey) : showToast("Opening tasks…"))}>
                  + {sel.tasks.length - 4} more tasks →
                </button>
              )}
            </div>
          ) : <div className="meta" style={{ marginTop: 6 }}>No tasks in this {sel.kind === "call" ? "call" : "phase"} yet.</div>}

          {/* Zoom actions — call nodes only */}
          {sel.kind === "call" && (
            <div className="row" style={{ gap: 0, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", alignItems: "center" }}>
              {!callScheduled && <span className="meta" style={{ marginRight: 12 }}>Not yet scheduled</span>}
              <button className="btn btn-primary" disabled={!callScheduled} onClick={() => showToast("Opening Zoom…")}><Icons.Video size={15} /> Join on Zoom</button>
              <button className="btn btn-ghost" style={{ marginLeft: 12 }} onClick={() => showToast("Reschedule…")}>Reschedule</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Unified Task Modal (create + edit) ---------------- */
function TaskModal({ task, phase, onClose }) {
  const { showToast } = useAdmin();
  const { ADM, Icons } = window;
  const isEdit = !!task;

  const [step, setStep] = React.useState(isEdit ? 'edit' : 'select');
  const [title, setTitle] = React.useState(task?.title || "");
  const [status, setStatus] = React.useState(task?.status || "not_started");
  const [dueDate, setDueDate] = React.useState("");
  const [phaseVal, setPhaseVal] = React.useState(phase || "Week 1");
  const [visibleToClient, setVisibleToClient] = React.useState(false);
  const [description, setDescription] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState(null);
  const [docType, setDocType] = React.useState("Resume");
  const [docLink, setDocLink] = React.useState("");
  const [writerAssignee, setWriterAssignee] = React.useState("");
  const [clientInstructions, setClientInstructions] = React.useState("");
  const [internalNotes, setInternalNotes] = React.useState("");
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [published, setPublished] = React.useState(false);
  const [rounds, setRounds] = React.useState(1);
  const DOC_TYPES = ["Resume","Cover Letter","LinkedIn Audit","LinkedIn Profile","Executive Brief","Job Strategy","Exec Bio","5 Stories","SSOT","Other"];
  const [dragOver, setDragOver] = React.useState(false);
  const [attachedDoc, setAttachedDoc] = React.useState(() => {
    const t = task?.title || "";
    if (t.toLowerCase().includes("resum") || t.toLowerCase().includes("r\u00e9sum")) return "R\u00e9sum\u00e9 \u2014 Draft v1.pdf";
    return task?.doc || task?.document?.name || task?.documentUrl || task?.linkedDocument || null;
  });
  const fileInputRef = React.useRef(null);
  const [subs, setSubs] = React.useState((task?.sub || []).map((s, i) => ({ ...s, id: i, done: s.done || false })));
  const [commentFilter, setCommentFilter] = React.useState("All");
  const [commentText, setCommentText] = React.useState("");
  const [comments, setComments] = React.useState([
    { id: 1, who: "Kate Wade", init: "KW", role: "Team", when: "2h ago", text: "Draft v1 is with the editor. Targeting client delivery by Thursday." },
    { id: 2, who: "Maya Chen", init: "MC", role: "Client", when: "5h ago", text: "Looks great so far! Can we adjust the executive summary section?" },
  ]);
  const [editingComment, setEditingComment] = React.useState(null);
  const [editCommentText, setEditCommentText] = React.useState("");
  const [hoverComment, setHoverComment] = React.useState(null);

  const sb = ADM.STATUS_BADGE;
  const STATUS_OPTIONS = ["not_started", "in_progress", "overdue", "complete"];
  const STATUS_LABELS = { not_started: "Not Started", in_progress: "In Progress", overdue: "Overdue", complete: "Complete" };

  React.useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  const FieldLabel = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 6 }}>{children}</div>
  );

  const SharedStatusDue = () => (
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
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
          style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
      </div>
    </div>
  );

  const AssignTo = ({ showDeliverable }) => (
    <div style={{ background: "#F8F7FF", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
      {showDeliverable ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <Avatar initials="KW" color="var(--purple)" size={26} />
            <div style={{ minWidth: 50 }}><span style={{ fontSize: 11, color: "var(--text-muted)" }}>Editor</span></div>
            <div style={{ fontSize: 13, flex: 1, fontStyle: "italic", color: "var(--text-muted)" }}>Kate Wade — auto-assigned</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: 99, background: "#E8E6E0", flexShrink: 0 }} />
            <div style={{ minWidth: 50 }}><span style={{ fontSize: 11, color: "var(--text-muted)" }}>Writer</span></div>
            <select value={writerAssignee} onChange={e => setWriterAssignee(e.target.value)}
              style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff" }}>
              <option value="">Search by name…</option>
              {ADM.TEAM.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {["Editor","Writer","Admin"].map(r => (
              <button key={r} onClick={() => setSelectedRole(r === selectedRole ? null : r)}
                style={{ border: selectedRole === r ? "1px solid var(--purple)" : "1px solid var(--border)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", background: selectedRole === r ? "var(--purple)" : "transparent", color: selectedRole === r ? "#fff" : "var(--text-secondary)", fontFamily: "inherit" }}>
                {r}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>or by name</div>
          <select style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff" }}>
            <option>Search by name…</option>
            {ADM.TEAM.map(t => <option key={t.id}>{t.name}</option>)}
          </select>
        </>
      )}
    </div>
  );

  // One persistent overlay — content switches by step to prevent click retargeting
  if (step === 'select' || step === 'ordinary' || step === 'deliverable') {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={{ background: "#fff", borderRadius: 16, width: step === 'select' ? 480 : 560, maxHeight: "90vh", overflowY: "auto", padding: "28px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.16)" }}
          onClick={(e) => e.stopPropagation()}>

          {step === 'select' && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20 }}>New Task</div>
                <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 20, padding: 4 }}>×</button>
              </div>
              <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>What type of task?</div>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { key: "deliverable", icon: "📄", title: "Deliverable", desc: "For documents, drafts, reviews + file upload" },
                  { key: "ordinary", icon: "✓", title: "Ordinary Task", desc: "Action item, admin task, or follow-up" },
                ].map(opt => (
                  <div key={opt.key} onClick={() => setStep(opt.key)}
                    style={{ flex: 1, border: "1.5px solid var(--border)", borderRadius: 12, padding: 16, cursor: "pointer", userSelect: "none" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--purple)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{opt.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{opt.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'ordinary' && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <button onClick={() => setStep('select')} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--purple)", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
                  <Icons.ChevronLeft size={15} /> Back
                </button>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20, flex: 1 }}>New Ordinary Task</div>
                <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}><Icons.X size={20} /></button>
              </div>
              <div style={{ height: "0.5px", background: "var(--border)", marginBottom: 20 }} />
              <div style={{ marginBottom: 20 }}>
                <FieldLabel>Task Title *</FieldLabel>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter task title…"
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
              </div>
              <SharedStatusDue />
              <div style={{ marginBottom: 20 }}>
                <FieldLabel>Assign To</FieldLabel>
                <AssignTo showDeliverable={false} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <FieldLabel>Phase</FieldLabel>
                <select value={phaseVal} onChange={e => setPhaseVal(e.target.value)}
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff", outline: "none", fontFamily: "inherit" }}>
                  {ADM.PHASES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontSize: 13 }}>Visible to client</span>
                <div onClick={() => setVisibleToClient(v => !v)}
                  style={{ width: 40, height: 22, borderRadius: 20, background: visibleToClient ? "var(--purple)" : "#D0CEC8", cursor: "pointer", position: "relative", transition: "background 150ms", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2, left: visibleToClient ? 20 : 2, width: 18, height: 18, borderRadius: 99, background: "#fff", transition: "left 150ms", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <FieldLabel>Description</FieldLabel>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add a description…"
                  style={{ width: "100%", minHeight: 80, border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button className="btn btn-ghost" style={{ color: "var(--purple)" }} onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" disabled={!title.trim()}
                  style={{ borderRadius: 8, padding: "0 20px", height: 38, fontSize: 13, fontWeight: 600, opacity: title.trim() ? 1 : 0.5 }}
                  onClick={() => { showToast("Task created."); onClose(); }}>Create Task</button>
              </div>
            </div>
          )}

          {step === 'deliverable' && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <button onClick={() => setStep('select')} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--purple)", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
                  <Icons.ChevronLeft size={15} /> Back
                </button>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20, flex: 1 }}>New Deliverable Task</div>
                <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}><Icons.X size={20} /></button>
              </div>
              <div style={{ height: "0.5px", background: "var(--border)", marginBottom: 20 }} />
              <div style={{ marginBottom: 20 }}>
                <FieldLabel>Task Title *</FieldLabel>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter task title…"
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
              </div>
              <SharedStatusDue />
              <div style={{ marginBottom: 20 }}>
                <FieldLabel>Document Type</FieldLabel>
                <select value={docType} onChange={e => setDocType(e.target.value)}
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff", outline: "none", fontFamily: "inherit" }}>
                  {DOC_TYPES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 8 }}>
                <FieldLabel>Document Upload (optional)</FieldLabel>
                <div style={{ border: "1.5px dashed #E0C0D0", background: "#FEF8FB", borderRadius: 10, padding: "20px 16px", textAlign: "center", cursor: "pointer" }}>
                  <div style={{ color: "var(--raspberry)", display: "flex", justifyContent: "center", marginBottom: 6 }}><Icons.Paperclip size={20} /></div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Drag file here or click to browse</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>PDF, DOC, DOCX, PNG accepted</div>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <FieldLabel>Or paste link</FieldLabel>
                <input value={docLink} onChange={e => setDocLink(e.target.value)} placeholder="Google Doc / Drive URL…"
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <FieldLabel>Assign Subtasks</FieldLabel>
                <AssignTo showDeliverable={true} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <FieldLabel>Phase</FieldLabel>
                <select value={phaseVal} onChange={e => setPhaseVal(e.target.value)}
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff", outline: "none", fontFamily: "inherit" }}>
                  {ADM.PHASES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontSize: 13 }}>Visible to client</span>
                <div onClick={() => setVisibleToClient(v => !v)}
                  style={{ width: 40, height: 22, borderRadius: 20, background: visibleToClient ? "var(--purple)" : "#D0CEC8", cursor: "pointer", position: "relative", transition: "background 150ms", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2, left: visibleToClient ? 20 : 2, width: 18, height: 18, borderRadius: 99, background: "#fff", transition: "left 150ms", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <FieldLabel>Client Instructions</FieldLabel>
                <textarea value={clientInstructions} onChange={e => setClientInstructions(e.target.value)} placeholder="Add instructions for the client…"
                  style={{ width: "100%", minHeight: 70, border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <FieldLabel>Internal Notes</FieldLabel>
                <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} placeholder="Add internal notes…"
                  style={{ width: "100%", minHeight: 70, border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button className="btn btn-ghost" style={{ color: "var(--purple)" }} onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" disabled={!title.trim()}
                  style={{ borderRadius: 8, padding: "0 20px", height: 38, fontSize: 13, fontWeight: 600, opacity: title.trim() ? 1 : 0.5 }}
                  onClick={() => { showToast("Task created."); onClose(); }}>Create Task</button>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // Edit mode
  const subRows = subs.length ? [
    { init: "KW", role: "Editor", name: "Kate Wade", sub: subs.find(s => s.assignee === "Editor") || subs[0] },
    { init: "MB", role: "Writer", name: "Mimi Bishop", sub: subs.find(s => s.assignee === "Writer") || subs[1] },
  ].filter(r => r.sub) : [];

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    setComments(prev => [{ id: Date.now(), who: "Kate Wade", init: "KW", role: "Team", when: "just now", text: commentText.trim() }, ...prev]);
    setCommentText("");
  };

  const filteredComments2 = commentFilter === "All" ? comments : comments.filter(c => c.role === commentFilter);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: 560, maxHeight: "90vh", overflowY: "auto", padding: "28px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.16)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
          {editingTitle ? (
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)} onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
              style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20, border: "none", borderBottom: "2px solid var(--purple)", outline: "none", flex: 1, background: "transparent", padding: "2px 0" }} />
          ) : (
            <div onClick={() => setEditingTitle(true)} style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20, flex: 1, cursor: "text", lineHeight: 1.3 }}>{title || "Untitled task"}</div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span className="badge" style={{ background: (sb[status] || {}).bg, color: (sb[status] || {}).fg, fontWeight: 600, fontSize: 11 }}>{STATUS_LABELS[status] || status}</span>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}><Icons.X size={20} /></button>
          </div>
        </div>

        <SharedStatusDue />

        {/* Document section */}
        <div style={{ marginBottom: 20 }}>
          <FieldLabel>Document</FieldLabel>
          {attachedDoc ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#F8F7FF", borderRadius: 10, padding: "14px 16px" }}>
              <Icons.FileText size={22} style={{ color: "var(--purple)", flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attachedDoc}</span>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => window.open('https://docs.google.com', '_blank')}
                  style={{ border: "1.5px solid var(--purple)", color: "var(--purple)", background: "transparent", borderRadius: 20, padding: "7px 16px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>Open in Google Docs</button>
                <button style={{ display: "flex", alignItems: "center", gap: 6, border: "1.5px solid var(--purple)", color: "var(--purple)", background: "transparent", borderRadius: 20, padding: "7px 16px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <Icons.Download size={14} /> Download
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setAttachedDoc(f.name); }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, border: "1.5px dashed " + (dragOver ? "var(--purple)" : "var(--border)"), borderRadius: 10, padding: 20, cursor: "pointer", background: dragOver ? "rgba(130,17,255,0.03)" : "#FAFAFA", marginBottom: 10, fontSize: 13, color: "var(--text-secondary)" }}>
                <Icons.Paperclip size={20} style={{ color: "#AAAAAA" }} />
                <span>Drop file here or click to upload</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>PDF, DOC, DOCX accepted</span>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) setAttachedDoc(e.target.files[0].name); }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Or paste Google Doc / Drive link:</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="url" value={docLink} onChange={(e) => setDocLink(e.target.value)} placeholder="https://docs.google.com/..."
                  style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 8, padding: "7px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--purple)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"} />
                <button disabled={!docLink.trim()} onClick={() => { if (docLink.trim()) { setAttachedDoc("Linked document"); setDocLink(""); } }}
                  style={{ background: "var(--purple)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 500, cursor: docLink.trim() ? "pointer" : "default", opacity: docLink.trim() ? 1 : 0.4, whiteSpace: "nowrap" }}>Attach</button>
              </div>
            </div>
          )}
        </div>

        {subRows.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <FieldLabel>Subtasks</FieldLabel>
            <div style={{ background: "#F8F7FF", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {rounds > 1 && <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: 4 }}>Round 1</div>}
              {subRows.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 48 }}>
                  <Avatar initials={r.init} color="var(--purple)" size={28} />
                  <div style={{ minWidth: 50 }}><span style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.role}</span></div>
                  <div style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{r.name}</div>
                  {r.sub.done ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => setSubs(prev => prev.map(s => s === r.sub ? { ...s, done: false } : s))}
                        style={{ fontSize: 12, color: "#E53935", background: "transparent", border: "none", cursor: "pointer", fontWeight: 500 }}
                        onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}>Reopen</button>
                      <span className="badge" style={{ background: "rgba(0,160,108,0.12)", color: "#00A06C", fontWeight: 600 }}>Complete</span>
                      <span style={{ width: 20, height: 20, borderRadius: 99, background: "#00A06C", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icons.Check size={11} style={{ color: "#fff" }} /></span>
                    </div>
                  ) : (
                    <button onClick={() => setSubs(prev => prev.map(s => s === r.sub ? { ...s, done: true } : s))}
                      style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px", height: 30, fontSize: 12, color: "var(--text-muted)", background: "#fff", cursor: "pointer", whiteSpace: "nowrap", transition: "border-color 150ms, color 150ms" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--purple)"; e.currentTarget.style.color = "var(--purple)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                      Mark as Complete
                    </button>
                  )}
                </div>
              ))}
              {rounds > 1 && Array.from({ length: rounds - 1 }, (_, ri) => (
                <React.Fragment key={ri}>
                  <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", margin: "4px 0 8px" }}>Round {ri + 2}</div>
                  <div style={{ background: "#F8F7FF", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {subRows.map((r, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 48 }}>
                        <Avatar initials={r.init} color="var(--purple)" size={28} />
                        <div style={{ minWidth: 50 }}><span style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.role}</span></div>
                        <div style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{r.name}</div>
                        <button style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "0 12px", height: 30, fontSize: 12, color: "var(--text-muted)", background: "#fff", cursor: "pointer", whiteSpace: "nowrap" }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--purple)"; e.currentTarget.style.color = "var(--purple)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>Mark as Complete</button>
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              ))}
            </div>
            <button onClick={() => setRounds(r => r + 1)}
              style={{ fontSize: 12, color: "#E53935", background: "transparent", border: "none", cursor: "pointer", fontWeight: 500, marginTop: 8, display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
              <Icons.Plus size={13} /> Add round of changes
            </button>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <FieldLabel>Notes (Internal)</FieldLabel>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add internal notes..."
            style={{ width: "100%", minHeight: 80, border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.5, background: "transparent" }} />
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>Comments</div>
            <div style={{ display: "flex", gap: 4 }}>
              {["All","Client","Team"].map(f => (
                <button key={f} onClick={() => setCommentFilter(f)}
                  style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: commentFilter === f ? "none" : "1px solid var(--border)", background: commentFilter === f ? "var(--purple)" : "transparent", color: commentFilter === f ? "#fff" : "var(--text-muted)", cursor: "pointer", fontFamily: "inherit" }}>{f}</button>
              ))}
            </div>
          </div>
          {filteredComments2.map((cm) => (
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

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginTop: 8 }}>
          <button style={{ fontSize: 13, fontWeight: 500, color: published ? "var(--text-muted)" : "#C8005A", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
            onClick={() => { setPublished(v => !v); showToast(published ? "Unpublished." : "Published to client portal."); }}>
            {published ? "Unpublish" : "Publish to client"}
          </button>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-ghost" style={{ color: "var(--purple)", fontSize: 13 }} onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" style={{ borderRadius: 8, padding: "0 20px", height: 38, fontSize: 13, fontWeight: 600 }}
              onClick={() => { showToast("Changes saved."); onClose(); }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Split-view tasks ---------------- */
function ProjectTasks({ project, focusPhase }) {
  const { ADM, Icons } = window;
  const { showToast } = useAdmin();
  const [sel, setSel] = React.useState(focusPhase || project.phase);
  React.useEffect(() => { if (focusPhase) setSel(focusPhase); }, [focusPhase]);
  const [hideDone, setHideDone] = React.useState(false);
  const [assignee, setAssignee] = React.useState("All");
  const [status, setStatus] = React.useState("All");
  const [openTask, setOpenTask] = React.useState(null);
  const [showNewTask, setShowNewTask] = React.useState(false);
  const [completed, setCompleted] = React.useState({});
  const [expanded, setExpanded] = React.useState({});

  let tasks = (ADM.TASKS_BY_PHASE[sel] || []).map((t) => ({ ...t, done: t.done || completed[sel + t.n] }));
  tasks = tasks.filter((t) =>
    (assignee === "All" || t.assignee === assignee) &&
    (status === "All" || t.status === status) &&
    (!hideDone || !t.done)
  );
  tasks = [...tasks].sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));

  const toggle = (t) => { setCompleted((c) => ({ ...c, [sel + t.n]: !t.done })); showToast(t.done ? "Task reopened." : "Task completed."); };

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 480 }}>
      {/* Phases */}
      <div style={{ width: 220, flex: "0 0 220px", background: "#F8F7FF", borderRight: "1px solid var(--border)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".6px", textTransform: "uppercase", color: "var(--text-muted)", padding: "12px 16px" }}>Phases</div>
        {ADM.PHASES.map((p) => {
          const pr = ADM.phaseProgress(p);
          const active = p === sel;
          const complete = pr.total > 0 && pr.done === pr.total;
          const started = pr.done > 0;
          const pct = pr.total ? (pr.done / pr.total) * 100 : 0;
          return (
            <button key={p} onClick={() => setSel(p)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, height: 44, padding: "0 16px", border: "none", textAlign: "left", cursor: "pointer",
              background: active ? "var(--surface)" : "transparent", borderRight: active ? "2px solid var(--purple)" : "2px solid transparent" }}>
              <span style={{ width: 9, height: 9, borderRadius: 99, flex: "0 0 9px", background: complete ? "#00A06C" : started ? "var(--purple)" : "#CCC" }} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: active ? "var(--purple)" : started ? "var(--text-primary)" : "#AAA" }}>{p}</span>
              <span style={{ fontSize: 11, color: complete ? "#00A06C" : "#888", whiteSpace: "nowrap" }}>{pr.done}/{pr.total}</span>
              <span className="pbar" style={{ width: 32, flex: "0 0 32px" }}><div style={{ width: pct + "%", background: complete ? "#00A06C" : "var(--purple)" }} /></span>
            </button>
          );
        })}
      </div>

      {/* Tasks */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 40, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, padding: "0 14px" }}>
          <FilterPill label="Assignee" options={ADM.TEAM.map((t) => t.name)} active={assignee} onChange={setAssignee} />
          <FilterPill label="Status" options={["not_started", "in_progress", "overdue", "complete"]} active={status} onChange={setStatus} optionLabels={{ not_started: "Not Started", in_progress: "In Progress", overdue: "Overdue", complete: "Complete" }} />
          <ToggleChip on={hideDone} onToggle={() => setHideDone((v) => !v)}>Hide Completed</ToggleChip>
          <button className="fpill" style={{ marginLeft: "auto", background: "var(--purple)", color: "#fff", borderColor: "var(--purple)" }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowNewTask(true); }}><Icons.Plus size={13} /> New Task</button>
        </div>
          <div className="scrollbar-thin" style={{ flex: 1, overflowY: "auto" }}>
          {tasks.length ? (
            <table className="atable">
              <tbody>
                {tasks.map((t) => (
                  <React.Fragment key={t.n}>
                    {/* Parent row */}
                    <tr id={"task-" + t.n} className="clickable" style={{ opacity: t.done ? 0.5 : 1 }}
                      onClick={() => setOpenTask(t)}>
                      <td style={{ width: 36 }} onClick={(ev) => { ev.stopPropagation(); toggle(t); }}>
                        <span style={{ width: 18, height: 18, borderRadius: 99, border: t.done ? "none" : "1.5px solid #CFC9DD", background: t.done ? "#00A06C" : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>{t.done ? <Icons.Check size={11} /> : ""}</span>
                      </td>
                      <td style={{ width: 24 }} onClick={(ev) => { ev.stopPropagation(); t.sub && t.sub.length && setExpanded((e) => ({ ...e, [t.n]: !e[t.n] })); }}>
                        {t.sub && t.sub.length > 0 && <Icons.ChevronRight size={14} style={{ color: "#AAA", transition: "transform 150ms", transform: expanded[t.n] ? "rotate(90deg)" : "rotate(0deg)" }} />}
                      </td>
                      <td style={{ width: 28, color: "#AAA", fontSize: 12 }}>{t.n}</td>
                      <td style={{ textDecoration: t.done ? "line-through" : "none" }}>
                        {t.title}
                        {t.sub && t.sub.length > 0 && !expanded[t.n] && <div style={{ fontSize: 11, color: "#AAA", marginTop: 2 }}>{t.sub.length} sub-tasks</div>}
                      </td>
                      {(!t.sub || t.sub.length === 0) && (
                        <td style={{ width: 150 }}>
                          <div className="row" style={{ gap: 6, fontSize: 12, color: "#888" }}>
                            <Avatar initials={t.assignee.split(" ").map((w) => w[0]).join("").slice(0, 2)} color="#B9B4C7" size={24} />
                            <span>{t.assignee}</span>
                          </div>
                        </td>
                      )}
                      {t.sub && t.sub.length > 0 && <td style={{ width: 150 }} />}
                      <td style={{ width: 100, color: "#888", fontSize: 12 }}>{t.due}</td>
                      <td style={{ width: 110 }}><APill status={t.status} /></td>                      <td style={{ width: 32 }} onClick={(ev) => ev.stopPropagation()}><button className="icon-btn" style={{ border: "none" }}>⋯</button></td>
                    </tr>
                    {/* Subtask rows */}
                    {expanded[t.n] && t.sub && t.sub.map((s, si) => (
                      <tr key={t.n + "-s" + si} style={{ background: "rgba(130,17,255,0.025)" }}>
                        <td style={{ width: 36, paddingLeft: 24 }}>
                          <span style={{ width: 15, height: 15, borderRadius: 4, border: "1.5px solid #CFC9DD", display: "inline-flex", alignItems: "center", justifyContent: "center" }} />
                        </td>
                        <td style={{ width: 24, borderLeft: "2px solid rgba(130,17,255,0.2)" }} />
                        <td style={{ width: 28 }} />
                        <td style={{ fontSize: 13, color: "#444", paddingLeft: 4, textDecoration: s.done ? "line-through" : "none", opacity: s.done ? 0.5 : 1 }}>{s.text}</td>
                        <td style={{ width: 150 }}>
                          <div className="row" style={{ gap: 6, fontSize: 12, color: "#888" }}>
                            <Avatar initials={(s.assignee || "?")[0]} color="#B9B4C7" size={18} />
                            <span>{s.assignee || "Unassigned"}</span>
                          </div>
                        </td>
                        <td style={{ width: 110 }} />
                        <td style={{ width: 32 }} />
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : <EmptyState icon="ListChecks" title="No tasks in this phase" desc="Tasks for this phase will appear here." />}
        </div>
      </div>
      {openTask && <TaskModal task={openTask} phase={sel} onClose={() => setOpenTask(null)} />}
      {showNewTask && <TaskModal phase={sel} onClose={() => setShowNewTask(false)} />}
    </div>
  );
}

/* ---------------- Documents tab ---------------- */
function DocSection({ title, arrow, docs }) {
  const { Icons } = window;
  const [open, setOpen] = React.useState(true);
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <button onClick={() => setOpen((v) => !v)} className="row between" style={{ width: "100%", background: "#FAF9F6", border: "none", borderBottom: open ? "0.5px solid var(--border-light)" : "none", padding: "11px 16px", cursor: "pointer" }}>
        <span className="row" style={{ gap: 8 }}>
          {open ? <Icons.ChevronDown size={14} /> : <Icons.ChevronRight size={14} />}
          <span className="label" style={{ margin: 0 }}>{arrow} {title}</span>
          <span className="meta">{docs.length}</span>
        </span>
      </button>
      {open && (docs.length ? (
        <table className="atable">
          <thead><tr>{["Name", "Type", "Status", "Version", "Modified", ""].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id} className="clickable">
                <td style={{ fontWeight: 500 }}><span className="row" style={{ gap: 7 }}><Icons.FileText size={15} /> {d.name} {d.drive && <Icons.ArrowUpRight size={12} />}</span></td>
                <td><span className="badge" style={{ background: "var(--review-bg)", color: "var(--raspberry)" }}>{d.type}</span></td>
                <td><APill status={d.status} /></td>
                <td style={{ color: "#888" }}>{d.version}</td>
                <td style={{ color: "#888" }}>{d.modified}</td>
                <td onClick={(e) => e.stopPropagation()}><button className="icon-btn" style={{ border: "none" }}>⋯</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}><span className="meta">No documents yet</span></div>)}
    </Card>
  );
}

function ProjectDocs({ client }) {
  const { ADM, Icons } = window;
  const { showToast } = useAdmin();
  const docs = ADM.DOCS.filter((d) => d.client === client);
  const fromGHH = docs.filter((d) => d.dir === "GHH to Client");
  const fromClient = docs.filter((d) => d.dir === "Client to GHH");
  return (
    <div className="admin-body">
      <div className="row" style={{ justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
        <button className="fpill" onClick={() => showToast("Syncing from Drive…")}><Icons.ChevronDown size={13} /> Sync from Drive</button>
        <button className="fpill" onClick={() => showToast("Upload…")}><Icons.Upload size={13} /> Upload File</button>
        <button className="fpill" style={{ background: "var(--purple)", color: "#fff", borderColor: "var(--purple)" }} onClick={() => showToast("New document…")}><Icons.Plus size={13} /> New Document</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <DocSection title="From GHH to Client" arrow="↙" docs={fromGHH} />
        <DocSection title="From Client to GHH" arrow="↗" docs={fromClient} />
      </div>
    </div>
  );
}

/* Sample comments for project */
const PROJECT_COMMENTS = [
  { id: "pc1", who: "Kate Wade", initials: "KW", when: "2h ago", role: "Team", text: "Draft v1 is with the editor. Targeting client delivery by Thursday.", taskId: "t7", taskTitle: "Résumé — Draft v1" },
  { id: "pc2", who: "Maya Chen", initials: "MC", when: "5h ago", role: "Client", text: "Love the direction! A few small edits on the opening paragraph.", taskId: "t7", taskTitle: "Résumé — Draft v1" },
  { id: "pc3", who: "Mimi Bishop", initials: "MB", when: "1d ago", role: "Team", text: "Assigned to me for final edits. ETA end of week.", taskId: "t9", taskTitle: "LinkedIn Audit" },
];

const PROJECT_NOTES = [
  { id: "pn1", who: "Kate Wade", initials: "KW", when: "3h ago", text: "Client mentioned interest in VP roles — pivot narrative toward leadership impact." },
  { id: "pn2", who: "Ryan Nelson", initials: "RN", when: "1d ago", text: "Schedule follow-up with client on cover letter positioning." },
];

/* ProjectComments with filter */
function ProjectComments({ setTab }) {
  const { Icons } = window;
  const [filter, setFilter] = React.useState("All");
  const [openTaskId, setOpenTaskId] = React.useState(null);
  const { ADM } = window;
  const filtered = filter === "All" ? PROJECT_COMMENTS : PROJECT_COMMENTS.filter((c) => c.role === filter);
  const openTask = openTaskId
    ? (Object.values(ADM.TASKS_BY_PHASE || {}).flat().find(t => t.id === openTaskId) || { id: openTaskId, title: "Task" })
    : null;

  return (
    <div className="admin-body">
      <Card>
        <div className="row between" style={{ marginBottom: 14 }}>
          <div className="label">Comments</div>
          <div className="row" style={{ gap: 8 }}>
            {["All", "Client", "Team"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ borderRadius: 6, padding: "4px 12px", fontSize: 11, fontWeight: 500, cursor: "pointer",
                  background: filter === f ? "var(--purple)" : "transparent",
                  color: filter === f ? "#fff" : "var(--text-secondary)",
                  border: filter === f ? "1px solid var(--purple)" : "1px solid var(--border)" }}>{f}</button>
            ))}
          </div>
        </div>
        {filtered.length ? filtered.map((c, i) => (
          <div key={c.id} style={{ paddingTop: i ? 14 : 0, paddingBottom: 14, borderTop: i ? "1px solid var(--border)" : "none", display: "flex", gap: 11 }}>
            <div>
              <Avatar initials={c.initials} color={c.role === "Client" ? "#C8005A" : "var(--purple)"} size={32} />
              <div style={{ marginTop: 6 }}><span className="badge" style={{ background: c.role === "Client" ? "rgba(200,0,90,0.1)" : "rgba(130,17,255,0.1)", color: c.role === "Client" ? "#C8005A" : "#8211FF", fontSize: 10, fontWeight: 600 }}>{c.role}</span></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}><span style={{ fontWeight: 600 }}>{c.who}</span><span className="meta"> · {c.when}</span></div>
              <div style={{ fontSize: 13, marginTop: 2, lineHeight: 1.5 }}>{c.text}</div>
            </div>
            {c.taskId && (
              <button onClick={() => setOpenTaskId(c.taskId)}
                style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "var(--text-secondary)", background: "transparent", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, alignSelf: "flex-start", marginTop: 4, transition: "border-color 150ms, color 150ms" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--purple)"; e.currentTarget.style.color = "var(--purple)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                <Icons.CheckSquare size={12} /> {c.taskTitle || "View task"} →
              </button>
            )}
          </div>
        )) : <div style={{ textAlign: "center", padding: "20px" }}><Icons.MessageCircle size={24} style={{ opacity: 0.3, marginBottom: 8, display: "block" }} /><div style={{ fontSize: 13, color: "#AAA" }}>No {filter.toLowerCase()} comments</div></div>}
      </Card>
      {openTaskId && openTask && <TaskModal task={openTask} onClose={() => setOpenTaskId(null)} />}
    </div>
  );
}

/* ProjectNotes — read-only internal notes */
function ProjectNotes({ setTab }) {
  const { Icons } = window;
  const [noteText, setNoteText] = React.useState("");
  const [notes, setNotes] = React.useState([...PROJECT_NOTES]);

  const handlePostNote = () => {
    if (!noteText.trim()) return;
    const newNote = { id: "n" + Date.now(), initials: "KW", who: "Kate Wade", when: "just now", text: noteText.trim(), role: "Team" };
    setNotes((prev) => [newNote, ...prev]);
    setNoteText("");
  };

  return (
    <div className="admin-body">
      {/* Input row */}
      <div className="notes-input-row">
        <textarea
          placeholder="Add a note..."
          value={noteText}
          rows={1}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePostNote(); } }}
        />
        <button className="notes-post-btn" onClick={handlePostNote} disabled={!noteText.trim()}>
          <Icons.Send size={15} />
        </button>
      </div>
      <Card>
        <div className="label" style={{ marginBottom: 14 }}>Notes</div>
        {notes.length ? notes.map((n, i) => (
          <div key={n.id} style={{ paddingTop: i ? 14 : 0, paddingBottom: 14, borderTop: i ? "1px solid var(--border)" : "none", display: "flex", gap: 11 }}>
            <div>
              <Avatar initials={n.initials} color="var(--purple)" size={32} />
              <div style={{ marginTop: 6 }}><span className="badge" style={{ background: "rgba(130,17,255,0.1)", color: "#8211FF", fontSize: 10, fontWeight: 600 }}>Team</span></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}><span style={{ fontWeight: 600 }}>{n.who}</span><span className="meta"> · {n.when}</span></div>
              <div style={{ fontSize: 13, marginTop: 2, lineHeight: 1.5 }}>{n.text}</div>
            </div>
          </div>
        )) : <div style={{ textAlign: "center", padding: "20px" }}><Icons.Lightbulb size={24} style={{ opacity: 0.3, marginBottom: 8, display: "block" }} /><div style={{ fontSize: 13, color: "#AAA" }}>No notes yet</div></div>}
      </Card>
    </div>
  );
}

/* ProjectInfo — Intake Highlights tab */
function ProjectInfo() {
  const [editing, setEditing] = React.useState(null);
  const [aspirationalRole, setAspirationalRole] = React.useState("");
  const [targetIndustry, setTargetIndustry] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const SectionLabel = ({ children }) => (
    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>{children}</div>
  );
  const Field = ({ k, v }) => (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{k}</div>
      <div style={{ fontSize: 14, color: "var(--text-primary)" }}>{v || "—"}</div>
    </div>
  );
  const EditableField = ({ k, fk, val, setVal, multiline }) => {
    const empty = !val;
    return (
      <div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{k}</div>
        {editing === fk ? (
          multiline ? (
            <textarea autoFocus value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => setEditing(null)}
              style={{ fontSize: 13, width: "100%", border: "1px solid var(--border)", borderRadius: 6, padding: 8, resize: "vertical", minHeight: 80, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          ) : (
            <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} onBlur={() => setEditing(null)} onKeyDown={(e) => e.key === "Enter" && setEditing(null)}
              style={{ fontSize: 14, border: "none", borderBottom: "1px solid var(--purple)", outline: "none", width: "100%", background: "transparent", fontFamily: "inherit", padding: "2px 0" }} />
          )
        ) : (
          <div onClick={() => setEditing(fk)}
            style={{ fontSize: 14, cursor: "pointer", borderBottom: "1px dashed transparent", paddingBottom: 1, transition: "border-color 150ms, color 150ms", color: empty ? "var(--text-muted)" : "var(--text-primary)", fontStyle: empty ? "italic" : "normal" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = "var(--purple)"; e.currentTarget.style.color = "var(--purple)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = "transparent"; e.currentTarget.style.color = empty ? "var(--text-muted)" : "var(--text-primary)"; }}>
            {val || "Click to add..."}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="admin-body">
      <Card style={{ padding: "20px 24px" }}>
        <div style={{ marginBottom: 20 }}>
          <SectionLabel>Intake Highlights</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field k="Motivation" v="Targeting VP-level roles after a recent reorg." />
            <Field k="Search Process" v="Actively applying, 2 interviews in flight." />
            <Field k="Referral Source" v="LinkedIn" />
            <Field k="Job Search Status" v="Active" />
            <Field k="Investment Readiness" v="High" />
          </div>
        </div>
        <div style={{ height: 1, background: "var(--border)", margin: "4px 0 20px" }} />
        <SectionLabel>Added After Milestone Call</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <EditableField k="Aspirational Role" fk="aspirationalRole" val={aspirationalRole} setVal={setAspirationalRole} />
          <EditableField k="Target Industry" fk="targetIndustry" val={targetIndustry} setVal={setTargetIndustry} />
          <EditableField k="Notes" fk="notes" val={notes} setVal={setNotes} multiline />
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Project detail ---------------- */
function AdminProjectDetail({ id }) {
  const { navigate } = useAdmin();
  const { ADM, Icons } = window;
  const project = ADM.PROJECTS.find((p) => p.id === id) || ADM.PROJECTS[0];
  const client = ADM.CLIENTS.find((c) => c.id === project.clientId);
  const [tab, setTab] = React.useState("Tasks");
  const [focusPhase, setFocusPhase] = React.useState(null);
  const tabs = ["Tasks", "Documents", "Comments", "Notes", "Project Info"];

  return (
    <div>
      <AdminHeader icon="FolderOpen" title="Project Details" subtitle="View and manage project information" back={{ label: "Back to Projects", onClick: () => navigate("#/admin/projects") }} />

      {/* Project info card */}
      <div className="admin-body" style={{ paddingBottom: 0 }}>
        <Card style={{ padding: "20px 24px" }}>
          <div className="row between" style={{ alignItems: "flex-start" }}>
            <div className="row" style={{ gap: 12, alignItems: "center" }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 20 }}>{project.name}</span>
              <APill status={project.status} />
              <span className="badge" style={{ background: ADM.phaseColor(project.phase) + "1f", color: ADM.phaseColor(project.phase), fontWeight: 600 }}>{project.pkg}</span>
            </div>
            <button className="fpill">✏ Edit</button>
          </div>
          <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>{project.client}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 18 }}>
            {[["Writer", project.writer], ["Editor", project.editor], ["Start Date", project.start], ["Projected End", project.end]].map(([k, v]) => (
              <div key={k}>
                <div className="field-label" style={{ marginBottom: 3 }}>{k}</div>
                <div className="row" style={{ gap: 5, fontSize: 13, color: v === "Unassigned" ? "#AAA" : "inherit", fontStyle: v === "Unassigned" ? "italic" : "normal" }}>{v} {(k !== "Start Date") && <Icons.ChevronDown size={12} />}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ height: 14 }} />
      <ProjectTimelineBar project={project} onMore={(ph) => { setFocusPhase(ph); setTab("Tasks"); }} />

      {/* Tabs */}
      <div style={{ padding: "0 32px", background: "#fff", borderBottom: "1px solid var(--border)" }}>
        <div className="tabs" style={{ marginBottom: 0, border: "none" }}>
          {tabs.map((t) => <button key={t} className={"tab" + (t === tab ? " active" : "")} onClick={() => setTab(t)}>{t}</button>)}
        </div>
      </div>

      {tab === "Tasks" && <ProjectTasks project={project} focusPhase={focusPhase} />}
      {tab === "Documents" && <ProjectDocs client={project.client} />}
      {tab === "Comments" && <ProjectComments setTab={setTab} />}
      {tab === "Notes" && <ProjectNotes setTab={setTab} />}
      {tab === "Project Info" && <ProjectInfo />}
    </div>
  );
}

Object.assign(window, { AdminProjects, AdminProjectDetail });
