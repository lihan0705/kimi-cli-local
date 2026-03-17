# Multi OpenAI Legacy URLs Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Support multiple OpenAI Legacy URL configurations with custom names, allowing users to manage and switch between different LLM API endpoints.

**Architecture:** Modify the provider key format to include user-defined names (`managed:openai-legacy:<name>`), add URL management UI in the `/login` flow, and update model selection to display URL names instead of generic "OpenAI Legacy".

**Tech Stack:** Python 3.12+, pytest, pydantic, prompt_toolkit

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/kimi_cli/auth/platforms.py` | Helper functions for listing/parsing OpenAI Legacy providers |
| `src/kimi_cli/ui/shell/setup.py` | URL management UI (add/delete/list) |
| `src/kimi_cli/ui/shell/slash.py` | Model selection display (show URL name) |
| `tests/ui/shell/test_setup.py` | Unit tests for new functionality |

---

## Task 1: Add Helper Functions in platforms.py

**Files:**
- Modify: `src/kimi_cli/auth/platforms.py`
- Test: `tests/auth/test_platforms.py`

- [ ] **Step 1: Write the failing tests for helper functions**

Create `tests/auth/test_platforms.py` (or add to existing file):

```python
"""Tests for OpenAI Legacy multi-URL helper functions."""

from kimi_cli.auth.platforms import (
    list_openai_legacy_providers,
    parse_openai_legacy_name,
    make_openai_legacy_provider_key,
)
from kimi_cli.config import Config, LLMProvider, LLMModel
from pydantic import SecretStr


def test_parse_openai_legacy_name_valid():
    """Test parsing a valid OpenAI Legacy provider key."""
    assert parse_openai_legacy_name("managed:openai-legacy:my-openai") == "my-openai"
    assert parse_openai_legacy_name("managed:openai-legacy:deepseek") == "deepseek"


def test_parse_openai_legacy_name_invalid():
    """Test parsing invalid provider keys."""
    assert parse_openai_legacy_name("managed:kimi-code") is None
    assert parse_openai_legacy_name("managed:openai-legacy") is None
    assert parse_openai_legacy_name("other:provider") is None


def test_make_openai_legacy_provider_key():
    """Test creating provider keys."""
    assert make_openai_legacy_provider_key("my-openai") == "managed:openai-legacy:my-openai"
    assert make_openai_legacy_provider_key("deepseek") == "managed:openai-legacy:deepseek"


def test_list_openai_legacy_providers_empty():
    """Test listing when no OpenAI Legacy providers exist."""
    config = Config()
    result = list_openai_legacy_providers(config)
    assert result == []


def test_list_openai_legacy_providers_multiple():
    """Test listing multiple OpenAI Legacy providers."""
    config = Config()
    config.providers["managed:openai-legacy:my-openai"] = LLMProvider(
        type="openai_legacy",
        base_url="https://api.openai.com/v1",
        api_key=SecretStr("sk-test"),
    )
    config.providers["managed:openai-legacy:deepseek"] = LLMProvider(
        type="openai_legacy",
        base_url="https://api.deepseek.com/v1",
        api_key=SecretStr("sk-test2"),
    )
    config.providers["managed:kimi-code"] = LLMProvider(
        type="kimi",
        base_url="https://api.kimi.com/v1",
        api_key=SecretStr("sk-test3"),
    )

    result = list_openai_legacy_providers(config)
    names = [name for name, _ in result]
    assert len(names) == 2
    assert "my-openai" in names
    assert "deepseek" in names
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `uv run pytest tests/auth/test_platforms.py -v`
Expected: FAIL with "cannot import name" errors

- [ ] **Step 3: Implement helper functions in platforms.py**

Add to `src/kimi_cli/auth/platforms.py`:

