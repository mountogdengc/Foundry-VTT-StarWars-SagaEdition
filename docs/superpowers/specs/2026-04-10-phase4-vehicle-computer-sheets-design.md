# Phase 4: Vehicle & Computer Sheets Design Spec

**Date:** 2026-04-10
**Scope:** Vehicle/NPC-Vehicle and Computer actor sheet UI for the SWSE Foundry VTT v14 rebuild.

---

## Overview

Add two new actor sheets: a tabbed Vehicle sheet (for `vehicle` and `npc-vehicle` types) and a minimal Computer sheet (for `computer` type). Both follow the Phase 2 ApplicationV2 + Svelte 5 pattern and reuse existing shared components and the theme system.

---

## Vehicle Sheet

**Actor types:** `vehicle`, `npc-vehicle`

**Window:** 720 x 700, resizable

### Tab Structure (6 tabs)

| Tab | Content |
|-----|---------|
| **Summary** | Portrait, name, vehicle class summary, size, HP, shields, speed (base/swim/climb/fly), abilities (6), defenses (ref/fort/will from schema + DT + DR), BAB, grapple |
| **Skills** | 7 vehicle skills: Initiative, Mechanics, Perception, Pilot, Ride, Stealth, Use Computer. Trained toggle, total modifier. |
| **Inventory** | Equipped/unequipped vehicle systems, weapons, armor, upgrades. |
| **Crew** | Linked actors from `system.actorLinks` — displays name, position (pilot/copilot/gunner/passenger), slot. Add/remove crew links. |
| **Details** | Biography (rich text display), CL, size, reach, speed special, fight space, special qualities, notes. |
| **Settings** | Active effects list with enable/disable. Theme selector. |

### Summary Tab Layout

Same top-down flow as character sheet:

```
┌─────────────────────────────────────────────────┐
│ [Portrait]  Name / Size / CL                    │
│             Speed: 6 / Swim: 1.5    [HP] [Shld] │
├─────────────────────────────────────────────────┤
│  STR   DEX   CON   INT   WIS   CHA             │
├─────────────────────────────────────────────────┤
│  REFLEX  FORTITUDE  WILL  │  DT   DR            │
├─────────────────────────────────────────────────┤
│  BAB   GRAPPLE   FORCE PTS   DESTINY   DARK    │
└─────────────────────────────────────────────────┘
```

### Defense Display

Vehicle defenses come from schema fields (`system.defense.ref.value`, `system.defense.fort.value`, `system.defense.will.value`, `system.defense.dt.value`, `system.defense.dr`) rather than computed derived data. These are editable inputs for NPC-style stat blocks.

### Crew Tab

Displays `system.actorLinks` array. Each entry has:
- `uuid` — reference to the linked actor
- `position` — crew role (pilot, copilot, gunner, passenger, etc.)
- `slot` — optional slot identifier

The crew tab shows each link with the actor's name (resolved from UUID), position, and a remove button. An add button opens a dialog or accepts drag-drop of actor tokens.

---

## Computer Sheet

**Actor type:** `computer`

**Window:** 480 x 400, resizable

**Single panel, no tabs:**
- Header: image, name, type badge ("Computer")
- Content: rich text display of `system.content`
- Cursor: display/edit `system.cursor`
- Attributes: display `system.attributes` as key/value pairs

---

## Shared Components Reused

From Phase 2: `AbilityScore`, `DefenseBlock`, `HealthBar`, `ShieldDisplay`, `SkillRow`, `ItemList`, `TabBar`, `ResourceBox`

From Phase 3: `ItemHeader` (for computer sheet header)

### New Component

`CrewList.svelte` — displays and manages `actorLinks` array. Shows linked actor name, position, slot. Add/remove functionality.

---

## File Inventory

```
src/sheets/
├── actor/
│   ├── SWSEVehicleSheet.mjs          # Vehicle ApplicationV2 host
│   ├── VehicleSheet.svelte           # Vehicle root (tabs)
│   ├── vehicle-tabs/
│   │   ├── VehicleSummaryTab.svelte
│   │   ├── VehicleSkillsTab.svelte
│   │   ├── VehicleInventoryTab.svelte
│   │   ├── VehicleCrewTab.svelte
│   │   ├── VehicleDetailsTab.svelte
│   │   └── VehicleSettingsTab.svelte
│   ├── SWSEComputerSheet.mjs         # Computer ApplicationV2 host
│   └── ComputerSheet.svelte          # Computer root (no tabs)
├── components/
│   └── CrewList.svelte               # New — crew link management
```

---

## Registration

In `src/swse.mjs`, during the `init` hook:

```javascript
import { SWSEVehicleSheet } from "./sheets/actor/SWSEVehicleSheet.mjs";
import { SWSEComputerSheet } from "./sheets/actor/SWSEComputerSheet.mjs";

foundry.documents.collections.Actors.registerSheet("swse", SWSEVehicleSheet, {
  types: ["vehicle", "npc-vehicle"],
  makeDefault: true,
  label: "SWSE Vehicle Sheet",
});

foundry.documents.collections.Actors.registerSheet("swse", SWSEComputerSheet, {
  types: ["computer"],
  makeDefault: true,
  label: "SWSE Computer Sheet",
});
```

---

## Out of Scope

- Attack rolls from vehicle weapons (Phase 5)
- Crew ability score substitution in vehicle skill checks (Phase 5)
- Starship combat maneuvers (Phase 5)
