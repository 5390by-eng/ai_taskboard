import type { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[75%] rounded-lg px-4 py-2 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
