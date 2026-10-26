"use client";
import { useState } from "react";
import {
  Bot as BotIcon,
  Bug,
  ChevronDown,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import type { Bot, Settings, Widget } from "@/lib/client";
export function ChatPreview({
  bot,
  settings,
  widget,
  debugEnabled = false,
  interactive = true,
}: {
  bot: Bot;
  settings: Settings;
  widget: Widget;
  debugEnabled?: boolean;
  interactive?: boolean;
}) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
      [],
    ),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [debug, setDebug] = useState<Record<string, unknown> | null>(null),
    [session, setSession] = useState<{
      sessionToken?: string;
      conversationId?: string;
    }>({});
  async function send() {
    if (!input.trim() || busy) return;
    const message = input.trim();
    setInput("");
    setBusy(true);
    setError("");
    setMessages((current) => [
      ...current,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    try {
      const response = await fetch("/api/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId: bot.id, message, settings, ...session }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      const reader = response.body!.getReader(),
        decoder = new TextDecoder();
      let buffer = "",
        answer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let pos: number;
        while ((pos = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, pos);
          buffer = buffer.slice(pos + 2);
          if (!frame.startsWith("data: ")) continue;
          const event = JSON.parse(frame.slice(6));
          if (event.type === "meta")
            setSession({
              sessionToken: event.sessionToken,
              conversationId: event.conversationId,
            });
          if (event.type === "delta") {
            answer += event.text;
            const text = answer;
            setMessages((current) =>
              current.map((x, i) =>
                i === current.length - 1
                  ? { role: "assistant", content: text }
                  : x,
              ),
            );
          }
          if (event.type === "done") setDebug(event.debug);
          if (event.type === "error") throw new Error(event.message);
        }
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="preview-column">
      <div className="preview-label">
        <span>
          <i /> LIVE-VORSCHAU
        </span>
        <button
          className="icon-button"
          aria-label="Neue Test-Unterhaltung"
          disabled={busy}
          onClick={() => {
            setMessages([]);
            setSession({});
            setDebug(null);
            setError("");
          }}
        >
          <RotateCcw size={15} />
        </button>
      </div>
      <div
        className={`chat-preview ${widget.theme === "dark" ? "chat-dark" : ""}`}
        style={{ borderRadius: widget.radius }}
      >
        <div
          className="chat-header"
          style={{ background: widget.primaryColor, color: widget.textColor }}
        >
          <span className="chat-avatar">
            {widget.avatarUrl ? (
              <img src={widget.avatarUrl} alt="Bot-Avatar" />
            ) : (
              <BotIcon size={25} />
            )}
          </span>
          <div>
            <strong>{widget.displayName}</strong>
            <small>
              <i /> Für dich da
            </small>
          </div>
          <ChevronDown size={20} />
        </div>
        <div className="chat-messages">
          <span className="chat-timestamp">Heute</span>
          <div className="chat-line assistant">
            <span
              className="mini-chat-avatar"
              style={{ color: widget.primaryColor }}
            >
              <Sparkles size={16} />
            </span>
            <div>{widget.greeting}</div>
          </div>
          {!messages.length && (
            <div className="chat-suggestions">
              <button onClick={() => setInput("Was könnt ihr mir anbieten?")}>
                Was könnt ihr mir anbieten? <MessageCircle size={13} />
              </button>
              <button
                onClick={() => setInput("Wie kann ich euch kontaktieren?")}
              >
                Wie kann ich euch kontaktieren? <MessageCircle size={13} />
              </button>
            </div>
          )}
          {messages.map((message, i) => (
            <div className={`chat-line ${message.role}`} key={i}>
              {message.role === "assistant" && (
                <span
                  className="mini-chat-avatar"
                  style={{ color: widget.primaryColor }}
                >
                  <Sparkles size={16} />
                </span>
              )}
              <div
                style={
                  message.role === "user"
                    ? {
                        background: widget.primaryColor,
                        color: widget.textColor,
                      }
                    : undefined
                }
              >
                {message.content ||
                  (busy ? (
                    <span className="typing">•••</span>
                  ) : (
                    "Antwort nicht verfügbar."
                  ))}
              </div>
            </div>
          ))}
        </div>
        {error && (
          <div className="chat-error" role="alert">
            {error}
          </div>
        )}
        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            if (interactive) void send();
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={widget.placeholder}
            maxLength={4000}
            aria-label="Nachricht an den Chatbot"
            disabled={busy || !interactive}
          />
          <button
            aria-label="Nachricht senden"
            disabled={busy || !input.trim() || !interactive}
            style={{ background: widget.primaryColor, color: widget.textColor }}
          >
            <Send size={16} />
          </button>
        </form>
        {widget.branding && (
          <div className="chat-brand">
            {widget.logoUrl && <img src={widget.logoUrl} alt="Logo" />}Powered
            by <strong>dialogue ✦</strong>
          </div>
        )}
      </div>
      <div
        className={`preview-launcher ${widget.position === "left" ? "launcher-left" : ""}`}
        style={{ background: widget.primaryColor, color: widget.textColor }}
      >
        {widget.buttonIcon === "sparkles" ? (
          <Sparkles size={23} />
        ) : widget.buttonIcon === "bot" ? (
          <BotIcon size={23} />
        ) : (
          <MessageCircle size={23} />
        )}
      </div>
      {debugEnabled && (
        <div className="debug-panel">
          <h3>
            <Bug size={16} /> RAG Debug <span>Nur intern</span>
          </h3>
          {debug ? (
            <pre>{JSON.stringify(debug, null, 2)}</pre>
          ) : (
            <p>
              Sende eine Nachricht, um Chunks, Similarity Scores, Kontext,
              Tokens und Antwortzeit zu prüfen.
            </p>
          )}
        </div>
      )}
      <p className="preview-note">
        <X size={12} /> Vorschau-Gespräche werden nicht in den Live-Analytics
        gezählt.
      </p>
    </div>
  );
}
