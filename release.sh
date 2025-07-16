#!/bin/bash

REPO_URL="https://github.com/TsProphet94/IdleForge.git"
DEPLOY_DIR="../idleforge-deploy"

VERSION=$(date +%Y%m%d-%H%M)

echo "🔧 Committing changes to main..."
git add .
git commit -m "Release $VERSION"
git push origin main

echo "🧾 Updating version.txt..."
echo "Version $VERSION" > version.txt
git add version.txt
git commit -m "Tag version $VERSION"
git push origin main

echo "🚀 Deploying to gh-pages..."
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR
cp -r * $DEPLOY_DIR
cp .nojekyll $DEPLOY_DIR 2>/dev/null || touch $DEPLOY_DIR/.nojekyll

cd $DEPLOY_DIR
git init
git remote add origin $REPO_URL
git checkout -b gh-pages
git add .
git commit -m "Deploy version $VERSION"
git push -u origin gh-pages --force

echo "✅ Deployment complete!"
echo "🌍 Visit: https://tsprophet94.github.io/IdleForge/"