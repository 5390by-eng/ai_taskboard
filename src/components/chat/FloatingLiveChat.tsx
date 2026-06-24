import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { TaskPreviewList } from "@/components/ai";
import { useBoardTaskPrompt } from "@/features/ai";
import type { Profile } from "@/features/auth/profile.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FloatingLiveChatProps = {
  boardId: string;
  members?: Profile[];
};

export function FloatingLiveChat({ boardId, members = [] }: FloatingLiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    preview,
    lastPrompt,
    generateMutation,
    confirmMutation,
    updatePreviewTask,
    removePreviewTask,
    clearPreview,
    regenerate,
  } = useBoardTaskPrompt(boardId);

  const isGenerating = generateMutation.isPending;
  const isCreating = confirmMutation.isPending;
  const isBusy = isGenerating || isCreating;

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [preview, isOpen, isGenerating]);

  const handleGenerate = () => {
    const trimmed = prompt.trim();
    if (!trimmed || isBusy) return;
    generateMutation.mutate(trimmed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleGenerate();
    }
  };

  const handleConfirm = () => {
    if (preview.length === 0 || isBusy) return;
    confirmMutation.mutate(preview, {
      onSuccess: () => {
        setPrompt("");
      },
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <Card className="flex h-[min(560px,calc(100vh-6rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">Task Prompt</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Describe work and generate tasks for this board
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setIsOpen(false)}
              aria-label="Close task prompt"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {preview.length === 0 && !isGenerating && (
                <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <Sparkles className="h-8 w-8 opacity-60" />
                  <p className="text-sm">Describe what needs to be done</p>
                  <p className="text-xs">
                    Example: Create backend for todo app with auth and task CRUD
                  </p>
                </div>
              )}

              {generateMutation.isError && (
                <p className="rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive">
                  {generateMutation.error.message}
                </p>
              )}

              <TaskPreviewList
                tasks={preview}
                onUpdate={updatePreviewTask}
                onRemove={removePreviewTask}
                members={members}
                compact
              />

              {isGenerating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating tasks...
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t p-3">
            {preview.length > 0 && (
              <div className="flex w-full flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  disabled={isBusy || preview.length === 0}
                >
                  {isCreating ? "Creating..." : `Create ${preview.length} tasks`}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={regenerate}
                  disabled={isBusy || !lastPrompt}
                >
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearPreview}
                  disabled={isBusy}
                >
                  Clear
                </Button>
              </div>
            )}

            <div className="flex w-full gap-2">
              <Textarea
                placeholder="Describe tasks for this board..."
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isBusy}
                rows={2}
                className="min-h-[60px] resize-none"
              />
              <Button
                size="icon"
                className="h-[60px] w-[60px] shrink-0"
                onClick={handleGenerate}
                disabled={isBusy || !prompt.trim()}
                aria-label="Generate tasks"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105",
        )}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close task prompt" : "Open task prompt"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </Button>
    </div>
  );
}
