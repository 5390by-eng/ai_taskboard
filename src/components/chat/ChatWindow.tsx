import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { PromptInput } from "./PromptInput";
import { LoadingState } from "@/components/LoadingState";

type ChatWindowProps = {
  messages: ChatMessage[];
  isLoading?: boolean;
  onSend: (content: string) => void;
};

export function ChatWindow({ messages, isLoading, onSend }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>Start a conversation with the AI assistant</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <LoadingState message="AI is thinking..." className="py-4" />}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-4">
        <PromptInput onSend={onSend} disabled={isLoading} />
      </div>
    </div>
  );
}
