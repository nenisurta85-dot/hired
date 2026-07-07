/* ============================================================
   Modals: TaskDetail, Upload, AddOns  →  window
   ============================================================ */

function ModalHeader({ title, status, meta, onClose }) {
  const I = window.Icons;
  return (
    <div style={{ padding: "18px 20px 14px", borderBottom: "0.5px solid var(--border-light)" }}>
      <div className="row between" style={{ alignItems: "flex-start", gap: 12 }}>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>{title}</span>
          {status && <Badge status={status} />}
        </div>
        <button className="modal-x" onClick={onClose} aria-label="Close"><I.X size={18} /></button>
      </div>
      {meta && (
        <div className="meta" style={{ marginTop: 8, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <span>{meta.phase}</span><span>·</span>
          <span>{meta.due}</span><span>·</span>
          <span>Assigned to {meta.assigned}</span><span>·</span>
          <span>{meta.priority} priority</span>
        </div>
      )}
    </div>
  );
}

function TaskDetailModal({ task, onClose, onComplete }) {
  const { showToast } = usePortal();
  const I = window.Icons;
  const [feedback, setFeedback] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const isReview = task.type === "review";
  const isBook = task.type === "book";
  const isUpload = task.type === "upload";
  const actionNeeded = !task.done;

  // Comment thread state (seeded from task.comment if present)
  const [threadComments, setThreadComments] = React.useState(() =>
    task.comment ? [{ id: "tc0", who: task.comment.who, initials: "KW", role: "team", when: task.comment.when, text: task.comment.text }] : []
  );
  const [commentText, setCommentText] = React.useState("");
  const handleSendComment = () => {
    const t = commentText.trim();
    if (!t) return;
    setThreadComments(prev => [...prev, { id: "tc" + Date.now(), who: "Sarah K.", initials: "SK", role: "client", when: "just now", text: t }]);
    setCommentText("");
    showToast("Comment posted.");
  };

  const submit = (msg) => { showToast(msg); onComplete(task); onClose(); };

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={task.title} status={task.done ? "Complete" : task.status} meta={task.meta} onClose={onClose} />
      <div style={{ padding: "16px 20px" }}>
        {task.detail && <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: "0 0 16px" }}>{task.detail}</p>}

        {isReview && (
          <>
            {task.doc && (
              <div style={{ background: "var(--page-bg)", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
                <div className="row between" style={{ gap: 10, flexWrap: "wrap" }}>
                  <span className="row" style={{ gap: 8, fontSize: 13, fontWeight: 500 }}><I.FileText size={16} /> {task.doc}</span>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn btn-secondary" style={{ padding: "7px 12px", borderColor: "#4285F4", color: "#4285F4" }} onClick={() => showToast("Opening in Google Docs…")}>Open in Google Docs</button>
                    <button className="btn btn-secondary" style={{ padding: "7px 12px" }} onClick={() => showToast("Downloading…")}><I.Download size={14} /> Download</button>
                  </div>
                </div>
              </div>
            )}
            <div className="field">
              <label className="field-label">Your feedback</label>
              <textarea className="textarea" placeholder="Leave your comments and questions for your writer…" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            </div>
            <button className="btn btn-primary" disabled={!feedback.trim()} onClick={() => submit("Feedback submitted — your writer has been notified.")}>Submit Feedback</button>
          </>
        )}

        {isBook && (
          <>
            {task.info && (
              <div style={{ background: "var(--page-bg)", borderRadius: 8, padding: "14px 16px", marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="row" style={{ gap: 8, fontSize: 13 }}><I.Clock size={15} /> {task.info.duration}</div>
                <div className="row" style={{ gap: 8, fontSize: 13 }}><I.Video size={15} /> {task.info.format}</div>
                <div className="row" style={{ gap: 8, fontSize: 13 }}><I.User size={15} /> Hosted by {task.info.host}</div>
              </div>
            )}
            <button className="btn btn-primary btn-block" onClick={() => submit("Session booked — check your email for the calendar invite.")}>Book Your Session</button>
          </>
        )}

        {isUpload && (
          <>
            <div style={{ border: "1.5px dashed #E0C0D0", background: "#FEF8FB", borderRadius: 10, padding: "26px 16px", textAlign: "center", marginBottom: 16 }}>
              <div style={{ color: "var(--raspberry)", display: "flex", justifyContent: "center", marginBottom: 8 }}><I.Upload size={26} /></div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Drag & drop your files here</div>
              <div className="meta" style={{ marginTop: 3 }}>or <span style={{ color: "var(--raspberry)", fontWeight: 500 }}>browse to choose</span> — PDF, Word, or images</div>
            </div>
            <button className="btn btn-primary btn-block" onClick={() => submit("Materials uploaded — thank you! Your writer will review them.")}>I've uploaded my materials</button>
          </>
        )}

        {task.type === "none" && !isReview && !isBook && !isUpload && (
          <div style={{ background: "var(--page-bg)", borderRadius: 8, padding: "16px", fontSize: 13, color: "#888" }}>
            There's nothing for you to do on this task yet.
          </div>
        )}

        {/* Comment thread — all task types */}
        <div style={{ marginTop: 20, borderTop: "0.5px solid var(--border-light)", paddingTop: 16 }}>
          <div className="label" style={{ marginBottom: 10 }}>Comments — Deliverables</div>
          {threadComments.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
              {threadComments.map(c => {
                const isClient = c.role === "client";
                const avatarBg = isClient ? "var(--raspberry)" : "var(--purple)";
                return (
                  <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: isClient ? "row-reverse" : "row" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 99, background: avatarBg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flex: "0 0 28px" }}>{c.initials}</div>
                    <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 2, alignItems: isClient ? "flex-end" : "flex-start" }}>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)", marginRight: 3 }}>{isClient ? "You" : c.who}</span>· {c.when}
                      </div>
                      <div style={{ background: isClient ? "var(--raspberry)" : "var(--page-bg)", color: isClient ? "#fff" : "#555", borderRadius: isClient ? "12px 3px 12px 12px" : "3px 12px 12px 12px", padding: "8px 12px", fontSize: 13, lineHeight: 1.5, border: isClient ? "none" : "1px solid var(--border)" }}>{c.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {threadComments.length === 0 && (
            <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>No comments yet. Leave a note for your writer.</div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
              placeholder="Leave a comment for your writer…"
              rows={2}
              style={{ flex: 1, resize: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 11px", fontSize: 13, fontFamily: "inherit", outline: "none", lineHeight: 1.5 }}
            />
            <button onClick={handleSendComment} disabled={!commentText.trim()}
              style={{ background: commentText.trim() ? "var(--raspberry)" : "var(--border)", color: commentText.trim() ? "#fff" : "#aaa", border: "none", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: commentText.trim() ? "pointer" : "default", flexShrink: 0 }}>
              <I.Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="row between" style={{ padding: "14px 20px", borderTop: "0.5px solid var(--border-light)" }}>
        <div />
        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-ghost" style={{ color: "#888" }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={actionNeeded && (isReview || isBook || isUpload)} onClick={() => { onComplete(task); onClose(); showToast("Task marked complete."); }}>
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

function UploadModal({ onClose }) {
  const { showToast } = usePortal();
  const I = window.Icons;
  const [desc, setDesc] = React.useState("");
  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Upload a File" onClose={onClose} />
      <div style={{ padding: "16px 20px" }}>
        <div style={{ border: "1.5px dashed #E0C0D0", background: "#FEF8FB", borderRadius: 10, padding: "32px 16px", textAlign: "center", marginBottom: 16 }}>
          <div style={{ color: "var(--raspberry)", display: "flex", justifyContent: "center", marginBottom: 8 }}><I.Upload size={28} /></div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Drag & drop a file here</div>
          <div className="meta" style={{ marginTop: 3 }}>or <span style={{ color: "var(--raspberry)", fontWeight: 500 }}>browse</span> — PDF, Word, or images</div>
        </div>
        <div className="field">
          <label className="field-label">Description (optional)</label>
          <textarea className="textarea" placeholder="What is this file?" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-primary" onClick={() => { showToast("File uploaded."); onClose(); }}>Upload File</button>
          <button className="btn btn-ghost" style={{ color: "#888" }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

function AddOnsModal({ onClose }) {
  const { showToast, GHH } = usePortal();
  const I = window.Icons;
  const [discountCode, setDiscountCode] = React.useState("");
  const [discountApplied, setDiscountApplied] = React.useState(false);

  const applyCode = () => {
    if (discountCode.trim().toUpperCase() === "GHH10-24H") {
      setDiscountApplied(true);
      showToast("10% discount applied!");
    } else {
      showToast("Invalid or expired code.");
    }
  };

  return (
    <Modal onClose={onClose} wide>
      <ModalHeader title="Expand Your Package" onClose={onClose} />
      <div style={{ padding: "16px 20px 22px" }}>
        <p style={{ fontSize: 13, color: "#555", margin: "0 0 16px" }}>Add a service to your engagement anytime — your writer will reach out to get started.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {window.GHH.ADDONS.map((a) => (
            <div key={a.title} style={{ border: "0.5px solid var(--border)", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{a.title}</div>
              <div className="meta" style={{ flex: 1, lineHeight: 1.4 }}>{a.desc}</div>
              <button className="btn btn-secondary" style={{ marginTop: 12, alignSelf: "flex-start", padding: "6px 14px" }} onClick={() => showToast(a.title + " requested — we'll be in touch.")}>
                <I.Plus size={14} /> Add
              </button>
            </div>
          ))}
        </div>
        {/* Discount code field */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--text-secondary)", marginBottom: 8 }}>Discount code</div>
          {discountApplied ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#00A06C", fontWeight: 600 }}>
              <I.CircleCheck size={15} /> 10% discount applied — code: <span style={{ fontFamily: "monospace", fontWeight: 700 }}>GHH10-24H</span>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") applyCode(); }}
                placeholder="Enter code (e.g. GHH10-24H)"
                style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff" }}
              />
              <button onClick={applyCode} style={{ background: "var(--purple)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Apply</button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { TaskDetailModal, UploadModal, AddOnsModal, ModalHeader });