```python
# OpenAI Legacy multi-URL support

OPENAI_LEGACY_PREFIX = "openai-legacy"


def is_openai_legacy_provider(provider_key: str) -> bool:
    """Check if a provider key is an OpenAI Legacy provider."""
    parsed = parse_managed_provider_key(provider_key)
    if not parsed:
        return False
    # Check for both old format (openai-legacy) and new format (openai-legacy:<name>)
    if parsed == OPENAI_LEGACY_PREFIX:
        return True
    return parsed.startswith(f"{OPENAI_LEGACY_PREFIX}:")


def parse_openai_legacy_name(provider_key: str) -> str | None:
    """Extract the user-defined name from an OpenAI Legacy provider key.

    Args:
        provider_key: Provider key like "managed:openai-legacy:my-openai"

    Returns:
        The user-defined name (e.g., "my-openai") or None if not an OpenAI Legacy provider.
    """
    parsed = parse_managed_provider_key(provider_key)
    if not parsed:
        return None
    if not parsed.startswith(f"{OPENAI_LEGACY_PREFIX}:"):
        return None
    return parsed.removeprefix(f"{OPENAI_LEGACY_PREFIX}:")


def make_openai_legacy_provider_key(name: str) -> str:
    """Create an OpenAI Legacy provider key from a user-defined name.

    Args:
        name: User-defined name for the URL configuration

    Returns:
        Provider key like "managed:openai-legacy:my-openai"
    """
    return f"{MANAGED_PROVIDER_PREFIX}{OPENAI_LEGACY_PREFIX}:{name}"


def list_openai_legacy_providers(config: Config) -> list[tuple[str, LLMProvider]]:
    """List all OpenAI Legacy providers with their user-defined names.

    Args:
        config: Current configuration

    Returns:
        List of (name, provider) tuples, sorted by name
    """
    result: list[tuple[str, LLMProvider]] = []
    for key, provider in config.providers.items():
        name = parse_openai_legacy_name(key)
        if name:
            result.append((name, provider))
    return sorted(result, key=lambda x: x[0])
```

Add import at top of file:
```python
from kimi_cli.config import Config, LLMProvider
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `uv run pytest tests/auth/test_platforms.py -v`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/kimi_cli/auth/platforms.py tests/auth/test_platforms.py
git commit -m "feat(platforms): add OpenAI Legacy multi-URL helper functions"
```

---

## Task 2: Add URL Management UI in setup.py

**Files:**
- Modify: `src/kimi_cli/ui/shell/setup.py`
- Create: `tests/ui/shell/test_setup.py`

- [ ] **Step 1: Write failing tests for URL management**

Create `tests/ui/shell/test_setup.py`:

