"use client";

import { useEffect, useRef } from "react";

import { formatCompactDate } from "@/lib/utils";

type ChatThreadProps = {
  currentUserId: string;
  messages: {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    sender: {
      displayName: string;
    };
  }[];
};

export function ChatThread({ currentUserId, messages }: ChatThreadProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/40 p-4"
    >
      {messages.length ? (
        messages.map((message) => {
          const isOwn = message.senderId === currentUserId;

          return (
            <div
              key={message.id}
              className={
                isOwn
                  ? "ml-auto max-w-[80%] rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-3"
                  : "mr-auto max-w-[80%] rounded-2xl border border-white/10 bg-white/5 p-3"
              }
            >
              <p className="text-sm text-white">{message.content}</p>
              <p className="mt-2 text-xs text-white/45">
                {isOwn ? "Tu" : message.sender.displayName} -{" "}
                {formatCompactDate(message.createdAt)}
              </p>
            </div>
          );
        })
      ) : (
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-white/60">
          Este chat aun no tiene mensajes.
        </div>
      )}
    </div>
  );
}
