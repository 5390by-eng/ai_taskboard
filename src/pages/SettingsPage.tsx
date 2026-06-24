import { useAuthStore } from "@/stores";
import { mockUsers } from "@/lib/mock-data/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function SettingsProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue={user?.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue={user?.email} />
        </div>
        <Button>Save Changes</Button>
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

export function SettingsIntegrationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>Connect external services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { name: "Telegram", status: "Connected", description: "Receive tasks from Telegram bot" },
          { name: "Supabase", status: "Not configured", description: "Backend database and auth" },
          { name: "Stripe", status: "Coming soon", description: "Payment processing" },
        ].map((integration) => (
          <div key={integration.name} className="flex items-center justify-between border rounded-lg p-4">
            <div>
              <p className="font-medium">{integration.name}</p>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
            </div>
            <Badge variant={integration.status === "Connected" ? "default" : "secondary"}>
              {integration.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