```python
"""Tests for OpenAI Legacy URL management in setup.py."""

import pytest
from pathlib import Path
from unittest.mock import AsyncMock, patch, MagicMock

from kimi_cli.config import Config, LLMProvider, LLMModel
from kimi_cli.auth.platforms import (
    list_openai_legacy_providers,
    make_openai_legacy_provider_key,
)
from pydantic import SecretStr


class TestOpenAISetupResult:
    """Tests for the _OpenAISetupResult NamedTuple."""

    def test_setup_result_fields(self):
        """Verify _OpenAISetupResult has required fields."""
        from kimi_cli.ui.shell.setup import _OpenAISetupResult

        result = _OpenAISetupResult(
            name="my-openai",
            api_key=SecretStr("sk-test"),
            base_url="https://api.openai.com/v1",
            selected_model_id="gpt-4",
            thinking=True,
        )
        assert result.name == "my-openai"
        assert result.base_url == "https://api.openai.com/v1"


class TestApplyOpenAISetup:
    """Tests for _apply_openai_setup function."""

    def test_apply_openai_setup_creates_provider_and_models(self, tmp_path: Path, monkeypatch):
        """Test that applying setup creates provider and model entries."""
        from kimi_cli.ui.shell.setup import _apply_openai_setup
        from kimi_cli.auth.platforms import ModelInfo

        # Create a minimal config
        config = Config()

        # Mock load_config and save_config
        with patch("kimi_cli.ui.shell.setup.load_config", return_value=config), \
             patch("kimi_cli.ui.shell.setup.save_config") as mock_save:

            models = [
                ModelInfo(id="gpt-4", context_length=128000, supports_reasoning=False,
                         supports_image_in=False, supports_video_in=False),
                ModelInfo(id="gpt-3.5-turbo", context_length=16000, supports_reasoning=False,
                         supports_image_in=False, supports_video_in=False),
            ]

            _apply_openai_setup(
                name="my-openai",
                base_url="https://api.openai.com/v1",
                api_key=SecretStr("sk-test"),
                models=models,
                selected_model_id="gpt-4",
                thinking=True,
            )

            # Verify provider was created
            provider_key = make_openai_legacy_provider_key("my-openai")
            assert provider_key in config.providers
            assert config.providers[provider_key].base_url == "https://api.openai.com/v1"

            # Verify models were created
            assert "openai-legacy:my-openai/gpt-4" in config.models
            assert "openai-legacy:my-openai/gpt-3.5-turbo" in config.models

            # Verify default model was set
            assert config.default_model == "openai-legacy:my-openai/gpt-4"
            assert config.default_thinking is True

            mock_save.assert_called_once()


class TestDeleteOpenAIProvider:
    """Tests for _delete_openai_provider function."""

    def test_delete_openai_provider_removes_all(self, tmp_path: Path):
        """Test that deleting a provider removes provider and all associated models."""
        from kimi_cli.ui.shell.setup import _delete_openai_provider

        config = Config()
        provider_key = make_openai_legacy_provider_key("my-openai")
        config.providers[provider_key] = LLMProvider(
            type="openai_legacy",
            base_url="https://api.openai.com/v1",
            api_key=SecretStr("sk-test"),
        )
        config.models["openai-legacy:my-openai/gpt-4"] = LLMModel(
            provider=provider_key,
            model="gpt-4",
            max_context_size=128000,
        )
        config.models["openai-legacy:my-openai/gpt-3.5"] = LLMModel(
            provider=provider_key,
            model="gpt-3.5-turbo",
            max_context_size=16000,
        )
        # Add another provider's model to verify it's not deleted
        config.models["other/model"] = LLMModel(
            provider="other",
            model="model",
            max_context_size=8000,
        )

        with patch("kimi_cli.ui.shell.setup.load_config", return_value=config), \
             patch("kimi_cli.ui.shell.setup.save_config") as mock_save:

            _delete_openai_provider("my-openai")

            # Verify provider was deleted
            assert provider_key not in config.providers

            # Verify associated models were deleted
            assert "openai-legacy:my-openai/gpt-4" not in config.models
            assert "openai-legacy:my-openai/gpt-3.5" not in config.models

            # Verify other models remain
            assert "other/model" in config.models

            mock_save.assert_called_once()
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `uv run pytest tests/ui/shell/test_setup.py -v`
Expected: FAIL with import errors

- [ ] **Step 3: Implement URL management functions in setup.py**

Add to `src/kimi_cli/ui/shell/setup.py`:

```python
from typing import NamedTuple

from kimi_cli.auth.platforms import (
    OPENAI_LEGACY_PREFIX,
    Platform,
    is_openai_legacy_provider,
    list_openai_legacy_providers,
    make_openai_legacy_provider_key,
    parse_openai_legacy_name,
)


class _OpenAISetupResult(NamedTuple):
    """Result of setting up an OpenAI Legacy URL."""
    name: str
    api_key: SecretStr
    base_url: str
    selected_model_id: str
    thinking: bool


