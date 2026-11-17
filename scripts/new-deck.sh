#!/usr/bin/env bash
# Create decks/<name> from a kit in kits/ (default: elastic-web).
# Deck-level node_modules/package.json are not used: fslides is installed once at the root.
# Usage: npm run new-deck -- <name> [kit]
set -euo pipefail
name="${1:?Usage: npm run new-deck -- <name> [kit]}"
kit="${2:-elastic-web}"
root="$(cd "$(dirname "$0")/.." && pwd)"
[ -d "$root/kits/$kit" ] || { echo "No such kit: kits/$kit"; exit 1; }
[ ! -e "$root/decks/$name" ] || { echo "decks/$name already exists"; exit 1; }
cd "$root/decks"
"$root/node_modules/.bin/fslides" create "$name" --style "$root/kits/$kit"
rm -f "$root/decks/$name/package.json"   # fslides comes from the repo root
# standard layout: slides at the deck root (slidesDir '.'), like partner-deck, so the built player and Pages resolve them
cd "$root/decks/$name"
shopt -s dotglob nullglob; for f in slides/*; do [ "$(basename "$f")" = style ] || mv "$f" .; done; rm -rf slides
sed -i '' "s/^  name: '[^']*',/  name: '$name',\\n  title: '$name',\\n  slidesDir: '.',/" fslides.config.js
printf 'js/\n%s.html\nsource/\n' "$name" > "$root/decks/$name/.gitignore"
node "$root/tools/sync.js" "$name"
echo "Next: npm run serve -- $name"
