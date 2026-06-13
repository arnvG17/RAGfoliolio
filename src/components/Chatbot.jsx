import { useEffect, useMemo, useRef, useState, useCallback } from "react";

export default function Chatbot({
  apiUrl = "https://ragfolio-1.onrender.com/rag",
  title = "Portfolio RAG Bot",
  placeholder = "Ask me about my projects, skills, or experience…",
  customStyles = {},
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const listRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const conversationId = useRef(
    crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  );

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
      personal: "#8b5cf6",
      general: "#3b82f6",
    }),
    []
  );

  // Default styles that can be overridden
  const defaultContainerStyles = {
    background: theme.bg,
    color: theme.text,
    minHeight: 520,
    width: "100%",
    maxWidth: 960,
    margin: "0 auto",
    border: `1px solid ${theme.border}`,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
  };

  const defaultMessagesStyles = {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: 16,
    background: theme.bg,
    position: "relative",
  };

  // Merge custom styles with defaults
  const containerStyles = { ...defaultContainerStyles, ...customStyles.container };
  const messagesStyles = { ...defaultMessagesStyles, ...customStyles.messagesContainer };

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

  // Auto scroll when messages or streaming text changes
  useEffect(() => {
    scrollToBottom(true);
  }, [messages, streamingText]);

  // Handle scroll restoration
  useEffect(() => {
    if (listRef.current) {
      scrollToBottom(false);
    }
  }, []);

  // Build conversation history for the API
  const getHistory = useCallback(() => {
    return messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));
  }, [messages]);

  // ── SSE Streaming Send ─────────────────────────────────────

  async function sendMessage() {
    const question = input.trim();
    if (!question || loading) return;
    setError("");
    setRouteInfo(null);

    const newMsgs = [...messages, { role: "user", content: question }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    setStreamingText("");

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: question,
          conversation_id: conversationId.current,
          history: getHistory(),
        }),
      });

      if (!res.ok) {
        const info = await res.json().catch(() => ({}));
        throw new Error(info?.detail || info?.error || `HTTP ${res.status}`);
      }

      const contentType = res.headers.get("content-type") || "";

      // ── SSE streaming response ──
      if (contentType.includes("text/event-stream")) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events from buffer
          const events = buffer.split("\n\n");
          buffer = events.pop(); // Keep incomplete event in buffer

          for (const event of events) {
            if (!event.trim()) continue;

            const lines = event.split("\n");
            let eventType = "";
            let eventData = "";

            for (const line of lines) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith("data: ")) {
                eventData = line.slice(6);
              }
            }

            if (!eventData) continue;

            try {
              const data = JSON.parse(eventData);

              switch (eventType) {
                case "metadata":
                  setRouteInfo({
                    route: data.route,
                    confidence: data.confidence,
                    tools: data.tools_used || [],
                  });
                  break;

                case "token":
                  fullText += data.content;
                  setStreamingText(fullText);
                  break;

                case "done":
                  // Finalize: move streaming text to messages
                  setMessages((prev) => [
                    ...prev,
                    {
                      role: "assistant",
                      content: fullText,
                      route: routeInfo?.route,
                      tools: routeInfo?.tools || [],
                      latency: data.latency_ms,
                    },
                  ]);
                  setStreamingText("");
                  break;
              }
            } catch (e) {
              // Skip malformed events
              console.warn("SSE parse error:", e);
            }
          }
        }

        // If stream ended without a done event, finalize anyway
        if (fullText && streamingText) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: fullText },
          ]);
          setStreamingText("");
        }
      }
      // ── Legacy JSON response (backward compat) ──
      else {
        const data = await res.json();
        const answer = data?.answer ?? "(No answer returned)";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: answer,
            route: data?.route,
            tools: data?.tools_used || [],
          },
        ]);
      }
    } catch (e) {
      console.error(e, "error");
      setError(e?.message || "Request failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't fetch a reply right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: theme.panel,
          borderBottom: `1px solid ${theme.border}`,
          borderTopLeftRadius: containerStyles.borderRadius === 0 ? 0 : 16,
          borderTopRightRadius: containerStyles.borderRadius === 0 ? 0 : 16,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: loading ? "#f59e0b" : theme.green,
              animation: loading ? "pulse 1.5s ease-in-out infinite" : "none",
            }}
          />
          <h3 style={{ margin: 0, fontSize: 16, letterSpacing: 0.3 }}>
            {title}
          </h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {routeInfo && (
            <span
              style={{
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 999,
                background:
                  routeInfo.route === "personal"
                    ? "rgba(139,92,246,0.15)"
                    : "rgba(59,130,246,0.15)",
                color:
                  routeInfo.route === "personal"
                    ? theme.personal
                    : theme.general,
                border: `1px solid ${
                  routeInfo.route === "personal"
                    ? "rgba(139,92,246,0.3)"
                    : "rgba(59,130,246,0.3)"
                }`,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {routeInfo.route}
            </span>
          )}
          <span style={{ fontSize: 12, color: theme.subtext }}>
            {loading ? "thinking…" : "online"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        style={messagesStyles}
      >
        {messages.length === 0 && !streamingText && <EmptyState theme={theme} />}
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.content} theme={theme} meta={m} />
        ))}

        {/* Streaming bubble */}
        {streamingText && (
          <Bubble
            role="assistant"
            text={streamingText}
            theme={theme}
            isStreaming={true}
          />
        )}

        {/* Loading indicator */}
        {loading && !streamingText && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "8px 0",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: "#2a3139",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.text,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              B
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: theme.green,
                    animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
          </div>
        )}

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
              transition: "transform 0.1s ease, box-shadow 0.1s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1)";
              e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
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
            flexShrink: 0,
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
          borderBottomLeftRadius: containerStyles.borderRadius === 0 ? 0 : 16,
          borderBottomRightRadius: containerStyles.borderRadius === 0 ? 0 : 16,
          flexShrink: 0,
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
          <small style={{ color: theme.subtext }}>Powered by ArnV@teamLH</small>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function MusicTable({ title, headers, rows, accentColor }) {
  return (
    <div style={{ marginTop: 12, marginBottom: 4 }}>
      <div style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1,
        color: accentColor || "#22c55e",
        textTransform: "uppercase",
        marginBottom: 6,
      }}>{title}</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 13,
        }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{
                  padding: "6px 10px",
                  background: "#0c1014",
                  color: accentColor || "#22c55e",
                  textAlign: "left",
                  fontWeight: 600,
                  borderBottom: `1px solid ${accentColor || "#22c55e"}44`,
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  letterSpacing: 0.5,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{
                background: ri % 2 === 0 ? "#0f1418" : "#111820",
              }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: "7px 10px",
                    color: ci === 0 ? (accentColor || "#22c55e") : "#e5e7eb",
                    fontWeight: ci === 0 ? 700 : 400,
                    borderBottom: "1px solid #1a2028",
                    whiteSpace: ci > 0 ? "nowrap" : "normal",
                    maxWidth: ci === 1 ? 200 : "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function parseMusicProfile(text) {
  // Detect if text contains a music profile block from Last.fm
  if (!text.includes("MUSIC PROFILE") && !text.includes("TOP TRACKS") && !text.includes("TOP ARTISTS")) {
    return null;
  }

  const sections = [];
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Section headers followed by a header row and dashes
    if (
      (line.includes("TOP TRACKS") || line.includes("TOP ARTISTS") ||
       line.includes("TOP ALBUMS") || line.includes("RECENTLY PLAYED")) &&
      i + 2 < lines.length
    ) {
      const headerLine = lines[i + 1]?.trim();
      const dashLine = lines[i + 2]?.trim();

      if (headerLine && dashLine && dashLine.startsWith("-")) {
        const headers = headerLine.split(/\s{2,}/).map(h => h.trim()).filter(Boolean);
        const rows = [];
        let j = i + 3;
        while (j < lines.length && lines[j].trim() && !lines[j].trim().startsWith("-")) {
          const cells = lines[j].trim().split(/\s{2,}/).map(c => c.trim()).filter(Boolean);
          if (cells.length >= 2) rows.push(cells);
          j++;
        }
        if (rows.length > 0) {
          sections.push({ title: line, headers, rows });
          i = j;
          continue;
        }
      }
    }

    i++;
  }

  return sections.length > 0 ? sections : null;
}

