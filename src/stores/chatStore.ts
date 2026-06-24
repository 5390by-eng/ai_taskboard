import { create } from "zustand";
import type { ChatMessage, ChatSession } from "@/types";
import { mockChatSessions } from "@/lib/mock-data/chat";
import { generateId } from "@/lib/utils";

type ChatState = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messagesBySession: Record<string, ChatMessage[]>;
  isLoading: boolean;
  error: string | null;
  setActiveSession: (id: string) => void;
  createSession: (title?: string) => string;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initMessages: (sessionId: string, messages: ChatMessage[]) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [...mockChatSessions],
  activeSessionId: mockChatSessions[0]?.id ?? null,
  messagesBySession: {},
  isLoading: false,
  error: null,
  setActiveSession: (id) => set({ activeSessionId: id }),
  createSession: (title) => {
    const id = generateId("session");
    const session: ChatSession = {
      id,
      title: title ?? "New Chat",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      sessions: [session, ...state.sessions],
      activeSessionId: id,
    }));
    return id;
  },
  addMessage: (sessionId, message) =>
    set((state) => ({
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: [
          ...(state.messagesBySession[sessionId] ?? []),
          message,
        ],
      },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  initMessages: (sessionId, messages) => {
    if (get().messagesBySession[sessionId]) return;
    set((state) => ({
      messagesBySession: {
        ...state.messagesBySession,
        [sessionId]: messages,
      },
    }));
  },
}));