async def _setup_openai_legacy_platform() -> _OpenAISetupResult | None:
    """Interactive setup flow for adding a new OpenAI Legacy URL.

    Returns:
        _OpenAISetupResult if successful, None if cancelled.
    """
    # Prompt for configuration name
    name = await _prompt_text("Enter a name for this URL configuration (e.g., my-openai, deepseek)")
    if not name:
        return None

    # Validate name doesn't contain special characters
    if "/" in name or ":" in name:
        console.print("[red]Name cannot contain '/' or ':' characters[/red]")
        return None

    # Check for duplicate names
    config = load_config()
    existing_names = [n for n, _ in list_openai_legacy_providers(config)]
    if name in existing_names:
        console.print(f"[red]A configuration named '{name}' already exists[/red]")
        return None

    # Prompt for base URL
    base_url = await _prompt_text("Enter the API base URL (e.g., https://api.openai.com/v1)")
    if not base_url:
        return None

    # Prompt for API key
    api_key = await _prompt_text("Enter your API key", is_password=True)
    if not api_key:
        return None

    # Create a temporary platform to fetch models
    temp_platform = Platform(
        id=OPENAI_LEGACY_PREFIX,
        name="OpenAI Legacy",
        base_url=base_url,
        provider_type="openai_legacy",
    )

    # List models
    try:
        models = await list_models(temp_platform, api_key)
    except Exception as e:
        logger.error("Failed to get models: {error}", error=e)
        console.print(f"[red]Failed to get models: {e}[/red]")
        return None

    if not models:
        console.print("[red]No models available from this URL[/red]")
        return None

    # Select model
    model_map = {model.id: model for model in models}
    model_id = await _prompt_choice(
        header="Select a default model (↑↓ navigate, Enter select, Ctrl+C cancel):",
        choices=list(model_map),
    )
    if not model_id:
        return None

    selected_model = model_map[model_id]

    # Determine thinking mode
    capabilities = selected_model.capabilities
    thinking: bool

    if "always_thinking" in capabilities:
        thinking = True
    elif "thinking" in capabilities:
        thinking_selection = await _prompt_choice(
            header="Enable thinking mode? (↑↓ navigate, Enter select, Ctrl+C cancel):",
            choices=["off", "on"],
        )
        if not thinking_selection:
            return None
        thinking = thinking_selection == "on"
    else:
        thinking = False

    return _OpenAISetupResult(
        name=name,
        api_key=SecretStr(api_key),
        base_url=base_url,
        selected_model_id=model_id,
        thinking=thinking,
    )


def _apply_openai_setup(
    name: str,
    base_url: str,
    api_key: SecretStr,
    models: list,
    selected_model_id: str,
    thinking: bool,
) -> None:
    """Apply OpenAI Legacy setup to configuration."""
    config = load_config()

    # Create provider
    provider_key = make_openai_legacy_provider_key(name)
    config.providers[provider_key] = LLMProvider(
        type="openai_legacy",
        base_url=base_url,
        api_key=api_key,
    )

    # Create model entries
    model_prefix = f"openai-legacy:{name}"
    for model_info in models:
        model_key = f"{model_prefix}/{model_info.id}"
        capabilities = model_info.capabilities or None
        max_context_size = model_info.context_length if model_info.context_length > 0 else 128000
        config.models[model_key] = LLMModel(
            provider=provider_key,
            model=model_info.id,
            max_context_size=max_context_size,
            capabilities=capabilities,
        )

    # Set default model
    config.default_model = f"{model_prefix}/{selected_model_id}"
    config.default_thinking = thinking

    save_config(config)


def _delete_openai_provider(name: str) -> None:
    """Delete an OpenAI Legacy provider and all associated models."""
    config = load_config()
    provider_key = make_openai_legacy_provider_key(name)

    # Remove provider
    if provider_key in config.providers:
        del config.providers[provider_key]

    # Remove all models for this provider
    model_prefix = f"openai-legacy:{name}/"
    keys_to_delete = [k for k in config.models if k.startswith(model_prefix)]
    for key in keys_to_delete:
        del config.models[key]

    # If the default model was from this provider, clear it
    if config.default_model and config.default_model.startswith(model_prefix):
        # Find a new default model
        if config.models:
            config.default_model = next(iter(config.models))
        else:
            config.default_model = ""

    save_config(config)
```

- [ ] **Step 4: Modify _setup_platform to handle OpenAI Legacy differently**

Modify `_setup_platform` function in `setup.py` to check for OpenAI Legacy and call the management flow:

```python
async def _setup_platform(platform: Platform) -> _SetupResult | None:
    # Special handling for OpenAI Legacy - show URL management
    if platform.id == OPENAI_LEGACY_PREFIX:
        result = await _manage_openai_legacy_urls()
        return None  # URL management handles its own config saving

    # ... rest of existing function unchanged ...
