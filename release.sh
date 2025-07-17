#!/bin/bash

# Configuration
REPO_URL="https://github.com/TsProphet94/IdleForge.git"
DEPLOY_DIR="../idleforge-deploy"
VERSION_FILE="version.txt"

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

# Commit any outstanding changes
git add .
git commit -m "Release $NEW_VERSION"
git push origin main

# Update version.txt
echo "Version $NEW_VERSION" > "$VERSION_FILE"
git add "$VERSION_FILE"
git commit -m "Tag version $NEW_VERSION"
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

echo "✅ Deployment complete!"
echo "🌍 Visit: https://tsprophet94.github.io/IdleForge/"