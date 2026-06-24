import { Loader2, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AIInputProps = {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isLoading?: boolean;
  className?: string;
};

export function AIInput({
  value,
  onChange,
  onGenerate,
  isLoading,
  className,
}: AIInputProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Textarea
        placeholder="Describe your project... e.g. Build a mobile app with user authentication, API integration, and dark mode support"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        disabled={isLoading}
      />
      <Button onClick={onGenerate} disabled={isLoading || value.length < 10}>
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles />
            Generate Tasks
          </>
        )}
      </Button>
    </div>
  );
}
