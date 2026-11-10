
import { useState } from "react";
import { apiRequest } from "../services/api";
import "./TripNestAI.css";

function TripNestAI() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm TripNest AI. Where would you like to travel? I can help you discover destinations, plan itineraries, and estimate your trip budget.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async (event) => {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) return;

    const previousMessages = messages.filter(
      (item) => item.role === "user" || item.role === "assistant"
    );

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
    ]);

    setInput("");
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message,
          history: previousMessages.slice(-10),
        }),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setError(err.message || "Could not connect to TripNest AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tripnest-ai-page">
      <div className="ai-chat-container">
        <header className="ai-header">
          <div>
            <span className="ai-label">YOUR TRAVEL COMPANION</span>
            <h1>TripNest AI</h1>
            <p>Let's plan your next adventure together.</p>
          </div>
          <div className="ai-status">
            <span className="ai-status-dot"></span>
            AI Assistant
          </div>
        </header>

        <main className="ai-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`ai-message ${msg.role === "user" ? "user-message" : "assistant-message"}`}
            >
              <div className="ai-message-label">
                {msg.role === "user" ? "You" : "TripNest AI"}
              </div>
              <div className="ai-message-content">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="ai-message assistant-message">
              <div className="ai-message-label">TripNest AI</div>
              <div className="ai-message-content typing">
                Planning your answer...
              </div>
            </div>
          )}

          {error && <p className="ai-error">{error}</p>}
        </main>

        <form className="ai-input-form" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Ask me anything about travelling..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={loading}
          />

          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? "Sending..." : "Send"}
          </button>
        </form>

        <p className="ai-disclaimer">
          TripNest AI can make mistakes. Verify important travel information
          before making bookings.
        </p>
      </div>
    </div>
  );
}

export default TripNestAI;
