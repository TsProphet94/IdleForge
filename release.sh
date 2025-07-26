#!/bin/bash

# Enhanced IdleForge Release Automation Script
# Automatically handles versioning, service worker updates, and deployment

# Exit on any error
set -e

# Configuration
REPO_URL="https://github.com/TsProphet94/IdleForge.git"
DEPLOY_DIR="../idleforge-deploy"
VERSION_FILE="version.txt"

# Validate required files exist
if [[ ! -f "sw.js" ]]; then
  echo "❌ Error: sw.js not found. Are you in the correct directory?"
  exit 1
fi

if [[ ! -f "index.html" ]]; then
  echo "❌ Error: index.html not found. Are you in the correct directory?"
  exit 1
fi

echo "🚀 IdleForge Release Automation Starting..."
echo "📍 Current directory: $(pwd)"

# Determine new semantic version
if [[ -f "$VERSION_FILE" ]] && CURRENT_VERSION=$(grep -Eo '([0-9]+\.){2}[0-9]+' "$VERSION_FILE"); then
  if [[ "$CURRENT_VERSION" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
    MAJOR=${BASH_REMATCH[1]}
    MINOR=${BASH_REMATCH[2]}
    PATCH=${BASH_REMATCH[3]}
    NEW_PATCH=$((PATCH + 1))
    NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"
  else
    # if version.txt is malformed, reset to 0.1.0
    NEW_VERSION="0.1.0"
  fi
else
  # first-ever release
  NEW_VERSION="0.1.0"
fi

echo "🔧 Releasing version $NEW_VERSION"

# Commit any outstanding changes (if any)
if [[ -n $(git status --porcelain) ]]; then
  echo "📝 Committing outstanding changes..."
  git add .
  git commit -m "Release $NEW_VERSION"
  git push origin main
else
  echo "✅ Working directory is clean, proceeding with release..."
fi

# Update version.txt
echo "Version $NEW_VERSION" > "$VERSION_FILE"

# Update service worker cache version to match
echo "🔄 Updating service worker cache version to $NEW_VERSION"
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/const CACHE_NAME = \"idleforge-v.*\";/const CACHE_NAME = \"idleforge-v$NEW_VERSION\";/" sw.js
else
  # Linux
  sed -i "s/const CACHE_NAME = \"idleforge-v.*\";/const CACHE_NAME = \"idleforge-v$NEW_VERSION\";/" sw.js
fi

# Add all updated files
git add "$VERSION_FILE" sw.js
git commit -m "Tag version $NEW_VERSION and update service worker cache"
git push origin main

# Deploy to gh-pages
echo "🚀 Deploying to gh-pages..."
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
cp -r * "$DEPLOY_DIR"
cp .nojekyll "$DEPLOY_DIR" 2>/dev/null || touch "$DEPLOY_DIR/.nojekyll"

cd "$DEPLOY_DIR"
git init
git remote add origin "$REPO_URL"
git checkout -b gh-pages
git add .
git commit -m "Deploy version $NEW_VERSION"
git push -u origin gh-pages --force

# Return to original directory
cd - > /dev/null

# Success summary
echo ""
echo "🎉 =================================="
echo "✅ RELEASE COMPLETE!"
echo "🎯 Version: $NEW_VERSION"
echo "📦 Service Worker Cache: idleforge-v$NEW_VERSION"
echo "🌍 Live URL: https://tsprophet94.github.io/IdleForge/"
echo "⏰ PWA users will auto-update within 24 hours"
echo "=================================="
echo ""
echo "📱 To force immediate PWA update:"
echo "   1. Close the app completely"
echo "   2. Reopen it"
echo ""
echo "🔍 Monitor deployment status:"
echo "   https://github.com/TsProphet94/IdleForge/deployments"