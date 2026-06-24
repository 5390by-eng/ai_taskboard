import type { ChatMessage } from "@/types";
import { mockAiChatResponses, mockChatMessages } from "@/lib/mock-data/chat";
import { delay, generateId } from "@/lib/utils";

async function simulateDelay(): Promise<void> {
  await delay(600 + Math.random() * 800);
}

export const chatService = {
  async sendMessage(
    sessionId: string,
    _content: string,
  ): Promise<ChatMessage> {
    await simulateDelay();
    const responseText =
      mockAiChatResponses[
        Math.floor(Math.random() * mockAiChatResponses.length)
      ] ?? mockAiChatResponses[0];

    return {
      id: generateId("msg"),
      sessionId,
      role: "assistant",
      content: responseText,
      createdAt: new Date().toISOString(),
    };
  },

  getInitialMessages(): ChatMessage[] {
    return [...mockChatMessages];
  },
};
