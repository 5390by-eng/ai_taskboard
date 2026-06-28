import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores";
import { useUpdateProfileSettings, useUpdateTelegramUsername } from "@/features/auth";
import { mockUsers } from "@/lib/mock-data/users";
import { TEAM_ROLE_LABELS } from "@/lib/constants";
import {
  settingsProfileSchema,
  telegramUsernameSchema,
  type SettingsProfileFormInput,
  type SettingsProfileFormValues,
} from "@/lib/validators";
import { TEAM_ROLES } from "@/types/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SettingsProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfileSettings();

  const form = useForm<SettingsProfileFormInput, unknown, SettingsProfileFormValues>({
    resolver: zodResolver(settingsProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      teamRole: user?.teamRole ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      name: user?.name ?? "",
      email: user?.email ?? "",
      teamRole: user?.teamRole ?? "",
    });
  }, [user, form]);

  function handleSaveProfile(values: SettingsProfileFormValues) {
    updateProfile.mutate({
      name: values.name,
      teamRole: values.teamRole,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" disabled {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teamRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TEAM_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {TEAM_ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function SettingsTeamPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <CardDescription>Manage team members and roles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockUsers.map((member) => {
          const initials = member.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
          return (
            <div key={member.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <Badge variant="secondary">{member.role}</Badge>
            </div>
          );
        })}
        <Button variant="outline">Invite Member</Button>
      </CardContent>
    </Card>
  );
}

export function SettingsNotificationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Configure how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {["Task assignments", "Board updates", "AI suggestions", "Telegram messages"].map((item) => (
          <div key={item} className="flex items-center justify-between">
            <span className="text-sm">{item}</span>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>
        ))}
        <Button>Save Preferences</Button>
      </CardContent>
    </Card>
  );
}

function TelegramIntegrationCard() {
  const user = useAuthStore((s) => s.user);
  const updateTelegramUsername = useUpdateTelegramUsername();
  const savedUsername = user?.telegramUsername ?? "";
  const hasSavedUsername = savedUsername.length > 0;

  const [username, setUsername] = useState(savedUsername);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUsername(savedUsername);
    setError(null);
  }, [savedUsername]);

  function handleSaveTelegramUsername() {
    const parsed = telegramUsernameSchema.safeParse(username);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid Telegram username");
      return;
    }

    updateTelegramUsername.mutate(parsed.data, {
      onSuccess: () => {
        setError(null);
      },
      onError: (mutationError) => {
        setError(mutationError.message);
      },
    });
  }

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">Telegram</p>
          <p className="text-sm text-muted-foreground">Receive tasks from Telegram bot</p>
        </div>
        <Badge variant={hasSavedUsername ? "default" : "secondary"}>
          {hasSavedUsername ? "Connected" : "Not connected"}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label htmlFor="telegram-username">Telegram username</Label>
        <Input
          id="telegram-username"
          placeholder="@username"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            if (error) {
              setError(null);
            }
          }}
        />
        {hasSavedUsername && (
          <p className="text-sm text-muted-foreground">
            Current: @{savedUsername}
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Button
        type="button"
        onClick={handleSaveTelegramUsername}
        disabled={updateTelegramUsername.isPending}
      >
        {updateTelegramUsername.isPending
          ? "Saving..."
          : hasSavedUsername
            ? "Update"
            : "Add"}
      </Button>
    </div>
  );
}

export function SettingsIntegrationsPage() {
  const otherIntegrations = [
    { name: "Supabase", status: "Not configured", description: "Backend database and auth" },
    { name: "Stripe", status: "Coming soon", description: "Payment processing" },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>Connect external services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TelegramIntegrationCard />
        {otherIntegrations.map((integration) => (
          <div key={integration.name} className="flex items-center justify-between border rounded-lg p-4">
            <div>
              <p className="font-medium">{integration.name}</p>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
            </div>
            <Badge variant="secondary">
              {integration.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
