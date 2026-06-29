import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AI_REQUEST_PRICE_USD, calculateAiCreditsFromAmountUsd } from "@/types/billing";

type AiTopupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (amountUsd: number) => void;
  isLoading?: boolean;
};

export function AiTopupDialog({ open, onOpenChange, onSubmit, isLoading }: AiTopupDialogProps) {
  const [amount, setAmount] = useState("5");

  const parsedAmount = Number.parseFloat(amount);
  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount >= AI_REQUEST_PRICE_USD;
  const estimatedCredits = isValidAmount ? calculateAiCreditsFromAmountUsd(parsedAmount) : 0;

  const handleSubmit = (): void => {
    if (!isValidAmount || estimatedCredits < 1) {
      return;
    }
    onSubmit(parsedAmount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy AI requests</DialogTitle>
          <DialogDescription>
            Enter any amount in USD. Each AI request costs ${AI_REQUEST_PRICE_USD.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topup-amount">Amount (USD)</Label>
            <Input
              id="topup-amount"
              type="number"
              min={AI_REQUEST_PRICE_USD}
              step="0.5"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="5.00"
            />
          </div>

          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            {isValidAmount && estimatedCredits > 0 ? (
              <p>
                You will receive <strong>{estimatedCredits}</strong> AI request
                {estimatedCredits === 1 ? "" : "s"}.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Minimum amount is ${AI_REQUEST_PRICE_USD.toFixed(2)} (1 request).
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValidAmount || estimatedCredits < 1 || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Redirecting...
              </>
            ) : (
              "Continue to payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
