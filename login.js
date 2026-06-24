/* ============================================================
   Login / role selection  →  window
   ============================================================ */

function RoleCard({ icon, title, desc, selected, onClick }) {
  const { Icons } = window;
  const IconCmp = Icons[icon];
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 13, width: "100%", textAlign: "left",
        border: selected ? "1px solid var(--purple)" : "1px solid var(--border)",
        background: selected ? "rgba(130,17,255,0.05)" : "#fff",
        borderRadius: 10, padding: 14, transition: "all .14s",
      }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 9, flex: "0 0 38px", display: "flex", alignItems: "center", justifyContent: "center", background: selected ? "var(--purple)" : "#F4EFF9", color: selected ? "#fff" : "var(--purple)" }}>
        <IconCmp size={18} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{title}</div>
        <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: 99, border: selected ? "5px solid var(--purple)" : "1.5px solid #D0CEC8", transition: "all .14s" }} />
    </button>
  );
}

function Login() {
  const { navigate } = usePortal();
  const { Icons } = window;
  const [role, setRole] = React.useState(null);
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");

  React.useEffect(() => {
    if (role === "client") { setEmail("sarah@example.com"); }
    else if (role === "admin") { setEmail("kate@getherhired.com"); }
  }, [role]);

  const signIn = (e) => {
    e.preventDefault();
    navigate(role === "admin" ? "#/admin/dashboard" : "#/dashboard");
  };

  return (
    <div style={{ display: "flex", height: "100%", minWidth: 1024 }}>
      {/* Left */}
      <div style={{ flex: "0 0 40%", background: "var(--sidebar-bg)", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 99, background: "var(--raspberry)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 24, marginBottom: 22 }}>GH</div>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 30, letterSpacing: "-0.01em" }}>Get Her Hired</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: 16, maxWidth: 280, lineHeight: 1.6 }}>
          Your private space for career transformation.
        </div>
      </div>

      {/* Right */}
      <div style={{ flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <form onSubmit={signIn} style={{ width: 380, maxWidth: "100%" }}>
          <div className="h1" style={{ fontSize: 26 }}>Welcome to Get Her Hired</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 6, marginBottom: 26 }}>Select how you're signing in</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <RoleCard icon="User" title="Client" desc="Access your career portal" selected={role === "client"} onClick={() => setRole("client")} />
            <RoleCard icon="Briefcase" title="Admin" desc="Get Her Hired team access" selected={role === "admin"} onClick={() => setRole("admin")} />
          </div>

          {role && (
            <div style={{ marginTop: 24, animation: "fade .2s ease" }}>
              <div className="field">
                <label className="field-label">Email</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="field">
                <label className="field-label">Password</label>
                <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
              </div>
              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 4 }}>
                Sign In <Icons.ArrowRight size={15} />
              </button>
            </div>
          )}

          {!role && (
            <div style={{ marginTop: 24, fontSize: 11, color: "#AAA", textAlign: "center" }}>
              Choose a role above to continue
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

Object.assign(window, { Login });
