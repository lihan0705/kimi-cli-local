#!/usr/bin/env bash
set -euo pipefail

# Kimi Code CLI - One-click Installer/Builder
# This script installs uv, builds the project (including Web UI), and installs it as a tool.

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

install_uv() {
  info "Installing uv..."
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL https://astral.sh/uv/install.sh | sh
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- https://astral.sh/uv/install.sh | sh
  else
    error "curl or wget is required to install uv."
    exit 1
  fi
}

# 1. Ensure uv is installed
if ! command -v uv >/dev/null 2>&1; then
  install_uv
  # Source cargo env if it was just installed (uv often installs to ~/.local/bin or similar)
  export PATH="$HOME/.local/bin:$PATH"
fi

UV_BIN=$(command -v uv)
info "Using uv at: $UV_BIN"

# 2. Check if we are in the source repository
if [ -f "pyproject.toml" ] && [ -d "src/kimi_cli" ]; then
  info "Detected local source repository. Starting local build and install..."
  
  # Ensure Node.js is present for web build
  if ! command -v npm >/dev/null 2>&1; then
    error "Node.js (npm) is required to build the Web UI. Please install it first."
    exit 1
  fi

  info "Step 1: Syncing dependencies..."
  "$UV_BIN" sync

  info "Step 2: Building Web UI (this may take a minute)..."
  "$UV_BIN" run scripts/build_web.py

  info "Step 3: Installing as a global tool (editable mode)..."
  "$UV_BIN" tool install --editable . \
    --with-editable packages/kosong \
    --with-editable packages/kaos --force

  success "Kimi Code CLI installed successfully from source!"
  info "You can now run 'kimi' or 'kimi-cli' from anywhere."
else
  # 3. Fallback to remote installation if not in source repo
  info "Not in a source repository. Installing 'kimi-cli' from PyPI..."
  "$UV_BIN" tool install kimi-cli --force
  success "Kimi Code CLI installed successfully from PyPI!"
fi
