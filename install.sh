#!/usr/bin/env bash
# J.A.R.V.I.S. — installer for macOS and Linux.
#   bash install.sh
# Installs what is missing (Git, Node.js 20+, FFmpeg, Claude Code), the
# project's packages, then runs the setup wizard. Windows: use install.cmd.
set -euo pipefail

say()  { printf '  %s\n' "$*"; }
ok()   { printf '  \033[32m[ok]\033[0m %s\n' "$*"; }
step() { printf '\n\033[36m== %s\033[0m\n' "$*"; }
warn() { printf '  \033[33m[!]\033[0m %s\n' "$*"; }
die()  { printf '\n  \033[31m[x]\033[0m %s\n\n' "$*"; exit 1; }
has()  { command -v "$1" >/dev/null 2>&1; }

REPO_URL=https://github.com/egamberdiyevshukurjon9-dotcom/jarvis.git

pkg_install() { # $1 = brew name, $2 = apt name
  if has brew; then brew install "$1"
  elif has apt-get; then sudo apt-get update -y && sudo apt-get install -y "$2"
  elif has dnf; then sudo dnf install -y "$2"
  elif has pacman; then sudo pacman -S --noconfirm "$2"
  else die "No package manager found. Install $1 by hand and run this again."
  fi
}

step "1/4  Git, Node.js, FFmpeg"
has git || pkg_install git git
node_major=$(has node && node -p 'process.versions.node.split(".")[0]' || echo 0)
if [ "$node_major" -ge 20 ]; then ok "Node.js $(node -v)"
else
  if has brew; then brew install node
  else
    warn "Node.js 20+ is needed. Installing the LTS build from NodeSource."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs \
      || die "Install Node.js 20+ from https://nodejs.org and run this again."
  fi
fi
has ffmpeg && ok "FFmpeg" || pkg_install ffmpeg ffmpeg || warn "FFmpeg missing — video editing will not work."

step "2/4  Claude Code"
if has claude; then ok "Claude Code $(claude --version)"
else
  npm install -g @anthropic-ai/claude-code || curl -fsSL https://claude.ai/install.sh | bash
  export PATH="$HOME/.local/bin:$(npm prefix -g)/bin:$PATH"
  has claude || die "Claude Code did not install. See https://docs.claude.com/en/docs/claude-code"
fi
if [ ! -f "$HOME/.claude/.credentials.json" ] && [ "$(uname)" != Darwin ] && [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  warn "Not logged in to Claude Code yet. It opens now: log in, then type /exit."
  read -r -p "  Press Enter when ready " _
  claude || true
fi

step "3/4  The project"
here=$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)
if [ -f "$here/package.json" ]; then dir=$here
else
  dir="$HOME/jarvis"
  if [ -d "$dir/.git" ]; then git -C "$dir" pull --ff-only; else git clone "$REPO_URL" "$dir"; fi
fi
cd "$dir"
npm_config_onnxruntime_node_install_cuda=skip npm install

step "4/4  Settings"
node scripts/configure.mjs
node scripts/install-skills.mjs
node scripts/setup.mjs

printf '\n  \033[32mDone.\033[0m Start it with:  cd "%s" && npm start\n' "$dir"
say "Open http://localhost:5173 in Chrome, click INITIALISE, and say \"Hey Jarvis\"."
