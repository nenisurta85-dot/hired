/* ============================================================
   App: router + global state + context  →  mounts #root
   ============================================================ */

function App() {
  const [route, setRoute] = React.useState(() => window.location.hash || "#/");
  const [toast, setToast] = React.useState(null);
  const [activeTask, setActiveTask] = React.useState(null);
  const [showAddons, setShowAddons] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(false);

  const [dashTasks, setDashTasks] = React.useState(window.GHH.DASH_TASKS);
  const [allTasks, setAllTasks] = React.useState(window.GHH.ALL_TASKS);
  const [comments, setComments] = React.useState(window.GHH.COMMENTS);

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
    setDashTasks((list) => list.map((t) => (t.id === id ? { ...t, done: true } : t)));
    setAllTasks((list) => list.map((t) => (t.id === id ? { ...t, done: true } : t)));
  };
  const completeDash = (id) => { completeInList(id); showToast("Task marked complete."); };
  const completeTask = (id) => { completeInList(id); showToast("Task marked complete."); };

  const markCommentRead = (id) => {
    setComments((list) => list.map((c) => (c.id === id ? { ...c, unread: false } : c)));
    showToast("Marked as read.");
  };

  const ctx = {
    navigate, showToast,
    openTask, openTaskById, closeTask,
    openAddons: () => setShowAddons(true),
    openUpload: () => setShowUpload(true),
    dashTasks, allTasks, comments,
    completeDash, completeTask, markCommentRead,
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
