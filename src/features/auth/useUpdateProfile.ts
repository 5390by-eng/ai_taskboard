import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores";
import type { TeamRole } from "@/types/user";
import { profileService, type Profile } from "./profile.service";

function syncProfileToAuthStore(profile: Profile): void {
  const { user, session, setSession } = useAuthStore.getState();

  if (!user || !session) {
    return;
  }

  setSession(
    {
      ...user,
      name: profile.name,
      teamRole: profile.teamRole,
      telegramUsername: profile.telegramUsername,
    },
    session,
  );
}

export function useUpdateProfileSettings() {
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (fields: { name: string; teamRole: TeamRole }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      return profileService.updateProfileFields(user.id, fields);
    },
    onSuccess: (profile) => {
      syncProfileToAuthStore(profile);
      toast.success("Profile saved");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTelegramUsername() {
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (telegramUsername: string) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      const hadUsername = Boolean(user.telegramUsername);
      const profile = await profileService.updateProfileFields(user.id, {
        telegramUsername,
      });

      return { profile, hadUsername };
    },
    onSuccess: ({ profile, hadUsername }) => {
      syncProfileToAuthStore(profile);
      toast.success(
        hadUsername ? "Telegram username updated" : "Telegram username added",
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
