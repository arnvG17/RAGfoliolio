import { useState, useEffect, useCallback } from "react";
import { getBackendUrl, DEFAULT_API_BASE } from "../config";

const THEME = {
  bg: "#07090b",
  surface: "#0f1214",
  panel: "#151a1f",
  border: "#1e252c",
  borderHover: "#2a343e",
  text: "#e5e7eb",
  subtext: "#7a8494",
  muted: "#4a5568",
  green: "#22c55e",
  greenDark: "#16a34a",
  greenGlow: "rgba(34,197,94,0.12)",
  purple: "#8b5cf6",
  purpleGlow: "rgba(139,92,246,0.12)",
  blue: "#3b82f6",
  blueGlow: "rgba(59,130,246,0.12)",
  orange: "#f59e0b",
  orangeGlow: "rgba(245,158,11,0.12)",
  red: "#ef4444",
  redGlow: "rgba(239,68,68,0.12)",
  pink: "#ec4899",
  pinkGlow: "rgba(236,72,153,0.12)",
};

// ─────────────────────────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────────────────────────

function StatusDot({ active, color = THEME.green }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: active ? color : THEME.muted,
        boxShadow: active ? `0 0 8px ${color}` : "none",
        transition: "all 0.3s ease",
      }}
    />
  );
}