```

Add the URL management function:

```python
async def _manage_openai_legacy_urls() -> None:
    """Manage OpenAI Legacy URLs - list, add, or delete."""
    config = load_config()
    existing = list_openai_legacy_providers(config)

    choices: list[str] = []

    # Show existing URLs
    if existing:
        console.print("\n[bold]Existing OpenAI Legacy configurations:[/bold]")
        for name, provider in existing:
            console.print(f"  • {name}: {provider.base_url}")
        console.print()
        choices.append("Add new URL")
        choices.append("Delete existing URL")
    else:
        console.print("\n[yellow]No OpenAI Legacy configurations found.[/yellow]")
        choices.append("Add new URL")

    action = await _prompt_choice(
        header="Select an action:",
        choices=choices,
    )
    if not action:
        return

    if action == "Add new URL":
        result = await _setup_openai_legacy_platform()
        if result:
            # Fetch models again for saving
            temp_platform = Platform(
                id=OPENAI_LEGACY_PREFIX,
                name="OpenAI Legacy",
                base_url=result.base_url,
                provider_type="openai_legacy",
            )
            try:
                models = await list_models(temp_platform, result.api_key.get_secret_value())
            except Exception:
                models = []

            _apply_openai_setup(
                name=result.name,
                base_url=result.base_url,
                api_key=result.api_key,
                models=models,
                selected_model_id=result.selected_model_id,
                thinking=result.thinking,
            )
            console.print(f"[green]✓[/green] Added configuration '{result.name}'")

    elif action == "Delete existing URL":
        if not existing:
            console.print("[yellow]No configurations to delete[/yellow]")
            return

        names = [name for name, _ in existing]
        name_to_delete = await _prompt_choice(
            header="Select configuration to delete:",
            choices=names,
        )
        if not name_to_delete:
            return

        confirm = await _prompt_choice(
            header=f"Delete '{name_to_delete}'? This cannot be undone.",
            choices=["No, cancel", "Yes, delete"],
        )
        if confirm == "Yes, delete":
            _delete_openai_provider(name_to_delete)
            console.print(f"[green]✓[/green] Deleted configuration '{name_to_delete}'")
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `uv run pytest tests/ui/shell/test_setup.py -v`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/kimi_cli/ui/shell/setup.py tests/ui/shell/test_setup.py
git commit -m "feat(setup): add OpenAI Legacy multi-URL management UI"
```

---

## Task 3: Update Model Selection Display

**Files:**
- Modify: `src/kimi_cli/ui/shell/slash.py`

- [ ] **Step 1: Write test for model display format**

Add to `tests/ui/shell/test_setup.py`:

```python
class TestModelSelectionDisplay:
    """Tests for model selection display format."""

    def test_get_provider_display_name_openai_legacy(self):
        """Test that OpenAI Legacy shows custom name."""
        from kimi_cli.ui.shell.slash import _get_provider_display_name

        # OpenAI Legacy with custom name
        assert _get_provider_display_name("managed:openai-legacy:my-openai") == "my-openai"
        assert _get_provider_display_name("managed:openai-legacy:deepseek") == "deepseek"

    def test_get_provider_display_name_other_platforms(self):
        """Test that other platforms show their normal names."""
        from kimi_cli.ui.shell.slash import _get_provider_display_name

        # Kimi Code
        assert _get_provider_display_name("managed:kimi-code") == "Kimi Code"

        # Unknown provider
        assert _get_provider_display_name("unknown:provider") == "unknown:provider"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/ui/shell/test_setup.py::TestModelSelectionDisplay -v`
Expected: FAIL with import error

- [ ] **Step 3: Implement display name function in slash.py**

Add to `src/kimi_cli/ui/shell/slash.py`:

```python
from kimi_cli.auth.platforms import (
    get_platform_name_for_provider,
    parse_openai_legacy_name,
)


def _get_provider_display_name(provider_key: str) -> str:
    """Get a display name for a provider.

    For OpenAI Legacy providers, shows the custom name.
    For other providers, shows the platform name.
    """
    # Check if this is an OpenAI Legacy provider with custom name
    custom_name = parse_openai_legacy_name(provider_key)
    if custom_name:
        return custom_name

    # Fall back to platform name
    platform_name = get_platform_name_for_provider(provider_key)
    if platform_name:
        return platform_name

    # Last resort: return the key itself
    return provider_key
```

- [ ] **Step 4: Update model command to use new display function**

In the `model` command function, change:

```python
# Before
provider_label = get_platform_name_for_provider(model_cfg.provider) or model_cfg.provider

