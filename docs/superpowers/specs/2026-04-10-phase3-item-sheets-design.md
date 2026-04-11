# Phase 3: Item Sheets Design Spec

**Date:** 2026-04-10
**Scope:** Item sheet UI for the SWSE Foundry VTT v14 rebuild. Three grouped item sheets covering all item types, with GM-editable changes tables.

---

## Overview

Replace Foundry's default item sheets with three custom sheets built as ApplicationV2 hosts mounting Svelte 5 components. Items are grouped by complexity: Equipment (physical items), Feature (game mechanics items), and Simple (minimal items). All three share a base host class and reuse the Phase 2 theme system.

---

## Sheet Groups

### Equipment Sheet

**Item types:** `weapon`, `armor`, `equipment`, `upgrade`

**Sections:**
- **Header:** Item image (clickable FilePicker), name (editable), type badge
- **Physical properties:** Weight, cost, availability
- **Type-specific fields:**
  - Weapons: weapon group, damage
  - Armor: armor type (light/medium/heavy), reflex bonus, max dex, fort bonus
  - Equipment: equipment subtype
  - Upgrades: upgrade type
- **Equip toggle:** Checkbox for `system.equipped`
- **Modes:** List of item modes (from active effects with mode flag), if any
- **Changes table:** GM-editable changes array
- **Description:** Rich text display of `system.description`

**Window:** 520 x 580, resizable

### Feature Sheet

**Item types:** `feat`, `talent`, `class`, `species`, `template`, `forcePower`, `forceSecret`, `forceTechnique`, `forceRegimen`, `starShipManeuver`

**Sections:**
- **Header:** Item image, name, type badge
- **Prerequisites:** Display `system.prerequisite` if present
- **Category / Source:** `system.categories`, `system.source` if present
- **Type-specific fields:**
  - Talents: talent tree name, talent tree source, bonus talent tree
  - Classes: class levels, hit points per level (from effects)
  - Species: species traits list
- **Changes table:** GM-editable changes array
- **Description:** Rich text display

**Window:** 520 x 520, resizable

### Simple Sheet

**Item types:** `language`, `affiliation`, `background`, `destiny`, `classFeature`, `hazard`, `implant`, `droid system`, `vehicleSystem`, `vehicleBaseType`, `beastAttack`, `beastSense`, `beastType`, `beastQuality`

**Sections:**
- **Header:** Item image, name, type badge
- **Changes table:** GM-editable changes array
- **Description:** Rich text display

**Window:** 480 x 400, resizable

---

## Shared Components

### ItemHeader.svelte

Shared across all three sheets. Displays:
- Item image (80x80, clickable to open FilePicker)
- Item name (editable input)
- Type badge (item.type formatted for display)

Props: `{ item }`

### ChangesTable.svelte

Displays and optionally edits the `system.changes` array. Each change has `key`, `value`, and optionally `mode`.

- **Player view:** Read-only table showing key and value columns
- **GM view:** Editable table with add/remove row buttons, editable key/value/mode fields
- GM detection: `game.user.isGM`

Props: `{ item }`

Updates go through `item.update({ "system.changes": newArray })`.

---

## Architecture

### Base Host Class

`src/sheets/item/SWSEItemSheetBase.mjs` — extends `foundry.applications.sheets.ItemSheetV2`

