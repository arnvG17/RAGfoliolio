import { useState } from "react";

export default function RagManager() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const theme = {
    bg: "#0f1214",
    panel: "#151a1f",
    border: "#22282f",
    text: "#e5e7eb",
    subtext: "#9ca3af",
    green: "#22c55e",
    greenDark: "#16a34a",
    danger: "#ef4444",
  };

  const handleRunPipeline = async () => {
    if (!content.trim()) {
      setError("Please enter some content to process");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/update-vector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Pipeline error:", err);
      setError(err?.message || "Failed to run pipeline");
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultContent = async () => {
    try {
      const response = await fetch("http://localhost:5000/me.txt");
      if (response.ok) {
        const text = await response.text();
        setContent(text);
      } else {
        setError("Could not load default me.txt content");
      }
    } catch (err) {
      setError("Failed to load default content");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.bg,
      color: theme.text,
      padding: "20px",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        {/* Header */}
        <div style={{
          background: theme.panel,
          border: `1px solid ${theme.border}`,
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "20px",
        }}>
          <h1 style={{
            margin: "0 0 10px 0",
            fontSize: "24px",
            color: theme.text,
          }}>
            RAG Vector Pipeline Manager
          </h1>
          <p style={{
            margin: 0,
            color: theme.subtext,
            fontSize: "14px",
          }}>
            Update your RAG vector store with new content. This will process the text and create embeddings for better query results.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}>
          {/* Input Section */}
          <div style={{
            background: theme.panel,
            border: `1px solid ${theme.border}`,
            borderRadius: "16px",
            padding: "20px",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}>
              <h2 style={{
                margin: 0,
                fontSize: "18px",
                color: theme.text,
              }}>
                Content Input
              </h2>
              <button
                onClick={loadDefaultContent}
                style={{
                  background: theme.green,
                  color: "#0a0f0c",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Load Default me.txt
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your me.txt content here or use the 'Load Default me.txt' button..."
              style={{
                width: "100%",
                height: "400px",
                resize: "vertical",
                background: "#0c0f11",
                color: theme.text,
                border: `1px solid ${theme.border}`,
                borderRadius: "8px",
                padding: "12px",
                fontSize: "14px",
                lineHeight: "1.5",
                fontFamily: "monospace",
                outline: "none",
              }}
            />

            <div style={{
              marginTop: "15px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div style={{
                fontSize: "12px",
                color: theme.subtext,
              }}>
                {content.length} characters
              </div>
              <button
                onClick={handleRunPipeline}
                disabled={loading || !content.trim()}
                style={{
                  background: loading ? theme.greenDark : theme.green,
                  color: "#0a0f0c",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "wait" : "pointer",
                  opacity: (loading || !content.trim()) ? 0.6 : 1,
                }}
              >
                {loading ? "Processing..." : "Run Pipeline"}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div style={{
            background: theme.panel,
            border: `1px solid ${theme.border}`,
            borderRadius: "16px",
            padding: "20px",
          }}>
            <h2 style={{
              margin: "0 0 15px 0",
              fontSize: "18px",
              color: theme.text,
            }}>
              Pipeline Results
            </h2>

            {error && (
              <div style={{
                background: "#1f2937",
                border: `1px solid ${theme.danger}`,
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "15px",
              }}>
                <div style={{
                  color: theme.danger,
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "5px",
                }}>
                  Error
                </div>
                <div style={{
                  color: theme.text,
                  fontSize: "13px",
                }}>
                  {error}
                </div>
              </div>
            )}

            {result && (
              <div style={{
                background: "#111518",
                border: `1px solid ${theme.green}`,
                borderRadius: "8px",
                padding: "15px",
              }}>
                <div style={{
                  color: theme.green,
                  fontSize: "14px",
                  fontWeight: "600",
                  marginBottom: "10px",
                }}>
                  ✅ Pipeline Completed Successfully
                </div>
                <div style={{
                  color: theme.text,
                  fontSize: "13px",
                  lineHeight: "1.6",
                }}>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Message:</strong> {result.message}
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Chunks Created:</strong> {result.chunksCount}
                  </div>
                  <div>
                    <strong>Status:</strong> Vector store updated and ready for queries
                  </div>
                </div>
              </div>
            )}

            {!loading && !result && !error && (
              <div style={{
                background: "#111518",
                border: `1px solid ${theme.border}`,
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                color: theme.subtext,
                fontSize: "14px",
              }}>
                <div style={{
                  fontSize: "48px",
                  marginBottom: "10px",
                  opacity: 0.5,
                }}>
                  ⚡
                </div>
                <div>
                  Enter content and click "Run Pipeline" to update your RAG vector store
                </div>
              </div>
            )}

            {loading && (
              <div style={{
                background: "#111518",
                border: `1px solid ${theme.border}`,
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                color: theme.subtext,
                fontSize: "14px",
              }}>
                <div style={{
                  fontSize: "48px",
                  marginBottom: "10px",
                  animation: "spin 2s linear infinite",
                }}>
                  ⚙️
                </div>
                <div>Processing your content...</div>
                <div style={{
                  fontSize: "12px",
                  marginTop: "5px",
                  opacity: 0.7,
                }}>
                  Creating embeddings and updating vector store
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          background: theme.panel,
          border: `1px solid ${theme.border}`,
          borderRadius: "16px",
          padding: "20px",
          marginTop: "20px",
        }}>
          <h3 style={{
            margin: "0 0 10px 0",
            fontSize: "16px",
            color: theme.text,
          }}>
            How to Use
          </h3>
          <ol style={{
            margin: 0,
            paddingLeft: "20px",
            color: theme.subtext,
            fontSize: "14px",
            lineHeight: "1.6",
          }}>
            <li>Click "Load Default me.txt" to load the current content, or paste your own content</li>
            <li>Review and edit the content as needed</li>
            <li>Click "Run Pipeline" to process the content and update the vector store</li>
            <li>Once completed, your chatbot will use the updated content for queries</li>
          </ol>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
