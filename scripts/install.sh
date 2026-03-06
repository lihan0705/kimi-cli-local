#!/usr/bin/env bash
set -euo pipefail

# Kimi Code CLI - One-click Installer/Builder
# This script installs uv, clones the repo (if needed), builds, and installs the tool.

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

REPO_URL="https://github.com/lihan0705/kimi-cli-local.git"
INSTALL_DIR="$HOME/.kimi-code-cli-src"

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
  export PATH="$HOME/.local/bin:$PATH"
fi

UV_BIN=$(command -v uv)
info "Using uv at: $UV_BIN"

# 2. Decide if we need to clone or use current directory
if [ -f "pyproject.toml" ] && [ -d "src/kimi_cli" ]; then
  info "Detected local source repository. Building from current directory..."
  BUILD_DIR="."
else
  info "Not in a source repository. Cloning to $INSTALL_DIR..."
  if [ -d "$INSTALL_DIR" ]; then
    info "Updating existing repository in $INSTALL_DIR..."
    cd "$INSTALL_DIR" && git pull
  else
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
  fi
  BUILD_DIR="."
fi

# 3. Build and Install
info "Starting build and installation process..."

# Check dependencies
if ! command -v npm >/dev/null 2>&1; then
  error "Node.js (npm) is required to build the Web UI. Please install it first."
  exit 1
fi

info "Step 1: Syncing dependencies..."
"$UV_BIN" sync

info "Step 2: Building Web UI (this may take a minute)..."
"$UV_BIN" run scripts/build_web.py

info "Step 3: Installing as a global tool..."
"$UV_BIN" tool install --editable . \
  --with-editable packages/kosong \
  --with-editable packages/kaos --force

success "Kimi Code CLI installed successfully!"
info "You can now run 'kimi' or 'kimi-cli' from anywhere."
