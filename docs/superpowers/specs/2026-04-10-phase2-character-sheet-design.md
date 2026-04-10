# Phase 2: Character Sheet Design Spec

**Date:** 2026-04-10
**Scope:** Character sheet UI for the SWSE Foundry VTT v14 rebuild. Covers the ApplicationV2 host, Svelte 5 components, tab structure, layout, and theming.

---

## Overview

Replace Foundry's default sheet with a custom character sheet built as an ApplicationV2 host mounting Svelte 5 components. The sheet supports both `character` and `npc` actor types (both use `CharacterData`). Three player-selectable visual themes are provided via CSS custom properties.

---

## Window

- **Default size:** 720 x 700 pixels
- **Resizable:** Yes
- **Minimum size:** 600 x 500

---

## Tab Structure (8 tabs)

| Tab | Content | Conditional |
|-----|---------|-------------|
| **Summary** | Portrait, name/class/species header, abilities, defenses, HP, shields, combat stats (BAB, grapple, force points, destiny points, dark side score), condition | No |
| **Skills** | Full skill list with trained toggle, focus indicator, ability mod, misc bonuses, total. Remaining trained skills counter. | No |
| **Inventory** | Equipped items, unequipped items, general equipment. Credits display. Carried weight. | No |
| **Feats & Talents** | Feats list with source. Talents list with source. Both show prerequisites. | No |
| **The Force** | Force Powers, Force Secrets, Force Techniques, Force Regimens. Drag-to-add from compendiums. | Yes — hidden when actor has no Force Sensitivity |
| **Traits & Languages** | Traits list. Affiliations. Languages. Beast section (natural weapons, senses, types, qualities) if actor is a beast. | No |
| **Details** | Biography (rich text editor), description, gender, sex, age, height, weight, player name. Class progression table. | No |
| **Settings** | Ability generation method dropdown. NPC toggle. Ignore prerequisites toggle. Active effects/modes list with enable/disable toggles. | No |

---

## Summary Tab Layout

Top-down flow, no sidebar. Content fills the full width.

```
┌─────────────────────────────────────────────────┐
│ [Portrait]  Name / Class Summary / Level        │
│             Species / XP          [HP] [Shields] │
├─────────────────────────────────────────────────┤
│  STR   DEX   CON   INT   WIS   CHA             │
│  10    16    14    12    14    15               │
│  +0    +3    +2    +1    +2    +2              │
├─────────────────────────────────────────────────┤
│  REFLEX  FORTITUDE  WILL  │  DAMAGE THRESHOLD   │
│    22       20       19   │       20            │
├─────────────────────────────────────────────────┤
│  BAB   GRAPPLE   FORCE PTS   DESTINY   DARK    │
│  +6     +9         8           1        0      │
└─────────────────────────────────────────────────┘
```

- Portrait is clickable (opens FilePicker)
- HP and Shields are editable inline (click to type)
- Ability scores show base value and modifier; clicking rolls `1d20 + modifier`
- Defense values show tooltip breakdown on hover (class bonus, ability bonus, misc)
- Force Points, Destiny Points, Dark Side Score are editable inline

---

## Component Architecture

### Host Class

`src/sheets/actor/SWSECharacterSheet.mjs` — extends `foundry.applications.sheets.ActorSheetV2`. Responsibilities:
- Register as the default sheet for `character` and `npc` actor types
- Set default window options (size, classes, resizable)
- Mount the root Svelte component in `_renderHTML()`
- Pass actor document and sheet reference as props
- Handle Foundry lifecycle (`_onRender`, `close`)
- Destroy Svelte component on close

### Root Component

`src/sheets/actor/CharacterSheet.svelte` — receives actor document as prop. Responsibilities:
- Tab bar rendering and tab switching (stores active tab in component state)
- Theme class application on the root element
- Renders the active tab component

### Tab Components

One Svelte component per tab, each in `src/sheets/actor/tabs/`:
- `SummaryTab.svelte`
- `SkillsTab.svelte`
- `InventoryTab.svelte`
- `FeatsTab.svelte`
- `ForceTab.svelte`
- `TraitsTab.svelte`
- `DetailsTab.svelte`
- `SettingsTab.svelte`

Each receives the actor document as a prop and reads from `actor.system` for display. Updates go through `actor.update()` or `actor.safeUpdate()`.

### Shared Sub-Components

Reusable components in `src/sheets/components/`:

| Component | Purpose |
|-----------|---------|
| `AbilityScore.svelte` | Single ability block (label, score, modifier). Click to roll. |
| `DefenseBlock.svelte` | Single defense (label, value, tooltip breakdown). |
| `HealthBar.svelte` | HP current/max display with inline edit. |
| `ShieldDisplay.svelte` | Shield HP with active indicator. |
| `SkillRow.svelte` | Single skill row (trained toggle, name, ability, bonus, total). Click to roll. |
| `ItemList.svelte` | Generic sortable item list with type icon, name, and action buttons (edit, delete, equip). Used by Inventory, Feats, Force, Traits tabs. |
| `ResourceBox.svelte` | Editable numeric resource (force points, destiny points, etc.). |
| `TabBar.svelte` | Tab navigation bar. Handles active state and conditional tab visibility. |

