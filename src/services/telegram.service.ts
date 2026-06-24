import type { ServiceResult, TelegramDraftTask } from "@/types";
import { mockTelegramDrafts } from "@/lib/mock-data/telegram";
import { delay } from "@/lib/utils";
import { failure, success } from "@/types/api";

let drafts = [...mockTelegramDrafts];

async function simulateDelay(): Promise<void> {
  await delay(300 + Math.random() * 500);
}

export const telegramService = {
  async listDrafts(): Promise<ServiceResult<TelegramDraftTask[]>> {
    await simulateDelay();
    return success(drafts.filter((d) => d.status === "pending"));
  },

  async approveDraft(id: string): Promise<ServiceResult<TelegramDraftTask>> {
    await simulateDelay();
    const draft = drafts.find((d) => d.id === id);
    if (!draft) {
      return failure("Draft not found");
    }
    drafts = drafts.map((d) =>
      d.id === id ? { ...d, status: "approved" as const } : d,
    );
    return success({ ...draft, status: "approved" });
  },

  async rejectDraft(id: string): Promise<ServiceResult<TelegramDraftTask>> {
    await simulateDelay();
    const draft = drafts.find((d) => d.id === id);
    if (!draft) {
      return failure("Draft not found");
    }
    drafts = drafts.map((d) =>
      d.id === id ? { ...d, status: "rejected" as const } : d,
    );
    return success({ ...draft, status: "rejected" });
  },
};
