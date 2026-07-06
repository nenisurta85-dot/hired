/* ============================================================
   App: router + global state + context  →  mounts #root
   ============================================================ */

function App() {
  const [route, setRoute] = React.useState(() => window.location.hash || "#/");
  const [toast, setToast] = React.useState(null);
  const [activeTask, setActiveTask] = React.useState(null);
  const [showAddons, setShowAddons] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(false);

  const PROJECTS = window.GHH.PROJECTS;
  const [activeProjectId, setActiveProjectId] = React.useState(PROJECTS[0].id);

  // Per-project mutable state — keyed by project id
  const [projectState, setProjectState] = React.useState(() => {
    const s = {};
    PROJECTS.forEach(p => {
      s[p.id] = {
        dashTasks: p.dashTasks,
        allTasks: p.allTasks,
        comments: p.comments,
        messages: p.messages,
      };
    });
    return s;
  });

  const proj = PROJECTS.find(p => p.id === activeProjectId) || PROJECTS[0];
  const ps = projectState[activeProjectId];
  const dashTasks = ps.dashTasks;
  const allTasks = ps.allTasks;
  const comments = ps.comments;
  const messages = ps.messages;

  const updateProjectState = (pid, patch) =>
    setProjectState(prev => ({ ...prev, [pid]: { ...prev[pid], ...patch } }));

  const switchProject = (pid) => {
    setActiveProjectId(pid);
    setActiveTask(null);
  };

  const toastTimer = React.useRef(null);

  React.useEffect(() => {
    const onHash = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (path) => {
    if (window.location.hash === path) setRoute(path);
    else window.location.hash = path;
    const main = document.querySelector(".page");
    if (main) main.scrollTop = 0;
  };

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const findTask = (id) =>
    dashTasks.find((t) => t.id === id) || allTasks.find((t) => t.id === id) || null;

  const openTask = (task) => setActiveTask(task);
  const openTaskById = (id) => { const t = findTask(id); if (t) setActiveTask(t); else showToast("Opening…"); };
  const closeTask = () => setActiveTask(null);

  const completeInList = (id) => {
    updateProjectState(activeProjectId, {
      dashTasks: ps.dashTasks.map(t => t.id === id ? { ...t, done: true } : t),
      allTasks: ps.allTasks.map(t => t.id === id ? { ...t, done: true } : t),
    });
  };
  const completeDash = (id) => { completeInList(id); showToast("Task marked complete."); };
  const completeTask = (id) => { completeInList(id); showToast("Task marked complete."); };

  const markCommentRead = (id) => {
    updateProjectState(activeProjectId, {
      comments: ps.comments.map(c => c.id === id ? { ...c, unread: false } : c),
    });
    showToast("Marked as read.");
  };

  const sendMessage = (text) => {
    const msg = { id: "m" + Date.now(), who: "Sarah K.", initials: "SK", role: "client", when: "just now", text, unread: false };
    updateProjectState(activeProjectId, { messages: [...ps.messages, msg] });
  };

  const ctx = {
    navigate, showToast,
    openTask, openTaskById, closeTask,
    openAddons: () => setShowAddons(true),
    openUpload: () => setShowUpload(true),
    dashTasks, allTasks, comments, messages,
    completeDash, completeTask, markCommentRead, sendMessage,
    // project switcher
    projects: PROJECTS,
    activeProject: proj,
    switchProject,
    GHH: window.GHH, Icons: window.Icons,
  };

  // Routing
  let screen, isAuthed = true;
  const r = route.replace(/^#/, "");
  if (r === "/" || r === "") { isAuthed = false; screen = <Login />; }
  else if (r === "/admin" || r.startsWith("/admin/")) { return <AdminApp route={route} />; }
  else if (r === "/dashboard") screen = <Dashboard />;
  else if (r === "/files") screen = <MyFiles />;
  else if (r === "/sessions") screen = <MySessions />;
  else if (r === "/comments") screen = <Comments />;
  else if (r === "/messages") screen = <Messages />;
  else if (r === "/toolkit") screen = <Toolkit />;
  else if (r === "/tasks") screen = <MyTasks />;
  else if (r === "/help") screen = <Help />;
  else if (r === "/settings") screen = <Settings />;
  else { screen = <Dashboard />; }

  return (
    <PortalCtx.Provider value={ctx}>
      {isAuthed ? <Layout route={route}>{screen}</Layout> : screen}

      {activeTask && (
        <TaskDetailModal
          task={findTask(activeTask.id) || activeTask}
          onClose={closeTask}
          onComplete={(t) => completeInList(t.id)}
        />
      )}
      {showAddons && <AddOnsModal onClose={() => setShowAddons(false)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {toast && <Toast msg={toast} />}
    </PortalCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
