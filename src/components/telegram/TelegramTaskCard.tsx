import type { TelegramDraftTask } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PriorityBadge } from "@/components/tasks/PriorityBadge";
import { ApproveTaskButton } from "./ApproveTaskButton";
import { RejectTaskButton } from "./RejectTaskButton";
import { formatRelativeTime } from "@/lib/utils";

type TelegramTaskCardProps = {
  draft: TelegramDraftTask;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
};

export function TelegramTaskCard({
  draft,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: TelegramTaskCardProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{draft.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              from {draft.senderName} ({draft.senderUsername}) · {formatRelativeTime(draft.receivedAt)}
            </p>
          </div>
          <PriorityBadge priority={draft.priority} />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-4">
        <p className="text-sm text-muted-foreground">{draft.description}</p>
        <div className="flex gap-2">
          <ApproveTaskButton
            onClick={() => onApprove(draft.id)}
            isLoading={isApproving}
          />
          <RejectTaskButton
            onClick={() => onReject(draft.id)}
            isLoading={isRejecting}
          />
        </div>
      </CardContent>
    </Card>
  );
}
