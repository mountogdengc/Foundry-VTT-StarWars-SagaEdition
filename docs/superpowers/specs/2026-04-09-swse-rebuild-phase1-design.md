# SWSE Rebuild Phase 1: Project Scaffold + DataModels + Document Classes

**Date:** 2026-04-09
**Approach:** Ground-up rebuild using AppV2 + Svelte 5 + Vite, following the Battletech system as reference architecture.
**Scope:** Phase 1 only — scaffold, data layer, and game logic. No UI/sheets (Phase 2).

---

## Overview

Rebuild the Star Wars Saga Edition Foundry VTT system from scratch for v14, replacing the legacy AppV1 + Handlebars codebase with a modern Vite + Svelte 5 stack. Phase 1 establishes the foundation: project scaffold, all DataModels, Document classes, derived data logic, config, migration framework, and entry point. The system will use Foundry's default sheets until Phase 2 adds Svelte components.

---

## Section 1: Project Scaffold

### Build Tooling
- **Vite 6** with `@sveltejs/vite-plugin-svelte` — builds `src/swse.mjs` → `dist/swse.js` + `dist/swse.css`
- **Svelte 5** — not used in Phase 1 code, but installed and configured for Phase 2
- **Plain CSS** with custom properties (no Tailwind output — breaks Foundry icons)
- Matches Battletech's `vite.config.mjs` pattern: single ES module library output, sourcemaps enabled

### Directory Structure
```
StarWars-SagaEdition/
├── dist/                          # Vite build output
│   ├── swse.js
│   └── swse.css
├── src/
│   ├── swse.mjs                   # Entry point
│   ├── config.mjs                 # Game constants, abilities, skills, etc.
│   ├── migration.mjs              # Version-tracked migration framework
│   ├── styles/
│   │   └── swse.css               # System CSS
│   ├── data-models/
│   │   ├── actor/
│   │   │   ├── CharacterData.mjs
│   │   │   ├── VehicleData.mjs
│   │   │   └── ComputerData.mjs
│   │   └── item/
│   │       ├── fields.mjs         # Shared field group definitions
│   │       ├── SimpleItemData.mjs
│   │       ├── WeaponData.mjs
│   │       ├── ArmorData.mjs
│   │       ├── EquipmentData.mjs
│   │       ├── BeastAttackData.mjs
│   │       ├── TalentData.mjs
│   │       ├── ClassData.mjs
│   │       ├── SpeciesData.mjs
│   │       ├── TemplateItemData.mjs
│   │       ├── UpgradeData.mjs
│   │       └── LanguageData.mjs
│   ├── documents/
│   │   ├── SWSEActor.mjs
│   │   ├── SWSEItem.mjs
│   │   └── SWSEActiveEffect.mjs
│   ├── logic/
│   │   ├── abilities.mjs
│   │   ├── defenses.mjs
│   │   ├── skills.mjs
│   │   ├── health.mjs
│   │   ├── shields.mjs
│   │   └── traits.mjs
│   ├── util/
│   │   ├── attribute-helper.mjs
│   │   ├── util.mjs
│   │   ├── prerequisite.mjs
│   │   └── simple-cache.mjs
│   └── sheets/                    # Empty — populated in Phase 2
├── packs/                         # Existing compendium packs (kept as-is)
├── lang/
│   └── en.json                    # Existing localization (kept as-is)
├── icon/                          # Existing icons (kept as-is)
├── system.json
├── package.json
└── vite.config.mjs
```

### Files Removed (old codebase)
- `module/` — entire directory (old system code)
- `module_test/` — old Quench tests
- `templates/` — Handlebars templates
- `scss/` — old SCSS sources
- `css/` — old compiled CSS
- `template.json` — replaced by TypeDataModel classes
- `gulpfile.js` — replaced by Vite

### system.json Changes
- `version`: `"14.0.0"`
- `compatibility`: `{ "minimum": 14, "verified": 14, "maximum": 14 }`
- `esmodules`: `["dist/swse.js"]`
- `styles`: `["dist/swse.css"]`
- Add `documentTypes` block declaring all actor and item types
- Update `url`, `manifest`, `download` to `mountogdengc` fork
- Remove `scripts` array (empty, unused)

---

## Section 2: Actor DataModels

Three DataModel classes covering 5 actor types:

