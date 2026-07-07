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
  const { showToast, navigate, activeProject } = usePortal();
  const I = window.Icons;
  const sessionsUp = (activeProject && activeProject.sessionsUp) || window.GHH.SESSIONS_UP;
  const [next, ...rest] = sessionsUp;

  if (!next) return (
    <Card style={{ marginBottom: 16 }}>
      <div className="label" style={{ marginBottom: 12 }}>Upcoming Sessions</div>
      <div style={{ fontSize: 13, color: "#aaa" }}>No upcoming sessions.</div>
      <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => navigate("#/sessions")}>View all sessions →</button>
    </Card>
  );

  return (
    <Card style={{ marginBottom: 16 }}>
      <div className="label" style={{ marginBottom: 12 }}>Upcoming Sessions</div>

      {/* Next session — prominent */}
      <div className="row" style={{ gap: 11, alignItems: "flex-start" }}>
        <span style={{ width: 32, height: 32, borderRadius: 99, background: "var(--purple-light)", color: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 32px" }}><I.Video size={16} /></span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{next.title}</div>
          <div className="meta" style={{ marginTop: 2 }}>{next.when}</div>
          <div className="small" style={{ marginTop: 1 }}>{next.duration}</div>
        </div>
      </div>
      {next.booked ? (
        <>
          <button className="btn btn-primary btn-block" style={{ height: 38, marginTop: 12 }} onClick={() => showToast("Opening Zoom…")}>
            <I.Video size={15} /> Join on Zoom
          </button>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={() => navigate("#/sessions")}>Reschedule</button>
        </>
      ) : (
        <button className="btn btn-primary btn-block" style={{ height: 38, marginTop: 12 }} onClick={() => showToast("Opening booking calendar…")}>
          <I.Calendar size={15} /> Book Session
        </button>
      )}

      {/* Next 2 sessions — compact */}
      {rest.slice(0, 2).length > 0 && (
        <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
          {rest.slice(0, 2).map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <I.Video size={12} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
              <span style={{ flex: 1, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
              <span className="meta" style={{ flexShrink: 0 }}>{s.when.replace("Not yet scheduled", "TBD")}</span>
              <button onClick={() => showToast("Opening Zoom…")}
                style={{ background: "none", border: "none", color: "var(--purple)", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0, padding: 0, whiteSpace: "nowrap" }}>
                Join on Zoom →
              </button>
            </div>
          ))}
        </div>
      )}

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

function MessageTeamCard() {
  const { messages, sendMessage, navigate } = usePortal();
  const { Icons } = window;
  const [text, setText] = React.useState("");
  const unreadCount = messages.filter(m => m.unread).length;
  const preview = messages.slice(-2);

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    sendMessage(t);
    setText("");
  };

  return (
    <Card style={{ marginTop: 14 }}>
      <div className="row between" style={{ marginBottom: 10 }}>
        <div className="row" style={{ gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".6px", textTransform: "uppercase", color: "var(--text-secondary)" }}>Message Your Team</span>
          {unreadCount > 0 && (
            <span style={{ background: "var(--raspberry)", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 99, minWidth: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{unreadCount}</span>
          )}
        </div>
      </div>

      {preview.length === 0 ? (
        <div style={{ fontSize: 12, color: "#aaa", padding: "8px 0 10px", lineHeight: 1.5 }}>Questions about your project? Message your team.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {preview.map(m => (
            <div key={m.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ width: 24, height: 24, borderRadius: 99, background: m.role === "client" ? "var(--raspberry)" : "var(--purple)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, flex: "0 0 24px" }}>{m.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11 }}>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{m.role === "client" ? "You" : m.who}</span>
                  <span className="meta"> · {m.when}</span>
                  {m.unread && <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: 99, background: "var(--raspberry)", marginLeft: 5, verticalAlign: "middle" }} />}
                </div>
                <div style={{ fontSize: 11, color: "#888", lineHeight: 1.4, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
          placeholder="Write a message…"
          style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 8, padding: "7px 10px", fontSize: 12, fontFamily: "inherit", outline: "none", background: "var(--page-bg)", color: "var(--text-primary)" }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          style={{ background: text.trim() ? "var(--raspberry)" : "var(--border)", color: text.trim() ? "#fff" : "#aaa", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: text.trim() ? "pointer" : "default", flexShrink: 0 }}>
          <Icons.Send size={13} />
        </button>
      </div>

      <button className="btn btn-ghost" style={{ marginTop: 10, width: "100%", textAlign: "left", fontSize: 11 }} onClick={() => navigate("#/messages")}>
        Open messages →
      </button>
    </Card>
  );
}

function AddBanner() {
  return (
    <div style={{ background: "var(--page-bg)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12, padding: "14px 16px", marginTop: 14, boxShadow: "var(--shadow-card)" }}>
      <div className="row between" style={{ gap: 16, flexWrap: "wrap" }}>
        <div>
          <div className="row" style={{ gap: 8, fontSize: 14, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <span style={{ color: "var(--raspberry)" }}>✦</span> Want to add something to your package?
          </div>
          <div className="meta" style={{ marginTop: 4 }}>Interview prep, LinkedIn optimization, cover letters — you can add services anytime.</div>
        </div>
        <a href="addon-landing.html" style={{ color: "var(--raspberry)", fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
          View Add-ons &amp; Upgrades →
        </a>
      </div>
    </div>
  );
}

/* ---------- Share your experience widgets ---------- */
function ShareExperienceRow() {
  const { Icons } = window;
  const [done, setDone] = React.useState({ review: false, linkedin: false, survey: false, video: false });
  const [videoConfirm, setVideoConfirm] = React.useState(false);
  const fileRef = React.useRef(null);

  const markDone = (key) => setDone(d => ({ ...d, [key]: true }));

  const DoneOverlay = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "12px 0 4px" }}>
      <div style={{ width: 36, height: 36, borderRadius: 99, background: "rgba(0,160,108,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icons.Check size={18} style={{ color: "#00A06C" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#00A06C" }}>Done — thank you!</span>
    </div>
  );

  const WIDGETS = [
    {
      key: "review",
      bg: "#FBEAF0", border: "#F0AEC5", chip: "#F4C0D1",
      titleColor: "#4B1528", textColor: "#993556", btnColor: "#993556",
      icon: "Star", title: "Leave a Google review",
      text: "Loved the process? A few kind words help others find us.",
      actions: (
        <button
          style={{ background: "#993556", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" }}
          onClick={() => markDone("review")}>
          Leave a review
        </button>
      ),
    },
    {
      key: "linkedin",
      bg: "#E6F1FB", border: "#9BC6EE", chip: "#B5D4F4",
      titleColor: "#042C53", textColor: "#0C447C", btnColor: "#185FA5",
      icon: "Linkedin", title: "Write a LinkedIn recommendation",
      text: "Vouch for your writer — it takes two minutes and means a lot.",
      actions: (
        <button
          style={{ background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" }}
          onClick={() => markDone("linkedin")}>
          Write recommendation
        </button>
      ),
    },
    {
      key: "survey",
      bg: "#E1F5EE", border: "#7FD3B5", chip: "#9FE1CB",
      titleColor: "#085041", textColor: "#0F6E56", btnColor: "#0F6E56",
      icon: "ClipboardCheck", title: "Complete the satisfaction survey",
      text: "Tell us how we did — your feedback shapes what's next.",
      actions: (
        <a href="#survey-placeholder"
          style={{ display: "block", background: "#0F6E56", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}
          onClick={(e) => { e.preventDefault(); markDone("survey"); }}>
          Take the survey
        </a>
      ),
    },
    {
      key: "video",
      bg: "#EEEDFE", border: "#B8B2F0", chip: "#CECBF6",
      titleColor: "#26215C", textColor: "#3C3489", btnColor: "#3C3489",
      icon: "Video", title: "Record a video testimonial",
      text: "Share your story on camera — or let us handle it for you.",
      actions: null,
    },
  ];

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".7px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 14 }}>Help us grow — share your experience</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}
        className="share-experience-grid">
        {WIDGETS.map((w) => {
          const IconCmp = Icons[w.icon];
          const isDone = done[w.key];
          return (
            <div key={w.key}
              style={{ background: w.bg, border: `1px solid ${w.border}`, borderRadius: 14, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 12, opacity: isDone ? 0.7 : 1, transition: "opacity .2s" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: w.chip, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: w.titleColor }}>
                  {IconCmp && <IconCmp size={18} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: w.titleColor, lineHeight: 1.3 }}>{w.title}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: w.textColor, lineHeight: 1.55, flex: 1 }}>{w.text}</div>
              {isDone ? <DoneOverlay /> : (
                w.key === "video" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,.mp4,.mov" style={{ display: "none" }}
                      onChange={() => { if (fileRef.current?.files?.length) markDone("video"); }} />
                    {videoConfirm
                      ? <div style={{ fontSize: 12, fontWeight: 600, color: "#3C3489", textAlign: "center", padding: "6px 0" }}>We're on it! Your writer will reach out soon.</div>
                      : <>
                          <button
                            style={{ background: "#3C3489", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                            onClick={() => fileRef.current?.click()}>
                            I'll record myself
                          </button>
                          <button
                            style={{ background: "transparent", color: "#3C3489", border: "1.5px solid #3C3489", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                            onClick={() => { setVideoConfirm(true); markDone("video"); }}>
                            Do it for me
                          </button>
                        </>
                    }
                  </div>
                ) : w.actions
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
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
          <MessageTeamCard />
        </div>
      </div>
      <ShareExperienceRow />
    </div>
  );
}

Object.assign(window, { Dashboard });
