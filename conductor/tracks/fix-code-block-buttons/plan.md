# Implementation Plan: Fix CodeBlock Download and Copy buttons

## Steps

1. **Modify `CodeBlockCopyButton` in `web/src/components/ai-elements/code-block.tsx`**:
   Update `onClick` to merge the local `copyToClipboard` with `props.onClick`. Ensure `...props` is spread BEFORE the explicit `onClick` handler.

2. **Modify `CodeBlockDownloadButton` in `web/src/components/ai-elements/code-block.tsx`**:
   Update `onClick` to merge the local `handleDownload` with `props.onClick`. Ensure `...props` is spread BEFORE the explicit `onClick` handler.

3. **Modify `CodeBlockPreviewButton` in `web/src/components/ai-elements/code-block.tsx`**:
   Update `onClick` to merge the local `handlePreview` with `props.onClick`. Ensure `...props` is spread BEFORE the explicit `onClick` handler.

4. **Verification**:
   - Perform manual verification (simulated or via description of how tests would run).
   - Check if the project has any existing Playwright or Jest tests that can be updated or added.

## Verification Details
Since this is a Web UI bug, the most reliable verification is a Playwright test. I'll check if there's an existing test suite for the Web UI.