---

## Theming

Three themes implemented as CSS custom property sets. A `data-theme` attribute on the sheet root element switches between them.

### Themes

| Theme | Key | Description |
|-------|-----|-------------|
| Dark Sci-Fi | `dark-scifi` | Dark blue backgrounds, blue accent lighting, subtle gradients. Default. |
| Clean & Neutral | `clean-neutral` | Light warm backgrounds, white cards, brown accent labels. |
| Dark Minimal | `dark-minimal` | Dark gray backgrounds, no color accents, matches Foundry default UI. |

### CSS Custom Properties (per theme)

```css
--sheet-bg            /* main sheet background */
--sheet-color         /* primary text color */
--card-bg             /* stat block / card background */
--card-border         /* card border color */
--label-color         /* small uppercase labels */
--accent-color        /* highlighted values, active states */
--input-bg            /* editable field background */
--input-border        /* editable field border */
--tab-active-bg       /* active tab background */
--tab-active-color    /* active tab text */
--tab-inactive-color  /* inactive tab text */
--hp-color            /* HP value color */
--shield-color        /* shield value color */
--hover-bg            /* row hover highlight */
--section-border      /* section divider lines */
```

### Storage

Theme preference stored as a Foundry client setting:

```javascript
game.settings.register("swse", "sheetTheme", {
  name: "Sheet Theme",
  hint: "Visual theme for character sheets.",
  scope: "client",
  config: false,  // controlled from sheet Settings tab
  type: String,
  default: "dark-scifi",
  choices: {
    "dark-scifi": "Dark Sci-Fi",
    "clean-neutral": "Clean & Neutral",
    "dark-minimal": "Dark Minimal"
  }
});
```

### File Structure

- `src/styles/themes/dark-scifi.css`
- `src/styles/themes/clean-neutral.css`
- `src/styles/themes/dark-minimal.css`
- `src/styles/sheet.css` — layout styles using the custom properties

---

## Data Flow

1. Foundry calls `SWSECharacterSheet._renderHTML()` on actor changes
2. Host passes the actor document to the root Svelte component
3. Svelte components read `actor.system.*` for display values (abilities, skills, defenses, health, etc. — all computed by the Phase 1 logic functions in `prepareDerivedData()`)
4. User edits (HP changes, skill training, ability scores) call `actor.update({ "system.path.to.field": newValue })`
5. Foundry re-renders the sheet, Svelte reactively updates

### Rolls

Clickable elements (ability scores, skills, defenses) dispatch rolls using Foundry's `Roll` API:

```javascript
const roll = new Roll("1d20 + @mod", { mod: value });
await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }) });
```

### Item Operations

- **Add:** Drag from compendium or sidebar onto sheet (handled by Foundry's drop infrastructure)
- **Edit:** Click item name to open its sheet
- **Delete:** Click delete button, confirm dialog
- **Equip/Unequip:** Toggle button calls `item.update({ "system.equipped": !equipped })`

---

## File Inventory

```
src/
├── sheets/
│   ├── actor/
│   │   ├── SWSECharacterSheet.mjs      # ApplicationV2 host
│   │   ├── CharacterSheet.svelte       # Root component
│   │   └── tabs/
│   │       ├── SummaryTab.svelte
│   │       ├── SkillsTab.svelte
│   │       ├── InventoryTab.svelte
│   │       ├── FeatsTab.svelte
│   │       ├── ForceTab.svelte
│   │       ├── TraitsTab.svelte
│   │       ├── DetailsTab.svelte
│   │       └── SettingsTab.svelte
│   └── components/
│       ├── AbilityScore.svelte
│       ├── DefenseBlock.svelte
│       ├── HealthBar.svelte
│       ├── ShieldDisplay.svelte
│       ├── SkillRow.svelte
│       ├── ItemList.svelte
│       ├── ResourceBox.svelte
│       └── TabBar.svelte
├── styles/
│   ├── sheet.css                       # Layout styles (uses custom properties)
│   ├── themes/
│   │   ├── dark-scifi.css
│   │   ├── clean-neutral.css
│   │   └── dark-minimal.css
│   └── swse.css                        # Existing — imports sheet.css and themes
```

---

## Registration

In `src/swse.mjs`, during the `init` hook:

```javascript
import { SWSECharacterSheet } from "./sheets/actor/SWSECharacterSheet.mjs";

// Inside Hooks.once("init", () => { ... })
Actors.registerSheet("swse", SWSECharacterSheet, {
  types: ["character", "npc"],
  makeDefault: true,
  label: "SWSE Character Sheet",
});
```

---

## Out of Scope

- Item sheets (Phase 3)
- Vehicle / Computer sheets (Phase 4)
- Attack system and chat cards (Phase 5)
- Compendium browser (Phase 6)
- Drag-and-drop reordering within lists
- Sheet popout / window-in-window
