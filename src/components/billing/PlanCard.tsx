import type { PaymentPlan } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeButton } from "./UpgradeButton";
import { cn } from "@/lib/utils";

type PlanCardProps = {
  plan: PaymentPlan;
  isCurrent?: boolean;
  onUpgrade?: () => void;
  isUpgrading?: boolean;
};

export function PlanCard({ plan, isCurrent, onUpgrade, isUpgrading }: PlanCardProps) {
  return (
    <Card className={cn(isCurrent && "border-primary ring-1 ring-primary")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{plan.name}</CardTitle>
          {isCurrent && <Badge>Current</Badge>}
        </div>
        <CardDescription>
          <span className="text-2xl font-bold text-foreground">
            ${plan.price}
          </span>
          <span className="text-muted-foreground">/{plan.interval}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      {!isCurrent && onUpgrade && (
        <CardFooter>
          <UpgradeButton onClick={onUpgrade} isLoading={isUpgrading} planName={plan.name} />
        </CardFooter>
      )}
    </Card>
  );
}
