// ChatWidget.jsx
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import Chatbot from "./Chatbot";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating bubble button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "#22c55e",
          color: "#0a0f0c",
          border: "3px solid rgba(255, 255, 255, 0.2)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 20px rgba(34, 197, 94, 0.4), 0 0 0 0 rgba(34, 197, 94, 0.5)",
          zIndex: 1000,
          transition: "all 0.3s ease",
        }}
        title={open ? "Close chat" : "Chat with me"}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(34, 197, 94, 0.5), 0 0 0 4px rgba(34, 197, 94, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(34, 197, 94, 0.4), 0 0 0 0 rgba(34, 197, 94, 0.5)";
        }}
      >
        {open ? (
          <X size={32} strokeWidth={2.5} />
        ) : (
          <MessageCircle size={36} strokeWidth={2.5} />
        )}
      </button>

      {/* Chatbot panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 24,
            width: 360,
            height: "70vh",
            maxHeight: "600px",
            minHeight: "400px",
            zIndex: 999,
            animation: "fadeIn 0.2s ease-out",
            // Ensure the container doesn't interfere with scrolling
            overflow: "hidden",
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          {/* Modified Chatbot wrapper for proper scrolling */}
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              background: "#0f1214",
              borderRadius: 16,
              border: "1px solid #22282f",
            }}
          >
            <Chatbot
              apiUrl="https://ragfolio-1.onrender.com/chat"
              title="Ask Arnav"
              // Override the default styles for the widget context
              customStyles={{
                container: {
                  minHeight: "100%",
                  height: "100%",
                  maxWidth: "none",
                  width: "100%",
                  margin: 0,
                  border: "none",
                  borderRadius: 0,
                  boxShadow: "none",
                  display: "flex",
                  flexDirection: "column",
                },
                messagesContainer: {
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  maxHeight: "none",
                  // Custom scrollbar styling
                  scrollbarWidth: "thin",
                  scrollbarColor: "#22c55e #151a1f",
                  // Webkit scrollbar styling
                  WebkitScrollbar: {
                    width: "6px",
                  },
                  WebkitScrollbarTrack: {
                    background: "#151a1f",
                  },
                  WebkitScrollbarThumb: {
                    background: "#22c55e",
                    borderRadius: "3px",
                  },
                  WebkitScrollbarThumbHover: {
                    background: "#16a34a",
                  },
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Enhanced animations and scrollbar styles */}
      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(10px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }

        /* Custom scrollbar for webkit browsers */
        div[style*="overflowY: auto"]::-webkit-scrollbar {
          width: 6px;
        }

        div[style*="overflowY: auto"]::-webkit-scrollbar-track {
          background: #151a1f;
          border-radius: 3px;
        }

        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
          background: #22c55e;
          border-radius: 3px;
        }

        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb:hover {
          background: #16a34a;
        }

        /* Ensure proper scrolling behavior */
        div[style*="overflowY: auto"] {
          scrollbar-width: thin;
          scrollbar-color: #22c55e #151a1f;
        }
      `}</style>
    </>
  );
}
