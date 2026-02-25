---
name: release
description: Release a new version of the couper-vscode extension to VS Code Marketplace and Open VSX Registry
disable-model-invocation: true
allowed-tools: Read, Edit, Bash(git *), Bash(gh *), Bash(npm version *)
argument-hint: "[version e.g. 1.11.0]"
---

# Release couper-vscode Extension

Release a new version of the Couper Configuration VS Code extension.

## Context

- Current version: !`node -p "require('./package.json').version"`
- Recent tags: !`git tag --sort=-v:refname | head -5`
- Unreleased changelog section: !`sed -n '/## \[Unreleased\]/,/^## \[v/p' CHANGELOG.md | head -30`
- Git status: !`git status --short`

## Steps

1. **Validate preconditions**
   - Ensure working tree is clean (no uncommitted changes)
   - Ensure branch is `master` and up to date with remote (`git pull --rebase`)
   - Verify there are unreleased changes in CHANGELOG.md; abort if the Unreleased section is empty

2. **Determine version**
   - If `$ARGUMENTS` is provided, use that as the new version
   - Otherwise, show the unreleased changes and ask the user to choose: patch, minor, or major bump
   - Validate the version is semver and greater than the current version

3. **Bump version in `package.json`**
   - Update the `"version"` field to the new version

4. **Update `CHANGELOG.md`**
   - Replace the `[Unreleased]` compare link to reference the new version tag
   - Add a new empty `[Unreleased]` section above with compare link from new version to master
   - Move existing unreleased entries under the new version heading
   - Follow the existing format in the file

5. **Commit and push**
   - Stage `package.json` and `CHANGELOG.md`
   - Commit with message: `release: <version>`
   - Push to remote

6. **Tag and push tag**
   - Create annotated tag `v<version>`
   - Push the tag to remote

7. **Create GitHub Release**
   - Use `gh release create v<version>` with the changelog entries as release notes
   - Use the Added/Changed/Fixed/Removed sections from the changelog as the body

8. **Verify**
   - Confirm the release workflow was triggered: `gh run list --limit 1`
   - Print the release URL and marketplace link for the user to monitor

## Important

- Never force-push or amend commits
- If `git push` fails due to remote changes, `git pull --rebase` first
- The CI workflow (`.github/workflows/release.yaml`) handles publishing to both VS Code Marketplace and Open VSX Registry automatically on GitHub Release creation
