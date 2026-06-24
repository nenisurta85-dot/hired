/* ============================================================
   Sidebar + Layout  →  window
   ============================================================ */

function Sidebar({ route }) {
  const { navigate } = usePortal();
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

      {/* My Projects */}
      <div style={{ padding: "8px 18px 4px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>My Projects</div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--raspberry)", flex: "0 0 7px" }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "#fff" }}>Get Her Hired Package</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: "#555", flex: "0 0 7px" }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>Executive Package</span>
        </div>
      </div>

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
