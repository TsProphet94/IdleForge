#!/bin/bash

# IdleForge Development Helper
# Quick commands for common tasks

case "$1" in
  "test")
    echo "🧪 Starting local test server..."
    ./test-local.sh
    ;;
  "release")
    echo "🚀 Starting automated release..."
    ./release.sh
    ;;
  "version")
    if [[ -f "version.txt" ]]; then
      CURRENT=$(grep -Eo '([0-9]+\.){2}[0-9]+' version.txt)
      SW_VERSION=$(grep -o 'idleforge-v[0-9.]*' sw.js | head -1 | cut -d'v' -f2)
      echo "📋 Current Versions:"
      echo "   Game: $CURRENT"
      echo "   Service Worker: $SW_VERSION"
      if [[ "$CURRENT" == "$SW_VERSION" ]]; then
        echo "   ✅ Versions are in sync"
      else
        echo "   ⚠️  Versions are out of sync!"
      fi
    else
      echo "❌ version.txt not found"
    fi
    ;;
  "status")
    echo "📊 IdleForge Development Status:"
    echo "================================"
    
    # Check if we're in a git repo
    if git rev-parse --git-dir > /dev/null 2>&1; then
      echo "📁 Repository: $(basename $(git rev-parse --show-toplevel))"
      echo "🌿 Branch: $(git branch --show-current)"
      echo "📝 Last commit: $(git log -1 --pretty=format:'%h - %s (%cr)')"
      
      # Check for uncommitted changes
      if [[ -n $(git status --porcelain) ]]; then
        echo "⚠️  Uncommitted changes:"
        git status --short
      else
        echo "✅ Working directory clean"
      fi
    else
      echo "❌ Not a git repository"
    fi
    
    # Check version sync
    if [[ -f "version.txt" ]] && [[ -f "sw.js" ]]; then
      CURRENT=$(grep -Eo '([0-9]+\.){2}[0-9]+' version.txt)
      SW_VERSION=$(grep -o 'idleforge-v[0-9.]*' sw.js | head -1 | cut -d'v' -f2)
      echo "🏷️  Version: $CURRENT"
      if [[ "$CURRENT" == "$SW_VERSION" ]]; then
        echo "✅ Service worker version in sync"
      else
        echo "⚠️  Service worker version out of sync ($SW_VERSION)"
      fi
    fi
    ;;
  *)
    echo "🎮 IdleForge Development Helper"
    echo "================================"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  test     - Start local test server"
    echo "  release  - Run automated release & deploy"
    echo "  version  - Check version sync status"
    echo "  status   - Show development status"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh test     # Test locally"
    echo "  ./dev.sh release  # Deploy new version"
    echo "  ./dev.sh status   # Check repo status"
    ;;
esac
