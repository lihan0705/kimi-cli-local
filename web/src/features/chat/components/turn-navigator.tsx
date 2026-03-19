import { memo } from "react";
import type { LiveMessage } from "@/hooks/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";
import { useBookmarkStore } from "../bookmark-store";

export type TurnNavigatorProps = {
  messages: LiveMessage[];
  visible: boolean;
  onNavigateToTurn: (messageIndex: number) => void;
  bookmarkedTurns?: Set<number>;
  onToggleBookmark?: (turnIndex: number) => void;
};

/**
 * Extract unique turns from messages.
 * Each turn starts with a user message.
 * Returns array of { turnIndex, messageIndex, content } for user messages.
 */
function extractTurns(messages: LiveMessage[]) {
  const turns: Array<{
    turnIndex: number;
    messageIndex: number;
    content: string;
  }> = [];

  messages.forEach((message, index) => {
    if (message.role === "user") {
      turns.push({
        turnIndex: message.turnIndex !== undefined ? message.turnIndex : turns.length,
        messageIndex: index,
        content: message.content ?? "",
      });
    }
  });

  return turns;
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}

export const TurnNavigator = memo(function TurnNavigator({
  messages,
  visible,
  onNavigateToTurn,
  bookmarkedTurns: propBookmarkedTurns,
  onToggleBookmark,
}: TurnNavigatorProps) {
  const turns = extractTurns(messages);

  // Use store if props not provided
  const storeBookmarkedTurns = useBookmarkStore((s) => s.bookmarkedTurns);
  const storeToggleBookmark = useBookmarkStore((s) => s.toggleBookmark);

  const bookmarkedTurns = propBookmarkedTurns ?? storeBookmarkedTurns;
  const toggleBookmark = onToggleBookmark ?? storeToggleBookmark;

  // Don't render if there are fewer than 2 turns
  if (turns.length < 2) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-10 h-full py-4",
        "flex flex-col items-center justify-center",
        "transition-all duration-200",
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      role="navigation"
      aria-label="Conversation turns"
    >
      <div className={cn(
        "flex flex-col items-center gap-1 rounded-l-md px-1 py-2",
        "transition-all duration-200",
        "overflow-y-auto max-h-full scroll-y",
        visible ? "bg-muted/50 backdrop-blur-sm" : "bg-transparent"
      )}>
        {turns.map((turn) => {
          const isBookmarked = bookmarkedTurns.has(turn.turnIndex);
          return (
            <Tooltip key={turn.turnIndex}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onNavigateToTurn(turn.messageIndex)}
                  className={cn(
                    "size-2 rounded-full cursor-pointer shrink-0 transition-all",
                    isBookmarked
                      ? "bg-amber-400 hover:bg-amber-500"
                      : "bg-muted-foreground/40 hover:bg-foreground hover:size-3"
                  )}
                  aria-label={`Go to turn ${turn.turnIndex + 1}${isBookmarked ? " (bookmarked)" : ""}`}
                />
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="max-w-[280px] p-2"
              >
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-sm leading-relaxed">{truncateText(turn.content, 100)}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleBookmark(turn.turnIndex);
                    }}
                    className={cn(
                      "shrink-0 transition-colors",
                      isBookmarked
                        ? "text-amber-400 hover:text-amber-500"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                  >
                    <StarIcon className={cn("w-4 h-4", isBookmarked && "fill-current")} />
                  </button>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
});