function Badge({ children, color = THEME.green, glow = THEME.greenGlow }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 999,
        background: glow,
        color: color,
        border: `1px solid ${color}25`,
        textTransform: "uppercase",
        letterSpacing: 0.8,
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: THEME.surface,
        border: `1px solid ${THEME.border}`,
        borderRadius: 16,
        padding: 24,
        transition: "border-color 0.2s ease",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = THEME.borderHover)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = THEME.border)}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: THEME.text,
            letterSpacing: -0.3,
          }}
        >
          {title}
        </h2>
      </div>
      {subtitle && (
        <p style={{ margin: 0, fontSize: 13, color: THEME.subtext, paddingLeft: 30 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = "primary",
  style = {},
}) {
  const variants = {
    primary: {
      bg: THEME.green,
      hoverBg: THEME.greenDark,
      color: "#0a0f0c",
    },
    secondary: {
      bg: "transparent",
      hoverBg: THEME.panel,
      color: THEME.text,
      border: `1px solid ${THEME.border}`,
    },
    danger: {
      bg: "transparent",
      hoverBg: THEME.redGlow,
      color: THEME.red,
      border: `1px solid ${THEME.red}30`,
    },
  };
  const v = variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: "10px 20px",
        borderRadius: 10,
        border: v.border || "none",
        background: loading ? v.hoverBg || v.bg : v.bg,
        color: v.color,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",
        gap: 8,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.background = v.hoverBg || v.bg;
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = loading ? v.hoverBg || v.bg : v.bg;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {loading && (
        <span
          style={{
            display: "inline-block",
            width: 14,
            height: 14,
            border: `2px solid ${v.color}40`,
            borderTopColor: v.color,
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }}
        />
      )}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Tool Config Cards
// ─────────────────────────────────────────────────────────────

const TOOL_CONFIGS = [
  {
    key: "spotify",
    name: "Spotify",
    icon: "🎵",
    color: THEME.green,
    glow: THEME.greenGlow,
    description: "Now playing & recent tracks",
    fields: ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET", "SPOTIFY_REFRESH_TOKEN"],
    ttl: "30s",
  },
  {
    key: "youtube",
    name: "YouTube",
    icon: "▶️",
    color: THEME.red,
    glow: THEME.redGlow,
    description: "Recent channel uploads",
    fields: ["YOUTUBE_API_KEY", "YOUTUBE_CHANNEL_ID"],
    ttl: "5min",
  },
  {
    key: "github",
    name: "GitHub",
    icon: "🐙",
    color: THEME.purple,
    glow: THEME.purpleGlow,
    description: "Activity feed & repositories",
    fields: ["GITHUB_TOKEN", "GITHUB_USERNAME"],
    ttl: "2min",
  },
];

const CORE_SERVICES = [
  { key: "groq", name: "Groq LLM", icon: "⚡", color: THEME.orange, glow: THEME.orangeGlow },
  { key: "google_embeddings", name: "Gemini Embeddings", icon: "🧬", color: THEME.blue, glow: THEME.blueGlow },
  { key: "pinecone", name: "Pinecone Vector DB", icon: "🌲", color: THEME.green, glow: THEME.greenGlow },
];

function ToolCard({ tool, isConfigured, onTest }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const base = await getBackendUrl();
      const res = await fetch(`${base}/config/test-tool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: tool.key }),
      });
      const data = await res.json();
      setTestResult(res.ok ? { ok: true, data } : { ok: false, error: data.error });
    } catch (e) {
      setTestResult({ ok: false, error: e.message });
    }
    setTesting(false);
  }

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: tool.glow,
              border: `1px solid ${tool.color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            {tool.icon}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: THEME.text }}>{tool.name}</div>
            <div style={{ fontSize: 12, color: THEME.subtext }}>{tool.description}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge
            color={isConfigured ? THEME.green : THEME.muted}
            glow={isConfigured ? THEME.greenGlow : `${THEME.muted}15`}
          >
            {isConfigured ? "Connected" : "Not Configured"}
          </Badge>
          <StatusDot active={isConfigured} color={tool.color} />
        </div>
      </div>

      {/* Env var hints */}
      <div
        style={{
          marginTop: 16,
          padding: "10px 14px",
          borderRadius: 8,
          background: THEME.bg,
          border: `1px solid ${THEME.border}`,
        }}
      >
        <div style={{ fontSize: 10, color: THEME.subtext, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
          Required ENV Variables
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tool.fields.map((field) => (
            <code
              key={field}
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 4,
                background: `${tool.color}10`,
                color: tool.color,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              }}
            >
              {field}
            </code>
          ))}
        </div>
        <div style={{ fontSize: 10, color: THEME.muted, marginTop: 6 }}>
          Cache TTL: {tool.ttl}
        </div>
      </div>

      {/* Test button */}
      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <ActionButton
          variant="secondary"
          onClick={handleTest}
          loading={testing}
          disabled={!isConfigured}
          style={{ fontSize: 12, padding: "6px 14px" }}
        >
          Test Connection
        </ActionButton>
        {testResult && (
          <span style={{ fontSize: 12, color: testResult.ok ? THEME.green : THEME.red }}>
            {testResult.ok ? "✓ Working" : `✗ ${testResult.error}`}
          </span>
        )}
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────

export default function RagAdmin() {
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE);
  const [activeTab, setActiveTab] = useState("knowledge");
  const [meTxt, setMeTxt] = useState("");
  const [meTxtLoading, setMeTxtLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [configStatus, setConfigStatus] = useState({});
  const [kbStats, setKbStats] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    getBackendUrl().then((url) => {
      setApiBase(url);
      loadMeTxt(url);
      loadConfigStatus(url);
      loadHealth(url);
    });
  }, []);

  const loadMeTxt = useCallback(async (baseUrl = apiBase) => {
    try {
      const res = await fetch(`${baseUrl}/me.txt`);
      if (res.ok) {
        const text = await res.text();
        setMeTxt(text);
      }
    } catch (e) {
      console.error("Failed to load me.txt:", e);
    }
  }, [apiBase]);

  const loadConfigStatus = useCallback(async (baseUrl = apiBase) => {
    setConfigLoading(true);
    try {
      const res = await fetch(`${baseUrl}/config/status`);
      if (res.ok) {
        const data = await res.json();
        setConfigStatus(data);
      }
    } catch (e) {
      console.error("Failed to load config status:", e);
    }
    setConfigLoading(false);
  }, [apiBase]);

  const loadHealth = useCallback(async (baseUrl = apiBase) => {
    try {
      const res = await fetch(`${baseUrl}/health`);
      if (res.ok) {
        const data = await res.json();
        setKbStats(data.knowledge_base);
      }
    } catch (e) {
      console.error("Failed to load health:", e);
    }
  }, [apiBase]);

  async function saveMeTxt() {
    setMeTxtLoading(true);
    setSaveStatus(null);
    try {
      const res = await fetch(`${apiBase}/me.txt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: meTxt }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveStatus({ ok: true, message: data.message, stats: data.stats });
        setKbStats(data.stats);
      } else {
        setSaveStatus({ ok: false, message: data.error });
      }
    } catch (e) {
      setSaveStatus({ ok: false, message: e.message });
    }
    setMeTxtLoading(false);
    // Clear status after 5s
    setTimeout(() => setSaveStatus(null), 5000);
  }

  async function reloadKB() {
    setMeTxtLoading(true);
    try {
      const res = await fetch(`${apiBase}/reload`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setKbStats(data.stats);
        setSaveStatus({ ok: true, message: "Knowledge base reloaded successfully" });
      } else {
        setSaveStatus({ ok: false, message: data.error });
      }
    } catch (e) {
      setSaveStatus({ ok: false, message: e.message });
    }
    setMeTxtLoading(false);
    setTimeout(() => setSaveStatus(null), 5000);
  }

  const tabs = [
    { id: "knowledge", label: "Knowledge Base", icon: "📄" },
    { id: "tools", label: "Tool Integrations", icon: "🔧" },
    { id: "system", label: "System Status", icon: "📊" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
      }}
    >
      {/* ── Top Bar ────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: `${THEME.bg}ee`,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${THEME.green}, ${THEME.purple})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              ⚙
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>
                RAG Control Center
              </h1>
              <div style={{ fontSize: 11, color: THEME.subtext }}>Smart Agent Configuration</div>
            </div>
          </div>

          <a
            href="/"
            style={{
              fontSize: 13,
              color: THEME.subtext,
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: 8,
              border: `1px solid ${THEME.border}`,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = THEME.borderHover;
              e.currentTarget.style.color = THEME.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = THEME.border;
              e.currentTarget.style.color = THEME.subtext;
            }}
          >
            ← Back to Portfolio
          </a>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────── */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>
        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 24,
            padding: 4,
            background: THEME.surface,
            borderRadius: 12,
            border: `1px solid ${THEME.border}`,
            width: "fit-content",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: activeTab === tab.id ? THEME.panel : "transparent",
                color: activeTab === tab.id ? THEME.text : THEME.subtext,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: activeTab === tab.id ? `0 1px 3px ${THEME.bg}` : "none",
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Knowledge Base Tab ───────────────────── */}
        {activeTab === "knowledge" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
            {/* Editor */}
            <Card>
              <SectionTitle
                icon="📝"
                title="me.txt Editor"
                subtitle="Edit your personal knowledge base. Changes are embedded and stored in Pinecone."
              />

              <textarea
                value={meTxt}
                onChange={(e) => setMeTxt(e.target.value)}
                spellCheck={false}
                style={{
                  width: "100%",
                  height: "calc(100vh - 340px)",
                  minHeight: 400,
                  resize: "vertical",
                  background: THEME.bg,
                  color: THEME.text,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 10,
                  padding: 16,
                  fontSize: 13,
                  lineHeight: 1.7,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = THEME.green + "50")}
                onBlur={(e) => (e.target.style.borderColor = THEME.border)}
              />

              {/* Actions */}
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: THEME.subtext }}>
                    {meTxt.length.toLocaleString()} chars • ~{Math.ceil(meTxt.split(/\s+/).length)} tokens
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <ActionButton variant="secondary" onClick={reloadKB} loading={meTxtLoading}>
                    🔄 Reload Only
                  </ActionButton>
                  <ActionButton onClick={saveMeTxt} loading={meTxtLoading} disabled={!meTxt.trim()}>
                    💾 Save & Re-embed
                  </ActionButton>
                </div>
              </div>

              {/* Save status toast */}
              {saveStatus && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 16px",
                    borderRadius: 8,
                    background: saveStatus.ok ? THEME.greenGlow : THEME.redGlow,
                    border: `1px solid ${saveStatus.ok ? THEME.green : THEME.red}30`,
                    color: saveStatus.ok ? THEME.green : THEME.red,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    animation: "fadeIn 0.2s ease-out",
                  }}
                >
                  <span>{saveStatus.ok ? "✓" : "✗"}</span>
                  {saveStatus.message}
                </div>
              )}
            </Card>

            {/* Sidebar — Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card>
                <SectionTitle icon="📊" title="Knowledge Stats" />
                {kbStats ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <StatRow label="Total Chunks" value={kbStats.total_chunks} />
                    <StatRow label="Total Tokens" value={kbStats.total_tokens?.toLocaleString()} />
                    <StatRow
                      label="Sections"
                      value={kbStats.sections?.length || 0}
                    />
                    <div style={{ marginTop: 4 }}>
                      <div style={{ fontSize: 10, color: THEME.subtext, marginBottom: 6, textTransform: "uppercase" }}>
                        Indexed Sections
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {(kbStats.sections || []).map((s) => (
                          <Badge key={s} color={THEME.purple} glow={THEME.purpleGlow}>
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {kbStats.last_load_time > 0 && (
                      <div style={{ fontSize: 11, color: THEME.muted, marginTop: 4 }}>
                        Last loaded: {new Date(kbStats.last_load_time * 1000).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: THEME.subtext, fontSize: 13 }}>
                    Backend not connected
                  </div>
                )}
              </Card>

              <Card>
                <SectionTitle icon="💡" title="Section Format" />
                <div
                  style={{
                    background: THEME.bg,
                    borderRadius: 8,
                    padding: 12,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: THEME.green,
                      fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.6,
                    }}
                  >
{`--- SECTION NAME ---
Your content here...

--- NEXT SECTION ---
More content...`}
                  </pre>
                </div>
                <p style={{ fontSize: 11, color: THEME.subtext, margin: "8px 0 0" }}>
                  Sections like PERSONAL IDENTITY, EDUCATION, PROJECTS, SKILLS, etc. are auto-parsed.
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* ── Tools Tab ────────────────────────────── */}
        {activeTab === "tools" && (
          <div>
            {/* Core Services */}
            <SectionTitle
              icon="🔑"
              title="Core Services"
              subtitle="These must be configured for the agent to function."
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
              {CORE_SERVICES.map((svc) => (
                <Card key={svc.key}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          fontSize: 24,
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: svc.glow,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {svc.icon}
                      </span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{svc.name}</div>
                        {svc.key === "groq" && configStatus.groq_model && (
                          <div style={{ fontSize: 11, color: THEME.subtext }}>{configStatus.groq_model}</div>
                        )}
                        {svc.key === "pinecone" && configStatus.pinecone_index && (
                          <div style={{ fontSize: 11, color: THEME.subtext }}>Index: {configStatus.pinecone_index}</div>
                        )}
                      </div>
                    </div>
                    <StatusDot active={configStatus[svc.key]} color={svc.color} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Tool Integrations */}
            <SectionTitle
              icon="🔌"
              title="Tool Integrations"
              subtitle="Optional APIs that enhance the agent's capabilities. Configure in your .env file."
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 16 }}>
              {TOOL_CONFIGS.map((tool) => (
                <ToolCard
                  key={tool.key}
                  tool={tool}
                  isConfigured={configStatus[tool.key]}
                />
              ))}
            </div>

            {/* Env file hint */}
            <Card style={{ marginTop: 24 }}>
              <SectionTitle icon="📋" title="Configuration Guide" />
              <div
                style={{
                  background: THEME.bg,
                  borderRadius: 8,
                  padding: 16,
                  border: `1px solid ${THEME.border}`,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  lineHeight: 1.8,
                  color: THEME.subtext,
                  overflowX: "auto",
                }}
              >
                <div style={{ color: THEME.muted }}>
                  # Add these to your <span style={{ color: THEME.green }}>.env</span> file in the backend directory:
                </div>
                <br />
                <div style={{ color: THEME.orange }}>## Core (Required)</div>
                <div><span style={{ color: THEME.text }}>GROQ_API_KEY</span>=gsk_your_key_here</div>
                <div><span style={{ color: THEME.text }}>GOOGLE_API_KEY</span>=AIza_your_key_here</div>
                <div><span style={{ color: THEME.text }}>PINECONE_API_KEY</span>=pcsk_your_key_here</div>
                <br />
                <div style={{ color: THEME.orange }}>## Spotify (Optional)</div>
                <div><span style={{ color: THEME.text }}>SPOTIFY_CLIENT_ID</span>=your_client_id</div>
                <div><span style={{ color: THEME.text }}>SPOTIFY_CLIENT_SECRET</span>=your_client_secret</div>
                <div><span style={{ color: THEME.text }}>SPOTIFY_REFRESH_TOKEN</span>=your_refresh_token</div>
                <br />
                <div style={{ color: THEME.orange }}>## YouTube (Optional)</div>
                <div><span style={{ color: THEME.text }}>YOUTUBE_API_KEY</span>=your_api_key</div>
                <div><span style={{ color: THEME.text }}>YOUTUBE_CHANNEL_ID</span>=your_channel_id</div>
                <br />
                <div style={{ color: THEME.orange }}>## GitHub (Optional)</div>
                <div><span style={{ color: THEME.text }}>GITHUB_TOKEN</span>=ghp_your_token</div>
                <div><span style={{ color: THEME.text }}>GITHUB_USERNAME</span>=your_username</div>
              </div>
            </Card>
          </div>
        )}

        {/* ── System Tab ───────────────────────────── */}
        {activeTab === "system" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card>
              <SectionTitle icon="🏥" title="System Health" />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <HealthRow
                  label="Backend Server"
                  status={kbStats ? "online" : "offline"}
                  detail={apiBase}
                />
                <HealthRow
                  label="Knowledge Base"
                  status={kbStats && kbStats.total_chunks > 0 ? "online" : "warning"}
                  detail={kbStats ? `${kbStats.total_chunks} chunks indexed` : "Not loaded"}
                />
                <HealthRow
                  label="Pinecone"
                  status={configStatus.pinecone ? "online" : "offline"}
                  detail={configStatus.pinecone_index || "Not configured"}
                />
                <HealthRow
                  label="Groq LLM"
                  status={configStatus.groq ? "online" : "offline"}
                  detail={configStatus.groq_model || "Not configured"}
                />
                <HealthRow
                  label="Gemini Embeddings"
                  status={configStatus.google_embeddings ? "online" : "offline"}
                  detail={configStatus.google_embeddings ? "text-embedding-004" : "Not configured"}
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <ActionButton variant="secondary" onClick={() => { loadHealth(); loadConfigStatus(); }}>
                  🔄 Refresh Status
                </ActionButton>
              </div>
            </Card>

            <Card>
              <SectionTitle icon="🧪" title="Quick Test" subtitle="Send a test query to the agent" />
              <TestQueryPanel />
            </Card>

            <Card style={{ gridColumn: "1 / -1" }}>
              <SectionTitle icon="🗺️" title="Architecture" subtitle="How queries flow through the system" />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 12,
                  padding: "16px 0",
                }}
              >
                {[
                  { label: "Query Input", icon: "💬", color: THEME.text },
                  { label: "Router", icon: "🔀", color: THEME.orange },
                  { label: "Tool Agent", icon: "🔧", color: THEME.purple },
                  { label: "Pipeline", icon: "⚙️", color: THEME.blue },
                  { label: "SSE Stream", icon: "📡", color: THEME.green },
                ].map((step, i) => (
                  <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: `${step.color}12`,
                        border: `1px solid ${step.color}25`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: step.color }}>{step.label}</div>
                    </div>
                    {i < 4 && (
                      <span style={{ color: THEME.muted, fontSize: 18, marginLeft: "auto" }}>→</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${THEME.bg}; }
        ::-webkit-scrollbar-thumb { background: ${THEME.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${THEME.borderHover}; }
        textarea::-webkit-scrollbar { width: 6px; }
        textarea::-webkit-scrollbar-track { background: ${THEME.bg}; border-radius: 0 10px 10px 0; }
        textarea::-webkit-scrollbar-thumb { background: ${THEME.border}; border-radius: 3px; }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────────

function StatRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: THEME.subtext }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: THEME.text }}>{value ?? "—"}</span>
    </div>
  );
}

function HealthRow({ label, status, detail }) {
  const colors = {
    online: THEME.green,
    offline: THEME.red,
    warning: THEME.orange,
  };
  const c = colors[status] || THEME.muted;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderRadius: 8,
        background: THEME.bg,
        border: `1px solid ${THEME.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <StatusDot active={status === "online"} color={c} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{ fontSize: 12, color: c }}>{detail}</span>
    </div>
  );
}

function TestQueryPanel() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function testQuery() {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);

    const start = Date.now();
    try {
      const base = await getBackendUrl();
      const res = await fetch(`${base}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), k: 4 }),
      });
      const data = await res.json();
      setResult({
        ok: res.ok,
        answer: data.answer || data.error,
        route: data.route,
        confidence: data.confidence,
        tools: data.tools_used,
        latency: Date.now() - start,
      });
    } catch (e) {
      setResult({ ok: false, answer: e.message, latency: Date.now() - start });
    }
    setLoading(false);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && testQuery()}
          placeholder="Type a test query..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: `1px solid ${THEME.border}`,
            background: THEME.bg,
            color: THEME.text,
            fontSize: 13,
            outline: "none",
          }}
        />
        <ActionButton onClick={testQuery} loading={loading} disabled={!query.trim()}>
          Test
        </ActionButton>
      </div>

      {/* Quick test buttons */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {["Tell me about yourself", "What are your projects?", "What is machine learning?"].map((q) => (
          <button
            key={q}
            onClick={() => { setQuery(q); }}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: `1px solid ${THEME.border}`,
              background: "transparent",
              color: THEME.subtext,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {result && (
        <div
          style={{
            padding: 14,
            borderRadius: 8,
            background: THEME.bg,
            border: `1px solid ${result.ok ? THEME.green : THEME.red}30`,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {result.route && (
              <Badge
                color={result.route === "personal" ? THEME.purple : THEME.blue}
                glow={result.route === "personal" ? THEME.purpleGlow : THEME.blueGlow}
              >
                {result.route}
              </Badge>
            )}
            {result.confidence && (
              <Badge color={THEME.orange} glow={THEME.orangeGlow}>
                {Math.round(result.confidence * 100)}% conf
              </Badge>
            )}
            <Badge color={THEME.subtext} glow={`${THEME.subtext}15`}>
              {result.latency}ms
            </Badge>
          </div>
          <div
            style={{
              fontSize: 13,
              color: THEME.text,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {result.answer}
          </div>
        </div>
      )}
    </div>
  );
}
