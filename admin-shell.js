/* ============================================================
   Admin shell: context, sidebar (+View As), gradient header,
   universal filter bar, slide-over, layout  →  window
   ============================================================ */

const AdminCtx = React.createContext(null);
const useAdmin = () => React.useContext(AdminCtx);

/* ---------- Status pill (admin palette) ---------- */
function APill({ status, children, style }) {
  const statusLabels = { not_started: "Not Started", in_progress: "In Progress", overdue: "Overdue", complete: "Complete" };
  const s = window.ADM.STATUS_BADGE[status] || { bg: "#F1EFE8", fg: "#5F5E5A" };
  const label = statusLabels[status] || status;
  return <span className="badge" style={{ background: s.bg, color: s.fg, textTransform: /^[a-z]/.test(status) ? "capitalize" : "none", ...style }}>{children || label}</span>;
}

/* ---------- Avatar ---------- */
function Avatar({ initials, color = "#8211FF", size = 28 }) {
  return <div style={{ width: size, height: size, flex: `0 0 ${size}px`, borderRadius: 99, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 600 }}>{initials}</div>;
}

/* ---------- Sidebar ---------- */
function AdminSidebar({ route }) {
  const { navigate, viewAs, setViewAs, role, setRole } = useAdmin();
  const { Icons, ADM } = window;
  const activeKey = (route.split("/")[2] || "dashboard");

  const NavGroup = ({ title, items }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", padding: "0 18px 6px" }}>{title}</div>
      {items.map((item) => {
        const IconCmp = Icons[item.icon];
        const active = activeKey === item.key || (item.key === "projects" && route.includes("/projects"));
        return (
          <button key={item.key} onClick={() => navigate(item.path)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, height: 36, padding: "0 16px", border: "none",
              background: active ? "var(--sidebar-active)" : "transparent",
              borderLeft: active ? "2px solid var(--purple)" : "2px solid transparent",
              color: active ? "#fff" : "rgba(255,255,255,0.45)",
              fontSize: 12, fontWeight: item.primary ? 700 : 500, textAlign: "left" }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
            <IconCmp size={16} /> <span style={{ flex: 1 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <aside style={{ width: 200, flex: "0 0 200px", background: "var(--sidebar-bg)", height: "100%", display: "flex", flexDirection: "column", color: "#fff", overflowY: "auto" }} className="scrollbar-thin">
      {/* Logo */}
      <div style={{ padding: "18px 18px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--raspberry)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 13 }}>GH</div>
          <div style={{ lineHeight: 1.25 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 14 }}>Get Her Hired</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Admin Portal</div>
          </div>
        </div>
      </div>

      {/* View As */}
      <div style={{ padding: "4px 18px 10px", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 7 }}>View As</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {["Admin", "Client"].map((r) => (
            <button key={r} onClick={() => { setViewAs(r); if (r === "Client") navigate("#/dashboard"); }}
              style={{ borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 500, cursor: "pointer", color: "#fff",
                background: viewAs === r ? "var(--raspberry)" : "transparent",
                border: viewAs === r ? "1px solid var(--raspberry)" : "1px solid rgba(255,255,255,0.25)" }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Role Switcher */}
      <div style={{ padding: "10px 18px 12px", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 7 }}>Role</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {["Admin", "Writer", "Admin Assistant"].map((r) => (
            <button key={r} onClick={() => setRole(r)}
              style={{ borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 500, cursor: "pointer", color: "#fff", textAlign: "left",
                background: role === r ? "var(--raspberry)" : "transparent",
                border: role === r ? "1px solid var(--raspberry)" : "1px solid rgba(255,255,255,0.25)" }}>{r}</button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ marginTop: 14, flex: 1 }}>
        <NavGroup title="Overview" items={ADM.NAV.overview} />
        <NavGroup title="Management" items={ADM.NAV.management.filter(item => !(role === "Writer" && item.key === "team"))} />
        <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)", margin: "4px 0", paddingTop: 8 }}>
          <button onClick={() => navigate("#/admin/dashboard")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, height: 34, padding: "0 16px", border: "none", background: "transparent", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 500, textAlign: "left" }}><Icons.Settings size={16} /> Settings</button>
          <button onClick={() => navigate("#/")} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, height: 34, padding: "0 16px", border: "none", background: "transparent", color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 500, textAlign: "left" }}><Icons.LogOut size={16} /> Log Out</button>
        </div>
      </nav>

      {/* User */}
      <div style={{ padding: "12px 18px", borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar initials="LH" color="var(--raspberry)" size={28} />
          <div style={{ lineHeight: 1.3, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>Lourdes H-D</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>lourdes@getherhired.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ---------- Gradient page header ---------- */
function AdminHeader({ icon = "FolderOpen", title, subtitle, action, back }) {
  const { Icons } = window;
  const IconCmp = Icons[icon] || Icons.FolderOpen;
  return (
    <div style={{ height: 80, background: "linear-gradient(135deg, #2D0A5E 0%, #8211FF 50%, #C8005A 100%)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 99, background: "rgba(255,255,255,0.15)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 40px" }}><IconCmp size={20} /></div>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 22, color: "#fff", letterSpacing: "-0.01em" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {back && <button className="hdr-btn" onClick={back.onClick}>← {back.label}</button>}
        {action && <button className="hdr-btn" onClick={action.onClick}>{action.label}</button>}
      </div>
    </div>
  );
}

/* ---------- Filter pill (with dropdown) ---------- */
function FilterPill({ label, options = [], active, onChange, optionLabels = {} }) {
  const { Icons } = window;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);
  const isActive = active && active !== "All";
  const displayLabel = (o) => optionLabels[o] || o;
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen((v) => !v)} className="fpill" style={{ background: isActive ? "var(--purple)" : "#fff", color: isActive ? "#fff" : "var(--text-primary)", borderColor: isActive ? "var(--purple)" : "var(--border)" }}>
        {isActive ? displayLabel(active) : label} <Icons.ChevronDown size={12} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 60, background: "#fff", border: "0.5px solid var(--border)", borderRadius: 8, boxShadow: "0 8px 28px rgba(0,0,0,.14)", minWidth: 170, padding: 6 }}>
          {["All", ...options].map((o) => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }} style={{ width: "100%", textAlign: "left", border: "none", background: o === active ? "var(--purple-light)" : "transparent", color: "var(--text-primary)", borderRadius: 6, padding: "7px 10px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 14, color: "var(--purple)" }}>{o === active ? "✓" : ""}</span>{displayLabel(o)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Toggle (Hide Completed / Me) ---------- */
function ToggleChip({ on, onToggle, children, icon, color = "var(--purple)" }) {
  const { Icons } = window;
  const IconCmp = icon ? Icons[icon] : null;
  return (
    <button onClick={onToggle} className="fpill" style={{ background: on ? color : "#fff", color: on ? "#fff" : "var(--text-secondary)", borderColor: on ? color : "var(--border)", gap: 6 }}>
      {IconCmp && <IconCmp size={13} />}{children}
    </button>
  );
}

/* ---------- Universal filter bar ---------- */
function FilterBar({ search, onSearch, children, right }) {
  const { Icons } = window;
  return (
    <div style={{ minHeight: 44, background: "#fff", borderBottom: "1px solid var(--border)", padding: "7px 16px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {onSearch != null && (
        <div style={{ position: "relative", width: 200 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#AAA" }}><Icons.Search size={14} /></span>
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search..." style={{ width: "100%", height: 30, border: "1px solid var(--border)", borderRadius: 6, padding: "0 10px 0 30px", fontSize: 13, outline: "none" }} />
        </div>
      )}
      {children}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>{right}</div>
    </div>
  );
}

/* ---------- Slide-over panel ---------- */
function SlideOver({ title, subtitle, onClose, children, footer, width = 480 }) {
  const { Icons } = window;
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", justifyContent: "flex-end", animation: "fade .15s ease" }}>
      <div className="scrollbar-thin" style={{ width, maxWidth: "100%", background: "#fff", height: "100%", display: "flex", flexDirection: "column", animation: "slideIn .2s ease-out" }}>
        <div style={{ padding: "18px 22px", borderBottom: "0.5px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 18 }}>{title}</div>
            {subtitle && <div className="meta" style={{ marginTop: 4, lineHeight: 1.4 }}>{subtitle}</div>}
          </div>
          <button className="modal-x" onClick={onClose}><Icons.X size={18} /></button>
        </div>
        <div className="scrollbar-thin" style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>{children}</div>
        {footer && <div style={{ padding: "14px 22px", borderTop: "0.5px solid var(--border-light)", display: "flex", justifyContent: "flex-end", gap: 10 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Layout ---------- */
function AdminLayout({ route, children }) {
  return (
    <div className="app-shell">
      <AdminSidebar route={route} />
      <main style={{ flex: 1, height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }} className="scrollbar-thin admin-main">
        {children}
      </main>
    </div>
  );
}

Object.assign(window, { AdminCtx, useAdmin, APill, Avatar, AdminSidebar, AdminHeader, FilterPill, ToggleChip, FilterBar, SlideOver, AdminLayout });
