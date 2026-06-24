/* ============================================================
   Admin · Clients (list + onboard slide-over + detail)
   →  window.AdminClients, window.AdminClientDetail
   ============================================================ */

function OnboardSlideOver({ onClose }) {
  const { showToast } = useAdmin();
  const Section = ({ title, children }) => (
    <div style={{ paddingBottom: 18, marginBottom: 18, borderBottom: "0.5px solid var(--border-light)" }}>
      <div className="label" style={{ marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
  return (
    <SlideOver title="Onboard New Client" onClose={onClose}
      subtitle="Creates a client, project, and resume review meeting in one step. G Drive folder created automatically."
      footer={<>
        <button className="btn btn-ghost" style={{ color: "#888" }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { showToast("Client onboarded — project + meeting created."); onClose(); }}>Onboard Client</button>
      </>}>
      <Section title="Client Info">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label className="field-label">First Name *</label><input className="input" /></div>
          <div className="field"><label className="field-label">Last Name *</label><input className="input" /></div>
        </div>
        <div className="field"><label className="field-label">Email *</label><input className="input" type="email" /></div>
        <div className="field" style={{ marginBottom: 0 }}><label className="field-label">LinkedIn URL</label><input className="input" placeholder="linkedin.com/in/…" /></div>
      </Section>
      <Section title="Résumé">
        <div style={{ border: "1.5px dashed #E0C0D0", background: "#FEF8FB", borderRadius: 10, padding: "20px 16px", textAlign: "center" }}>
          <div style={{ color: "var(--raspberry)", display: "flex", justifyContent: "center", marginBottom: 6 }}><window.Icons.Upload size={22} /></div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Upload Résumé</div>
          <div className="meta" style={{ marginTop: 2 }}>PDF, DOC, or DOCX</div>
        </div>
      </Section>
      <Section title="Intake Questionnaire">
        <div className="field"><label className="field-label">How did they hear about us?</label><input className="input" /></div>
        <div className="field"><label className="field-label">Job search status</label><input className="input" /></div>
        <div className="field"><label className="field-label">Motivation</label><textarea className="textarea" /></div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
          <div className="field" style={{ marginBottom: 0 }}><label className="field-label">Street</label><input className="input" /></div>
          <div className="field" style={{ marginBottom: 0 }}><label className="field-label">City</label><input className="input" /></div>
          <div className="field" style={{ marginBottom: 0 }}><label className="field-label">ZIP</label><input className="input" /></div>
        </div>
      </Section>
      <Section title="Résumé Review Meeting">
        <p className="meta" style={{ margin: "0 0 12px" }}>These fields populate the Client Brief visible to writers and on meeting prep.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field"><label className="field-label">Date</label><input className="input" type="date" /></div>
          <div className="field"><label className="field-label">Time</label><input className="input" type="time" /></div>
        </div>
        <div className="field" style={{ marginBottom: 0 }}><label className="field-label">Zoom Meeting ID</label><input className="input" /></div>
      </Section>
      <div>
        <div className="label" style={{ marginBottom: 12 }}>Intake Notes</div>
        <textarea className="textarea" placeholder="Questionnaire highlights, referral source, or anything worth noting before the call…" />
      </div>
    </SlideOver>
  );
}

function AdminClients() {
  const { navigate } = useAdmin();
  const { ADM, Icons } = window;
  const [tab, setTab] = React.useState("Active");
  const [search, setSearch] = React.useState("");
  const [me, setMe] = React.useState(false);
  const [onboard, setOnboard] = React.useState(false);

  const counts = {
    Lead: ADM.CLIENTS.filter((c) => c.stage === "Lead").length,
    Active: ADM.CLIENTS.filter((c) => c.stage === "Active").length,
    "90d Support": 0, Past: 0, All: ADM.CLIENTS.length,
  };
  const tabs = ["Lead", "Active", "90d Support", "Past", "All"];
  const rows = ADM.CLIENTS.filter((c) =>
    (tab === "All" || c.stage === tab) &&
    (!me || c.writer === "Lourdes H-D" || c.producer === "Lourdes H-D") &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const yn = (v) => v
    ? <span style={{ color: "#00A06C", display: "inline-flex" }}><Icons.CircleCheck size={16} /></span>
    : <span style={{ color: "var(--raspberry)", display: "inline-flex" }}><Icons.X size={15} /></span>;

  return (
    <div>
      <AdminHeader icon="User" title="Clients" subtitle="Manage your client pipeline" action={{ label: "+ Onboard New Client", onClick: () => setOnboard(true) }} />

      <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "0 32px" }}>
        <div className="tabs" style={{ marginBottom: 0, border: "none" }}>
          {tabs.map((t) => <button key={t} className={"tab" + (t === tab ? " active" : "")} onClick={() => setTab(t)}>{t} <span style={{ color: "#BBB" }}>[{counts[t]}]</span></button>)}
        </div>
      </div>

      <FilterBar search={search} onSearch={setSearch}
        right={<>
          <ToggleChip on={me} onToggle={() => setMe((v) => !v)} icon="User" color="var(--raspberry)">Me</ToggleChip>
          <button className="fpill"><Icons.ListChecks size={13} /> Columns</button>
          <button className="fpill" style={{ background: "var(--purple)", color: "#fff", borderColor: "var(--purple)" }} onClick={() => setOnboard(true)}><Icons.Plus size={13} /> Onboard New Client</button>
        </>}>
        <FilterPill label="Status" options={["On Track", "Behind"]} active="All" onChange={() => {}} />
        <FilterPill label="Blocking" options={["Resume", "LinkedIn", "Payment"]} active="All" onChange={() => {}} />
      </FilterBar>

      <div className="admin-body">
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table className="atable">
            <thead><tr>{["Name", "Status", "Email", "Package", "Next Meeting", "Resume", "LinkedIn", ""].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="clickable" onClick={() => navigate("#/admin/clients/" + c.id)}>
                  <td><div className="row" style={{ gap: 9 }}><Avatar initials={c.initials} color={c.color} size={30} /><span style={{ fontWeight: 600 }}>{c.name}</span></div></td>
                  <td><APill status={c.stage} /></td>
                  <td style={{ color: "#888" }}>{c.email}</td>
                  <td style={{ color: c.pkg === "—" ? "#AAA" : "inherit" }}>{c.pkg}</td>
                  <td style={{ color: "#888" }}>{c.next}</td>
                  <td>{yn(c.resume)}</td>
                  <td>{yn(c.linkedin)}</td>
                  <td onClick={(e) => e.stopPropagation()}><button className="icon-btn" style={{ border: "none" }}>⋯</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <EmptyState icon="User" title="No clients found" desc="Try a different tab or filter." />}
        </Card>
      </div>
      {onboard && <OnboardSlideOver onClose={() => setOnboard(false)} />}
    </div>
  );
}

/* ---------------- Client detail ---------------- */
function AdminClientDetail({ id }) {
  const { navigate, showToast } = useAdmin();
  const { ADM, Icons } = window;
  const c = ADM.CLIENTS.find((x) => x.id === id) || ADM.CLIENTS[0];
  const projects = ADM.PROJECTS.filter((p) => p.clientId === c.id);
  const stages = ["Lead", "Active", "90d Support", "Past"];
  const stageIdx = stages.indexOf(c.stage);

  const [copied, setCopied] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [aspirationalRole, setAspirationalRole] = React.useState("");
  const [targetIndustry, setTargetIndustry] = React.useState("");
  const [intakeNotes, setIntakeNotes] = React.useState("");

  const portalUrl = "getherhired.com/portal/setup/" + c.id;
  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(portalUrl); } catch(_) {}
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const Field = ({ k, v }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{k}</div>
      <div style={{ fontSize: 14, color: "var(--text-primary)" }}>{v || "—"}</div>
    </div>
  );

  const EditableField = ({ k, fieldKey, value, setValue, multiline }) => {
    const isEmpty = !value;
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{k}</div>
        {editing === fieldKey ? (
          multiline ? (
            <textarea autoFocus value={value} onChange={(e) => setValue(e.target.value)}
              onBlur={() => setEditing(null)}
              style={{ fontSize: 13, width: "100%", border: "1px solid var(--border)", borderRadius: 6, padding: 8, resize: "vertical", minHeight: 80, fontFamily: "'Space Grotesk',sans-serif", outline: "none", boxSizing: "border-box" }} />
          ) : (
            <input autoFocus value={value} onChange={(e) => setValue(e.target.value)}
              onBlur={() => setEditing(null)}
              onKeyDown={(e) => e.key === "Enter" && setEditing(null)}
              style={{ fontSize: 14, border: "none", borderBottom: "1px solid var(--purple)", outline: "none", width: "100%", background: "transparent", fontFamily: "'Space Grotesk',sans-serif", padding: "2px 0" }} />
          )
        ) : (
          <div onClick={() => setEditing(fieldKey)}
            style={{ fontSize: 14, cursor: "pointer", borderBottom: "1px dashed transparent", paddingBottom: 1, transition: "border-color 150ms, color 150ms", color: isEmpty ? "var(--text-muted)" : "var(--text-primary)", fontStyle: isEmpty ? "italic" : "normal" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = "var(--purple)"; e.currentTarget.style.color = "var(--purple)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = "transparent"; e.currentTarget.style.color = isEmpty ? "var(--text-muted)" : "var(--text-primary)"; }}>
            {value || "Click to add..."}
          </div>
        )}
      </div>
    );
  };

  const ProjectCard = ({ p }) => {
    const completed = p._override ? p._override.completed : 8;
    const total = p._override ? p._override.total : 21;
    return (
      <div onClick={() => navigate("#/admin/projects/" + p.id)}
        style={{ background: "var(--page-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", cursor: "pointer" }}>
        <div className="row between" style={{ alignItems: "center", gap: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
            <span className="badge" style={{ background: ADM.phaseColor(p.phase) + "1f", color: ADM.phaseColor(p.phase), fontWeight: 600 }}>{p.phase}</span>
            <APill status={p.status} />
          </div>
          <button className="btn btn-ghost" style={{ fontSize: 12, marginLeft: "auto" }} onClick={(e) => { e.stopPropagation(); navigate("#/admin/projects/" + p.id); }}>View Project ↗</button>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Writer: {p.writer} · Producer: {p.producer} · Started {p.start}</div>
        <div style={{ height: 4, background: "#E8E6E0", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
          <div style={{ height: "100%", width: Math.round((completed / total) * 100) + "%", background: "var(--purple)", borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "right", marginTop: 4 }}>{completed}/{total} tasks</div>
      </div>
    );
  };

  return (
    <div>
      {/* Gradient header */}
      <div style={{ background: "linear-gradient(135deg, #2D0A5E 0%, #8211FF 50%, #C8005A 100%)", height: 80, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          <span style={{ width: 40, height: 40, borderRadius: 99, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Icons.Users size={20} />
          </span>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 22, color: "#fff" }}>Client Details</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>View and manage client information</div>
          </div>
        </div>
        <button className="btn" style={{ background: "#fff", color: "var(--purple)", fontSize: 13, fontWeight: 600, borderRadius: 8, border: "none", padding: "0 16px", height: 36, cursor: "pointer" }} onClick={() => navigate("#/admin/clients")}>← Back to Clients</button>
      </div>

      <div style={{ padding: "20px 32px", background: "var(--page-bg)", minHeight: "calc(100vh - 80px)" }}>
        {/* Header card — includes onboarding row */}
        <Card style={{ padding: "14px 20px", marginBottom: 16, boxShadow: "var(--shadow-card)" }}>
          <div className="row between" style={{ alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Created {c.created}</div>
            </div>
            <div className="row" style={{ gap: 8, alignItems: "center" }}>
              <span className="badge" style={{ background: "rgba(0,160,108,0.12)", color: "#00A06C", borderRadius: 20, padding: "0 10px", height: 26, display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 600 }}>Active</span>
              <div style={{ width: "0.5px", height: 16, background: "var(--border)" }} />
              <button onClick={handleCopyLink} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "0.5px solid var(--border)", borderRadius: 6, padding: "0 12px", height: 28, fontSize: 12, color: "var(--text-primary)", background: "#fff", cursor: "pointer" }}>
                <Icons.Copy size={13} />{copied ? "Copied!" : "Portal link"}
              </button>
              <div style={{ width: "0.5px", height: 16, background: "var(--border)" }} />
              <button onClick={() => showToast("Edit client…")} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "none", background: "transparent", fontSize: 12, color: "var(--purple)", cursor: "pointer", padding: "0 4px" }}>
                <Icons.Edit size={14} />Edit
              </button>
            </div>
          </div>
          {/* Pipeline */}
          <div className="row" style={{ gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {stages.map((s, i) => (
              <React.Fragment key={s}>
                <span style={{ display: "inline-flex", alignItems: "center", height: 26, padding: "0 12px", borderRadius: 20, fontSize: 12, fontWeight: i === stageIdx ? 500 : 400, background: i === stageIdx ? "var(--purple)" : "transparent", color: i === stageIdx ? "#fff" : "var(--text-muted)", border: i === stageIdx ? "none" : "0.5px solid var(--border)", cursor: "default" }}>{s}</span>
                {i < stages.length - 1 && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>→</span>}
              </React.Fragment>
            ))}
          </div>
          {/* Onboarding fields — inside header card */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            {[["Next Meeting", c.next || "—"], ["Resume Review Call", c.created], ["Start Date", c.created]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
          {/* Contact row */}
          <div className="row" style={{ gap: 24, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
            <a href={"mailto:" + c.email} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--purple)", textDecoration: "none" }}>
              <Icons.Mail size={14} style={{ color: "var(--text-muted)" }} />{c.email}
            </a>
            <a href="tel:+15550000000" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-primary)", textDecoration: "none" }}>
              <Icons.Phone size={14} style={{ color: "var(--text-muted)" }} />+1 555 000 0000
            </a>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-primary)" }}>
              <Icons.MapPin size={14} style={{ color: "var(--text-muted)" }} />New York, NY
            </span>
          </div>
        </Card>

        {/* Full-width Projects card */}
        <div style={{ marginTop: 0 }}>
          <Card style={{ padding: "20px 24px", boxShadow: "var(--shadow-card)" }}>
            <div className="row between" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#AAAAAA" }}>Projects</div>
              <button className="btn btn-ghost" style={{ fontSize: 12, fontWeight: 500, color: "var(--purple)", background: "transparent", border: "none", cursor: "pointer", padding: 0 }} onClick={() => showToast("New project…")}>+ New Project</button>
            </div>
            {projects.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {projects.map((p) => (<ProjectCard key={p.id} p={p} />))}
                <ProjectCard p={{ id: projects[0] ? projects[0].id : "p1", name: "Executive Package", phase: "Week 1", status: "Behind", writer: "Mimi Bishop", producer: "Kate Wade", start: "Mar 15, 2026", _override: { completed: 3, total: 21 } }} />
              </div>
            ) : (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <Icons.Folder size={28} style={{ color: "var(--text-muted)", margin: "0 auto" }} />
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>No projects yet</div>
                <button className="btn btn-primary" style={{ marginTop: 12, fontSize: 13, borderRadius: 8, padding: "0 16px", height: 34 }} onClick={() => showToast("Create project…")}>+ Create Project</button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { AdminClients, AdminClientDetail });
