#!/bin/bash
# Commits all changed files and pushes to GitHub target branch.
set -e # Exit with nonzero exit code if anything fails

cd "$(dirname "$0")/../.."

# Save some useful information
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
SHA=`git rev-parse --verify HEAD`

# Decrypt the deploy key.
openssl aes-256-cbc -K $encrypted_12c8071d2874_key \
  -iv $encrypted_12c8071d2874_iv -in utils/imjoy_deploy_keys.tar.enc \
  -out imjoy_deploy_keys.tar -d

tar xvf imjoy_deploy_keys.tar

# Set the correct permission
chmod 600 ./imjoy_id_rsa

# Import the deploy key
eval "$(ssh-agent -s)"
ssh-add ./imjoy_id_rsa

# Clone the existing gh-pages for this repo into gh-pages/
git clone $REPO gh-pages
cd gh-pages

# Create a new empty branch if gh-pages doesn't exist yet (should only happen on first deploy).
git checkout $TARGET_BRANCH || { git checkout --orphan $TARGET_BRANCH; git rm -rf .; }
git config user.name "Travis CI"
git config user.email "travis@travis-ci.org"

# Remove all existing files
rm -rf ./*

# Copy dirs and files and that we want to update.
cp -Rf ../web/dist/* ./

# Create .nojekyll to bypass Github jekyll
touch .nojekyll

# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git add -A .
git diff-index --quiet HEAD || git commit -m "Deploy to GitHub Pages $TARGET_BRANCH branch: ${SHA}"

# Now that we're all set up, we can push.
git push $SSH_REPO $TARGET_BRANCH
