#!/bin/bash
# deploy imjoy-lib with jailed library
set -e # Exit with nonzero exit code if anything fails

cd "$(dirname "$0")/../.."

# Save some useful information
LIB_REPO=git@github.com:oeway/lib.imjoy.io.git
LIB_SSH_REPO=${LIB_REPO/https:\/\/github.com\//git@github.com:}
SHA=`git rev-parse --verify HEAD`

# Decrypt the deploy key.
openssl aes-256-cbc -K $encrypted_12c8071d2874_key \
  -iv $encrypted_12c8071d2874_iv -in utils/imjoy_deploy_keys.tar.enc \
  -out imjoy_deploy_keys.tar -d

tar xvf imjoy_deploy_keys.tar

# Set the correct permission
chmod 600 ./imjoy_lib_id_rsa

# Import the deploy key
eval "$(ssh-agent -s)"
ssh-add ./imjoy_lib_id_rsa

# Clone the existing gh-pages for this repo into gh-pages/
git clone $LIB_REPO imjoy-lib
cd imjoy-lib

# Create a new empty branch if gh-pages doesn't exist yet (should only happen on first deploy).
git checkout ${LIB_TARGET_BRANCH} || { git checkout --orphan ${LIB_TARGET_BRANCH}; git rm -rf .; }

# Clean up
rm -rf ./*

# Copy dirs and files and that we want to update.
cp -Rf ../web/dist/*  ./
rm -rf ./static/*
rm -rf ./docs
rm -rf CNAME
rm -rf index.html
cp -Rf ../web/dist/static/icons ./static/icons
cp -Rf ../web/dist/static/iconfont ./static/iconfont
cp -Rf ../web/dist/static/jailed ./static/jailed

# Create .nojekyll to bypass Github jekyll
touch .nojekyll
echo "lib.imjoy.io" > CNAME

# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git add -A .
git diff-index --quiet HEAD || git commit -m "Deploy to GitHub Pages ${LIB_TARGET_BRANCH} branch: ${SHA}"

# Now that we're all set up, we can push.
git push $LIB_SSH_REPO ${LIB_TARGET_BRANCH}
