import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { profileService, type Profile } from "@/features/auth/profile.service";
import { queryKeys } from "@/lib/query-keys";
import type { Board } from "@/types";

export function useBoardMemberProfilesMap(boards: Board[] | undefined) {
  const memberIdsKey = useMemo(() => {
    if (!boards || boards.length === 0) return "";
    const ids = [...new Set(boards.flatMap((board) => board.memberIds))].sort();
    return ids.join(",");
  }, [boards]);

  const query = useQuery({
    queryKey: queryKeys.profiles.byIds(memberIdsKey),
    queryFn: () => profileService.getProfilesByIds(memberIdsKey.split(",").filter(Boolean)),
    enabled: memberIdsKey.length > 0,
  });

  const profilesById = useMemo(() => {
    const map = new Map<string, Profile>();
    for (const profile of query.data ?? []) {
      map.set(profile.id, profile);
    }
    return map;
  }, [query.data]);

  return {
    profilesById,
    isLoading: query.isLoading,
  };
}