function NowPlayingBanner({ text, theme }) {
  // Extract NOW PLAYING line
  const match = text.match(/🔴 NOW PLAYING: (.+?) — (.+?) \(from '(.+?)'\)/);
  if (!match) return null;
  const [, track, artist, album] = match;
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 12px",
      background: "linear-gradient(90deg, rgba(239,68,68,0.12) 0%, rgba(15,20,26,0) 100%)",
      border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: 8,
      marginBottom: 8,
    }}>
      <span style={{ fontSize: 20 }}>🔴</span>
      <div>
        <div style={{ fontWeight: 700, color: "#f87171", fontSize: 13 }}>{track}</div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>{artist} · {album}</div>
      </div>
    </div>
  );
}

function SmartMessageContent({ text, theme }) {
  const sections = parseMusicProfile(text);

  if (!sections) {
    // Plain text — find any intro lines before tables
    return (
      <span style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{text}</span>
    );
  }

  // Extract the non-table preamble text (before first table marker)
  const firstTableMarker = ["📋", "🎤", "💿", "🕒"].find(m => text.includes(m));
  const preamble = firstTableMarker
    ? text.split(firstTableMarker)[0].replace(/\n{3,}/g, "\n\n").trim()
    : "";

  const sectionColors = {
    "TOP TRACKS": "#22c55e",
    "TOP ARTISTS": "#a78bfa",
    "TOP ALBUMS": "#60a5fa",
    "RECENTLY PLAYED": "#f59e0b",
  };

  return (
    <div>
      {preamble && (
        <div style={{ marginBottom: 10, whiteSpace: "pre-wrap", fontSize: 13, color: "#d1d5db" }}>
          {preamble}
        </div>
      )}
      <NowPlayingBanner text={text} theme={theme} />
      {sections.map((s, i) => {
        const color = Object.entries(sectionColors).find(([k]) => s.title.includes(k))?.[1] || "#22c55e";
        return (
          <MusicTable
            key={i}
            title={s.title}
            headers={s.headers}
            rows={s.rows}
            accentColor={color}
          />
        );
      })}
    </div>
  );
}

