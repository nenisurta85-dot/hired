/* ============================================================
   Sidebar + Layout  →  window
   ============================================================ */

function ProjectSwitcher() {
  const { projects, activeProject, switchProject, navigate } = usePortal();
  const { Icons } = window;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!projects || projects.length <= 1) return null;

  const STATUS_COLOR = { Active: "#00A06C", Inactive: "#AAA" };
  const STATUS_BG = { Active: "rgba(0,160,108,0.1)", Inactive: "rgba(0,0,0,0.06)" };

  return (
    <div ref={ref} style={{ position: "relative", padding: "10px 14px 0" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, padding: "8px 11px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#fff", textAlign: "left" }}>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeProject.name}</span>
        <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 99, padding: "2px 7px", background: STATUS_BG[activeProject.status], color: STATUS_COLOR[activeProject.status], flexShrink: 0 }}>{activeProject.status}</span>
        <Icons.ChevronDown size={13} style={{ flexShrink: 0, opacity: 0.6 }} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 14, right: 14, background: "#fff", borderRadius: 10, border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.14)", zIndex: 300, overflow: "hidden" }}>
          {projects.map(p => {
            const isActive = p.id === activeProject.id;
            return (
              <button key={p.id} onClick={() => { switchProject(p.id); setOpen(false); navigate("#/dashboard"); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 13px", border: "none", background: isActive ? "rgba(130,17,255,0.05)" : "#fff", cursor: "pointer", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: isActive ? 600 : 400, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                <span style={{ fontSize: 10, fontWeight: 600, borderRadius: 99, padding: "2px 7px", background: STATUS_BG[p.status], color: STATUS_COLOR[p.status], flexShrink: 0 }}>{p.status}</span>
                {isActive && <Icons.Check size={13} style={{ color: "var(--purple)", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Sidebar({ route }) {
  const { navigate, switchProject } = usePortal();
  const { Icons, GHH } = window;
  const activeKey = route.replace("#/", "") || "dashboard";

  return (
    <aside style={{ width: 200, flex: "0 0 200px", background: "var(--sidebar-bg)", height: "100%", display: "flex", flexDirection: "column", color: "#fff", overflowY: "auto" }} className="scrollbar-thin">
      {/* Logo */}
      <div style={{ padding: "20px 18px 18px", display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{ width: 32, height: 32, borderRadius: 99, background: "var(--raspberry)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>GH</div>
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 14 }}>Get Her Hired</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Client Portal</div>
        </div>
      </div>

      {/* Project switcher (only shown when >1 project) */}
      <ProjectSwitcher />

      {/* My Projects — dynamic list */}
      {(() => {
        const { projects, activeProject, switchProject } = usePortal();
        const projs = (projects && projects.length > 0) ? projects : [{ id: "proj1", name: "Get Her Hired Package", status: "Active" }];
        return (
          <div style={{ padding: "8px 18px 4px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>My Projects</div>
            {projs.map(p => {
              const isCurrent = activeProject && p.id === activeProject.id;
              const dotColor = p.status === "Active" ? "var(--raspberry)" : "#555";
              const textColor = isCurrent ? "#fff" : "rgba(255,255,255,0.45)";
              return (
                <button key={p.id} onClick={() => { switchProject && switchProject(p.id); navigate("#/dashboard"); }}
                  style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6, background: "none", border: "none", padding: 0, cursor: "pointer", width: "100%", textAlign: "left" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: dotColor, flex: "0 0 7px" }} />
                  <span style={{ fontSize: 12, fontWeight: isCurrent ? 500 : 400, color: textColor, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* Nav */}
      <nav style={{ marginTop: 18, flex: 1 }}>
        {GHH.NAV.map((item) => {
          const IconCmp = Icons[item.icon];
          const active = activeKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 11,
                padding: "10px 18px", border: "none", background: active ? "var(--sidebar-active)" : "transparent",
                borderLeft: active ? "2px solid var(--sidebar-border)" : "2px solid transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.45)",
                fontSize: 12, fontWeight: 500, textAlign: "left", transition: "background .12s, color .12s",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <IconCmp size={16} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: "var(--raspberry)", color: "#fff", fontSize: 10, fontWeight: 600, borderRadius: 99, minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "14px 18px", borderTop: "0.5px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 99, background: "var(--raspberry)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flex: "0 0 28px" }}>SK</div>
        <div style={{ lineHeight: 1.3, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#fff" }}>Sarah K.</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>sarah@example.com</div>
        </div>
      </div>
    </aside>
  );
}

function Layout({ route, children }) {
  return (
    <div className="app-shell">
      <Sidebar route={route} />
      <main className="page scrollbar-thin">
        <div className="page-inner">{children}</div>
      </main>
    </div>
  );
}

Object.assign(window, { Sidebar, Layout });
