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

            {task.comment && (
              <div style={{ marginTop: 20, borderTop: "0.5px solid var(--border-light)", paddingTop: 16 }}>
                <div className="label" style={{ marginBottom: 10 }}>Comments</div>
                <div style={{ display: "flex", gap: 11 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 99, background: "var(--raspberry)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flex: "0 0 28px" }}>KW</div>
                  <div>
                    <div style={{ fontSize: 12 }}><span style={{ fontWeight: 500 }}>{task.comment.who}</span><span className="meta"> · {task.comment.when}</span></div>
                    <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5, marginTop: 3 }}>{task.comment.text}</div>
                  </div>
                </div>
              </div>
            )}
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
            {task.checklist && (
              <div style={{ marginBottom: 16 }}>
                <div className="field-label">What to upload</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {task.checklist.map((c, i) => (
                    <div key={i} className="row" style={{ gap: 9, fontSize: 13, color: "#555" }}>
                      <span style={{ width: 15, height: 15, borderRadius: 4, border: "1.5px solid #D0CEC8", flex: "0 0 15px" }} /> {c}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ border: "1.5px dashed #E0C0D0", background: "#FEF8FB", borderRadius: 10, padding: "26px 16px", textAlign: "center", marginBottom: 16 }}>
              <div style={{ color: "var(--raspberry)", display: "flex", justifyContent: "center", marginBottom: 8 }}><I.Upload size={26} /></div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Drag & drop your files here</div>
              <div className="meta" style={{ marginTop: 3 }}>or <span style={{ color: "var(--raspberry)", fontWeight: 500 }}>browse to choose</span> — PDF, Word, or images</div>
            </div>
            <div className="field">
              <label className="field-label">Notes for your writer (optional)</label>
              <textarea className="textarea" placeholder="Anything we should know about these materials?" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" onClick={() => submit("Materials uploaded — thank you! Your writer will review them.")}>I've uploaded my materials</button>
          </>
        )}

        {task.type === "none" && !isReview && !isBook && !isUpload && (
          <div style={{ background: "var(--page-bg)", borderRadius: 8, padding: "16px", fontSize: 13, color: "#888" }}>
            There's nothing for you to do on this task yet.
          </div>
        )}
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
      </div>
    </Modal>
  );
}

Object.assign(window, { TaskDetailModal, UploadModal, AddOnsModal, ModalHeader });
