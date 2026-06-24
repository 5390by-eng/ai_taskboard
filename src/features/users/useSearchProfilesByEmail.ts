import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/features/auth/profile.service";
import { queryKeys } from "@/lib/query-keys";
import { useDebounce } from "@/hooks/useDebounce";

export function useSearchProfilesByEmail(query: string) {
  const debouncedQuery = useDebounce(query.trim(), 300);

  return useQuery({
    queryKey: queryKeys.profiles.search(debouncedQuery),
    queryFn: () => profileService.searchProfilesByEmail(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });
}
