/* ============================================================
   Messages screen  →  window.Messages
   Project-level client ↔ team thread
   ============================================================ */

function Messages() {
  const { messages, sendMessage, navigate } = usePortal();
  const { Icons } = window;
  const [text, setText] = React.useState("");
  const bottomRef = React.useRef(null);

  React.useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const t = text.trim();
    if (!t) return;
    sendMessage(t);
    setText("");
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Plus Jakarta Sans',sans-serif", color: "var(--text-primary)" }}>Messages</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>Project thread with your Get Her Hired team</div>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Message list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 16, maxHeight: 520 }} className="scrollbar-thin">
          {messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#bbb" }}>
              <Icons.Inbox size={32} style={{ opacity: 0.3, display: "block", margin: "0 auto 12px" }} />
              <div style={{ fontSize: 13 }}>Questions about your project? Message your team.</div>
            </div>
          )}
          {messages.map((m) => {
            const isClient = m.role === "client";
            return (
              <div key={m.id} style={{ display: "flex", gap: 11, alignItems: "flex-start", flexDirection: isClient ? "row-reverse" : "row" }}>
                <div style={{ width: 32, height: 32, borderRadius: 99, background: isClient ? "var(--raspberry)" : "var(--purple)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flex: "0 0 32px" }}>{m.initials}</div>
                <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 3, alignItems: isClient ? "flex-end" : "flex-start" }}>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    {!isClient && <span style={{ fontWeight: 600, marginRight: 4, color: "var(--text-primary)" }}>{m.who}</span>}
                    {m.when}
                    {m.unread && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 99, background: "var(--raspberry)", marginLeft: 6, verticalAlign: "middle" }} />}
                  </div>
                  <div style={{ background: isClient ? "var(--raspberry)" : "var(--page-bg)", color: isClient ? "#fff" : "var(--text-primary)", borderRadius: isClient ? "14px 4px 14px 14px" : "4px 14px 14px 14px", padding: "10px 14px", fontSize: 13, lineHeight: 1.55, border: isClient ? "none" : "1px solid var(--border)" }}>{m.text}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border)" }} />

        {/* Compose */}
        <div style={{ padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Write a message…"
            rows={2}
            style={{ flex: 1, resize: "none", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", color: "var(--text-primary)", background: "var(--page-bg)", outline: "none", lineHeight: 1.5 }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            style={{ background: text.trim() ? "var(--raspberry)" : "var(--border)", color: text.trim() ? "#fff" : "#aaa", border: "none", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: text.trim() ? "pointer" : "default", transition: "background .15s, color .15s", flexShrink: 0 }}>
            <Icons.Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Messages });
