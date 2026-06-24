import type { Board } from "@/types";

type BoardHeaderProps = {
  board: Board;
};

export function BoardHeader({ board }: BoardHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold">{board.title}</h1>
      {board.description ? (
        <p className="text-sm text-muted-foreground">{board.description}</p>
      ) : null}
    </div>
  );
}
