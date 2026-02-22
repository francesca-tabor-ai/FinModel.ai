/**
 * Floating chat widget: bottom-right icon opens a conversational AI assistant
 * with prompt probes for platform questions and guidance.
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { API } from "../lib/api";
import { cn } from "../lib/utils";

type Message = { role: "user" | "assistant"; content: string };

const PROMPT_PROBES = [
  "What can I do on the dashboard?",
  "How do I run a simulation?",
  "What are the AI agents?",
  "Where do I see my runway?",
  "How does the decision log work?",
  "Explain the financial model view",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    try {
      const res = await fetch(API.chat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Chat failed");
      }
      const data = (await res.json()) as { reply: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: e instanceof Error ? e.message : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const showProbes = messages.length === 0;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300",
          "bg-[#111827] text-white hover:bg-black hover:scale-105 active:scale-95",
          "border border-gray-200/50"
        )}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-40 w-[420px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-8rem)] flex flex-col rounded-2xl border border-gray-100 bg-white shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center">
                <MessageCircle className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-[#111827] tracking-tight">
                  FinModel.ai Assistant
                </h3>
                <p className="text-xs text-gray-500 font-light">
                  Ask about the platform or get guidance
                </p>
              </div>
            </div>

            {/* Messages + probes */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
            >
              {showProbes && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Try asking
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PROMPT_PROBES.map((probe, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(probe)}
                        className="px-3 py-2 text-left text-sm rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-700 transition-colors"
                      >
                        {probe}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      m.role === "user"
                        ? "bg-[#111827] text-white"
                        : "bg-gray-50 border border-gray-100 text-[#111827]"
                    )}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm prose-gray max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="font-medium">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-2.5 bg-gray-50 border border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={16} className="animate-spin" />
                    Thinking…
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about the platform..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="btn-primary flex items-center justify-center w-10 h-10 shrink-0 rounded-xl p-0"
                  aria-label="Send"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