function Bubble({ role, text, theme, isStreaming = false, meta = {} }) {
  const isUser = role === "user";
  const toolEmojis = { spotify: "🎵", youtube: "▶️", github: "🐙" };
  const tools = meta?.tools || [];

  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-start",
      gap: 10,
      margin: "8px 0",
    }}>
      <div aria-hidden style={{
        width: 28, height: 28, borderRadius: 999,
        background: isUser ? theme.green : "#2a3139",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: isUser ? "#0a0f0c" : theme.text,
        fontSize: 14, fontWeight: 700, flexShrink: 0,
      }} title={isUser ? "You" : "Bot"}>
        {isUser ? "U" : "A"}
      </div>

      <div style={{ maxWidth: "88%", minWidth: 0 }}>
        {tools.length > 0 && (
          <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
            {tools.map((t) => (
              <span key={t} style={{
                fontSize: 10, padding: "1px 6px", borderRadius: 999,
                background: "rgba(34,197,94,0.1)", color: theme.green,
                border: "1px solid rgba(34,197,94,0.2)",
              }}>
                {toolEmojis[t] || "🔧"} {t}
              </span>
            ))}
          </div>
        )}

        <div style={{
          background: isUser ? "#111518" : "#13181d",
          color: theme.text,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: "10px 14px",
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}>
          {isUser
            ? <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>
            : <SmartMessageContent text={text} theme={theme} />
          }
          {isStreaming && (
            <span style={{
              display: "inline-block", width: 2, height: 16,
              background: theme.green, marginLeft: 2, verticalAlign: "text-bottom",
              animation: "blink 0.8s step-end infinite",
            }} />
          )}
        </div>

        {meta?.latency && (
          <div style={{ fontSize: 10, color: theme.subtext, marginTop: 2, paddingLeft: 4 }}>
            {meta.latency}ms
          </div>
        )}
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
          Ask me about Arnv
        </div>
        <div style={{ fontSize: 13 }}>
          Ml • SWE • Automations • Web3
        </div>
        <div
          style={{
            fontSize: 11,
            marginTop: 8,
            color: theme.subtext,
            opacity: 0.7,
          }}
        >
          Try: "What are your projects?" • "What's on your Spotify?"
        </div>
      </div>
    </div>
  );
}
