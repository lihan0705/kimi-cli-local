# Conversation Turn Navigator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a semi-transparent vertical navigator bar on the right side of the chat area to help users quickly navigate to specific conversation turns.

**Architecture:** Create a new React component that overlays on the chat area, tracks turns from existing LiveMessage.turnIndex, and provides hover preview + click navigation.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui Tooltip

---

### Task 1: Create Turn Navigator Component

**Files:**
- Create: `web/src/features/chat/components/turn-navigator.tsx`
- Test: Manual testing in browser

**Step 1: Create the base component file**

```tsx
import { useCallback, useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { LiveMessage } from "@/hooks/types";
import { cn } from "@/lib/utils";

export type TurnNavigatorProps = {
  messages: LiveMessage[];
  visible: boolean;
  onNavigateToTurn: (turnIndex: number) => void;
};

/**
 * Extract unique turns from messages.
 * Each turn starts with a user message.
 */
function extractTurns(messages: LiveMessage[]): Array<{
  turnIndex: number;
  userMessage: string;
  messageIndex: number;
}> {
  const turns: Array<{
    turnIndex: number;
    userMessage: string;
    messageIndex: number;
  }> = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "user" && msg.turnIndex !== undefined) {
      turns.push({
        turnIndex: msg.turnIndex,
        userMessage: msg.content.slice(0, 100) + (msg.content.length > 100 ? "..." : ""),
        messageIndex: i,
      });
    }
  }

  return turns;
}

export function TurnNavigator({
  messages,
  visible,
  onNavigateToTurn,
}: TurnNavigatorProps) {
  const turns = useMemo(() => extractTurns(messages), [messages]);

  if (!visible || turns.length <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-0 bottom-0 w-8 z-50",
        "flex flex-col items-center justify-center gap-1 py-4",
        "bg-background/30 backdrop-blur-sm",
        "pointer-events-auto"
      )}
    >
      <div className="flex flex-col gap-1">
        {turns.map((turn, index) => (
          <Tooltip key={turn.turnIndex} delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onNavigateToTurn(turn.messageIndex)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-150",
                  "bg-muted-foreground/50 hover:bg-primary hover:scale-150",
                  "cursor-pointer"
                )}
                aria-label={`Jump to turn ${turn.turnIndex + 1}`}
              />
            </TooltipTrigger>
            <TooltipContent
              side="left"
              sideOffset={8}
              className="max-w-xs text-xs"
            >
              <p className="line-clamp-3">{turn.userMessage}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add web/src/features/chat/components/turn-navigator.tsx
git commit -m "feat(web): add TurnNavigator component for conversation navigation"
```

---

### Task 2: Integrate Turn Navigator into Chat Workspace

**Files:**
- Modify: `web/src/features/chat/components/chat-conversation.tsx`
- Modify: `web/src/features/chat/chat-workspace-container.tsx`

**Step 1: Update ChatConversation props and component**

In `web/src/features/chat/components/chat-conversation.tsx`, add import and modify:

```tsx
// Add import at top
import { TurnNavigator } from "./turn-navigator";

// Add to ChatConversationProps type
type ChatConversationProps = {
  // ... existing props
  onNavigateToTurn: (messageIndex: number) => void;
};

// In the component, add before the closing </div>:
{hasMessages && (
  <TurnNavigator
    messages={messages}
    visible={true}
    onNavigateToTurn={onNavigateToTurn}
  />
)}
```

**Step 2: Update chat-workspace-container to pass navigation handler**

In `web/src/features/chat/chat-workspace-container.tsx`, find where `ChatConversation` is rendered and ensure `onNavigateToTurn` prop is passed using the existing `handleJumpToMessage` pattern.

**Step 3: Commit**

```bash
git add web/src/features/chat/components/chat-conversation.tsx web/src/features/chat/chat-workspace-container.tsx
git commit -m "feat(web): integrate TurnNavigator into ChatConversation"
```

---

### Task 3: Add Visibility Toggle (Optional Enhancement)

**Files:**
- Modify: `web/src/features/chat/components/turn-navigator.tsx`

**Step 1: Add hover-to-show behavior**

Update the component to only show the full navigator on hover:

```tsx
// Add useState for hover
const [isHovered, setIsHovered] = useState(false);

// Update container classes
<div
  className={cn(
    "fixed right-0 top-0 bottom-0 w-8 z-50",
    "flex flex-col items-center justify-center gap-1 py-4",
    "transition-opacity duration-200",
    isHovered ? "bg-background/30 backdrop-blur-sm opacity-100" : "opacity-30",
    "pointer-events-auto"
  )}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
```

**Step 2: Commit**

```bash
git add web/src/features/chat/components/turn-navigator.tsx
git commit -m "feat(web): add hover behavior to TurnNavigator"
```

---

### Task 4: Add CSS Styles

**Files:**
- Modify: `web/src/index.css`

**Step 1: Add CSS variables for turn navigator (optional)**

```css
/* Turn Navigator */
.turn-navigator {
  --turn-navigator-width: 2rem;
}
```

**Step 2: Commit**

```bash
git add web/src/index.css
git commit -m "feat(web): add CSS for TurnNavigator"
```

---

### Task 5: Test and Verify

**Step 1: Start the dev server**

```bash
cd web && pnpm dev
```

**Step 2: Manual testing checklist**

1. Create a new session
2. Send multiple messages (3+ turns)
3. Verify:
   - [ ] Navigator appears on the right side
   - [ ] Hover shows tooltip with user message
   - [ ] Click navigates to the correct message
   - [ ] Navigator is semi-transparent
   - [ ] Doesn't interfere with chat scrolling

**Step 3: Build for production**

```bash
cd web && pnpm build
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(web): add conversation turn navigator with hover preview and click navigation"
```

---

## Summary

The implementation adds a `TurnNavigator` component that:

1. **Extracts turns** from `LiveMessage[]` by finding user messages with `turnIndex`
2. **Renders** as a semi-transparent vertical bar on the right edge
3. **Shows tooltips** on hover with truncated user message text
4. **Navigates** to the message on click using existing scroll infrastructure

The feature leverages existing data (`turnIndex` already exists in `LiveMessage`) and existing infrastructure (`handleJumpToMessage`, `Tooltip` component).
