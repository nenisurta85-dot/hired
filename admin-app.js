/* ============================================================
   Admin app: routing + context  →  window.AdminApp
   Login (#/admin) sends here once a non-Client role is chosen.
   ============================================================ */

function AdminApp({ route }) {
  const [viewAs, setViewAs] = React.useState("Admin");
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);

  const navigate = (path) => {
    if (window.location.hash === path) { /* same */ } else window.location.hash = path;
    const main = document.querySelector(".admin-main");
    if (main) main.scrollTop = 0;
  };
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const ctx = { navigate, showToast, viewAs, setViewAs, ADM: window.ADM, Icons: window.Icons };

  // route like #/admin/projects/p1
  const parts = route.replace(/^#\/admin\/?/, "").split("/").filter(Boolean);
  const section = parts[0] || "dashboard";
  const sub = parts[1];

  let screen;
  switch (section) {
    case "dashboard": screen = <AdminDashboard />; break;
    case "clients": screen = sub ? <AdminClientDetail id={sub} /> : <AdminClients />; break;
    case "projects": screen = sub ? <AdminProjectDetail id={sub} /> : <AdminProjects />; break;
    case "tasks": screen = <AdminTasks />; break;
    case "documents": screen = <AdminDocuments />; break;
    case "schedule": screen = <AdminSchedule />; break;
    case "inbox": screen = <AdminInbox />; break;
    case "team": screen = <AdminTeam />; break;
    case "packages": screen = <AdminPackages />; break;
    case "task-templates": screen = <AdminTemplates />; break;
    case "knowledge-base": screen = <AdminKB />; break;
    default: screen = <AdminDashboard />;
  }

  // Non-admin role preview banner (View As)
  const previewBanner = viewAs !== "Admin" && viewAs !== "Client" && (
    <div style={{ background: "rgba(130,17,255,0.08)", color: "var(--purple)", fontSize: 12, fontWeight: 600, padding: "7px 32px", borderBottom: "0.5px solid var(--purple-border)", display: "flex", alignItems: "center", gap: 8 }}>
      <window.Icons.Info size={14} /> Previewing as <strong>{viewAs}</strong> — read-only view of what this role sees.
      <button className="btn btn-ghost" style={{ marginLeft: "auto", fontSize: 12 }} onClick={() => setViewAs("Admin")}>Exit preview ✕</button>
    </div>
  );

  return (
    <AdminCtx.Provider value={ctx}>
      <AdminLayout route={route}>
        {previewBanner}
        {screen}
      </AdminLayout>
      {toast && <Toast msg={toast} />}
    </AdminCtx.Provider>
  );
}

Object.assign(window, { AdminApp });
