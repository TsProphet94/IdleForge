#!/bin/bash

REPO_URL="https://github.com/TsProphet94/IdleForge.git"
DEPLOY_DIR="../idleforge-deploy"

echo "🚀 Starting gh-pages deployment..."

rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR
cp -r * $DEPLOY_DIR
cp .nojekyll $DEPLOY_DIR 2>/dev/null || touch $DEPLOY_DIR/.nojekyll

cd $DEPLOY_DIR
git init
git remote add origin $REPO_URL
git checkout -b gh-pages

git add .
git commit -m "Deploying latest version to gh-pages"
git push -u origin gh-pages --force

echo "✅ Deployment complete!"
echo "🌍 Visit: https://tsprophet94.github.io/IdleForge/"