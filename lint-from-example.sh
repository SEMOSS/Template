#!/bin/bash
set -e

git checkout example-dev -- biome.json package.json pnpm-lock.yaml .pre-commit-config.yaml
git restore --staged biome.json package.json pnpm-lock.yaml .pre-commit-config.yaml
pnpm i
pnpm fix
rm biome.json package.json pnpm-lock.yaml .pre-commit-config.yaml
