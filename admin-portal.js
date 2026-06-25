/* ============================================================
   Admin Portal — mock data  →  window.ADM
   ============================================================ */
(function () {
  const TEAM = [
    { id: "jb", name: "Jhoneth Briones", email: "jhoneth@getherhired.com", initials: "JB", roles: ["admin", "writer"], cap: "0 / 5", load: 35, status: "Active", color: "#8211FF" },
    { id: "kw", name: "Kate Wade", email: "kate@getherhired.com", initials: "KW", roles: ["admin", "writer"], cap: "3 / 5", load: 62, status: "Active", color: "#C8005A", flagged: true },
    { id: "lh", name: "Lourdes H-D", email: "lourdes@getherhired.com", initials: "LH", roles: ["admin", "writer"], cap: "2 / 5", load: 48, status: "Active", color: "#185FA5" },
    { id: "mb", name: "Mimi Bishop", email: "mimi@getherhired.com", initials: "MB", roles: ["writer"], cap: "4 / 5", load: 80, status: "Active", color: "#0F9E75" },
    { id: "ed", name: "Erin Doyle", email: "erin@getherhired.com", initials: "ED", roles: ["editor"], cap: "1 / 5", load: 22, status: "Inactive", color: "#854F0B" },
  ];

  const PHASES = ["Onboarding", "Week 1", "Week 2", "Week 3", "Complete"];
  const phaseColor = (p) => ({
    "Initial Interest": "#6B3FA0",
    "Onboarding":       "#8A6A00",
    "Week 1":           "#3A6A10",
    "Week 2":           "#3A6A10",
    "Week 3":           "#3A6A10",
    "Active Project":   "#3A6A10",
    "90-day Support":   "#1A6A7A",
    "Complete":         "#4A6A1A",
  }[p] || "#888");

  const CLIENTS = [
    { id: "c1", first: "Maya", last: "Chen", name: "Maya Chen", email: "maya.chen@gmail.com", initials: "MC", color: "#8211FF", stage: "Active", pkg: "I'm A Big Freaking Deal", next: "May 1 · 2:00 PM", resume: true, linkedin: false, created: "Apr 1, 2026", writer: "Kate Wade", producer: "Lourdes H-D", phase: "Week 2", status: "On Track", payment: true },
    { id: "c2", first: "Sarah", last: "Klein", name: "Sarah Klein", email: "sarah@example.com", initials: "SK", color: "#C8005A", stage: "Active", pkg: "The Scroll-Stopper", next: "May 3 · 11:00 AM", resume: true, linkedin: true, created: "Mar 18, 2026", writer: "Kate Wade", producer: "Lourdes H-D", phase: "Week 1", status: "On Track", payment: true },
    { id: "c3", first: "Priya", last: "Nair", name: "Priya Nair", email: "priya.nair@outlook.com", initials: "PN", color: "#185FA5", stage: "Active", pkg: "Tits Up", next: "—", resume: false, linkedin: false, created: "Apr 8, 2026", writer: "Mimi Bishop", producer: "Jhoneth Briones", phase: "Week 1", status: "Behind", payment: true },
    { id: "c4", first: "Dana", last: "Okafor", name: "Dana Okafor", email: "dana.o@gmail.com", initials: "DO", color: "#0F9E75", stage: "Active", pkg: "I'm A Big Freaking Deal", next: "May 6 · 9:30 AM", resume: true, linkedin: true, created: "Mar 30, 2026", writer: "Lourdes H-D", producer: "Jhoneth Briones", phase: "Week 3", status: "On Track", payment: true },
    { id: "c5", first: "Renee", last: "Alvarez", name: "Renee Alvarez", email: "renee.alvarez@gmail.com", initials: "RA", color: "#854F0B", stage: "Active", pkg: "The Scroll-Stopper", next: "—", resume: true, linkedin: false, created: "Apr 12, 2026", writer: "Mimi Bishop", producer: "Lourdes H-D", phase: "Onboarding", status: "Behind", payment: false },
    { id: "c6", first: "Tessa", last: "Wright", name: "Tessa Wright", email: "tessa.w@gmail.com", initials: "TW", color: "#8211FF", stage: "Active", pkg: "Tits Up", next: "May 2 · 4:00 PM", resume: true, linkedin: true, created: "Apr 5, 2026", writer: "Kate Wade", producer: "Jhoneth Briones", phase: "Week 2", status: "On Track", payment: true },
    { id: "c7", first: "Leah", last: "Goldberg", name: "Leah Goldberg", email: "leah.g@gmail.com", initials: "LG", color: "#C8005A", stage: "Lead", pkg: "—", next: "Apr 30 · 1:00 PM", resume: false, linkedin: false, created: "Apr 20, 2026", writer: "Unassigned", producer: "Unassigned", phase: "Onboarding", status: "On Track", payment: false },
    { id: "c8", first: "Nina", last: "Patel", name: "Nina Patel", email: "nina.patel@gmail.com", initials: "NP", color: "#185FA5", stage: "Lead", pkg: "—", next: "—", resume: false, linkedin: false, created: "Apr 22, 2026", writer: "Unassigned", producer: "Unassigned", phase: "Onboarding", status: "On Track", payment: false },
  ];

  // Tasks per phase for a project (used in split-view)
  const mkTask = (n, title, assignee, due, status, review, sub, visible) => ({ n, title, assignee, due, status, review, sub: sub || [], done: status === "complete", visibleToClient: visible !== false });
  const TASKS_BY_PHASE = {
    "Onboarding": [
      mkTask(1, "Conduct a resume call", "Superadmin", "Apr 1", "complete", "—", [], false),
      mkTask(2, "Send a follow-up email", "Superadmin", "Apr 1", "complete", "—", [], false),
      mkTask(3, "Confirm resume, LinkedIn profile, and intake answers are present", "Admin assistant", "Apr 2", "complete", "—", [], false),
    ],
    "Week 1": [
      mkTask(1, "Assign Writer to Project", "Superadmin", "Apr 3", "complete", "—", [], false),
      mkTask(2, "Confirm client has scheduled all working session calls", "Admin assistant", "Apr 5", "complete", "—", [], false),
      mkTask(3, "Create Resume", "Client", "Apr 3", "complete", "—", [], true),
      mkTask(4, "Add LinkedIn URL", "Client", "Apr 3", "complete", "—", [], true),
      mkTask(5, "Create Career History / Additional Files", "Client", "Apr 3", "in_progress", "—", [], true),
      mkTask(6, "Schedule Working Session #1", "Client", "Apr 3", "complete", "—", [], true),
      mkTask(7, "Schedule Working Session #2", "Client", "Apr 3", "in_progress", "—", [], true),
      mkTask(8, "Schedule Working Session #3", "Client", "Apr 3", "not_started", "—", [], true),
      mkTask(9, "Create Single Source of Truth", "Kate Wade", "Apr 24", "complete", "editor", [
        { text: "Draft Single Source of Truth", done: true, assignee: "Writer" },
        { text: "Editor Review", done: true, assignee: "Editor" },
      ], false),
      mkTask(10, "Review Single Source of Truth", "Client", "Apr 24", "complete", "—", [], true),
      mkTask(11, "Working Session #1 (30-min Zoom)", "Superadmin", "Apr 24", "complete", "—", [], true),
    ],
    "Week 2": [
      mkTask(1, "Create Resume", "Kate Wade", "Apr 28", "overdue", "editor", [
        { text: "Draft Resume", done: false, assignee: "Writer" },
        { text: "Editor Review", done: false, assignee: "Editor" },
      ], false),
      mkTask(2, "Create Optimized Cover Letter Template", "Kate Wade", "Apr 28", "in_progress", "editor", [
        { text: "Draft Cover Letter Template", done: true, assignee: "Writer" },
        { text: "Editor Review", done: false, assignee: "Editor" },
      ], false),
      mkTask(3, "Create Cover Letter Scripts for Emails and LinkedIn", "Mimi Bishop", "Apr 28", "not_started", "editor", [
        { text: "Draft Cover Letter Scripts", done: false, assignee: "Writer" },
        { text: "Editor Review", done: false, assignee: "Editor" },
      ], false),
      mkTask(4, "Create 4-Point LinkedIn Audit", "Mimi Bishop", "Apr 28", "in_progress", "editor", [
        { text: "Draft LinkedIn Audit", done: true, assignee: "Writer" },
        { text: "Editor Review", done: false, assignee: "Editor" },
      ], false),
      mkTask(5, "Create Toolkit (20 Scripts, Worksheets, Guides)", "Lourdes H-D", "Apr 28", "complete", "—", [
        { text: "Prepare / Upload Toolkit", done: true, assignee: "Ops admin" },
      ], false),
      mkTask(6, "Create 5 Custom LinkedIn Banners", "Lourdes H-D", "Apr 28", "not_started", "editor", [
        { text: "Submit for Review", done: false, assignee: "Ops admin" },
        { text: "Editor Review", done: false, assignee: "Editor" },
      ], false),
      mkTask(7, "Review Resume", "Client", "Apr 30", "not_started", "—", [], true),
      mkTask(8, "Review Toolkit (20 Scripts, Worksheets, Guides)", "Client", "Apr 30", "not_started", "—", [], true),
      mkTask(9, "Review Cover Letter Template", "Client", "Apr 30", "not_started", "—", [], true),
      mkTask(10, "Review LinkedIn Audit", "Client", "Apr 30", "not_started", "—", [], true),
      mkTask(11, "Review 4-Point LinkedIn Audit", "Client", "Apr 30", "not_started", "—", [], true),
      mkTask(12, "Working Session #2 (30-min Zoom)", "Superadmin", "May 1", "not_started", "—", [], true),
    ],
    "Week 3": [
      mkTask(1, "Create LinkedIn Profile Rewrite", "Kate Wade", "May 8", "not_started", "editor", [
        { text: "Draft LinkedIn Profile Rewrite", done: false, assignee: "Writer" },
        { text: "Editor Review", done: false, assignee: "Editor" },
      ], false),
      mkTask(2, "Create 1-Page Executive Brief for Networking", "Kate Wade", "May 8", "not_started", "editor", [
        { text: "Draft Executive Brief", done: false, assignee: "Writer" },
        { text: "Editor Review", done: false, assignee: "Editor" },
      ], false),
      mkTask(3, "Create Job Search Strategy", "Lourdes H-D", "May 8", "not_started", "editor", [
        { text: "Draft Job Search Strategy", done: false, assignee: "Writer" },
        { text: "Editor Review", done: false, assignee: "Editor" },
      ], false),
      mkTask(4, "Create Exec Bio", "Kate Wade", "May 9", "not_started", "editor", [
        { text: "Draft Exec Bio", done: false, assignee: "Writer" },
        { text: "Editor Review", done: false, assignee: "Editor" },
      ], false),
      mkTask(5, "Create 5 Stories", "Kate Wade", "May 9", "not_started", "editor", [
        { text: "Draft 5 Stories", done: false, assignee: "Writer" },
        { text: "Editor Review", done: false, assignee: "Editor" },
        { text: "Share with Client", done: false, assignee: "Writer" },
      ], false),
      mkTask(6, "Create Additional Resume", "Mimi Bishop", "May 10", "not_started", "editor", [
        { text: "Draft Additional Resume", done: false, assignee: "Writer" },
        { text: "Editor Review", done: false, assignee: "Editor" },
      ], false),
      mkTask(7, "Create What I Am Looking For Script", "Kate Wade", "May 10", "not_started", "editor", [
        { text: "Draft What I Am Looking For Script", done: false, assignee: "Writer" },
        { text: "Editor Review", done: false, assignee: "Editor" },
        { text: "Share with Client", done: false, assignee: "Writer" },
      ], false),
      mkTask(8, "Create So Tell Me About Yourself Script", "Mimi Bishop", "May 11", "not_started", "editor", [
        { text: "Draft So Tell Me About Yourself Script", done: false, assignee: "Writer" },
        { text: "Editor Review", done: false, assignee: "Editor" },
      ], false),
      mkTask(9, "Create Salary Analysis", "Lourdes H-D", "May 12", "not_started", "editor", [
        { text: "Draft Salary Analysis", done: false, assignee: "Writer" },
        { text: "Editor Review", done: false, assignee: "Editor" },
      ], false),
      mkTask(10, "Review LinkedIn Profile Rewrite", "Client", "May 14", "not_started", "—", [], true),
      mkTask(11, "Review Executive Brief", "Client", "May 14", "not_started", "—", [], true),
      mkTask(12, "Review Job Search Strategy", "Client", "May 14", "not_started", "—", [], true),
      mkTask(13, "Review Exec Bio", "Client", "May 14", "not_started", "—", [], true),
      mkTask(14, "Review 5 Stories", "Client", "May 14", "not_started", "—", [], true),
      mkTask(15, "Review Additional Resume", "Client", "May 15", "not_started", "—", [], true),
      mkTask(16, "Review What I Am Looking For Script", "Client", "May 15", "not_started", "—", [], true),
      mkTask(17, "Review Salary Analysis", "Client", "May 15", "not_started", "—", [], true),
      mkTask(18, "Working Session #3 (30-min Zoom)", "Superadmin", "May 15", "not_started", "—", [], true),
    ],
    "Complete": [],
  };
  const phaseProgress = (p) => {
    const t = TASKS_BY_PHASE[p] || [];
    const done = t.filter((x) => x.done).length;
    return { done, total: t.length };
  };

  const PROJECTS = CLIENTS.filter((c) => c.stage === "Active").map((c, i) => ({
    id: "p" + (i + 1), clientId: c.id, name: c.name + " Project", client: c.name,
    phase: c.phase, status: c.status, writer: c.writer, producer: c.producer,
    editor: i % 2 ? "Erin Doyle" : "Unassigned", pkg: c.pkg,
    start: c.created, end: "May 22, 2026",
  }));

  const DOCS = [
    { id: "d1", name: "Résumé — Draft v1", client: "Maya Chen", type: "Resume", status: "overdue", version: "v1", dir: "GHH to Client", modified: "Apr 28", drive: true },
    { id: "d2", name: "LinkedIn Audit", client: "Maya Chen", type: "LinkedIn Audit", status: "not_started", version: "v1", dir: "GHH to Client", modified: "Apr 25", drive: true },
    { id: "d3", name: "Maya — Original Résumé.pdf", client: "Maya Chen", type: "Resume", status: "in_progress", version: "—", dir: "Client to GHH", modified: "Apr 1", drive: false },
    { id: "d4", name: "Cover Letter Template", client: "Sarah Klein", type: "Cover Letter Template", status: "complete", version: "v2", dir: "GHH to Client", modified: "Apr 22", drive: true },
    { id: "d5", name: "Single Source of Truth", client: "Sarah Klein", type: "Resume", status: "in_progress", version: "v1", dir: "GHH to Client", modified: "Apr 20", drive: true },
    { id: "d6", name: "Priya — LinkedIn Export.pdf", client: "Priya Nair", type: "LinkedIn Audit", status: "overdue", version: "—", dir: "Client to GHH", modified: "Apr 9", drive: false },
  ];

  const MEETINGS_REVIEW = [
    { id: "m1", title: "Résumé Review Call", client: "Maya Chen", when: "Apr 24 · 2:00 PM", status: "needs review" },
  ];
  const MEETINGS_WEEKS = [
    { week: "Apr 27 – May 3", items: [
      { id: "m2", title: "Working Session #2", client: "Maya Chen", when: "May 1 · 2:00 PM", status: "scheduled" },
      { id: "m3", title: "Working Session #1", client: "Sarah Klein", when: "May 3 · 11:00 AM", status: "scheduled" },
      { id: "m4", title: "Intro Call", client: "Tessa Wright", when: "May 2 · 4:00 PM", status: "scheduled" },
    ] },
    { week: "May 4 – May 10", items: [
      { id: "m5", title: "Working Session #2", client: "Dana Okafor", when: "May 6 · 9:30 AM", status: "scheduled" },
    ] },
  ];

  const PACKAGES = [
    { id: "pk1", name: "Tits Up", price: "$1,750", weeks: "2 weeks", active: true, alc: false, tagline: "Get your essentials sorted, fast." },
    { id: "pk2", name: "I'm A Big Freaking Deal", price: "$2,695", weeks: "4 weeks", active: true, alc: false, tagline: "Full executive brand build-out." },
    { id: "pk3", name: "The Scroll-Stopper", price: "$3,495", weeks: "4 weeks", active: true, alc: false, tagline: "Premium, attention-commanding presence." },
    { id: "pk4", name: "Hit Send", price: "$1,295", weeks: "3 weeks", active: true, alc: false, tagline: "Application-ready in three weeks." },
    { id: "pk5", name: "Consultation", price: "$297", weeks: "0 weeks", active: true, alc: true, tagline: "One-time strategy session." },
  ];
  const ALACARTE = [
    { id: "a1", name: "Mock Interview Session", price: "$395" },
    { id: "a2", name: "72-Hour Resume + Cover Letter", price: "$895" },
    { id: "a3", name: "LinkedIn Optimization", price: "$697" },
    { id: "a4", name: "1-Page Graphic Executive Brief", price: "$595" },
    { id: "a5", name: "10-Point LinkedIn Audit", price: "$595" },
    { id: "a6", name: "Additional Resume (different focus)", price: "$595" },
    { id: "a7", name: "Salary Negotiation Coaching", price: "$597" },
    { id: "a8", name: "Executive Coaching", price: "$1,297" },
    { id: "a9", name: "Career Transition Workshop", price: "$397" },
  ];

  const TEMPLATES = {
    "Onboarding": [
      { title: "Create Google Drive folder", week: "Onboarding", resp: "admin", dur: "15m", vis: false, type: "Setup", order: 1, active: true },
      { title: "Send welcome email", week: "Onboarding", resp: "admin", dur: "10m", vis: true, type: "Comms", order: 2, active: true },
      { title: "Build client brief", week: "Onboarding", resp: "writer", dur: "45m", vis: false, type: "Strategy", order: 3, active: true },
    ],
    "Tits Up": [
      { title: "Résumé — Draft v1", week: "Week 1", resp: "writer", dur: "3h", vis: true, type: "Deliverable", order: 1, active: true },
      { title: "LinkedIn audit", week: "Week 1", resp: "writer", dur: "1h", vis: true, type: "Deliverable", order: 2, active: true },
    ],
    "MFD": [], "Scroll-Stopper": [], "Offboarding": [
      { title: "Final deliverables handoff", week: "Complete", resp: "admin", dur: "30m", vis: true, type: "Comms", order: 1, active: true },
    ], "À La Carte": [],
  };

  const KB = {
    "General": [
      { title: "GHH Brand Voice Guide", type: "Training", date: "Jan 8", ext: "PDF" },
      { title: "Client Communication Standards", type: "Training", date: "Jan 8", ext: "Doc" },
      { title: "Resume Formatting Rules", type: "Resume", date: "Feb 2", ext: "Doc" },
    ],
    "Writer Resources": [
      { title: "The Q Formula — Internal", type: "Resume", date: "Feb 12", ext: "Doc" },
      { title: "LinkedIn Audit Checklist", type: "LinkedIn Audit", date: "Mar 1", ext: "Sheet" },
      { title: "Cover Letter Template Library", type: "Cover Letter Template", date: "Mar 3", ext: "Doc" },
    ],
    "Templates": [
      { title: "Résumé Master Template", type: "Resume", date: "Jan 20", ext: "Doc" },
      { title: "Client Brief Template", type: "Training", date: "Jan 20", ext: "Doc" },
    ],
    "Training": [
      { title: "Onboarding Playbook", type: "Training", date: "Jan 5", ext: "PDF" },
      { title: "Editor SOP", type: "Training", date: "Jan 6", ext: "Doc" },
    ],
  };

  const ACTIVITY = [
    { who: "Kate Wade", initials: "KW", color: "#C8005A", action: "reviewed Résumé — Draft v1", client: "Maya Chen", when: "2h ago" },
    { who: "Mimi Bishop", initials: "MB", color: "#0F9E75", action: "uploaded LinkedIn Audit", client: "Priya Nair", when: "4h ago" },
    { who: "Lourdes H-D", initials: "LH", color: "#185FA5", action: "completed Working Session #1 prep", client: "Maya Chen", when: "6h ago" },
    { who: "Jhoneth Briones", initials: "JB", color: "#8211FF", action: "onboarded new client", client: "Nina Patel", when: "1d ago" },
  ];

  const MY_TASKS = [
    { title: "Review Résumé — Draft v1", client: "Maya Chen", due: "Today", overdue: false, done: false },
    { title: "Approve LinkedIn Audit", client: "Priya Nair", due: "Yesterday", overdue: true, done: false },
    { title: "Prep Working Session #2", client: "Maya Chen", due: "Apr 30", overdue: false, done: false },
    { title: "Send brief to writer", client: "Tessa Wright", due: "May 1", overdue: false, done: true },
  ];

  const REVIEW_QUEUE = [
    { name: "Résumé — Draft v1", client: "Maya Chen", type: "Resume" },
    { name: "Cover Letter Template", client: "Sarah Klein", type: "Cover Letter" },
  ];

  const ROLES = ["Admin", "Producer", "Writer", "Editor", "Client"];

  const NAV = {
    overview: [
      { key: "dashboard", label: "Dashboard", icon: "Home", path: "#/admin/dashboard" },
      { key: "clients", label: "Clients", icon: "User", path: "#/admin/clients" },
      { key: "projects", label: "Projects", icon: "FolderOpen", path: "#/admin/projects", primary: true },
      { key: "tasks", label: "Tasks", icon: "ListChecks", path: "#/admin/tasks" },
      { key: "schedule", label: "Schedule", icon: "Calendar", path: "#/admin/schedule" },
    ],
    management: [
      { key: "team", label: "Team", icon: "User", path: "#/admin/team" },
      { key: "packages", label: "Packages", icon: "Briefcase", path: "#/admin/packages" },
      { key: "kb", label: "Knowledge Base", icon: "Lightbulb", path: "#/admin/knowledge-base" },
    ],
  };

  window.ADM = {
    TEAM, CLIENTS, PROJECTS, PHASES, phaseColor, TASKS_BY_PHASE, phaseProgress,
    DOCS, MEETINGS_REVIEW, MEETINGS_WEEKS, PACKAGES, ALACARTE, TEMPLATES, KB,
    ACTIVITY, MY_TASKS, REVIEW_QUEUE, ROLES, NAV,
    STATUS_BADGE: {
      "On Track": { bg: "rgba(0,160,108,0.12)", fg: "#00A06C" },
      "Behind": { bg: "rgba(229,57,53,0.12)", fg: "#E53935" },
      "Active": { bg: "rgba(0,160,108,0.12)", fg: "#00A06C" },
      "Lead": { bg: "rgba(24,95,165,0.12)", fg: "#185FA5" },
      "Inactive": { bg: "#F1EFE8", fg: "#888" },
      // Task statuses
      "Not Started":  { bg: "#F0F0F0", fg: "#888888" },
      "In Progress":  { bg: "#FEF9E0", fg: "#8A7000" },
      "Overdue":      { bg: "rgba(180,60,60,0.12)", fg: "#A03030" },
      "Complete":     { bg: "rgba(160,190,100,0.2)", fg: "#4A6A1A" },
      // Underscore keys (canonical internal values)
      "not_started":  { bg: "#F0F0F0", fg: "#888888" },
      "in_progress":  { bg: "#FEF9E0", fg: "#8A7000" },
      "overdue":      { bg: "rgba(180,60,60,0.12)", fg: "#A03030" },
      "complete":     { bg: "rgba(160,190,100,0.2)", fg: "#4A6A1A" },
      // Legacy aliases
      "needs review": { bg: "rgba(180,60,60,0.12)", fg: "#A03030" },
      "completed":    { bg: "rgba(160,190,100,0.2)", fg: "#4A6A1A" },
      "scheduled":    { bg: "rgba(24,95,165,0.12)", fg: "#185FA5" },
      // Phase badges
      "Initial Interest": { bg: "rgba(120,80,160,0.15)", fg: "#6B3FA0" },
      "Onboarding":       { bg: "rgba(220,180,80,0.2)",  fg: "#8A6A00" },
      "Active Project":   { bg: "rgba(120,180,80,0.2)",  fg: "#3A6A10" },
      "90-day Support":   { bg: "rgba(100,190,210,0.2)", fg: "#1A6A7A" },
    },
  };
})();
