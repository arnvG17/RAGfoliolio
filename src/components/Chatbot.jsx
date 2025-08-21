import { useEffect, useMemo, useRef, useState } from "react";

export default function Chatbot({
  apiUrl = "http://localhost:5000/chat",
  title = "Portfolio RAG Bot",
  placeholder = "Ask me about my projects, skills, or experience…",
  k = 4,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const theme = useMemo(
    () => ({
      bg: "#0f1214",
      panel: "#151a1f",
      border: "#22282f",
      text: "#e5e7eb",
      subtext: "#9ca3af",
      green: "#22c55e",
      greenDark: "#16a34a",
      danger: "#ef4444",
    }),
    []
  );

  // Scroll handler to toggle scroll button
  function handleScroll() {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 40;
    setShowScrollBtn(!atBottom);
  }

  // Scroll to bottom helper
  function scrollToBottom(smooth = true) {
    if (!listRef.current) return;
    listRef.current.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }

  // Auto scroll when messages change
  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);

  async function sendMessage() {
    const question = input.trim();
    if (!question || loading) return;
    setError("");

    const newMsgs = [...messages, { role: "user", content: question }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question, k }),
      });

      if (!res.ok) {
        const info = await res.json().catch(() => ({}));
        throw new Error(info?.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const answer = data?.answer ?? "(No answer returned)";
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (e) {
      console.error(e, "error");
      setError(e?.message || "Request failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn’t fetch a reply right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div
      style={{
        background: theme.bg,
        color: theme.text,
        minHeight: 480,
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: theme.panel,
          borderBottom: `1px solid ${theme.border}`,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: theme.green,
            }}
          />
          <h3 style={{ margin: 0, fontSize: 16, letterSpacing: 0.3 }}>
            {title}
          </h3>
        </div>
        <span style={{ fontSize: 12, color: theme.subtext }}>
          {loading ? "thinking…" : "online"}
        </span>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          background: theme.bg,
          position: "relative",
        }}
      >
        {messages.length === 0 && <EmptyState theme={theme} />}
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.content} theme={theme} />
        ))}

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom(true)}
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              background: theme.green,
              color: "#0a0f0c",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              fontSize: 18,
              fontWeight: 700,
            }}
            title="Scroll to latest"
          >
            ↓
          </button>
        )}
      </div>

      {/* Error bar */}
      {error && (
        <div
          style={{
            background: "#1f2937",
            color: theme.text,
            borderTop: `1px solid ${theme.border}`,
            padding: "8px 12px",
          }}
        >
          <span style={{ color: theme.danger, marginRight: 8 }}>●</span>
          <span style={{ fontSize: 13 }}>{error}</span>
        </div>
      )}

      {/* Composer */}
      <div
        style={{
          padding: 12,
          background: theme.panel,
          borderTop: `1px solid ${theme.border}`,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder={placeholder}
            style={{
              flex: 1,
              resize: "none",
              outline: "none",
              borderRadius: 12,
              border: `1px solid ${theme.border}`,
              background: "#0c0f11",
              color: theme.text,
              padding: "10px 12px",
              fontSize: 14,
              lineHeight: 1.35,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              minWidth: 108,
              fontWeight: 600,
              borderRadius: 12,
              border: "none",
              background: loading ? theme.greenDark : theme.green,
              color: "#0a0f0c",
              cursor: loading ? "wait" : "pointer",
              padding: "10px 14px",
              transition: "transform 0.06s ease",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.98)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
        <div
          style={{
            marginTop: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <small style={{ color: theme.subtext }}>
            Enter to send • Shift+Enter for newline
          </small>
          <small style={{ color: theme.subtext }}>Powered by Gemini + RAG</small>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, text, theme }) {
  const isUser = role === "user";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: 10,
        margin: "8px 0",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          background: isUser ? theme.green : "#2a3139",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isUser ? "#0a0f0c" : theme.text,
          fontSize: 14,
          fontWeight: 700,
        }}
        title={isUser ? "You" : "Bot"}
      >
        {isUser ? "U" : "B"}
      </div>

      <div style={{ maxWidth: "78%" }}>
        <div
          style={{
            background: isUser ? "#111518" : "#13181d",
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: "10px 12px",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ theme }) {
  return (
    <div
      style={{
        height: "100%",
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: theme.subtext,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: "#12171c",
          border: `1px solid ${theme.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <span style={{ color: theme.green, fontSize: 28 }}>✳</span>
      </div>
      <div>
        <div style={{ fontSize: 16, color: "#d1d5db" }}>
          Ask me about Arnav’s work
        </div>
        <div style={{ fontSize: 13 }}>
          Projects • Competitions • Stack • Experience
        </div>
      </div>
    </div>
  );
}