### CharacterData (character, npc)
- Schema ports directly from existing `CharacterDataModel.defineSchema()`
- Fields: abilities (6 scores), health, shields, toggles, overrides, actorLinks, traits (xp, baseAttack, grapple, forcePoints, destinyPoints, darkSideScore), skills (23 character skills), details (biography, description, gender, etc.), settings (isNPC, ignorePrerequisites, abilityGeneration), credits
- `prepareDerivedData()` calls composition functions:
  1. `prepareTraitsDerivedData(this)` — level, classSummary, classLevel, traits
  2. `prepareAbilityDerivedData(this)` — ability modifiers and bonuses
  3. `prepareSkillDerivedData(this)` — skill values with all bonuses
  4. `prepareShieldsDerivedData(this)` — shield rating and status
  5. `prepareDefenseDerivedData(this)` — Reflex/Fort/Will defenses
  6. `prepareHealthDerivedData(this)` — max HP with all modifiers
- `migrateData()` handles forcePoints object-to-number conversion
- Level-up validation logic (available feats, talents, ability bonuses) stays in CharacterData as private methods — it's character-specific, not shared

### VehicleData (vehicle, npc-vehicle)
- Schema ports from existing `VehicleDataModel.defineSchema()`
- Fields: abilities, health, shields, toggles, overrides, actorLinks, NPC-style defense (ref/fort/will/dt/dr), NPC skills (7 vehicle skills), NPC details (extended fields), NPC traits (level, cl, speed, size, reach)
- `prepareDerivedData()` calls the same composition functions where applicable, with vehicle-specific variants where logic differs

### ComputerData (computer)
- Minimal schema: content (HTMLField), cursor (StringField), attributes (ObjectField)
- No `prepareDerivedData()` — just stores data

---

## Section 3: Item DataModels

10 DataModel classes covering 30 item types (after consolidation).

### Shared Field Definitions (fields.mjs)
Reusable field group getters, each returning an object of `foundry.data.fields` instances:
- `BaseFields.common` — finalName, description, textDescription, sourceString, attributes, changes, choices, modes, providedItems, payload, buildInstructions
- `PhysicalFields.common` — cost, weight, availability, size, type, subtype, quantity
- `ModifiableFields.common` — items array
- `ModFields.common` — hasItemOwner
- `PrerequisiteFields.common` — prerequisite (nullable)
- `CategoryFields.common` — categories array
- `SourceFields.common` — supplier, possibleProviders, isSupplied
- `ModeFields.common` — activeModes array
- `LevelFields.common` — levels array
- `ItemHealthFields.common` — empty (placeholder for class HP tracking)

### DataModel → Type Mapping

| DataModel | Types | Extra Fields |
|-----------|-------|-------------|
| SimpleItemData | trait, feat, beastSense, beastType, beastQuality, forcePower, forceSecret, forceRegimen, forceTechnique, starShipManeuver, affiliation, background, destiny, classFeature, hazard, implant, droid system, vehicleSystem, vehicleBaseType | base + categories + source + prerequisites |
| WeaponData | weapon | + physical + modifiable + modes + weapon (ObjectField) |
| ArmorData | armor | + physical + modifiable + armorType (StringField) |
| EquipmentData | equipment | + physical + modifiable + equipment (ObjectField) |
| BeastAttackData | beastAttack | + physical + modifiable + modes |
| TalentData | talent | + talentTree, talentTreeSource, talentTreeUrl, bonusTalentTree (StringFields) |
| ClassData | class | + health + levels |
| SpeciesData | species | + traits (ArrayField) |
| TemplateItemData | template | + mod |
| UpgradeData | upgrade | + physical + mod + upgrade (ObjectField) |
| LanguageData | language | base only |

### Consolidated Types
- `starshipManeuver` merged into `starShipManeuver` — migration renames existing data
- `vehicleTemplate` merged into `vehicleBaseType` — migration renames existing data

---

## Section 4: Document Classes

### SWSEActor (extends Actor)
Ported from existing `module/actor/actor.mjs`:
- `prepareData()` — initializes delegates (AttackDelegate, WeightDelegate, CrewDelegate, AmmunitionDelegate)
- Core game methods: `applyDamage()`, `applyHealing()`, `resolveFeats()`, `_explodeFeatNames()`, size handling
- `formulaFunctions` Map for custom roll functions
- Drops all jQuery-dependent and sheet-specific code

### SWSEItem (extends Item)
Ported from existing `module/item/item.mjs`:
- `prepareData()` — changes array normalization, quantity coercion, ammunition delegate
- `prepareFeatData()` for feat-specific logic
- `canUserModify()` — prevents system compendium pack edits
- `possibleProviders` getter
- `displayName` getter

