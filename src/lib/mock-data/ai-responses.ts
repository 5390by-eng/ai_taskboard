import type { GeneratedTaskPreview } from "@/types";
import { generateId } from "@/lib/utils";

export function generateMockTasksFromDescription(
  description: string,
): GeneratedTaskPreview[] {
  const keywords = description.toLowerCase();
  const tasks: GeneratedTaskPreview[] = [
    {
      id: generateId("preview"),
      title: "Project planning & requirements",
      description: "Define scope, goals, and success metrics for the project",
      priority: "high",
      assigneeId: "user_1",
      suggestedStatus: "todo",
    },
    {
      id: generateId("preview"),
      title: "Design system setup",
      description: "Establish UI components, colors, and typography",
      priority: "medium",
      assigneeId: "user_2",
      suggestedStatus: "backlog",
    },
    {
      id: generateId("preview"),
      title: "Core feature implementation",
      description: "Build the main functionality based on requirements",
      priority: "high",
      assigneeId: "user_3",
      suggestedStatus: "todo",
    },
    {
      id: generateId("preview"),
      title: "Testing & QA",
      description: "Write tests and perform quality assurance",
      priority: "medium",
      suggestedStatus: "backlog",
    },
    {
      id: generateId("preview"),
      title: "Documentation",
      description: "Create user and developer documentation",
      priority: "low",
      suggestedStatus: "backlog",
    },
  ];

  if (keywords.includes("mobile") || keywords.includes("app")) {
    tasks.push({
      id: generateId("preview"),
      title: "Mobile responsiveness",
      description: "Ensure the app works well on mobile devices",
      priority: "medium",
      assigneeId: "user_2",
      suggestedStatus: "backlog",
    });
  }

  if (keywords.includes("api") || keywords.includes("backend")) {
    tasks.push({
      id: generateId("preview"),
      title: "API integration",
      description: "Connect frontend to backend services",
      priority: "high",
      assigneeId: "user_3",
      suggestedStatus: "todo",
    });
  }

  return tasks;
}
