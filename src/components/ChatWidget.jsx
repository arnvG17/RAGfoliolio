// ChatWidget.jsx
import { useState } from "react";
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
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#22c55e",
          color: "#0a0f0c",
          border: "none",
          cursor: "pointer",
          fontSize: 26,
          fontWeight: "bold",
          boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
          zIndex: 1000,
        }}
        title={open ? "Close chat" : "Open chat"}
      >
        {open ? "×" : "💬"}
      </button>

      {/* Chatbot panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 360,
            maxHeight: "70vh",
            zIndex: 999,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <Chatbot
            apiUrl="http://localhost:5000/chat"
            title="Ask Arnav"
          />
        </div>
      )}

      {/* Quick fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
