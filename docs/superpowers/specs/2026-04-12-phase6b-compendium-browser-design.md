# Phase 6b: Compendium Browser Design Spec

**Date:** 2026-04-12
**Scope:** Custom compendium browser for searching and filtering system compendium packs.

---

## Overview

A standalone ApplicationV2 window with a Svelte 5 UI for browsing SWSE compendium content. Replaces the old AppV1 + Handlebars browser. Supports text search, type filtering, pack filtering, and lazy-loaded results. Items can be dragged onto actor sheets.

---

## Window

- **Size:** 720 x 600, resizable
- **Title:** "SWSE Compendium Browser"
- **Access:** Button in actor sidebar header + `game.swse.openCompendiumBrowser()` API

---

## UI Layout

```
┌──────────────────────────────────────────────────┐
│ [Search: ________________]  [Type: All ▼]        │
│ [Pack filter checkboxes...]                      │
├──────────────────────────────────────────────────┤
│ [img] Item Name          Type      Pack          │
│ [img] Item Name          Type      Pack          │
│ [img] Item Name          Type      Pack          │
│ ... (lazy load on scroll)                        │
│                                                  │
│ Showing 50 of 1,234 results                      │
└──────────────────────────────────────────────────┘
```

---

## Features

### Text Search
- Filters by item name (case insensitive regex)
- Debounced (200ms) to avoid filtering on every keystroke

### Type Filter
- Dropdown with all item types: All, Weapon, Armor, Equipment, Feat, Talent, Class, Species, Force Power, Language, Template, Upgrade, etc.
- Filters results to selected type

### Pack Filter
- Collapsible section showing checkboxes for each loaded compendium pack
- All checked by default
- Unchecking a pack excludes its items

### Results List
- Shows item image (24x24), name, type, pack name
- Sorted alphabetically by name
- Lazy loading: initial 50 items, load 20 more on scroll to bottom
- Click item name → opens item sheet
- Items are draggable for drag-to-actor-sheet workflow

### Loading
- On first open, loads all items from enabled packs (cached)
- Shows "Loading..." indicator during initial load
- Subsequent opens use cached data unless packs changed

---

## Architecture

### Host Class
`src/sheets/compendium/SWSECompendiumBrowser.mjs` — extends `foundry.applications.api.ApplicationV2`. Not a document sheet — standalone application. Mounts Svelte component.

### Svelte Component
`src/sheets/compendium/CompendiumBrowser.svelte` — single component handles search, filters, results display, and lazy loading. No sub-components needed.

### Data Loading
Load all items from system compendium packs on first open:

```javascript
const packs = game.packs.filter(p => p.metadata.packageType === "system" && p.documentName === "Item");
for (const pack of packs) {
  const index = await pack.getIndex({ fields: ["system.description", "system.subtype", "type"] });
  // Cache index entries with pack reference
}
```

Uses pack index (lightweight) rather than full document loading.

---

## File Inventory

```
src/sheets/compendium/
├── SWSECompendiumBrowser.mjs    # ApplicationV2 host
└── CompendiumBrowser.svelte     # Svelte UI
```

---

## Registration

In `src/swse.mjs`:
- Add `game.swse.openCompendiumBrowser` function
- Add sidebar button via `renderSidebar` hook (or items directory header)

---

## Out of Scope

- Actor compendium browsing (items only for now)
- Advanced filter syntax (the old `-type:` `-subtype:` `-pack:` prefix filters)
- Homebrew content toggle (uses existing `enableHomebrewContent` setting)
