#!/bin/bash
set -e

# ─── Pre-flight checks ────────────────────────────────────────────────────────

# Fetch so our remote-tracking refs are current before any checks
git fetch origin

# Ensure dev is not behind origin/dev
if [ -n "$(git log dev..origin/dev --oneline)" ]; then
    echo "Error: dev is not up to date with origin/dev. Run 'git pull' on dev first."
    exit 1
fi

# Ensure example-dev is not behind origin/example-dev
if [ -n "$(git log example-dev..origin/example-dev --oneline)" ]; then
    echo "Error: example-dev is not up to date with origin/example-dev. Run 'git pull' on example-dev first."
    exit 1
fi

# Block running with uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "Error: you have uncommitted changes. Stash or commit them before running this script."
    exit 1
fi

# Require example-dev to already contain all of dev's commits
if [ -n "$(git log example-dev..dev --oneline)" ]; then
    echo "Error: example-dev is not up to date with dev. Merge dev into example-dev first."
    exit 1
fi

# ─── dev: update client packages ─────────────────────────────────────────────

git checkout dev
cd client

# Update all dependencies to their latest published versions
output=$(pnpm up --latest 2>&1)
echo "$output"

# @semoss/sdk requires react 18 — if we upgraded past that, bring it back down
if echo "$output" | grep -q "@semoss/sdk" && echo "$output" | grep -q "unmet peer react"; then
    pnpm add react@"^18" react-dom@"^18"
    pnpm add -D @types/react@"^18" @types/react-dom@"^18"
fi

# Re-resolve lockfile within the (possibly adjusted) version ranges
pnpm up

# pnpm up --latest strips ^ from prerelease versions — restore it so future
# updates pick up new betas automatically
sed -i '' 's/"@semoss\/sdk": "\([^^][^"]*\)"/"@semoss\/sdk": "^\1"/' package.json

# Install to sync node_modules with the updated lockfile
pnpm i

cd ..
git add client/package.json client/pnpm-lock.yaml
git diff --cached --quiet || git commit -m "chore: update client packages to latest using script"

# ─── example-dev: pull dev, then update root + client packages ───────────────

git checkout example-dev

# Bring in the package update commit we just made on dev
git pull --no-edit origin dev

# Update root-level devDependencies (biome, husky, etc.)
pnpm up --latest

# Install to sync node_modules with the updated lockfile
pnpm i

# Sync biome.json $schema version with the newly installed biome version
biome_version=$(node -e "console.log(require('./node_modules/@biomejs/biome/package.json').version)")
sed -i '' "s|biomejs.dev/schemas/[^/]*/schema.json|biomejs.dev/schemas/${biome_version}/schema.json|" biome.json

# Update client dependencies (same process as above)
cd client

# Update all dependencies to their latest published versions
output=$(pnpm up --latest 2>&1)
echo "$output"

# @semoss/sdk requires react 18 — if we upgraded past that, bring it back down
if echo "$output" | grep -q "@semoss/sdk" && echo "$output" | grep -q "unmet peer react"; then
    pnpm add react@"^18" react-dom@"^18"
    pnpm add -D @types/react@"^18" @types/react-dom@"^18"
fi

# Re-resolve lockfile within the (possibly adjusted) version ranges
pnpm up

# pnpm up --latest strips ^ from prerelease versions — restore it so future
# updates pick up new betas automatically
sed -i '' 's/"@semoss\/sdk": "\([^^][^"]*\)"/"@semoss\/sdk": "^\1"/' package.json

# Install to sync node_modules with the updated lockfile
pnpm i

cd ..
git add package.json pnpm-lock.yaml biome.json client/package.json client/pnpm-lock.yaml

# Skip commit if nothing changed
git diff --cached --quiet || git commit -m "chore: update packages to latest using script"

# ─── dev: lint, commit formatting changes, push ──────────────────────────────

git checkout dev

# Lint and format using example-dev's tooling config
./lint-from-example.sh

# Stage only the two target files, then discard everything else the linter touched
git add client/package.json client/pnpm-lock.yaml
git restore .

# Skip commit if lint made no changes to these files
git diff --cached --quiet || git commit -m "chore: lint and format client packages"
git push

# ─── example-dev: pull dev, push ─────────────────────────────────────────────

git checkout example-dev

# Pull in the lint commit we just made on dev
git pull --no-edit origin dev
git push
