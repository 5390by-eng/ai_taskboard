import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useAiTaskGenerator } from "@/features/ai";
import { AIInput, TaskPreviewList } from "@/components/ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AiTaskGeneratorPage() {
  const [description, setDescription] = useState("");
  const {
    preview,
    generateMutation,
    confirmMutation,
    updatePreviewTask,
    removePreviewTask,
    clearPreview,
  } = useAiTaskGenerator("board_1");

  const handleGenerate = () => {
    if (description.length >= 10) {
      generateMutation.mutate(description);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          AI Task Generator
        </h1>
        <p className="text-muted-foreground">
          Describe your project and AI will break it down into actionable tasks
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Description</CardTitle>
          <CardDescription>
            Enter a detailed description of your project or feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIInput
            value={description}
            onChange={setDescription}
            onGenerate={handleGenerate}
            isLoading={generateMutation.isPending}
          />
        </CardContent>
      </Card>

      {preview.length > 0 && (
        <div className="space-y-4">
          <TaskPreviewList
            tasks={preview}
            onUpdate={updatePreviewTask}
            onRemove={removePreviewTask}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => confirmMutation.mutate(preview)}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? "Creating tasks..." : "Confirm & Create Tasks"}
            </Button>
            <Button variant="outline" onClick={clearPreview}>
              Clear Preview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
