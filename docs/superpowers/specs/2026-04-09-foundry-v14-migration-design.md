# Foundry VTT v14 Migration — Star Wars Saga Edition

**Date:** 2026-04-09
**System Version:** 13.0.5 → 14.0.0
**Approach:** Bottom-Up Migration (foundation first, then sheets, then features)

---

## Overview

Full migration of the Star Wars Saga Edition system from Foundry VTT v13 to v14, dropping v13 support. This includes:

- Replacing template.json schema with TypeDataModel classes
- Updating Document classes for v14 API changes (especially ActiveEffect)
- Migrating Actor and Item sheets from AppV1 to AppV2
- Replacing MeasuredTemplate usage with Scene Regions
- Cleaning up legacy API calls, jQuery, and deprecated hooks

---

## Section 1: system.json & Schema Migration

### system.json

- Update `compatibility` to `{ "minimum": 14, "verified": 14, "maximum": 14 }`
- Update `version` to `14.0.0`
- Update `manifest` and `download` URLs to the new fork (mountogdengc)
- Remove dependency on `template.json` for schema definition

### template.json Removal

The system already has `CharacterDataModel` and `VehicleDataModel` using TypeDataModel — this is a solid foundation. The remaining work:

- **Create item DataModels:** Either a single `SWSEItemDataModel` with conditional fields, or per-type models for the 25+ item types. A single base model with type-specific extensions is recommended given the shared `base`, `item`, `modifiable`, `mod`, `prerequisites`, `categories`, `health`, `source`, `mode`, and `levels` templates.
- **Create missing actor DataModel:** The `computer` actor type needs a DataModel.
- **Migrate template definitions:** Move all field definitions from template.json `templates` blocks into `defineSchema()` methods on the corresponding DataModel classes.
- **Remove template.json** once all schema is defined in code.

### DataModel Audit

- `CharacterDataModel.migrateData()` currently only handles `forcePoints` object-to-number conversion. Extend it to handle any v13→v14 data shape changes discovered during migration.
- `VehicleDataModel.prepareDerivedData()` is empty — implement or remove the override.
- The custom `SystemDataModel.mixin()` pattern (prototype method merging) should continue to work unchanged.

---

## Section 2: Document Class Updates

### ActiveEffect (Most Impactful)

These are breaking changes in v14:

| v13 | v14 | Action Required |
|-----|-----|-----------------|
| `ActiveEffect#changes` | `ActiveEffect#system#changes` | Update all reads/writes of effect changes |
| `EffectChangeData#mode` | `EffectChangeData#type` | Rename all references |
| `EffectChangeData#value` (string) | `EffectChangeData#value` (deserialized JSON) | Audit code expecting string values |
| `ActiveEffect#origin` (StringField) | `ActiveEffect#origin` (DocumentUUIDField) | Verify all effect creation passes valid UUIDs |

Files to update:
- `module/active-effect/active-effect.mjs` — SWSEActiveEffect class
- `module/active-effect/active-effect-config.mjs` — SWSEActiveEffectConfig sheet
- Any code that creates, reads, or modifies active effects

### SWSEActor

- Audit `prepareData()` and all delegate initialization for deprecated API usage.
- Check `tokenOverrides` field compatibility.
- Verify `CONFIG.Actor.dataModels` registration works the same way in v14.

### SWSEItem

- The legacy `changes` array conversion in `prepareData()` should still work but needs auditing.
- Verify embedded document handling for v14.

### SWSETokenDocument

- `detectionModes` changed to TypedObjectField — check if custom token code references this.
- `getAnimationOptions` signature changed: accepts `TokenDocument` instead of `Token`.

### Migration Framework

Implement `migration.mjs` with:
- A world setting to track the last completed migration version.
- Migration functions that run on `ready` hook when version is outdated.
- Specific migrations for:
  - ActiveEffect `changes` location (top-level → system)
  - ActiveEffect `mode` → `type` rename
  - ActiveEffect `origin` format validation
  - Any item/actor data shape changes

---

## Section 3: AppV2 Sheet Migration

### Actor Sheet

Current: `SWSEActorSheet extends foundry.appv1.sheets.ActorSheet`
Target: `SWSEActorSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2)`

Key changes:
- `static get defaultOptions()` → `static DEFAULT_OPTIONS` object + `static PARTS` definition
- `getData()` → `_prepareContext()`
- `activateListeners(html)` → action-based event handlers via `static ACTIONS` or `_onAction` pattern
- All jQuery (`$(event.currentTarget)`, `.find()`, `.click()`) → native DOM (`querySelector`, `addEventListener`, `.dataset`)

