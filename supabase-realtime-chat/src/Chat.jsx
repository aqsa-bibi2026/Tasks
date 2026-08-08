import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Load messages error:", error);
        return;
      }

      if (!cancelled) {
        setMessages(data || []);
      }
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          setMessages((oldMessages) => {
            const exists = oldMessages.some(
              (item) => item.id === payload.new.id
            );

            if (exists) return oldMessages;

            return [...oldMessages, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function sendMessage(event) {
    event.preventDefault();

    const text = message.trim();

    if (!text) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        user_name: "You",
        message: text,
      });

    if (error) {
      console.error("Send message error:", error);
      return;
    }

    setMessage("");
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "25px",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>💬 Live Chat</h2>

      <p style={{ color: "green" }}>
        ● Supabase Realtime Online
      </p>

      <div
        style={{
          height: "350px",
          overflowY: "auto",
          padding: "15px",
          background: "#f5f7fb",
          borderRadius: "12px",
          marginBottom: "15px",
        }}
      >
        {messages.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888" }}>
            No messages yet 👋
          </p>
        ) : (
          messages.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#fff",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "10px",
                border: "1px solid #eee",
              }}
            >
              <strong>{item.user_name}</strong>
              <p>{item.message}</p>
              <small style={{ color: "#888" }}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleTimeString()
                  : ""}
              </small>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={sendMessage}
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "10px",
            background: "#111827",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
