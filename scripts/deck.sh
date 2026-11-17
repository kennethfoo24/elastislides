#!/usr/bin/env bash
# Usage: npm run serve -- <deck>      live-reload player at the deck's port
#        npm run build -- <deck>      builds the player html (decks/<deck>/<name>.html)
set -euo pipefail
cmd="${1:?Usage: deck.sh serve|build <deck>}"; deck="${2:?deck name}"
root="$(cd "$(dirname "$0")/.." && pwd)"
node "$root/tools/sync.js" "$deck"
case "$cmd" in
  serve) cd "$root/decks/$deck" && "$root/node_modules/.bin/fslides" serve ;;
  build) node "$root/tools/build-player.js" "$root/decks/$deck" ;;
  *) echo "unknown command $cmd"; exit 1 ;;
esac
