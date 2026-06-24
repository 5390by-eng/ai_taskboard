import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type RejectTaskButtonProps = {
  onClick: () => void;
  isLoading?: boolean;
};

export function RejectTaskButton({ onClick, isLoading }: RejectTaskButtonProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onClick();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <X />}
          Reject
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject this task?</AlertDialogTitle>
          <AlertDialogDescription>
            This draft will be removed from your inbox. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Reject</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