# After
provider_label = _get_provider_display_name(model_cfg.provider)
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `uv run pytest tests/ui/shell/test_setup.py::TestModelSelectionDisplay -v`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/kimi_cli/ui/shell/slash.py tests/ui/shell/test_setup.py
git commit -m "feat(slash): show custom URL name in model selection"
```

---

## Task 4: Integration Testing

**Files:**
- Modify: `tests/ui/shell/test_setup.py`

- [ ] **Step 1: Write integration test for full flow**

Add to `tests/ui/shell/test_setup.py`:

```python
class TestOpenAISetupIntegration:
    """Integration tests for OpenAI Legacy multi-URL feature."""

    def test_add_multiple_urls_same_platform(self, tmp_path: Path):
        """Test that adding multiple URLs creates separate providers."""
        from kimi_cli.ui.shell.setup import _apply_openai_setup
        from kimi_cli.auth.platforms import ModelInfo

        config = Config()

        with patch("kimi_cli.ui.shell.setup.load_config", return_value=config), \
             patch("kimi_cli.ui.shell.setup.save_config"):

            # Add first URL
            models1 = [
                ModelInfo(id="gpt-4", context_length=128000, supports_reasoning=False,
                         supports_image_in=False, supports_video_in=False),
            ]
            _apply_openai_setup(
                name="openai",
                base_url="https://api.openai.com/v1",
                api_key=SecretStr("sk-openai"),
                models=models1,
                selected_model_id="gpt-4",
                thinking=False,
            )

            # Add second URL
            models2 = [
                ModelInfo(id="deepseek-chat", context_length=64000, supports_reasoning=False,
                         supports_image_in=False, supports_video_in=False),
            ]
            _apply_openai_setup(
                name="deepseek",
                base_url="https://api.deepseek.com/v1",
                api_key=SecretStr("sk-deepseek"),
                models=models2,
                selected_model_id="deepseek-chat",
                thinking=True,
            )

        # Verify both providers exist
        assert len(list_openai_legacy_providers(config)) == 2
        assert "managed:openai-legacy:openai" in config.providers
        assert "managed:openai-legacy:deepseek" in config.providers

        # Verify both model sets exist
        assert "openai-legacy:openai/gpt-4" in config.models
        assert "openai-legacy:deepseek/deepseek-chat" in config.models

    def test_backward_compatibility_with_old_provider_key(self):
        """Test that old 'managed:openai-legacy' key still works."""
        # The old format without custom name should still be recognized
        from kimi_cli.auth.platforms import is_openai_legacy_provider

        assert is_openai_legacy_provider("managed:openai-legacy") is True
        assert is_openai_legacy_provider("managed:openai-legacy:custom-name") is True
```

- [ ] **Step 2: Run integration tests**

Run: `uv run pytest tests/ui/shell/test_setup.py::TestOpenAISetupIntegration -v`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add tests/ui/shell/test_setup.py
git commit -m "test(setup): add integration tests for multi-URL feature"
```

---

## Task 5: Final Verification and Cleanup

- [ ] **Step 1: Run all tests**

Run: `uv run pytest tests/ -v --tb=short`
Expected: All tests PASS

- [ ] **Step 2: Run linting and type checks**

Run: `make check`
Expected: No errors

- [ ] **Step 3: Manual testing**

1. Run `/login` and select "OpenAI Legacy (Custom URL)"
2. Verify it shows URL management menu
3. Add a new URL configuration
4. Run `/model` and verify it shows the custom name
5. Add another URL configuration
6. Verify both appear in model selection
7. Test deleting a URL configuration

- [ ] **Step 4: Push changes**

```bash
git push
```

---

## Summary

This implementation adds:

1. **Helper functions** in `platforms.py` for managing OpenAI Legacy provider keys
2. **URL management UI** in `setup.py` with add/delete/list functionality
3. **Updated model selection** in `slash.py` to show custom URL names
4. **Comprehensive tests** for all new functionality

The feature maintains backward compatibility with existing `managed:openai-legacy` provider keys while supporting the new `managed:openai-legacy:<name>` format.
