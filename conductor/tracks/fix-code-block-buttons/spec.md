# Specification: Fix CodeBlock Download and Copy buttons

## Problem Description
User `elaine20250101` reported in GitHub Issue #6 that "download and copy button not functioning" in the Web UI. Clicking them results in nothing happening.

## Affected Component
`web/src/components/ai-elements/code-block.tsx`

## Root Cause Analysis
The `CodeBlockCopyButton`, `CodeBlockDownloadButton`, and `CodeBlockPreviewButton` components in `code-block.tsx` all have a similar bug:
They define an `onClick` handler but then spread `{...props}` AFTER it. Since `props` (passed from the `CodeBlock` component) may include an `onClick` (from `TooltipTrigger` when `asChild` is used, or other sources), the custom `onClick` that implements the functionality is being overridden by an empty or different `onClick` from the spread props.

Example from `CodeBlockCopyButton`:
```tsx
  return (
    <Button
      ref={ref}
      className={cn("shrink-0", className)}
      onClick={copyToClipboard} // <--- Defined here
      size="icon-xs"
      variant="ghost"
      {...props} // <--- Overridden here if props contains onClick
    >
      {children ?? <Icon className="size-3.5" />}
    </Button>
  );
```

## Proposed Solution
Move `onClick={...}` after `{...props}` or manually merge the `onClick` handlers. Since `Button` (from Shadcn/UI) and `TooltipTrigger` often interact, placing the specific handler last ensures it is the one executed, or better, we should merge them if both exist.

In this specific codebase, `TooltipTrigger asChild` passes its own event handlers (including `onClick`) to the child. If we override it, the tooltip might not work as expected, but more importantly, if we don't handle it, our logic doesn't run.

Correct pattern:
```tsx
    <Button
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        specificHandler(e);
      }}
      ...
    />
```

## Success Criteria
- Copy button successfully copies code to clipboard.
- Download button successfully triggers a file download.
- Preview button (for HTML) successfully opens a new tab.
- Tooltips for these buttons continue to work.
