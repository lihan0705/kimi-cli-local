# Multi OpenAI Legacy URL Management (Web UI)

**ID:** `web-manage-openai-legacy-urls`
**Status:** In Progress
**Track Directory:** `conductor/tracks/web-manage-openai-legacy-urls`

## Overview

Implement a user interface in the web client to manage multiple OpenAI Legacy (custom URL) providers. This complements the CLI `/login` flow, allowing users to add, list, and delete custom API endpoints directly from the browser.

## Specification

### 1. Backend (FastAPI)

#### Data Models
- `OpenAILegacyProvider`: `name`, `base_url`, `api_key` (write-only/脱敏).
- `AddOpenAILegacyRequest`: `name`, `base_url`, `api_key`.

#### API Endpoints
- `GET /api/config/providers/openai-legacy`: List all providers with `managed:openai-legacy:` prefix.
- `POST /api/config/providers/openai-legacy`: 
    1. Add/Update provider in `config.toml`.
    2. Trigger model refresh for this provider.
    3. Return updated config.
- `DELETE /api/config/providers/openai-legacy/{name}`:
    1. Remove provider and associated models.
    2. Return updated config.

### 2. Frontend (React + shadcn/ui)

#### Components
- `OpenAILegacyManagerDialog`: A monochrome dialog for listing and adding URLs.
- `GlobalConfigControls`: Add entry point to `ModelSelectorContent`.

#### Design Guidelines
- Strictly monochrome (Black/White/Gray).
- Use `shadcn/ui` components (Dialog, Input, Button, ScrollArea).
- Responsive and clean typography.

## Tasks

- [x] [Backend] Implement helper functions in `src/kimi_cli/auth/platforms.py` <!-- id: 0 -->
- [x] [Backend] Add API endpoints in `src/kimi_cli/web/api/config.py` <!-- id: 1 -->
- [x] [Frontend] Define API models and hooks for provider management <!-- id: 2 -->
- [x] [Frontend] Create `OpenAILegacyManagerDialog` component <!-- id: 3 -->
- [x] [Frontend] Integrate dialog into `GlobalConfigControls` <!-- id: 4 -->
- [x] [Verification] Run web build to ensure no TypeScript/Vite errors <!-- id: 6 -->
- [x] [Verification] Test add/delete flow and verify model list auto-refresh <!-- id: 5 -->
