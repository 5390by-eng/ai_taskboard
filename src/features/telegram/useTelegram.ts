import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { telegramService } from "@/services";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export function useTelegramInbox() {
  return useQuery({
    queryKey: queryKeys.telegram.drafts,
    queryFn: async () => {
      const result = await telegramService.listDrafts();
      if (result.error) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useApproveDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await telegramService.approveDraft(id);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.telegram.drafts });
      toast.success("Task approved and added to board");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRejectDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await telegramService.rejectDraft(id);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.telegram.drafts });
      toast.success("Task rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
