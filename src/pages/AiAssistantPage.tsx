import { useEffect } from "react";
import { useAiChat } from "@/features/ai";
import { useChatStore } from "@/stores";
import { chatService } from "@/services/chat.service";
import { ChatSidebar, ChatWindow } from "@/components/chat";
import { generateId } from "@/lib/utils";

export function AiAssistantPage() {
  const sessions = useChatStore((s) => s.sessions);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const messagesBySession = useChatStore((s) => s.messagesBySession);
  const isLoading = useChatStore((s) => s.isLoading);
  const setActiveSession = useChatStore((s) => s.setActiveSession);
  const createSession = useChatStore((s) => s.createSession);
  const addMessage = useChatStore((s) => s.addMessage);
  const setLoading = useChatStore((s) => s.setLoading);
  const initMessages = useChatStore((s) => s.initMessages);

  const { sendMessage } = useAiChat();

  useEffect(() => {
    sessions.forEach((session) => {
      const sessionMessages = chatService
        .getInitialMessages()
        .filter((m) => m.sessionId === session.id);
      if (sessionMessages.length > 0) {
        initMessages(session.id, sessionMessages);
      }
    });
  }, [sessions, initMessages]);

  const activeMessages = activeSessionId
    ? messagesBySession[activeSessionId] ?? []
    : [];

  const handleSend = async (content: string) => {
    if (!activeSessionId) return;

    const userMessage = {
      id: generateId("msg"),
      sessionId: activeSessionId,
      role: "user" as const,
      content,
      createdAt: new Date().toISOString(),
    };
    addMessage(activeSessionId, userMessage);
    setLoading(true);

    try {
      const response = await sendMessage.mutateAsync({
        sessionId: activeSessionId,
        content,
      });
      addMessage(activeSessionId, response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-4 md:-m-6 rounded-lg border overflow-hidden">
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSession}
        onNewSession={() => createSession()}
      />
      <ChatWindow
        messages={activeMessages}
        isLoading={isLoading}
        onSend={handleSend}
      />
    </div>
  );
}
