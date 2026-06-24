/* ============================================================
   Screens: MyFiles, MySessions, Comments, Toolkit, MyTasks,
            Help, Settings, Admin   →  window
   ============================================================ */

/* ---------------- My Files ---------------- */
function MyFiles() {
  const { openUpload, showToast } = usePortal();
  const I = window.Icons;
  const [tab, setTab] = React.useState("All");
  const [q, setQ] = React.useState("");
  const tabs = ["All", "Résumé", "LinkedIn", "Other"];

  const match = (f) =>
    (tab === "All" || f.cat === tab) &&
    (!q || f.name.toLowerCase().includes(q.toLowerCase()));

  const from = window.GHH.FILES_FROM.filter(match);
  const to = window.GHH.FILES_TO.filter(match);
  const onAction = (a, f) => showToast(`${a} — ${f.name}`);

  return (
    <div>
      <PageHeader title="My Files" sub="Documents and deliverables" />
      <div className="row" style={{ gap: 12, marginBottom: 18 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#AAA" }}><I.Search size={15} /></span>
          <input className="input" style={{ paddingLeft: 34 }} placeholder="Search files…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openUpload}><I.Plus size={15} /> Upload File</button>
      </div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <Card style={{ marginBottom: 14 }}>
        <div className="label" style={{ marginBottom: 6 }}>From Get Her Hired to me</div>
        {from.length ? from.map((f) => <FileRow key={f.id} file={f} onAction={onAction} />)
          : <EmptyState icon="FolderOpen" title="No files here yet" desc="Documents your team shares will appear here." />}
      </Card>

      <Card>
        <div className="label" style={{ marginBottom: 6 }}>From me to Get Her Hired</div>
        {to.length ? to.map((f) => <FileRow key={f.id} file={f} onAction={onAction} />)
          : <EmptyState icon="FolderOpen" title="Nothing shared yet" desc="Files you upload will appear here." />}
        <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={openUpload}>+ Add another file</button>
      </Card>
    </div>
  );
}

/* ---------------- My Sessions ---------------- */
function MySessions() {
  const { showToast, navigate } = usePortal();
  const I = window.Icons;
  const [tab, setTab] = React.useState("Upcoming");

  return (
    <div>
      <PageHeader title="Your Sessions" sub="Working calls with your coach" />
      <Tabs tabs={["Upcoming", "Past"]} active={tab} onChange={setTab} />

      {tab === "Upcoming" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {window.GHH.SESSIONS_UP.map((s) => (
            <Card key={s.id}>
              <div className="row between" style={{ flexWrap: "wrap", gap: 12 }}>
                <div className="row" style={{ gap: 12 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 9, background: "var(--blue-bg)", color: "var(--zoom)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 38px" }}><I.Video size={18} /></span>
                  <div>
                    <div className="row" style={{ gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</span>
                      <Badge status={s.status} />
                    </div>
                    <div className="meta" style={{ marginTop: 3 }}>{s.when}{s.booked ? ` · ${s.duration}` : ""}</div>
                  </div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  {s.booked ? (
                    <>
                      <button className="btn btn-zoom" onClick={() => showToast("Opening Zoom…")}><I.Video size={15} /> Join on Zoom</button>
                      <button className="btn btn-secondary" onClick={() => showToast("Reschedule flow…")}>Reschedule</button>
                      <button className="btn btn-ghost" style={{ color: "#888" }} onClick={() => showToast("Session cancelled.")}>Cancel</button>
                    </>
                  ) : (
                    <button className="btn btn-primary" onClick={() => showToast("Pick a time to book this session.")}>Book This Session</button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          <div className="row" style={{ gap: 8, fontSize: 11, color: "#888", padding: "2px 4px" }}>
            <I.Info size={14} /> Sessions must be scheduled at least 7 days apart.
          </div>
        </div>
      )}

      {tab === "Past" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {window.GHH.SESSIONS_PAST.map((s) => (
            <Card key={s.id}>
              <div className="row between" style={{ flexWrap: "wrap", gap: 12 }}>
                <div className="row" style={{ gap: 12 }}>
                  <span style={{ width: 38, height: 38, borderRadius: 9, background: "var(--green-bg)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 38px" }}><I.CircleCheck size={18} /></span>
                  <div>
                    <div className="row" style={{ gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</span>
                      <Badge status="Complete" />
                    </div>
                    <div className="meta" style={{ marginTop: 3 }}>{s.when}</div>
                  </div>
                </div>
                {s.recording && <button className="btn btn-secondary" onClick={() => showToast("Opening recording…")}>View Recording</button>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Comments ---------------- */
function Comments() {
  const { comments, openTaskById, markCommentRead } = usePortal();
  const [tab, setTab] = React.useState("All");
  const tabs = ["All", "Unread", "By Document"];
  const unreadCount = comments.filter((c) => c.unread).length;

  let list = comments;
  if (tab === "Unread") list = comments.filter((c) => c.unread);

  const byDoc = {};
  if (tab === "By Document") comments.forEach((c) => { (byDoc[c.on] = byDoc[c.on] || []).push(c); });

  return (
    <div>
      <PageHeader
        title="Comments"
        sub="Feedback on your documents from the GHH team"
        right={unreadCount > 0 && <Badge style={{ background: "#FBEAF0", color: "#993556" }}>{unreadCount} unread</Badge>}
      />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === "By Document" ? (
        Object.keys(byDoc).map((doc) => (
          <div key={doc} style={{ marginBottom: 18 }}>
            <div className="label" style={{ marginBottom: 10 }}>{doc}</div>
            {byDoc[doc].map((c) => <CommentItem key={c.id} c={c} variant="wide" onOpen={(cm) => openTaskById(cm.taskId)} onMarkRead={(cm) => markCommentRead(cm.id)} />)}
          </div>
        ))
      ) : list.length ? (
        list.map((c) => <CommentItem key={c.id} c={c} variant="wide" onOpen={(cm) => openTaskById(cm.taskId)} onMarkRead={(cm) => markCommentRead(cm.id)} />)
      ) : (
        <EmptyState icon="CircleCheck" title="You're all caught up!" desc="No unread comments." />
      )}
    </div>
  );
}

/* ---------------- Toolkit ---------------- */
function ResourceCard({ r, onView }) {
  return (
    <div
      onClick={() => onView(r)}
      style={{ background: "#fff", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)", padding: 14, cursor: "pointer", boxShadow: "var(--shadow-card)", transition: "border-color .15s, box-shadow .15s ease, transform .15s ease", display: "flex", flexDirection: "column" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--purple)"; e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--purple)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>{r.tag}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{r.title}</div>
      <div className="meta" style={{ marginTop: 4, lineHeight: 1.4, flex: 1 }}>{r.desc}</div>
      <span style={{ fontSize: 11, fontWeight: 500, color: "var(--purple)", marginTop: 8 }}>View →</span>
    </div>
  );
}

function Toolkit() {
  const { showToast } = usePortal();
  const I = window.Icons;
  const [tab, setTab] = React.useState("All");
  const tabs = ["All", "Career Strategy", "Personal Brand", "Interviewing"];
  const groups = window.GHH.TOOLKIT.filter((g) => tab === "All" || g.cat === tab);
  const onView = (r) => showToast("Opening: " + r.title);

  return (
    <div>
      <PageHeader title="Toolkit" sub="Scripts, worksheets, and guides to power your career journey" />
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px", maxWidth: 760 }}>
        Your bonus resource library — 12 guides, scripts, and templates included with every Get Her Hired engagement.
      </p>

      <div style={{ background: "#FBEAF0", borderRadius: 10, padding: "12px 16px", marginBottom: 18 }}>
        <div className="row" style={{ gap: 9, fontSize: 13, fontWeight: 500, color: "#993556" }}>
          <I.Lightbulb size={16} /> Starting interviews? Open your Interview Prep Guide below →
        </div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {groups.map((g) => (
        <div key={g.group} style={{ marginBottom: 26 }}>
          <div className="h2" style={{ fontSize: 15 }}>{g.group}</div>
          <p className="meta" style={{ fontSize: 12, margin: "4px 0 14px", maxWidth: 720 }}>{g.desc}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {g.items.map((r) => <ResourceCard key={r.title} r={r} onView={onView} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- My Tasks ---------------- */
function MyTasks() {
  const { allTasks, openTask, completeTask, showToast } = usePortal();
  const [tab, setTab] = React.useState("All");
  const [showDone, setShowDone] = React.useState(false);
  const tabs = ["All", "Week 1", "Week 2", "Week 3", "Week 4"];

  const inTab = (t) => tab === "All" || t.week === tab;
  const done = allTasks.filter((t) => t.done && inTab(t));
  const active = allTasks.filter((t) => !t.done && inTab(t));
  const totalDone = allTasks.filter((t) => t.done).length;
  const pct = Math.round((totalDone / allTasks.length) * 100);

  return (
    <div>
      <PageHeader title="My Tasks" sub="Your action items for the Get Her Hired Package" />

      <Card style={{ marginBottom: 14 }}>
        <div className="row between" style={{ marginBottom: 8 }}>
          <span className="meta">Your progress</span>
          <span className="small">{totalDone} of {allTasks.length} done</span>
        </div>
        <div style={{ height: 4, borderRadius: 4, background: "var(--border)" }}>
          <div style={{ height: 4, borderRadius: 4, background: "var(--purple)", width: pct + "%", transition: "width .3s" }} />
        </div>
      </Card>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {done.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <button className="btn btn-ghost" style={{ color: "#888" }} onClick={() => setShowDone((v) => !v)}>
            ✓ {done.length} completed task{done.length > 1 ? "s" : ""} [{showDone ? "Hide ↑" : "Show ↓"}]
          </button>
          {showDone && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              {done.map((t) => <TaskCard key={t.id} task={t} />)}
            </div>
          )}
        </div>
      )}

      {active.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {active.map((t, i) => (
            <TaskCard key={t.id} task={{ ...t, highlight: i === 0, action: t.type === "review" ? "Review" : t.type === "book" ? "Book Session" : t.type === "upload" ? "Upload Files" : null }} onOpen={openTask} onComplete={() => completeTask(t.id)} />
          ))}
        </div>
      ) : (
        <EmptyState icon="ListChecks" title="No tasks here" desc="You're all caught up for this filter." />
      )}

      <button className="btn btn-ghost" style={{ marginTop: 18 }} onClick={() => showToast("Your question has been sent to the GHH team.")}>I have a task question</button>
    </div>
  );
}

/* ---------------- Help ---------------- */
function FaqItem({ item, open, onToggle }) {
  const I = window.Icons;
  return (
    <div style={{ borderBottom: "0.5px solid var(--border-light)" }}>
      <button onClick={onToggle} className="row between" style={{ width: "100%", background: "none", border: "none", padding: "14px 2px", textAlign: "left", gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{item.q}</span>
        <span style={{ color: "#AAA", flex: "0 0 auto" }}>{open ? <I.ChevronUp size={16} /> : <I.ChevronDown size={16} />}</span>
      </button>
      {open && <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, padding: "0 2px 16px", maxWidth: 700 }}>{item.a}</div>}
    </div>
  );
}

function Help() {
  const I = window.Icons;
  const [open, setOpen] = React.useState(0);
  return (
    <div>
      <PageHeader title="Help" sub="Your GHH team is here to help" />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 14, alignItems: "start" }}>
        <Card>
          <div className="label" style={{ marginBottom: 6 }}>Frequently asked</div>
          {window.GHH.FAQ.map((item, i) => (
            <FaqItem key={i} item={item} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </Card>
        <Card>
          <div className="label" style={{ marginBottom: 12 }}>Contact us</div>
          <div className="row" style={{ gap: 10, marginBottom: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, background: "#F4EFF9", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 34px" }}><I.MessageCircle size={16} /></span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>admin@getherhired.com</div>
              <div className="meta">We typically respond within 24 hours during business days.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function Settings() {
  const { showToast, navigate } = usePortal();
  const [name, setName] = React.useState("Sarah K.");
  const [li, setLi] = React.useState("linkedin.com/in/sarahk");
  const [pwModal, setPwModal] = React.useState(false);

  return (
    <div>
      <PageHeader title="Settings" />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
        <Card>
          <div className="label" style={{ marginBottom: 14 }}>Profile</div>
          <div className="field">
            <label className="field-label">Full Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Email</label>
            <input className="input" value="sarah@example.com" readOnly />
          </div>
          <div className="field">
            <label className="field-label">LinkedIn URL</label>
            <input className="input" value={li} onChange={(e) => setLi(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => showToast("Profile saved.")}>Save Changes</button>
        </Card>

        <Card>
          <div className="label" style={{ marginBottom: 14 }}>Preferences</div>
          <div className="field">
            <label className="field-label">Preferred file format</label>
            <select className="select"><option>Word</option><option>Google Docs</option><option>PDF</option></select>
          </div>
          <div className="field">
            <label className="field-label">Email notifications</label>
            <select className="select"><option>All</option><option>Important only</option><option>None</option></select>
          </div>
          <button className="btn btn-primary" onClick={() => showToast("Preferences saved.")}>Save Preferences</button>
        </Card>

        <Card>
          <div className="label" style={{ marginBottom: 14 }}>Security</div>
          <div className="row" style={{ gap: 14 }}>
            <button className="btn btn-secondary" onClick={() => setPwModal(true)}>Change Password</button>
            <button className="btn btn-ghost" style={{ color: "#E24B4A" }} onClick={() => navigate("#/")}>Log Out</button>
          </div>
        </Card>
      </div>

      {pwModal && (
        <Modal onClose={() => setPwModal(false)}>
          <ModalHeader title="Change Password" onClose={() => setPwModal(false)} />
          <div style={{ padding: "16px 20px" }}>
            <div className="field"><label className="field-label">Current password</label><input className="input" type="password" /></div>
            <div className="field"><label className="field-label">New password</label><input className="input" type="password" /></div>
            <div className="field"><label className="field-label">Confirm new password</label><input className="input" type="password" /></div>
            <button className="btn btn-primary" onClick={() => { showToast("Password updated."); setPwModal(false); }}>Update Password</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Admin placeholder ---------------- */
function Admin() {
  const { navigate } = usePortal();
  const I = window.Icons;
  return (
    <div style={{ display: "flex", height: "100%", minWidth: 1024 }}>
      <aside style={{ width: 200, flex: "0 0 200px", background: "#1A1A2E", height: "100%", color: "#fff", padding: "20px 18px" }}>
        <div className="row" style={{ gap: 11, marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--raspberry)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 13 }}>GH</div>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 14 }}>Get Her Hired</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Admin Portal</div>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ color: "rgba(255,255,255,0.6)" }} onClick={() => navigate("#/")}>← Back to login</button>
      </aside>
      <main className="page">
        <div className="page-inner">
          <PageHeader title="Admin Dashboard" sub="Coming soon — under construction." />
          <Card>
            <EmptyState icon="Lock" title="Admin Dashboard — coming soon" desc="The team-side portal (Kate, Jhoneth) is under construction." />
          </Card>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { MyFiles, MySessions, Comments, Toolkit, MyTasks, Help, Settings, Admin });
