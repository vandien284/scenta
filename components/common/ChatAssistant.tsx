"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import styles from "@/styles/components/common/chatAssistant.module.scss";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
  createdAt: number;
}

const STORAGE_KEY = "scenta-chat-history";

function createId() {
  return Math.random().toString(36).slice(2);
}

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Xin chào! Mình là Scenta Assistant. Bạn cần tư vấn sản phẩm hay gợi ý quà tặng nào không?",
  id: createId(),
  createdAt: Date.now(),
};

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ChatMessage[] = JSON.parse(raw);
        if (parsed.length) {
          setMessages(parsed);
        }
      }
    } catch (error) {
      console.warn("[ChatAssistant] Không thể đọc lịch sử:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isOpen]);

  const isDisabled = useMemo(() => {
    return isLoading || !inputValue.trim();
  }, [isLoading, inputValue]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const cx = (...args: Array<string | false | null | undefined>) =>
    args.filter(Boolean).join(" ");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const content = inputValue.trim();
    if (!content) return;

    const userMessage: ChatMessage = {
      role: "user",
      content,
      id: createId(),
      createdAt: Date.now(),
    };

    const optimisticMessages = [...messages, userMessage];
    setMessages(optimisticMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: optimisticMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối tới AI");
      }

      const data = await response.json();
      const contentResponse = (data?.content as string | undefined)?.trim();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            contentResponse ||
            "Assistant hiện không phản hồi được. Bạn vui lòng thử lại sau nhé!",
          id: createId(),
          createdAt: Date.now(),
        },
      ]);
    } catch (error) {
      console.error("[ChatAssistant] error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Mình đang gặp sự cố khi kết nối tới AI. Bạn có thể thử lại sau ít phút nhé!",
          id: createId(),
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const formatText = (value: string) =>
    escapeHtml(value)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

  const renderContent = (content: string) => {
    const lines = content.trim().split(/\n+/);
    let html = "";
    let inList = false;

    lines.forEach((rawLine) => {
      const line = rawLine.trim();

      if (!line) return;

      if (/^[-*]\s+/.test(line)) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        const item = formatText(line.replace(/^[-*]\s+/, ""));
        html += `<li>${item}</li>`;
      } else {
        if (inList) {
          html += "</ul>";
          inList = false;
        }
        html += `<p>${formatText(line)}</p>`;
      }
    });

    if (inList) {
      html += "</ul>";
    }

    return html;
  };

  return (
    <div className={styles.wrapper}>
      <div className={cx(styles.panel, isOpen && styles.open)}>
        <header className={styles.header}>
          <div>
            <h3>Scenta Assistant</h3>
            <p>Trợ lý tư vấn 24/7</p>
          </div>
          <button onClick={handleClearHistory} className={styles.clearHistory}>
            Xóa lịch sử
          </button>
        </header>

        <div className={styles.messages} ref={listRef}>
          {messages.map((message) => (
            <div key={message.id} className={cx(styles.message, styles[message.role])}>
              <div
                className={styles.bubble}
                dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
              />
            </div>
          ))}
          {isLoading && (
            <div className={cx(styles.message, styles.assistant)}>
              <div className={cx(styles.bubble, styles.loading)}>
                Đang phản hồi...
              </div>
            </div>
          )}
        </div>

        <form
          className={styles.composer}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <textarea
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Nhập câu hỏi, ví dụ: Mùi hương nào phù hợp để tặng sinh nhật?"
            onKeyDown={handleKeyDown}
            rows={2}
          />
          <button type="submit" disabled={isDisabled} aria-label="Gửi">
            <FiSend />
          </button>
        </form>
      </div>

      <button
        className={cx(styles.fab, isOpen && styles.active)}
        onClick={handleToggle}
        aria-label="Mở trợ lý Scenta"
      >
        {isOpen ? <FiX /> : <FiMessageCircle />}
      </button>
    </div>
  );
}
