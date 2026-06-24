/* ============================================================
   UI primitives + shared context  →  window
   ============================================================ */

const PortalCtx = React.createContext(null);
const usePortal = () => React.useContext(PortalCtx);

/* ---------- Badge ---------- */
function Badge({ status, children, style }) {
  const s = (window.GHH.STATUS[status]) || { bg: "#F1EFE8", fg: "#5F5E5A" };
  return (
    <span className="badge" style={{ background: s.bg, color: s.fg, ...style }}>
      {children || status}
    </span>
  );
}

/* ---------- Card ---------- */
function Card({ children, className = "", style, ...p }) {
  return <div className={"card " + className} style={style} {...p}>{children}</div>;
}

/* ---------- Quick-complete button with confirm tooltip ---------- */
function QuickComplete({ done, onComplete, label }) {
  const [confirm, setConfirm] = React.useState(false);
  const { Icons } = window;
  if (done) {
    return (
      <button className="qc-btn done" title="Completed" aria-label="Completed" disabled>
        <Icons.Check size={16} />
      </button>
    );
  }
  return (
    <div style={{ position: "relative" }}>
      <button
        className="qc-btn"
        aria-label={"Mark complete: " + (label || "")}
        onClick={(e) => { e.stopPropagation(); setConfirm((v) => !v); }}
      >
        <Icons.Check size={16} />
      </button>
      {confirm && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 20,
            background: "#fff", border: "0.5px solid var(--border)", borderRadius: 10,
            boxShadow: "0 8px 28px rgba(0,0,0,.14)", padding: "12px 14px", width: 210,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Mark this task as complete?</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary" style={{ padding: "7px 12px", fontSize: 12, borderColor: "var(--green)", color: "var(--green)" }}
              onClick={() => { setConfirm(false); onComplete(); }}>
              <Icons.Check size={14} /> Yes
            </button>
            <button className="btn btn-ghost" style={{ color: "#888", padding: "7px 8px" }} onClick={() => setConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Task card ---------- */
function TaskCard({ task, onOpen, onComplete }) {
  const { Icons } = window;
  const is = window.GHH.ICON_STYLE[task.type] || window.GHH.ICON_STYLE.none;
  const IconCmp = Icons[is.icon] || Icons.FileText;
  const muted = task.muted && !task.done;
  const clickable = !!onOpen && task.type !== "none";
  return (
    <div
      className={"task-card" + (task.highlight && !task.done ? " highlight" : "") + (task.done ? " done" : "") + (clickable ? " clickable" : "")}
      onClick={clickable ? () => onOpen(task) : undefined}
    >
      <div className="task-icon" style={{ background: task.done ? "var(--green-bg)" : is.bg, color: task.done ? "var(--green)" : is.fg }}>
        {task.done ? <Icons.Check size={16} /> : <IconCmp size={16} />}
      </div>
      <div className="task-body">
        <div className={"task-title" + (task.done ? " struck" : muted ? " muted" : "")}>
          {task.title}
          {!task.done && <Badge status={task.status} />}
          {task.done && <Badge status="Complete" />}
        </div>
        {task.desc && <div className="task-desc">{task.desc}</div>}
        {task.due && (
          <div style={{ fontSize: 11, color: "#AAAAAA", marginTop: 2 }}>{task.due}</div>
        )}
      </div>
      <div className="task-actions" onClick={(e) => e.stopPropagation()}>
        {task.due && !task.desc && !task.week && (
          <span style={{ fontSize: 12, color: task.due?.toLowerCase().includes('overdue') ? '#E53935' : '#AAAAAA', flexShrink: 0, marginRight: 8, whiteSpace: 'nowrap' }}>{task.due}</span>
        )}
        {task.action && !task.done && (
          <button className="btn btn-secondary" onClick={() => onOpen && onOpen(task)}>{task.action}</button>
        )}
        {onComplete && <QuickComplete done={task.done} onComplete={() => onComplete(task)} label={task.title} />}
      </div>
    </div>
  );
}

/* ---------- File row ---------- */
function FileRow({ file, onAction }) {
  const { Icons } = window;
  const IconCmp = Icons[file.icon] || Icons.FileText;
  return (
    <div className="row" style={{ gap: 14, padding: "13px 0", borderBottom: "0.5px solid var(--border-light)" }}>
      <div className="task-icon" style={{ background: "#F4EFF9", color: "#8211FF" }}><IconCmp size={16} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{file.name}</span>
          {file.status && <Badge status={file.status} />}
        </div>
        <div className="meta" style={{ marginTop: 3 }}>{file.kind} · {file.date}</div>
      </div>
      <div className="row" style={{ gap: 8 }}>
        {file.actions.map((a) => (
          <button key={a} className="btn btn-secondary" style={{ padding: "7px 14px" }} onClick={() => onAction(a, file)}>{a}</button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Comment item ---------- */
function CommentItem({ c, onOpen, onMarkRead, variant = "compact" }) {
  const { navigate } = usePortal();
  const wide = variant === "wide";
  return (
    <div
      style={{
        display: "flex", gap: 11,
        background: c.unread ? "var(--raspberry-light)" : "#fff",
        border: wide ? "0.5px solid var(--border)" : "none",
        borderLeft: wide && c.unread ? "3px solid var(--raspberry)" : (wide ? "0.5px solid var(--border)" : "none"),
        borderRadius: wide ? 10 : 8,
        padding: wide ? "14px 16px" : "10px 10px",
        marginBottom: wide ? 12 : 0,
        alignItems: "flex-start",
      }}
    >
      {!wide && (
        <span style={{ width: 7, height: 7, borderRadius: 99, flex: "0 0 7px", marginTop: 7, background: c.unread ? "var(--raspberry)" : "#CCC" }} />
      )}
      <div style={{ width: wide ? 32 : 26, height: wide ? 32 : 26, flex: `0 0 ${wide ? 32 : 26}px`, borderRadius: 99, background: "var(--raspberry)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: wide ? 12 : 11, fontWeight: 600 }}>
        {c.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: wide ? 13 : 12 }}>
          <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{c.who}</span>
          <span className="meta"> · {c.when}</span>
        </div>
        <button
          onClick={() => (c.taskId ? onOpen(c) : navigate("#/comments"))}
          style={{ background: "none", border: "none", padding: "2px 0", display: "block", fontSize: wide ? 12 : 11, color: "var(--raspberry)", fontWeight: 500, cursor: "pointer" }}
        >
          on {c.on}
        </button>
        <div style={{ fontSize: wide ? 13 : 12, color: wide ? "#444" : "#555", lineHeight: 1.5, marginTop: 2, ...(wide ? {} : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }) }}>
          {c.text}
        </div>
        {wide && c.unread && (
          <div style={{ textAlign: "right", marginTop: 8 }}>
            <button className="btn btn-ghost" style={{ color: "#AAA", fontSize: 11 }} onClick={() => onMarkRead(c)}>Mark as read</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Modal ---------- */
function Modal({ children, onClose, wide }) {
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={"modal scrollbar-thin" + (wide ? " modal-wide" : "")}>{children}</div>
    </div>
  );
}

/* ---------- Toast ---------- */
function Toast({ msg }) {
  const { Icons } = window;
  return <div className="toast"><Icons.CircleCheck size={15} />{msg}</div>;
}

/* ---------- Empty state ---------- */
function EmptyState({ icon = "Inbox", title, desc }) {
  const { Icons } = window;
  const IconCmp = Icons[icon] || Icons.Inbox;
  return (
    <div className="empty">
      <div className="empty-icon"><IconCmp size={32} /></div>
      <div className="empty-title">{title}</div>
      {desc && <div className="empty-desc">{desc}</div>}
    </div>
  );
}

/* ---------- Page header ---------- */
function PageHeader({ title, sub, right }) {
  return (
    <div className="page-header row between" style={{ alignItems: "flex-start" }}>
      <div>
        <div className="h1">{title}</div>
        {sub && <div className="meta" style={{ fontSize: 12 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ---------- Tabs ---------- */
function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t} className={"tab" + (t === active ? " active" : "")} onClick={() => onChange(t)}>{t}</button>
      ))}
    </div>
  );
}

Object.assign(window, {
  PortalCtx, usePortal, Badge, Card, QuickComplete, TaskCard,
  FileRow, CommentItem, Modal, Toast, EmptyState, PageHeader, Tabs,
});
