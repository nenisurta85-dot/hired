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

/* ---------------- New Task Creation Modal (two-step) ---------------- */
function NewTaskModal({ phase, onClose }) {
  const { ADM, Icons } = window;
  const { showToast } = useAdmin();
  const [step, setStep] = React.useState("select"); // "select" | "deliverable" | "ordinary"
  const [title, setTitle] = React.useState("");
  const [status, setStatus] = React.useState("not_started");
  const [dueDate, setDueDate] = React.useState("");
  const [docType, setDocType] = React.useState("Resume");
  const [phaseVal, setPhaseVal] = React.useState(phase || "Week 1");
  const [visible, setVisible] = React.useState(false);
  const [instructions, setInstructions] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [pasteLink, setPasteLink] = React.useState("");
  const [dragOver, setDragOver] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState([]);
  const [writerSearch, setWriterSearch] = React.useState("");
  const [assignedWriter, setAssignedWriter] = React.useState(null);
  const inputRef = React.useRef(null);

  const STATUS_LABELS = { not_started: "Not Started", in_progress: "In Progress", overdue: "Overdue", complete: "Complete" };
  const DOC_TYPES = ["Resume", "Cover Letter", "LinkedIn Audit", "Career Strategy Doc", "Bio", "Thank You Note", "Other"];
  const WRITERS = ["Mimi Bishop", "Kate Wade", "Jhoneth B.", "Lourdes H-D"];
  const filteredWriters = WRITERS.filter(w => w.toLowerCase().includes(writerSearch.toLowerCase()));

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(0) + " KB" }))]);
  };
  const handleBrowse = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, size: (f.size / 1024).toFixed(0) + " KB" }))]);
    e.target.value = "";
  };

  React.useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  const FieldLabel = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 6 }}>{children}</div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, width: step === "select" ? 440 : 560, maxHeight: "90vh", overflowY: "auto", padding: "28px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.16)" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18 }}>
            {step === "select" ? "New Task" : step === "deliverable" ? "New Deliverable Task" : "New Ordinary Task"}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}><Icons.X size={20} /></button>
        </div>

        {/* Step 1 — type select */}
        {step === "select" && (
          <div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>What type of task is this?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => setStep("deliverable")}
                style={{ border: "1.5px solid var(--border)", borderRadius: 12, padding: "18px 20px", textAlign: "left", cursor: "pointer", background: "#fff", transition: "border-color 150ms, background 150ms" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--purple)"; e.currentTarget.style.background = "#F8F7FF"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "#fff"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(130,17,255,0.08)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icons.FileText size={18} /></span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Deliverable</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Documents, drafts, reviews &amp; file upload</div>
                  </div>
                  <Icons.ChevronRight size={16} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
                </div>
              </button>
              <button onClick={() => setStep("ordinary")}
                style={{ border: "1.5px solid var(--border)", borderRadius: 12, padding: "18px 20px", textAlign: "left", cursor: "pointer", background: "#fff", transition: "border-color 150ms, background 150ms" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#00A06C"; e.currentTarget.style.background = "#F4FBF7"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "#fff"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,160,108,0.08)", color: "#00A06C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icons.ListChecks size={18} /></span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Ordinary Task</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Action item, admin task, or follow-up</div>
                  </div>
                  <Icons.ChevronRight size={16} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
                </div>
              </button>
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}

        {/* Step 2a — Deliverable */}
        {step === "deliverable" && (
          <div>
            {/* Title */}
            <div style={{ marginBottom: 18 }}>
              <FieldLabel>Task Title</FieldLabel>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Create Resume — Draft v1"
                style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>

            {/* Status + Due Date */}
            <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
              <div style={{ width: 180 }}>
                <FieldLabel>Status</FieldLabel>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff", outline: "none", fontFamily: "inherit" }}>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <FieldLabel>Due Date</FieldLabel>
                <input type="text" value={dueDate} onChange={e => setDueDate(e.target.value)} placeholder="e.g. May 3"
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Document Type */}
            <div style={{ marginBottom: 18 }}>
              <FieldLabel>Document Type</FieldLabel>
              <select value={docType} onChange={e => setDocType(e.target.value)}
                style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff", outline: "none", fontFamily: "inherit" }}>
                {DOC_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Upload or Paste Link */}
            <div style={{ marginBottom: 18 }}>
              <FieldLabel>Document Upload</FieldLabel>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current && inputRef.current.click()}
                style={{ border: `2px dashed ${dragOver ? "var(--purple)" : "var(--border)"}`, borderRadius: 10, padding: "20px 16px", background: dragOver ? "#F8F7FF" : "#FAFAFA", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", transition: "border-color 150ms, background 150ms", marginBottom: 8 }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(130,17,255,0.08)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icons.Upload size={16} /></span>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--purple)" }}>Drop file or browse</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>PDF, DOCX, PNG — max 20 MB</div>
                <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={handleBrowse} />
              </div>
              {uploadedFiles.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "#F8F7FF", borderRadius: 8, marginBottom: 4, fontSize: 12 }}>
                  <Icons.FileText size={13} style={{ color: "var(--purple)", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontWeight: 500 }}>{f.name}</span>
                  <span style={{ color: "var(--text-muted)" }}>{f.size}</span>
                  <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 2 }}><Icons.X size={12} /></button>
                </div>
              ))}
              <div style={{ marginTop: 10 }}>
                <FieldLabel>Or Paste Link</FieldLabel>
                <input value={pasteLink} onChange={e => setPasteLink(e.target.value)} placeholder="https://docs.google.com/…"
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Assign Subtasks */}
            <div style={{ marginBottom: 18 }}>
              <FieldLabel>Assign Subtasks</FieldLabel>
              <div style={{ background: "#F8F7FF", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Editor — auto-assigned */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar initials="KW" color="var(--purple)" size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Kate Wade</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Editor · Auto-assigned</div>
                  </div>
                  <span className="badge" style={{ background: "rgba(130,17,255,0.1)", color: "var(--purple)", fontWeight: 600 }}>Auto</span>
                </div>
                {/* Writer search */}
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 5 }}>Writer</div>
                  {assignedWriter ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar initials={assignedWriter.split(" ").map(w => w[0]).join("").slice(0, 2)} color="#00A06C" size={28} />
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{assignedWriter}</div>
                      <button onClick={() => setAssignedWriter(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa" }}><Icons.X size={14} /></button>
                    </div>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <input value={writerSearch} onChange={e => setWriterSearch(e.target.value)} placeholder="Search writer…"
                        style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                      {writerSearch && (
                        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 10, overflow: "hidden" }}>
                          {filteredWriters.length ? filteredWriters.map(w => (
                            <button key={w} onClick={() => { setAssignedWriter(w); setWriterSearch(""); }}
                              style={{ display: "block", width: "100%", padding: "9px 12px", fontSize: 13, textAlign: "left", background: "none", border: "none", cursor: "pointer", borderBottom: "0.5px solid var(--border-light)" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#F8F7FF"}
                              onMouseLeave={e => e.currentTarget.style.background = "none"}>{w}</button>
                          )) : <div style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-muted)" }}>No match</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Phase + Visible toggle row */}
            <div style={{ display: "flex", gap: 16, marginBottom: 18, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <FieldLabel>Phase</FieldLabel>
                <select value={phaseVal} onChange={e => setPhaseVal(e.target.value)}
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff", outline: "none", fontFamily: "inherit" }}>
                  {ADM.PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ paddingBottom: 2 }}>
                <FieldLabel>Visible to client</FieldLabel>
                <button onClick={() => setVisible(v => !v)}
                  style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", borderRadius: 8, padding: "7px 12px", fontSize: 13, background: visible ? "#F8F7FF" : "#fff", cursor: "pointer", color: visible ? "var(--purple)" : "var(--text-muted)", fontFamily: "inherit", transition: "all 150ms" }}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${visible ? "var(--purple)" : "var(--border)"}`, background: visible ? "var(--purple)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {visible && <Icons.Check size={10} style={{ color: "#fff" }} />}
                  </span>
                  {visible ? "Yes" : "No"}
                </button>
              </div>
            </div>

            {/* Client Instructions */}
            <div style={{ marginBottom: 18 }}>
              <FieldLabel>Client Instructions</FieldLabel>
              <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="What should the client do or know about this task?"
                style={{ width: "100%", minHeight: 72, border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.5 }} />
            </div>

            {/* Internal Notes */}
            <div style={{ marginBottom: 20 }}>
              <FieldLabel>Internal Notes</FieldLabel>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes visible only to the team…"
                style={{ width: "100%", minHeight: 72, border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.5 }} />
            </div>

            {/* Footer */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button className="btn btn-ghost" onClick={() => setStep("select")} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                <Icons.ChevronLeft size={14} /> Back
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 13 }}>Cancel</button>
                <button className="btn btn-primary" style={{ borderRadius: 8, padding: "0 20px", height: 38, fontSize: 13, fontWeight: 600 }}
                  onClick={() => { showToast("Task created."); onClose(); }}>Create Task</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2b — Ordinary Task */}
        {step === "ordinary" && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <FieldLabel>Task Title</FieldLabel>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Send follow-up email"
                style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
              <div style={{ width: 180 }}>
                <FieldLabel>Status</FieldLabel>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff", outline: "none", fontFamily: "inherit" }}>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <FieldLabel>Due Date</FieldLabel>
                <input type="text" value={dueDate} onChange={e => setDueDate(e.target.value)} placeholder="e.g. May 3"
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 18, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <FieldLabel>Phase</FieldLabel>
                <select value={phaseVal} onChange={e => setPhaseVal(e.target.value)}
                  style={{ width: "100%", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff", outline: "none", fontFamily: "inherit" }}>
                  {ADM.PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ paddingBottom: 2 }}>
                <FieldLabel>Visible to client</FieldLabel>
                <button onClick={() => setVisible(v => !v)}
                  style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", borderRadius: 8, padding: "7px 12px", fontSize: 13, background: visible ? "#F8F7FF" : "#fff", cursor: "pointer", color: visible ? "var(--purple)" : "var(--text-muted)", fontFamily: "inherit" }}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${visible ? "var(--purple)" : "var(--border)"}`, background: visible ? "var(--purple)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {visible && <Icons.Check size={10} style={{ color: "#fff" }} />}
                  </span>
                  {visible ? "Yes" : "No"}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <FieldLabel>Internal Notes</FieldLabel>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes visible only to the team…"
                style={{ width: "100%", minHeight: 80, border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.5 }} />
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button className="btn btn-ghost" onClick={() => setStep("select")} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                <Icons.ChevronLeft size={14} /> Back
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 13 }}>Cancel</button>
                <button className="btn btn-primary" style={{ borderRadius: 8, padding: "0 20px", height: 38, fontSize: 13, fontWeight: 600 }}
                  onClick={() => { showToast("Task created."); onClose(); }}>Create Task</button>
              </div>
            </div>
          </div>
        )}
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
      {openTask && React.createElement(window.AdminTaskModal, { task: openTask, onClose: () => setOpenTask(null) })}
      {showNewTask && React.createElement(NewTaskModal, { phase: sel, onClose: () => setShowNewTask(false) })}
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
      {openTaskId && openTask && React.createElement(window.AdminTaskModal, { task: openTask, onClose: () => setOpenTaskId(null) })}
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
