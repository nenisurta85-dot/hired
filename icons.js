/* ============================================================
   Lucide-style inline SVG icons (24x24, stroke currentColor)
   Exposed as window.Icons
   ============================================================ */
(function () {
  const S = ({ children, size = 16, sw = 2, ...p }) => (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round"
      {...p}
    >{children}</svg>
  );

  const Icons = {
    Home: (p) => <S {...p}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></S>,
    FileText: (p) => <S {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h8M8 9h2"/></S>,
    Calendar: (p) => <S {...p}><rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></S>,
    MessageCircle: (p) => <S {...p}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 21l1.3-3.9A8.4 8.4 0 1 1 21 11.5z"/></S>,
    Wrench: (p) => <S {...p}><path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L3 18l3 3 6.5-6.5a4 4 0 0 0 5.2-5.2l-2.7 2.7-2.5-2.5z"/></S>,
    ListChecks: (p) => <S {...p}><path d="M3 6l1.5 1.5L7 5"/><path d="M3 13l1.5 1.5L7 12"/><path d="M3 20l1.5 1.5L7 19"/><path d="M11 6h10M11 13h10M11 20h10"/></S>,
    HelpCircle: (p) => <S {...p}><circle cx="12" cy="12" r="9"/><path d="M9.2 9.5a2.8 2.8 0 0 1 5.5.5c0 1.9-2.7 2.5-2.7 4"/><path d="M12 17.5h.01"/></S>,
    Settings: (p) => <S {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8z"/></S>,
    Video: (p) => <S {...p}><rect x="2" y="6" width="13" height="12" rx="2"/><path d="m15 9.5 6-3.5v12l-6-3.5z"/></S>,
    Upload: (p) => <S {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 9l5-5 5 5"/><path d="M12 4v12"/></S>,
    Check: (p) => <S {...p}><path d="M20 6 9 17l-5-5"/></S>,
    X: (p) => <S {...p}><path d="M18 6 6 18M6 6l12 12"/></S>,
    ChevronRight: (p) => <S {...p}><path d="m9 18 6-6-6-6"/></S>,
    ChevronLeft: (p) => <S {...p}><path d="m15 18-6-6 6-6"/></S>,
    ChevronDown: (p) => <S {...p}><path d="m6 9 6 6 6-6"/></S>,
    ChevronUp: (p) => <S {...p}><path d="m6 15 6-6 6 6"/></S>,
    ArrowRight: (p) => <S {...p}><path d="M5 12h14M13 6l6 6-6 6"/></S>,
    ArrowUpRight: (p) => <S {...p}><path d="M7 17 17 7M9 7h8v8"/></S>,
    Info: (p) => <S {...p}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></S>,
    Sparkle: (p) => <S {...p}><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/></S>,
    Download: (p) => <S {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></S>,
    Search: (p) => <S {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></S>,
    Plus: (p) => <S {...p}><path d="M12 5v14M5 12h14"/></S>,
    Paperclip: (p) => <S {...p}><path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.5 17.5a1.7 1.7 0 0 1-2.3-2.3l7.8-7.8"/></S>,
    Clock: (p) => <S {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></S>,
    LogOut: (p) => <S {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></S>,
    CircleCheck: (p) => <S {...p}><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5L16 9"/></S>,
    User: (p) => <S {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></S>,
    Inbox: (p) => <S {...p}><path d="M21 12h-6l-2 3h-2l-2-3H3"/><path d="M5.5 5h13l2.5 7v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/></S>,
    FolderOpen: (p) => <S {...p}><path d="M5 19l2.5-7H22l-2.5 7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2h4l2 3h7a2 2 0 0 1 2 2v1"/></S>,
    Lock: (p) => <S {...p}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></S>,
    Lightbulb: (p) => <S {...p}><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3z"/></S>,
    Briefcase: (p) => <S {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/></S>,
    BarChart: (p) => <S {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></S>,
    Copy: (p) => <S {...p}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></S>,
    Edit: (p) => <S {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></S>,
    Send: (p) => <S {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></S>,
    Users: (p) => <S {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></S>,
    Flag: (p) => <S {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></S>,
    CheckSquare: (p) => <S {...p}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></S>,
    Eye: (p) => <S {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></S>,
    FilePlus: (p) => <S {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M12 12v6M9 15h6"/></S>,
    Phone: (p) => <S {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L17 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 7a2 2 0 0 1 1-3z"/></S>,
    Mail: (p) => <S {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></S>,
    MapPin: (p) => <S {...p}><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></S>,
    Folder: (p) => <S {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></S>,
  };

  window.Icons = Icons;
})();
