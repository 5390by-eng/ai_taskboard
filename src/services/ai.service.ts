import type { AiGenerateRequest, GeneratedTaskPreview, ServiceResult } from "@/types";
import { generateMockTasksFromDescription } from "@/lib/mock-data/ai-responses";
import { delay } from "@/lib/utils";
import { success } from "@/types/api";

async function simulateDelay(): Promise<void> {
  await delay(800 + Math.random() * 700);
}

export const aiService = {
  async generateTasksFromDescription(
    request: AiGenerateRequest,
  ): Promise<ServiceResult<GeneratedTaskPreview[]>> {
    await simulateDelay();
    const tasks = generateMockTasksFromDescription(request.projectDescription);
    return success(tasks);
  },
};
