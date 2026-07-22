# Fate Core Sheets — Owlbear Rodeo Extension

An [Owlbear Rodeo](https://www.owlbear.rodeo/) (v2) extension for managing
**Fate Core** character sheets for a whole party. Sheets are shared and
synced in real time via room metadata, persist across sessions, and can be
imported from either the official Fate Core form-fillable PDF or this
tool's own JSON export.

Fate Core only — no Fate Accelerated / approaches.

## Project structure

```
public/
  manifest.json        Extension manifest (action popover config)
  icon.svg              Toolbar icon
index.html               Action popover entry (roster)
modal.html                Sheet editor / import entry, opened via OBR.modal
src/
  model/character.ts      Fate Core character types + factory helpers
  obr/
    metadata.ts            Room-metadata read/write/subscribe (persistence + sync)
    roles.ts                GM/player edit permission helpers (UI guard, not real access control)
    modal.ts                Helpers to open the sheet-editor / import modal
  hooks/
    CharactersProvider.tsx  React context: debounced writes, live sync, dirty-id tracking
    usePlayer.ts, useParty.ts, useTheme.ts   Thin wrappers around the OBR SDK
  import/
    json.ts                 This tool's own JSON schema, export, and migration-aware import
    pdf.ts                  Official Fate Core PDF field-mapping importer (pdf-lib)
  components/
    Roster.tsx, CharacterCard.tsx, ConfirmDialog.tsx
    sheet/                   One component per sheet section (identity, aspects, skills, ...)
    import/ImportFlow.tsx    Import chooser + review-before-save screen
  pages/SheetEditorApp.tsx  Modal root: routes between edit / import / not-found
```

## Install & develop

```
npm install
npm run dev
```

This starts Vite's dev server, by default at `http://localhost:5173`, but
everything is actually served under **`/fate-rpg/`** (see the `base` note
in `vite.config.ts` below), so the manifest is at
`http://localhost:5173/fate-rpg/manifest.json`, not the bare root.

## Load the extension into an Owlbear Rodeo room (for testing)

Owlbear Rodeo can load a custom extension straight from your local dev
server — no HTTPS or deployment needed for local testing:

1. Run `npm run dev` and leave it running.
2. In Owlbear Rodeo, open your profile menu and choose **Add Extension**.
3. Enter your local manifest URL: `http://localhost:5173/fate-rpg/manifest.json`.
4. Open (or create) a room, click the **...** menu at the bottom left,
   choose **Extensions**, and enable "Fate Core Sheets".
5. The toolbar should now show the extension's action icon, opening the
   roster popover.

Because everything is stored in room metadata, open the same room from a
second browser (or a private window, logged in as a different Owlbear
account) to see live sync between two "players."

## Build

```
npm run build
```

Outputs a static site to `dist/` with two HTML entry points (`index.html`
for the action popover, `modal.html` for the sheet editor / import flow).
Preview it locally with `npm run preview`.

## Publish

This repo deploys to **GitHub Pages** automatically: `.github/workflows/deploy.yml`
builds and publishes `dist/` on every push to `main` (or via a manual
"Run workflow" dispatch). Once GitHub Pages is enabled for the repo
(Settings → Pages → Source: "GitHub Actions" — a one-time setup step),
the site is live at:

```
https://umutyunusoglu.github.io/fate-rpg/
```

Add the extension in Owlbear using that hosted manifest URL:

```
https://umutyunusoglu.github.io/fate-rpg/manifest.json
```

Because GitHub Pages project sites serve from a `/fate-rpg/` subpath
rather than domain root, `vite.config.ts` sets `base: "/fate-rpg/"` for
**both** dev and build. This isn't just a build-output convenience:
Owlbear resolves `manifest.json`'s `action.icon`/`action.popover` as
`origin + path` (a plain string join against the bare domain, not a
proper relative-URL resolution against the manifest's own location), so
those paths must already be absolute *and* include `/fate-rpg` --
`/fate-rpg/icon.svg`, `/fate-rpg/index.html` -- in every environment.
Keeping dev and prod on the same base means there's one manifest.json
instead of divergent dev/prod copies.

To host elsewhere instead (Vercel, Netlify, Cloudflare Pages, ...), build
with `npm run build`, update `base` in `vite.config.ts` *and* the
`/fate-rpg/...` paths in `public/manifest.json` to match your hosting
path (both become `/` if served from domain root), and add the extension
using that host's manifest URL instead.

To list it in Owlbear's public extension directory, follow Owlbear's own
extension-sharing process from their documentation (`docs.owlbear.rodeo`
→ Extensions → Sharing your extension) — this extension doesn't do
anything special beyond a normal static manifest.

## Data model & persistence

All characters for a room live under one namespaced room-metadata key,
`com.fate-rpg.fate-sheets/characters` (see `src/obr/metadata.ts`), as a
map of `characterId -> Character`. Room metadata:

- **Persists** across reloads and future sessions (it's stored by Owlbear
  per-room, not per-connection).
- **Syncs** to every connected client via `OBR.room.onMetadataChange`.
- Has a **total size cap** enforced by Owlbear across all extensions in a
  room. To stay well under it we store avatars as plain URLs (never
  base64/embedded images) and surface a warning in the roster UI if the
  serialized character list gets large. If a campaign ever has enough
  characters to risk the cap, switch from the single combined key to one
  metadata key per character (`${KEY}/${id}`) — see the comment in
  `metadata.ts` for the trade-off (loses atomic read/write of the full
  roster).

Writes are **debounced** (`CharactersProvider.tsx`, 500ms) so typing in a
text field doesn't send an `OBR.room.setMetadata` call per keystroke.
While a character has an unflushed local edit it's marked "dirty" and
incoming remote updates for that character are held back, so a slower
echo of someone else's change can't stomp on what you're mid-typing — see
the comment in `CharactersProvider.tsx` for the exact mechanism and its
limits.

## Roles & permissions

The GM (`OBR.player.getRole() === "GM"`) can view, edit, create, delete,
and reassign the owner of every character. A player can view every
character but only edit/delete ones whose `ownerId` matches their own
`OBR.player.getId()`. **This is enforced only in the UI** (disabled
inputs/buttons) — room metadata in Owlbear is not access-controlled, so a
determined player could edit metadata directly via the SDK or devtools.
Treat this as a convenience guard for normal play, not real security (see
`src/obr/roles.ts`).

## Importing characters

Two import paths, both reachable from the roster's **Import** button,
both ending in a review/edit screen before anything is saved to the room:

- **This tool's JSON export** (`src/import/json.ts`) — the robust
  round-trip format for backups and moving a character between rooms.
  Versioned via `schemaVersion` so future model changes can migrate old
  exports.
- **Official Fate Core form-fillable PDF** (`src/import/pdf.ts`) — parsed
  client-side with `pdf-lib`'s `getTextField`/`getCheckBox`. The field
  names and the implicit skill-rating-by-row mapping are specific to that
  one template and hard-coded as a lookup table with an explanatory
  comment at the top of the file. The PDF has no structured
  weapons/equipment section, so its single free-text "Stunts and Extras"
  block is imported as one stunt entry for the user to split/refile by
  hand on the review screen.

## Known limitations

- `OBR.party.getPlayers()` only returns currently-connected players, so an
  offline owner shows as "Offline player" rather than their name.
- The debounce/dirty-tracking sync strategy trades a small chance of a
  very-fast concurrent edit being overwritten for avoiding both metadata
  spam and full CRDT-style merge complexity — acceptable for a
  low-contention, per-character editing pattern like this one.