Shared behavior:
- Mount/unmount Svelte component lifecycle (same pattern as `SWSECharacterSheet`)
- Default CSS classes: `["swse", "swse-item-sheet"]`
- Drop handling (disabled — items don't accept drops in Phase 3)
- Theme application via `data-theme` attribute

Subclasses override:
- `static DEFAULT_OPTIONS` — window size, additional CSS classes
- `static PARTS` — template reference
- `_svelteComponent` getter — returns the Svelte component class to mount

### Subclass Host Classes

Each extends `SWSEItemSheetBase`:

| Class | File | Types | Window |
|-------|------|-------|--------|
| `SWSEEquipmentSheet` | `src/sheets/item/SWSEEquipmentSheet.mjs` | weapon, armor, equipment, upgrade | 520x580 |
| `SWSEFeatureSheet` | `src/sheets/item/SWSEFeatureSheet.mjs` | feat, talent, class, species, template, forcePower, forceSecret, forceTechnique, forceRegimen, starShipManeuver | 520x520 |
| `SWSESimpleSheet` | `src/sheets/item/SWSESimpleSheet.mjs` | language, affiliation, background, destiny, classFeature, hazard, implant, droid system, vehicleSystem, vehicleBaseType, beastAttack, beastSense, beastType, beastQuality | 480x400 |

### Svelte Root Components

| Component | File |
|-----------|------|
| `EquipmentSheet.svelte` | `src/sheets/item/EquipmentSheet.svelte` |
| `FeatureSheet.svelte` | `src/sheets/item/FeatureSheet.svelte` |
| `SimpleSheet.svelte` | `src/sheets/item/SimpleSheet.svelte` |

Each receives `{ item }` as props and reads from `item.system` for display. Updates go through `item.update()`.

---

## Theming

Reuses the Phase 2 theme system. All item sheets read the `sheetTheme` client setting and apply the corresponding `data-theme` attribute. The same CSS custom properties and theme files apply — no new CSS files needed.

Item sheets use the existing `.swse-sheet`, `.swse-card`, `.swse-label`, `.swse-input`, `.swse-section`, `.swse-section-header`, `.swse-item-list` classes from `sheet.css`.

---

## Registration

In `src/swse.mjs`, during the `init` hook:

```javascript
import { SWSEEquipmentSheet } from "./sheets/item/SWSEEquipmentSheet.mjs";
import { SWSEFeatureSheet } from "./sheets/item/SWSEFeatureSheet.mjs";
import { SWSESimpleSheet } from "./sheets/item/SWSESimpleSheet.mjs";

foundry.documents.collections.Items.registerSheet("swse", SWSEEquipmentSheet, {
  types: ["weapon", "armor", "equipment", "upgrade"],
  makeDefault: true,
  label: "SWSE Equipment Sheet",
});

foundry.documents.collections.Items.registerSheet("swse", SWSEFeatureSheet, {
  types: ["feat", "talent", "class", "species", "template", "forcePower", "forceSecret", "forceTechnique", "forceRegimen", "starShipManeuver"],
  makeDefault: true,
  label: "SWSE Feature Sheet",
});

foundry.documents.collections.Items.registerSheet("swse", SWSESimpleSheet, {
  types: ["language", "affiliation", "background", "destiny", "classFeature", "hazard", "implant", "droid system", "vehicleSystem", "vehicleBaseType", "beastAttack", "beastSense", "beastType", "beastQuality"],
  makeDefault: true,
  label: "SWSE Simple Sheet",
});
```

---

## Data Flow

1. User clicks item name in character sheet → Foundry opens the registered item sheet
2. ApplicationV2 host mounts the Svelte root component with `{ item }` prop
3. Svelte component reads `item.system.*` for display
4. User edits call `item.update({ "system.path": value })`
5. Foundry re-renders, Svelte updates reactively

---

## File Inventory

```
src/
├── sheets/
│   ├── item/
│   │   ├── SWSEItemSheetBase.mjs       # Base ApplicationV2 host
│   │   ├── SWSEEquipmentSheet.mjs      # Equipment host
│   │   ├── SWSEFeatureSheet.mjs        # Feature host
│   │   ├── SWSESimpleSheet.mjs         # Simple host
│   │   ├── EquipmentSheet.svelte       # Equipment root component
│   │   ├── FeatureSheet.svelte         # Feature root component
│   │   └── SimpleSheet.svelte          # Simple root component
│   └── components/
│       ├── ItemHeader.svelte           # Shared header (image + name + type)
│       └── ChangesTable.svelte         # GM-editable changes array
```

---

## Out of Scope

- Vehicle / Computer sheets (Phase 4)
- Attack rolls from weapon sheets (Phase 5)
- Compendium browser integration (Phase 6)
- Drag-and-drop reordering of changes
- Rich text editing of description (display only — editing through Foundry's default editor via right-click or future enhancement)
