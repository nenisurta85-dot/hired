/* ============================================================
   Mock data  →  window.GHH
   ============================================================ */
(function () {
  // Status badge style map (bg + fg)
  const STATUS = {
    "Ready for Review": { bg: "#FBEAF0", fg: "#C8005A" },
    "Action Required":  { bg: "#FAEEDA", fg: "#854F0B" },
    "Upload Needed":    { bg: "#E8F5EE", fg: "#0F6E56" },
    "Not Started":      { bg: "#F1EFE8", fg: "#5F5E5A" },
    "Complete":         { bg: "#E8F5EE", fg: "#0F9E75" },
    "In Progress":      { bg: "#E6F1FB", fg: "#185FA5" },
    "Scheduled":        { bg: "#E6F1FB", fg: "#185FA5" },
    "Pending":          { bg: "#F1EFE8", fg: "#5F5E5A" },
  };

  // Icon-block color by task type
  const ICON_STYLE = {
    review: { bg: "#F4EFF9", fg: "#8211FF", icon: "FileText" },
    book:   { bg: "#E6F1FB", fg: "#185FA5", icon: "Calendar" },
    upload: { bg: "#E8F5EE", fg: "#0F9E75", icon: "Upload" },
    none:   { bg: "#F1EFE8", fg: "#888888", icon: "FileText" },
  };

  // Dashboard "Your Tasks" (4)
  const DASH_TASKS = [
    { id: "d1", type: "review", highlight: true, title: "Résumé — Draft v1",
      status: "Ready for Review", desc: "Open the doc, leave your comments, submit feedback",
      due: "Due May 12",
      action: "Review Draft", doc: "Résumé — Draft v1.pdf",
      detail: "Your writer has completed the first draft of your résumé. Open it, leave inline comments, and submit your feedback so we can refine it before your next session.",
      meta: { phase: "Phase 1", due: "Due May 12", assigned: "Kate Wade", priority: "High" },
      comment: { who: "Kate Wade", when: "4 days ago", text: "I've focused the executive summary on your P&L ownership and the team scale-up. Let me know if the framing feels right." } },
    { id: "d2", type: "book", title: "Schedule Working Session #1",
      status: "Action Required", desc: "Choose a time that works for you — 30 min session",
      due: "Due May 8",
      action: "Book Session",
      detail: "Pick a 30-minute slot for your first working session. We'll align on direction, voice, and target roles.",
      meta: { phase: "Phase 1", due: "Due May 8", assigned: "Kate Wade", priority: "Medium" },
      info: { duration: "30 minutes", format: "Zoom video call", host: "Kate Wade" } },
    { id: "d3", type: "upload", title: "Share your career history with us",
      status: "Upload Needed", desc: "Upload your résumé, LinkedIn export, performance reviews",
      due: "Due May 5",
      action: "Upload Files",
      detail: "Send us everything that tells your story so far. The more context, the stronger your first draft.",
      meta: { phase: "Phase 1", due: "Due May 5", assigned: "You", priority: "High" },
      checklist: ["Current résumé (any format)", "LinkedIn profile export (PDF)", "Recent performance reviews", "Job descriptions you're targeting (optional)"] },
    { id: "d4", type: "none", muted: true, title: "Career Strategy Doc",
      status: "Not Started", desc: "Your writer will begin this after Week 2 review",
      action: null,
      detail: "This deliverable opens up once we've completed your Week 2 review. Nothing for you to do yet.",
      meta: { phase: "Phase 2", due: "—", assigned: "Kate Wade", priority: "Low" } },
  ];

  // My Tasks screen (full list w/ week + done state)
  const ALL_TASKS = [
    { id: "t1", type: "none", title: "Accept Package & Complete Payment", week: "Onboarding", due: "Apr 1", status: "Complete", done: true },
    { id: "t2", type: "none", title: "Sign Service Agreement", week: "Onboarding", due: "Apr 1", status: "Complete", done: true },
    { id: "t3", type: "upload", title: "Upload Current Resume", week: "Week 1", due: "Due Apr 3", status: "Upload Needed",
      detail: "Upload your current resume so your writer has everything they need to get started.",
      checklist: ["Current résumé (PDF or Word)", "Any updated versions"],
      meta: { phase: "Week 1", due: "Due Apr 3", assigned: "You", priority: "High" } },
    { id: "t4", type: "upload", title: "Add LinkedIn URL", week: "Week 1", due: "Due Apr 3", status: "Upload Needed",
      detail: "Share your LinkedIn profile URL so we can review your current presence.",
      checklist: ["Your LinkedIn profile URL"],
      meta: { phase: "Week 1", due: "Due Apr 3", assigned: "You", priority: "High" } },
    { id: "t5", type: "upload", title: "Share Career History / Additional Files", week: "Week 1", due: "Due Apr 3", status: "Upload Needed",
      detail: "Upload your career history, LinkedIn export, and performance reviews.",
      checklist: ["LinkedIn export (PDF)", "Performance reviews", "Anything that tells your story"],
      meta: { phase: "Week 1", due: "Due Apr 3", assigned: "You", priority: "High" } },
    { id: "t6", type: "book", title: "Schedule Working Session #1", week: "Week 1", due: "Due Apr 5", status: "Action Required",
      detail: "Pick a 30-minute slot for your first working session with Kate.", info: { duration: "30 minutes", format: "Zoom video call", host: "Kate Wade" },
      meta: { phase: "Week 1", due: "Due Apr 5", assigned: "Kate Wade", priority: "Medium" } },
    { id: "t7", type: "book", title: "Schedule Working Session #2", week: "Week 1", due: "Due Apr 5", status: "Action Required",
      detail: "Pick a 30-minute slot for your second working session.", info: { duration: "30 minutes", format: "Zoom video call", host: "Kate Wade" },
      meta: { phase: "Week 1", due: "Due Apr 5", assigned: "Kate Wade", priority: "Medium" } },
    { id: "t8", type: "book", title: "Schedule Working Session #3", week: "Week 1", due: "Due Apr 5", status: "Action Required",
      detail: "Pick a 30-minute slot for your third working session.", info: { duration: "30 minutes", format: "Zoom video call", host: "Kate Wade" },
      meta: { phase: "Week 1", due: "Due Apr 5", assigned: "Kate Wade", priority: "Medium" } },
    { id: "t9", type: "review", title: "Review Single Source of Truth", week: "Week 1", due: "Due Apr 24", status: "Ready for Review",
      detail: "Review your Single Source of Truth — the master record of your career achievements. Flag anything inaccurate.", doc: "Single Source of Truth.pdf",
      meta: { phase: "Week 1", due: "Due Apr 24", assigned: "Kate Wade", priority: "Medium" },
      comment: { who: "Kate Wade", when: "2 days ago", text: "This is the foundation everything else is built from — flag anything inaccurate or missing." } },
    { id: "t10", type: "review", title: "Review Resume", week: "Week 2", due: "Due Apr 30", status: "Ready for Review",
      detail: "Review the first draft of your résumé and leave feedback for your writer.", doc: "Resume — Draft v1.pdf",
      meta: { phase: "Week 2", due: "Due Apr 30", assigned: "Kate Wade", priority: "High" },
      comment: { who: "Kate Wade", when: "4 days ago", text: "First draft is looking great — please review the executive summary and bullet points." } },
    { id: "t11", type: "review", title: "Review Toolkit (20 Scripts, Worksheets, Guides)", week: "Week 2", due: "Due Apr 30", status: "Ready for Review",
      detail: "Your full toolkit is ready. Take a look at the guides and scripts included in your package.", doc: "GHH Toolkit.pdf",
      meta: { phase: "Week 2", due: "Due Apr 30", assigned: "Kate Wade", priority: "Medium" },
      comment: { who: "Kate Wade", when: "3 days ago", text: "Your toolkit is ready! All 20 resources are in there — start with the Q Formula." } },
    { id: "t12", type: "review", title: "Review Cover Letter Template", week: "Week 2", due: "Due Apr 30", status: "Ready for Review",
      detail: "Review your optimized cover letter template and confirm the tone feels aligned with your voice.", doc: "Optimized Cover Letter Template.docx",
      meta: { phase: "Week 2", due: "Due Apr 30", assigned: "Kate Wade", priority: "Medium" },
      comment: { who: "Kate Wade", when: "5 days ago", text: "Take a look and let me know if the tone feels aligned with your voice and target companies." } },
    { id: "t13", type: "review", title: "Review LinkedIn Audit", week: "Week 2", due: "Due Apr 30", status: "Ready for Review",
      detail: "Review your 4-Point LinkedIn Audit and see the recommendations for optimizing your profile.", doc: "4-Point LinkedIn Audit.pdf",
      meta: { phase: "Week 2", due: "Due Apr 30", assigned: "Kate Wade", priority: "Medium" },
      comment: { who: "Kate Wade", when: "3 days ago", text: "A few questions about your headline — check the audit doc for details." } },
    { id: "t14", type: "book", title: "Working Session #2 (30-min Zoom)", week: "Week 2", due: "Due May 1", status: "Action Required",
      detail: "Join your second working session with Kate on Zoom.", info: { duration: "30 minutes", format: "Zoom video call", host: "Kate Wade" },
      meta: { phase: "Week 2", due: "Due May 1", assigned: "Kate Wade", priority: "High" } },
  ];
  const COMMENTS = [
    { id: "c1", who: "Kate Wade", initials: "KW", when: "2 hours ago", on: "Résumé — Draft v1", taskId: "d1", unread: true,
      text: "I've started your résumé and the first draft is looking great! Please review the executive summary section and let me know if it captures your leadership story the way you'd want a board to read it." },
    { id: "c2", who: "Kate Wade", initials: "KW", when: "3 days ago", on: "LinkedIn Profile", taskId: null, unread: true,
      text: "A few questions: should I emphasize the team leadership aspect more, or focus on individual contributor expertise? Also, what's your preferred headline direction?" },
    { id: "c3", who: "Kate Wade", initials: "KW", when: "5 days ago", on: "Cover Letter Template", taskId: "t8", unread: false,
      text: "Your cover letter template is ready for review. Take a look and let me know if the tone feels aligned with your voice and target companies." },
  ];

  const FILES_FROM = [
    { id: "f1", name: "Résumé — Draft v1", kind: "PDF", icon: "FileText", date: "Apr 28", status: "Ready for Review", cat: "Résumé", actions: ["Open", "Download"] },
    { id: "f2", name: "LinkedIn Profile — Draft v1", kind: "Google Doc", icon: "FileText", date: "Apr 25", status: "In Progress", cat: "LinkedIn", actions: ["Open"] },
  ];
  const FILES_TO = [
    { id: "f3", name: "My Résumé — Original.pdf", kind: "PDF", icon: "Paperclip", date: "Jan 16", status: null, cat: "Other", actions: ["View"] },
  ];

  const SESSIONS_UP = [
    { id: "s2", title: "Working Session #2", when: "Thu, May 1 · 2:00 PM", duration: "60 min", status: "Scheduled", booked: true },
    { id: "s3", title: "Working Session #3", when: "Not yet scheduled", duration: "30 min", status: "Pending", booked: false },
  ];
  const SESSIONS_PAST = [
    { id: "s1", title: "Working Session #1", when: "Apr 10", status: "Complete", recording: true },
    { id: "s0", title: "Résumé Review Call", when: "Jan 15", status: "Complete", recording: false },
  ];

  const TOOLKIT = [
    { group: "Career Strategy & Networking", cat: "Career Strategy",
      desc: "Frameworks for clarifying your direction and building meaningful professional relationships.",
      items: [
        { title: "The Q Formula", tag: "Strategy", desc: "A framework for quantifying your achievements and communicating your impact." },
        { title: "F.I.N.D. Job Search Strategy", tag: "Search", desc: "GHH's proprietary methodology for a focused, effective job search." },
        { title: "Performance Review Prep Tool", tag: "Strategy", desc: "Walk into your review with evidence, framing, and the ask ready." },
        { title: "TITS-UP Networking Pitch", tag: "Networking", desc: "A memorable structure for introducing yourself with confidence." },
      ] },
    { group: "Personal Brand", cat: "Personal Brand",
      desc: "Guides for telling your professional story across résumés, cover letters, and LinkedIn.",
      items: [
        { title: "CAR Stories & Cover Letter Worksheet", tag: "Brand", desc: "Turn your wins into Challenge–Action–Result stories that sell." },
        { title: "LinkedIn Profile Guide", tag: "Brand", desc: "Optimize every section for recruiters and executive search." },
      ] },
    { group: "Interviewing", cat: "Interviewing",
      desc: "Scripts and templates for every stage of the interview process.",
      items: [
        { title: "Informational Interview Script", tag: "Interviewing", desc: "Open doors with a low-pressure, high-signal conversation." },
        { title: '"So Tell Me About Yourself" Script', tag: "Interviewing", desc: "A tight, confident answer to the question that opens every interview." },
        { title: "Executive Level Questions to Ask", tag: "Interviewing", desc: "Questions that signal you think like a leader, not a candidate." },
      ] },
  ];

  const ADDONS = [
    { title: "Interview Preparation", desc: "Mock interviews and tailored prep for your target roles." },
    { title: "Cover Letter Package", desc: "Custom cover letters written for specific applications." },
    { title: "LinkedIn Optimization", desc: "Full profile rewrite optimized for executive search." },
    { title: "Executive Bio", desc: "A polished bio for board apps, speaking, and press." },
    { title: "30-Day Support Boost", desc: "Extended access to your writer for a full month." },
    { title: "Salary Negotiation", desc: "Strategy and scripts to negotiate your offer with confidence." },
  ];

  const FAQ = [
    { q: "How do I upload files to my project?", a: "Go to My Files and click \"+ Upload File\", or use the Upload Files action on any task that needs materials. Drag and drop or browse — we accept PDF, Word, and Google Doc links." },
    { q: "When can I join a Zoom meeting?", a: "The \"Join on Zoom\" button activates 10 minutes before your scheduled session. You'll also receive an email reminder with the link." },
    { q: "How do I mark a task as complete?", a: "Click the checkmark button on any task card and confirm. Review tasks complete automatically once you submit your feedback." },
    { q: "What is the 90-day support period?", a: "After your final session, you have 90 days of email support with your writer for tweaks, questions, and application-specific help." },
    { q: "How do I schedule a meeting?", a: "From My Sessions or any \"Book Session\" task, pick an available slot. Sessions must be scheduled at least 7 days apart." },
    { q: "Where can I find my project documents?", a: "Everything your team shares with you lives in My Files, split into documents from Get Her Hired and documents you've shared with us." },
  ];

  const TIMELINE = [
    { type: "phase", key: "start", label: "Start Project", date: "Apr 3, 2026", state: "done" },
    { type: "phase", key: "phase1", label: "Phase 1", date: "", state: "active",
      tasks: [
        { name: "Share your career history with us", state: "active", taskId: "t3" },
        { name: "Schedule working session #1 (30 min)", state: "active", taskId: "t4" },
        { name: "Review Single Source of Truth", state: "active", taskId: "t6" },
        { name: "Review Resume", state: "active", taskId: "t7" },
        { name: "Review Cover Letter Template", state: "active", taskId: "t8" },
      ] },
    { type: "call", key: "call2", label: "Call 1", date: "Apr 24", state: "past", n: 1,
      session: { title: "Working Session #1", when: "Apr 24 · 2:00 PM", duration: "30 min" },
      tasks: [
        { name: "Prep working session notes", state: "done" },
        { name: "Review draft with client", state: "done" },
        { name: "Submit feedback", state: "active", taskId: "t7" },
      ] },
    { type: "phase", key: "phase2", label: "Phase 2", date: "", state: "future",
      tasks: [
        { name: "Review Cover Letter Template", state: "future", taskId: "t8" },
        { name: "Career Strategy Doc", state: "future" },
      ] },
    { type: "call", key: "call3", label: "Call 2", date: "May 1", state: "upcoming", n: 2,
      session: { title: "Working Session #2", when: "Thu, May 1 · 2:00 PM", duration: "60 min" },
      tasks: [
        { name: "Prep working session notes", state: "future" },
        { name: "Review draft with client", state: "future" },
        { name: "Submit feedback", state: "future" },
      ] },
    { type: "phase", key: "phase3", label: "Phase 3", date: "", state: "future",
      tasks: [{ name: "Interview prep kickoff", state: "future" }, { name: "LinkedIn optimization", state: "future" }] },
    { type: "call", key: "call4", label: "Call 3", date: "May 8", state: "upcoming", n: 3,
      session: { title: "Working Session #3", when: "Not yet scheduled", duration: "30 min" },
      tasks: [
        { name: "Schedule the session", state: "future" },
        { name: "Prep working session notes", state: "future" },
      ] },
    { type: "phase", key: "offboarding", label: "Offboarding", date: "May 15 – May 22", state: "future",
      tasks: [{ name: "Final deliverables handoff", state: "future" }, { name: "90-day support begins", state: "future" }] },
  ];

  window.GHH = {
    STATUS, ICON_STYLE, DASH_TASKS, ALL_TASKS, COMMENTS,
    FILES_FROM, FILES_TO, SESSIONS_UP, SESSIONS_PAST,
    TOOLKIT, ADDONS, FAQ, TIMELINE,
    TARGET_END: "May 22, 2026",
    NAV: [
      { key: "dashboard", label: "Dashboard", icon: "Home", path: "#/dashboard" },
      { key: "files", label: "My Files", icon: "FileText", path: "#/files" },
      { key: "sessions", label: "My Sessions", icon: "Calendar", path: "#/sessions" },
      { key: "comments", label: "Comments", icon: "MessageCircle", path: "#/comments", badge: 3 },
      { key: "toolkit", label: "Toolkit", icon: "Wrench", path: "#/toolkit" },
      { key: "tasks", label: "My Tasks", icon: "ListChecks", path: "#/tasks" },
      { key: "help", label: "Help", icon: "HelpCircle", path: "#/help" },
      { key: "settings", label: "Settings", icon: "Settings", path: "#/settings" },
    ],
  };
})();
