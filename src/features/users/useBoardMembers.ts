import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/features/auth/profile.service";
import { queryKeys } from "@/lib/query-keys";

export function useBoardMembers(boardId: string) {
  return useQuery({
    queryKey: queryKeys.profiles.byBoard(boardId),
    queryFn: () => profileService.getBoardMemberProfiles(boardId),
    enabled: boardId.length > 0,
  });
}
