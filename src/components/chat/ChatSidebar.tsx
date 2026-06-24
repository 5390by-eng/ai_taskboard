import { Plus, MessageSquare } from "lucide-react";
import type { ChatSession } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

type ChatSidebarProps = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
};

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
}: ChatSidebarProps) {
  return (
    <div className="flex w-64 shrink-0 flex-col border-r bg-muted/30">
      <div className="p-3">
        <Button className="w-full" onClick={onNewSession}>
          <Plus />
          New Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {sessions.map((session) => (
          <button
            key={session.id}
            type="button"
            onClick={() => onSelectSession(session.id)}
            className={cn(
              "flex w-full items-start gap-2 rounded-lg p-3 text-left text-sm transition-colors hover:bg-muted",
              activeSessionId === session.id && "bg-muted",
            )}
          >
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{session.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(session.updatedAt)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
