import { useState } from "react";
import { Send } from "lucide-react";
import { useTelegramInbox, useApproveDraft, useRejectDraft } from "@/features/telegram";
import { TelegramTaskCard } from "@/components/telegram";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";

export function TelegramInboxPage() {
  const { data: drafts, isLoading, isError, refetch } = useTelegramInbox();
  const approveDraft = useApproveDraft();
  const rejectDraft = useRejectDraft();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setActionId(id);
    approveDraft.mutate(id, { onSettled: () => setActionId(null) });
  };

  const handleReject = (id: string) => {
    setActionId(id);
    rejectDraft.mutate(id, { onSettled: () => setActionId(null) });
  };

  if (isLoading) return <LoadingState message="Loading inbox..." />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Send className="h-6 w-6" />
          Telegram Inbox
        </h1>
        <p className="text-muted-foreground">
          Review and approve tasks received from Telegram
        </p>
      </div>

      {!drafts || drafts.length === 0 ? (
        <EmptyState
          icon={Send}
          title="Inbox is empty"
          description="New tasks from Telegram will appear here for review"
        />
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <TelegramTaskCard
              key={draft.id}
              draft={draft}
              onApprove={handleApprove}
              onReject={handleReject}
              isApproving={actionId === draft.id && approveDraft.isPending}
              isRejecting={actionId === draft.id && rejectDraft.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
