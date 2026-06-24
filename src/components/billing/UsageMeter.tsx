import { Progress } from "@/components/ui/progress";

type UsageMeterProps = {
  label: string;
  used: number;
  limit: number;
};

export function UsageMeter({ label, used, limit }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isUnlimited = limit >= 999;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {used} / {isUnlimited ? "∞" : limit}
        </span>
      </div>
      <Progress value={isUnlimited ? Math.min(used, 100) : percentage} />
    </div>
  );
}