### SWSEActiveEffect (extends ActiveEffect)
Ported from existing `module/active-effect/active-effect.mjs`, updated for v14:
- Custom `transfer` property handling
- `actions` getter for action generation
- Link/reciprocal effect management
- v14 changes: reads `system.changes` instead of top-level `changes`, uses `type` instead of `mode`, `origin` is DocumentUUIDField

---

## Section 5: Logic Functions

Pure functions in `src/logic/`, each exported and called explicitly by DataModel `prepareDerivedData()`:

| File | Exports | Ported From |
|------|---------|-------------|
| `abilities.mjs` | `prepareAbilityDerivedData(system)` | `AbilityFunctions._prepareAbilityDerivedData()` |
| `defenses.mjs` | `prepareDefenseDerivedData(system)` | `DefenseFunctions._prepareDefenseDerivedData()` |
| `skills.mjs` | `prepareSkillDerivedData(system)` | `SkillFunctions._prepareSkillDerivedData()` |
| `health.mjs` | `prepareHealthDerivedData(system)` | `HealthFunctions._prepareHealthDerivedData()` |
| `shields.mjs` | `prepareShieldsDerivedData(system)` | `ShieldFunctions._prepareShieldsDerivedData()` |
| `traits.mjs` | `prepareTraitsDerivedData(system)` | `TraitsFunctions._prepareCharacterTraitsDerivedData()` |

Each function receives the DataModel instance (`this` in the old code becomes the `system` parameter). Internal logic stays the same — these are calculation functions, not framework code.

### Config (`src/config.mjs`)
Consolidates `common/config.mjs` + `common/constants.mjs`:
- Ability names, short labels, and score-to-modifier mapping
- Defense keys
- Skill definitions (name, ability, trainedOnly, armorPenalty) for both character and vehicle
- Size array and size modifiers
- Combat ranges
- Status effects configuration
- Ability point buy costs

### Utilities (`src/util/`)
Ported as-is from existing code:
- `attribute-helper.mjs` — `getInheritableAttribute()` (critical dependency, used across all logic)
- `util.mjs` — `resolveExpression()`, `toNumber()`, `unique()`, `increaseDieSize()`, etc.
- `prerequisite.mjs` — `meetsPrerequisites()`, `formatPrerequisites()`
- `simple-cache.mjs` — `SimpleCache` class

---

## Section 6: Migration & Entry Point

### Migration Framework (`src/migration.mjs`)
- Version tracked via `swse.systemMigrationVersion` world setting
- Runs on `ready` hook, GM only
- Shows notification during migration, success/error notification when complete
- v14 migrations:
  - ActiveEffect `changes` → `system.changes`
  - ActiveEffect `mode` → `type` rename
  - ActiveEffect `origin` → DocumentUUIDField format
  - Item `changes` object-to-array normalization
  - `starshipManeuver` type → `starShipManeuver`
  - `vehicleTemplate` type → `vehicleBaseType`
- Processes: world actors, world items, world compendium packs (skips system packs)

### Entry Point (`src/swse.mjs`)
```
Hooks.once("init"):
  1. CONFIG.SWSE = SWSE config
  2. Register Actor DataModels in CONFIG.Actor.dataModels
  3. Register Item DataModels in CONFIG.Item.dataModels
  4. Register Document classes (CONFIG.Actor/Item/ActiveEffect.documentClass)
  5. Register system settings
  6. Initialize status effects
  7. Register sheets (Foundry defaults for Phase 1)

Hooks.once("ready"):
  1. Run migrateWorld()
  2. Initialize compendium indices
```

### Phase 1 Testability
With no custom sheets, Foundry will render default document sheets. This is sufficient to:
- Create and inspect actors/items of all types
- Verify DataModel schema validation
- Confirm `prepareDerivedData()` calculations via browser console
- Load and browse all 47 compendium packs
- Test migration on existing world data
- Verify ActiveEffect behavior

---

## Phase Roadmap (for context)

- **Phase 1** (this spec): Scaffold + DataModels + Documents + Logic
- **Phase 2**: Character sheet (Svelte — abilities, skills, defenses, health, equipment)
- **Phase 3**: Item sheets (Svelte — one per major item group)
- **Phase 4**: NPC/Vehicle/Computer sheets
- **Phase 5**: Attack system, area targeting (Scene Regions), chat cards
- **Phase 6**: Compendium browser, settings UI, module integrations (drag-ruler, polyglot)