Sub-sheets that inherit from this and migrate along:
- `character-sheet.mjs`
- `npc-sheet.mjs`
- `manual-actor-sheet.mjs`
- `base-sheet.mjs`

### Item Sheet

Current: `SWSEItemSheet extends foundry.appv1.sheets.ItemSheet`
Target: `SWSEItemSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2)`

Same migration pattern as actor sheet. Likely simpler due to less interaction logic.

### ActiveEffect Sheet

Already AppV2 (`extends foundry.applications.sheets.ActiveEffectConfig`). Audit for v13→v14 API drift only.

### Handlebars Templates (~50 templates)

- Template HTML largely stays the same.
- Update any template helpers referencing deprecated APIs.
- Transition from bulk `loadTemplates()` to `PARTS`-based loading where feasible.
- Verify `registerHandlebarsHelpers()` output is v14-compatible.

### Sheet Registration

Verify `DocumentSheetConfig.registerSheet()` call syntax is unchanged in v14. Current registration in `swse.mjs` lines 89-98.

---

## Section 4: MeasuredTemplate → Scene Regions

### Current Implementation

- `SWSETemplate` (module/template/SWSETemplate.mjs) extends `foundry.canvas.placeables.MeasuredTemplate`
- Used exclusively for attack targeting:
  - Grenades → circle shape
  - Autofire → circle shape
  - Cones → cone shape
- Workflow: `Attack.placeTemplate()` → create temporary template → check token containment via `_computeShape().contains()` → `cleanupTemplates()` → return targeted actors
- Called from `Attack.targetedActors()` (attack.mjs lines 1304-1307)

### Migration Plan

- Replace `SWSETemplate` with `SWSERegionTemplate` class that creates temporary Scene Regions.
- Shape mapping: circle → Emanation region shape, cone → cone region shape.
- Token containment: switch from `_computeShape().contains()` to Region-based token detection API.
- The attack workflow stays conceptually identical — just backed by Regions instead of MeasuredTemplates.
- Remove all references to `CONFIG.MeasuredTemplate`, `canvas.scene.createEmbeddedDocuments("MeasuredTemplate", ...)`.
- The `region-effects` compendium pack (Macro type) is unrelated and unchanged.

### Risk

Scene Regions API may behave differently for temporary preview/targeting workflows compared to MeasuredTemplates. This area needs iterative testing against the v14 instance. May need to explore whether temporary regions can be created/destroyed without persisting to the scene, or if an alternative targeting approach is needed.

---

## Section 5: Cleanup & Final Steps

### Legacy API Replacements

| Old | New |
|-----|-----|
| `mergeObject()` | `foundry.utils.mergeObject()` |
| `$(event.currentTarget)` | `event.currentTarget` (native DOM) |
| `.find('.selector')` (jQuery) | `.querySelector('.selector')` |
| `.click(handler)` (jQuery) | `.addEventListener('click', handler)` |
| `.data()` (jQuery) | `.dataset` |

### Hook Audit

- `renderChatMessageHTML` — verify correct for v14 (was already updated from `renderChatMessage` in a prior commit)
- `renderApplication` — may need updating for AppV2 applications
- `hotbarDrop` — confirm still supported
- `updateCombat` — confirm signature unchanged
- Third-party hooks (`dragRuler.ready`, `polyglot.init`) — keep as-is

### system.json Final

- Version: `14.0.0`
- Compatibility: `{ "minimum": 14, "verified": 14, "maximum": 14 }`
- URLs: point to `mountogdengc` fork

### Validation & Testing

- Load the system in Foundry VTT v14
- Create and edit actors (character, NPC, vehicle)
- Create and edit items (weapons, feats, force powers, etc.)
- Test attack workflows including area-of-effect targeting
- Test active effect creation and application
- Verify all compendium packs load and display correctly
- Test combat tracker and initiative
- Test module integrations (drag-ruler, polyglot) if installed

---

## Migration Order

1. **Schema** — TypeDataModel for items, computer actor type, remove template.json
2. **Documents** — ActiveEffect changes, migration framework, Actor/Item/Token audits
3. **Sheets** — AppV2 migration for Actor and Item sheets, jQuery removal
4. **Templates** — MeasuredTemplate → Scene Regions
5. **Cleanup** — Legacy APIs, hooks, system.json finalization, testing
