# Phase 1: Schema Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace template.json schema definitions with TypeDataModel classes and update system.json for Foundry VTT v14.

**Architecture:** Create item field template helpers mirroring the existing actor pattern (CommonActorData, AbilityFields, etc.), compose them into DataModel classes using the existing SystemDataModel.mixin() pattern, register them in CONFIG.Item.dataModels, create a ComputerDataModel for the computer actor type, implement a migration framework, and remove template.json.

**Tech Stack:** Foundry VTT v14 API, foundry.abstract.TypeDataModel, foundry.data.fields

---

## File Structure

### New Files
- `module/item/data/fields.mjs` — Item field template definitions (BaseFields, PhysicalFields, ModFields, etc.)
- `module/item/data/base-item-data.mjs` — Base item DataModel using SystemDataModel.mixin()
- `module/item/data/physical-item-data.mjs` — DataModel for weapon, armor, equipment, beastAttack
- `module/item/data/mod-item-data.mjs` — DataModel for template, vehicleTemplate, upgrade
- `module/item/data/class-item-data.mjs` — DataModel for class
- `module/item/data/species-item-data.mjs` — DataModel for species
- `module/item/data/talent-item-data.mjs` — DataModel for talent
- `module/item/data/weapon-item-data.mjs` — DataModel for weapon (extends physical with weapon-specific fields)
- `module/item/data/armor-item-data.mjs` — DataModel for armor (extends physical with armorType)
- `module/item/data/equipment-item-data.mjs` — DataModel for equipment (extends physical with equipment field)
- `module/item/data/upgrade-item-data.mjs` — DataModel for upgrade (extends mod with upgrade field)
- `module/actor/data/computerdata.mjs` — DataModel for computer actor type

### Modified Files
- `system.json` — Update version, compatibility, URLs
- `module/swse.mjs` — Register all new DataModels in CONFIG
- `module/migration.mjs` — Implement migration framework
- `template.json` — Reduce to type declarations only, then remove

---

### Task 1: Update system.json for v14

**Files:**
- Modify: `system.json`

- [ ] **Step 1: Update system.json compatibility and version**

Open `system.json` and make these changes:

```json
{
  "id": "swse",
  "title": "Star Wars: Saga Edition",
  "description": "The Star Wars: Saga Edition system for FoundryVTT!",
  "version": "14.0.0",
  "compatibility": {
    "minimum": 14,
    "verified": 14,
    "maximum": 14
  },
```

Also update the `url`, `manifest`, and `download` fields to point to the new fork:

```json
  "url": "https://github.com/mountogdengc/Foundry-VTT-StarWars-SagaEdition",
  "manifest": "https://raw.githubusercontent.com/mountogdengc/Foundry-VTT-StarWars-SagaEdition/main/system.json",
  "download": "https://github.com/mountogdengc/Foundry-VTT-StarWars-SagaEdition/archive/refs/tags/14.0.0.zip",
```

- [ ] **Step 2: Commit**

```bash
git add system.json
git commit -m "chore: update system.json for Foundry VTT v14 compatibility"
```

---

### Task 2: Create Item Field Templates

**Files:**
- Create: `module/item/data/fields.mjs`

- [ ] **Step 1: Create the item data directory**

```bash
mkdir -p module/item/data
```

- [ ] **Step 2: Create fields.mjs with all item template field definitions**

This file mirrors the pattern of `module/actor/data/templates/abilities.mjs` etc. — static field group getters that return objects of foundry.data.fields instances. Each group corresponds to one template block from template.json.

```javascript
const fields = foundry.data.fields;

/**
 * Shared field definitions for item data models.
 * Each static getter returns a group of fields corresponding to a template.json template block.
 */

// "base" template — shared by ALL item types
export class BaseFields {
    static get common() {
        return {
            finalName: new fields.StringField({ initial: "", label: "Final Name" }),
            description: new fields.HTMLField({ initial: "", label: "Description" }),
            textDescription: new fields.StringField({ initial: "", label: "Text Description" }),
            sourceString: new fields.StringField({ initial: "", label: "Source" }),
            attributes: new fields.ObjectField({ label: "Attributes" }),
            changes: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Changes" }),
            choices: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Choices" }),
            modes: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Modes" }),
            providedItems: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Provided Items" }),
            payload: new fields.StringField({ initial: "", label: "Payload" }),
            buildInstructions: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Build Instructions" }),
        };
    }
}

// "item" template — physical items with cost, weight, etc.
export class PhysicalFields {
    static get common() {
        return {
            cost: new fields.StringField({ initial: "", label: "Cost" }),
            weight: new fields.StringField({ initial: "", label: "Weight" }),
            availability: new fields.StringField({ initial: "", label: "Availability" }),
            size: new fields.StringField({ initial: "", label: "Size" }),
            type: new fields.StringField({ initial: "", label: "Type" }),
            subtype: new fields.StringField({ initial: "", label: "Subtype" }),
            quantity: new fields.NumberField({ initial: 1, integer: true, label: "Quantity" }),
        };
    }
}

// "modifiable" template — items that can contain sub-items
export class ModifiableFields {
    static get common() {
        return {
            items: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Items" }),
        };
    }
}

// "mod" template — items that can be owned by other items
export class ModFields {
    static get common() {
        return {
            hasItemOwner: new fields.BooleanField({ initial: false, label: "Has Item Owner" }),
        };
    }
}

// "prerequisites" template
export class PrerequisiteFields {
    static get common() {
        return {
            prerequisite: new fields.ObjectField({ nullable: true, initial: null, label: "Prerequisite" }),
        };
    }
}

// "categories" template
export class CategoryFields {
    static get common() {
        return {
            categories: new fields.ArrayField(new fields.StringField(), { initial: [], label: "Categories" }),
        };
    }
}

// "source" template — supplier/provider tracking
export class SourceFields {
    static get common() {
        return {
            supplier: new fields.ObjectField({ label: "Supplier" }),
            possibleProviders: new fields.ArrayField(new fields.StringField(), { initial: [], label: "Possible Providers" }),
            isSupplied: new fields.BooleanField({ initial: false, label: "Is Supplied" }),
        };
    }
}

// "mode" template — items with attack/activation modes
export class ModeFields {
    static get common() {
        return {
            activeModes: new fields.ArrayField(new fields.StringField(), { initial: [], label: "Active Modes" }),
        };
    }
}

// "levels" template — class levels
export class LevelFields {
    static get common() {
        return {
            levels: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Levels" }),
        };
    }
}

// "health" template — empty in template.json, placeholder for class HP tracking
export class ItemHealthFields {
    static get common() {
        return {};
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add module/item/data/fields.mjs
git commit -m "feat: add item field template definitions for TypeDataModel migration"
```

---

### Task 3: Create Base Item DataModel (SimpleItemDataModel)

This model covers item types that use: base + categories + source + prerequisites.
Types: trait, feat, beastSense, beastType, beastQuality, forcePower, forceSecret, forceRegimen, forceTechnique, starShipManeuver, affiliation, background, destiny, classFeature, starshipManeuver

**Files:**
- Create: `module/item/data/base-item-data.mjs`

- [ ] **Step 1: Create base-item-data.mjs**

```javascript
import SystemDataModel from "../../actor/data/abstract.mjs";
import {
    BaseFields,
    CategoryFields,
    SourceFields,
    PrerequisiteFields,
} from "./fields.mjs";

/**
 * Data model for simple item types that use base + categories + source + prerequisites templates.
 * Covers: trait, feat, beastSense, beastType, beastQuality, forcePower, forceSecret,
 * forceRegimen, forceTechnique, starShipManeuver, affiliation, background, destiny,
 * classFeature, starshipManeuver
 */
export class SimpleItemDataModel extends SystemDataModel {
    static defineSchema() {
        return {
            ...BaseFields.common,
            ...CategoryFields.common,
            ...SourceFields.common,
            ...PrerequisiteFields.common,
        };
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add module/item/data/base-item-data.mjs
git commit -m "feat: add SimpleItemDataModel for basic item types"
```

---

### Task 4: Create Language Item DataModel

Language only uses the "base" template — the simplest item type.

**Files:**
- Create: `module/item/data/language-item-data.mjs`

- [ ] **Step 1: Create language-item-data.mjs**

```javascript
import SystemDataModel from "../../actor/data/abstract.mjs";
import { BaseFields } from "./fields.mjs";

/**
 * Data model for language items. Uses only the base template.
 */
export class LanguageItemDataModel extends SystemDataModel {
    static defineSchema() {
        return {
            ...BaseFields.common,
        };
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add module/item/data/language-item-data.mjs
git commit -m "feat: add LanguageItemDataModel"
```

---

### Task 5: Create Physical Item DataModels

These cover items with cost/weight/physical properties. Each has type-specific extra fields.

**Files:**
- Create: `module/item/data/weapon-item-data.mjs`
- Create: `module/item/data/armor-item-data.mjs`
- Create: `module/item/data/equipment-item-data.mjs`
- Create: `module/item/data/beast-attack-item-data.mjs`

- [ ] **Step 1: Create weapon-item-data.mjs**

Weapon uses: base + item + categories + modifiable + source + mode + weapon-specific field.

```javascript
import SystemDataModel from "../../actor/data/abstract.mjs";
import {
    BaseFields,
    PhysicalFields,
    CategoryFields,
    ModifiableFields,
    SourceFields,
    ModeFields,
} from "./fields.mjs";

const fields = foundry.data.fields;

/**
 * Data model for weapon items.
 * Templates: base, item, categories, modifiable, source, mode
 * Extra: weapon object
 */
export class WeaponItemDataModel extends SystemDataModel {
    static defineSchema() {
        return {
            ...BaseFields.common,
            ...PhysicalFields.common,
            ...CategoryFields.common,
            ...ModifiableFields.common,
            ...SourceFields.common,
            ...ModeFields.common,
            weapon: new fields.ObjectField({ label: "Weapon Data" }),
        };
    }
}
```

- [ ] **Step 2: Create armor-item-data.mjs**

Armor uses: base + item + categories + modifiable + source + armorType field.

```javascript
import SystemDataModel from "../../actor/data/abstract.mjs";
import {
    BaseFields,
    PhysicalFields,
    CategoryFields,
    ModifiableFields,
    SourceFields,
} from "./fields.mjs";

const fields = foundry.data.fields;

/**
 * Data model for armor items.
 * Templates: base, item, categories, modifiable, source
 * Extra: armorType
 */
export class ArmorItemDataModel extends SystemDataModel {
    static defineSchema() {
        return {
            ...BaseFields.common,
            ...PhysicalFields.common,
            ...CategoryFields.common,
            ...ModifiableFields.common,
            ...SourceFields.common,
            armorType: new fields.StringField({ initial: "", label: "Armor Type" }),
        };
    }
}
```

- [ ] **Step 3: Create equipment-item-data.mjs**

Equipment uses: base + item + categories + modifiable + source + equipment field.

```javascript
import SystemDataModel from "../../actor/data/abstract.mjs";
import {
    BaseFields,
    PhysicalFields,
    CategoryFields,
    ModifiableFields,
    SourceFields,
} from "./fields.mjs";

const fields = foundry.data.fields;

/**
 * Data model for equipment items.
 * Templates: base, item, categories, modifiable, source
 * Extra: equipment object
 */
export class EquipmentItemDataModel extends SystemDataModel {
    static defineSchema() {
        return {
            ...BaseFields.common,
            ...PhysicalFields.common,
            ...CategoryFields.common,
            ...ModifiableFields.common,
            ...SourceFields.common,
            equipment: new fields.ObjectField({ label: "Equipment Data" }),
        };
    }
}
```

- [ ] **Step 4: Create beast-attack-item-data.mjs**

Beast attack uses: base + item + categories + modifiable + source + mode (same as weapon but no weapon field).

```javascript
import SystemDataModel from "../../actor/data/abstract.mjs";
import {
    BaseFields,
    PhysicalFields,
    CategoryFields,
    ModifiableFields,
    SourceFields,
    ModeFields,
} from "./fields.mjs";

/**
 * Data model for beast attack items.
 * Templates: base, item, categories, modifiable, source, mode
 */
export class BeastAttackItemDataModel extends SystemDataModel {
    static defineSchema() {
        return {
            ...BaseFields.common,
            ...PhysicalFields.common,
            ...CategoryFields.common,
            ...ModifiableFields.common,
            ...SourceFields.common,
            ...ModeFields.common,
        };
    }
}
```

- [ ] **Step 5: Commit**

```bash
git add module/item/data/weapon-item-data.mjs module/item/data/armor-item-data.mjs module/item/data/equipment-item-data.mjs module/item/data/beast-attack-item-data.mjs
git commit -m "feat: add DataModels for physical item types (weapon, armor, equipment, beastAttack)"
```

---

### Task 6: Create Mod Item DataModels

Items that can be owned by other items (template, vehicleTemplate, upgrade).

**Files:**
- Create: `module/item/data/mod-item-data.mjs`
- Create: `module/item/data/upgrade-item-data.mjs`

- [ ] **Step 1: Create mod-item-data.mjs**

Template type uses: base + mod. VehicleTemplate uses: base + item + mod.

```javascript
import SystemDataModel from "../../actor/data/abstract.mjs";
import {
    BaseFields,
    PhysicalFields,
    ModFields,
} from "./fields.mjs";

/**
 * Data model for template items (base + mod).
 */
export class TemplateItemDataModel extends SystemDataModel {
    static defineSchema() {
        return {
            ...BaseFields.common,
            ...ModFields.common,
        };
    }
}

/**
 * Data model for vehicleTemplate items (base + item + mod).
 */
export class VehicleTemplateItemDataModel extends SystemDataModel {
    static defineSchema() {
        return {
            ...BaseFields.common,
            ...PhysicalFields.common,
            ...ModFields.common,
        };
    }
}
```

- [ ] **Step 2: Create upgrade-item-data.mjs**

Upgrade uses: base + item + mod + upgrade field.

```javascript
import SystemDataModel from "../../actor/data/abstract.mjs";
import {
    BaseFields,
    PhysicalFields,
    ModFields,
} from "./fields.mjs";

const fields = foundry.data.fields;

/**
 * Data model for upgrade items.
 * Templates: base, item, mod
 * Extra: upgrade object
 */
export class UpgradeItemDataModel extends SystemDataModel {
    static defineSchema() {
        return {
            ...BaseFields.common,
            ...PhysicalFields.common,
            ...ModFields.common,
            upgrade: new fields.ObjectField({ label: "Upgrade Data" }),
        };
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add module/item/data/mod-item-data.mjs module/item/data/upgrade-item-data.mjs
git commit -m "feat: add DataModels for mod item types (template, vehicleTemplate, upgrade)"
```

---

### Task 7: Create Class Item DataModel

Class uses: base + prerequisites + health + levels.

**Files:**
- Create: `module/item/data/class-item-data.mjs`

- [ ] **Step 1: Create class-item-data.mjs**

```javascript
import SystemDataModel from "../../actor/data/abstract.mjs";
import {
    BaseFields,
    PrerequisiteFields,
    ItemHealthFields,
    LevelFields,
} from "./fields.mjs";

/**
 * Data model for class items.
 * Templates: base, prerequisites, health, levels
 */
export class ClassItemDataModel extends SystemDataModel {
    static defineSchema() {
        return {
            ...BaseFields.common,
            ...PrerequisiteFields.common,
            ...ItemHealthFields.common,
            ...LevelFields.common,
        };
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add module/item/data/class-item-data.mjs
git commit -m "feat: add ClassItemDataModel"
```

---

### Task 8: Create Species and Talent Item DataModels

These have type-specific extra fields beyond their template groups.

**Files:**
- Create: `module/item/data/species-item-data.mjs`
- Create: `module/item/data/talent-item-data.mjs`

- [ ] **Step 1: Create species-item-data.mjs**

Species uses: base + categories + traits array.

```javascript
import SystemDataModel from "../../actor/data/abstract.mjs";
import {
    BaseFields,
    CategoryFields,
} from "./fields.mjs";

const fields = foundry.data.fields;

/**
 * Data model for species items.
 * Templates: base, categories
 * Extra: traits array
 */
export class SpeciesItemDataModel extends SystemDataModel {
    static defineSchema() {
        return {
            ...BaseFields.common,
            ...CategoryFields.common,
            traits: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Traits" }),
        };
    }
}
```

- [ ] **Step 2: Create talent-item-data.mjs**

Talent uses: base + prerequisites + categories + source + talent-specific fields.

```javascript
import SystemDataModel from "../../actor/data/abstract.mjs";
import {
    BaseFields,
    PrerequisiteFields,
    CategoryFields,
    SourceFields,
} from "./fields.mjs";

const fields = foundry.data.fields;

/**
 * Data model for talent items.
 * Templates: base, prerequisites, categories, source
 * Extra: talentTree, talentTreeSource, talentTreeUrl, bonusTalentTree
 */
export class TalentItemDataModel extends SystemDataModel {
    static defineSchema() {
        return {
            ...BaseFields.common,
            ...PrerequisiteFields.common,
            ...CategoryFields.common,
            ...SourceFields.common,
            talentTree: new fields.StringField({ initial: "", label: "Talent Tree" }),
            talentTreeSource: new fields.StringField({ initial: "", label: "Talent Tree Source" }),
            talentTreeUrl: new fields.StringField({ initial: "", label: "Talent Tree URL" }),
            bonusTalentTree: new fields.StringField({ initial: "", label: "Bonus Talent Tree" }),
        };
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add module/item/data/species-item-data.mjs module/item/data/talent-item-data.mjs
git commit -m "feat: add SpeciesItemDataModel and TalentItemDataModel"
```

---

### Task 9: Create Computer Actor DataModel

The computer actor type has no templates — just content, cursor, and attributes fields.

**Files:**
- Create: `module/actor/data/computerdata.mjs`

- [ ] **Step 1: Create computerdata.mjs**

```javascript
import SystemDataModel from "./abstract.mjs";

const fields = foundry.data.fields;

/**
 * Data model for computer actor type.
 * Minimal schema — content for HTML pages, cursor for navigation, attributes for computed data.
 */
export class ComputerDataModel extends SystemDataModel {
    static _systemType = "computer";

    static defineSchema() {
        return {
            content: new fields.HTMLField({ initial: "", label: "Content" }),
            cursor: new fields.StringField({ initial: "root", label: "Cursor" }),
            attributes: new fields.ObjectField({ label: "Attributes" }),
        };
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add module/actor/data/computerdata.mjs
git commit -m "feat: add ComputerDataModel for computer actor type"
```

---

### Task 10: Register All DataModels in swse.mjs

**Files:**
- Modify: `module/swse.mjs:1-85`

- [ ] **Step 1: Add imports for all new DataModels**

At the top of `module/swse.mjs`, after the existing imports (after line 24), add:

```javascript
import {ComputerDataModel} from "./actor/data/computerdata.mjs";
import {SimpleItemDataModel} from "./item/data/base-item-data.mjs";
import {LanguageItemDataModel} from "./item/data/language-item-data.mjs";
import {WeaponItemDataModel} from "./item/data/weapon-item-data.mjs";
import {ArmorItemDataModel} from "./item/data/armor-item-data.mjs";
import {EquipmentItemDataModel} from "./item/data/equipment-item-data.mjs";
import {BeastAttackItemDataModel} from "./item/data/beast-attack-item-data.mjs";
import {TemplateItemDataModel, VehicleTemplateItemDataModel} from "./item/data/mod-item-data.mjs";
import {UpgradeItemDataModel} from "./item/data/upgrade-item-data.mjs";
import {ClassItemDataModel} from "./item/data/class-item-data.mjs";
import {SpeciesItemDataModel} from "./item/data/species-item-data.mjs";
import {TalentItemDataModel} from "./item/data/talent-item-data.mjs";
```

- [ ] **Step 2: Register computer DataModel in CONFIG**

In the init hook, after line 81 (`CONFIG.Actor.dataModels["npc-vehicle"] = VehicleDataModel;`), add:

```javascript
    CONFIG.Actor.dataModels.computer = ComputerDataModel;
```

- [ ] **Step 3: Register all item DataModels in CONFIG**

After line 82 (`CONFIG.Item.documentClass = SWSEItem;`), add:

```javascript
    // Item DataModels - grouped by template composition
    // Simple items: base + categories + source + prerequisites
    CONFIG.Item.dataModels.trait = SimpleItemDataModel;
    CONFIG.Item.dataModels.feat = SimpleItemDataModel;
    CONFIG.Item.dataModels.beastSense = SimpleItemDataModel;
    CONFIG.Item.dataModels.beastType = SimpleItemDataModel;
    CONFIG.Item.dataModels.beastQuality = SimpleItemDataModel;
    CONFIG.Item.dataModels.forcePower = SimpleItemDataModel;
    CONFIG.Item.dataModels.forceSecret = SimpleItemDataModel;
    CONFIG.Item.dataModels.forceRegimen = SimpleItemDataModel;
    CONFIG.Item.dataModels.forceTechnique = SimpleItemDataModel;
    CONFIG.Item.dataModels.starShipManeuver = SimpleItemDataModel;
    CONFIG.Item.dataModels.starshipManeuver = SimpleItemDataModel;
    CONFIG.Item.dataModels.affiliation = SimpleItemDataModel;
    CONFIG.Item.dataModels.background = SimpleItemDataModel;
    CONFIG.Item.dataModels.destiny = SimpleItemDataModel;
    CONFIG.Item.dataModels.classFeature = SimpleItemDataModel;

    // Physical items: base + item + categories + modifiable + source [+ mode]
    CONFIG.Item.dataModels.weapon = WeaponItemDataModel;
    CONFIG.Item.dataModels.armor = ArmorItemDataModel;
    CONFIG.Item.dataModels.equipment = EquipmentItemDataModel;
    CONFIG.Item.dataModels.beastAttack = BeastAttackItemDataModel;

    // Mod items: base + [item +] mod
    CONFIG.Item.dataModels.template = TemplateItemDataModel;
    CONFIG.Item.dataModels.vehicleTemplate = VehicleTemplateItemDataModel;
    CONFIG.Item.dataModels.upgrade = UpgradeItemDataModel;

    // Specialized items
    CONFIG.Item.dataModels.class = ClassItemDataModel;
    CONFIG.Item.dataModels.species = SpeciesItemDataModel;
    CONFIG.Item.dataModels.talent = TalentItemDataModel;
    CONFIG.Item.dataModels.language = LanguageItemDataModel;

    // Items using SimpleItemDataModel that don't have prerequisites in template.json
    // but SimpleItemDataModel includes the field as nullable — safe to reuse
    CONFIG.Item.dataModels.hazard = SimpleItemDataModel;
    CONFIG.Item.dataModels.implant = SimpleItemDataModel;
    CONFIG.Item.dataModels["droid system"] = SimpleItemDataModel;
    CONFIG.Item.dataModels.vehicleSystem = SimpleItemDataModel;
    CONFIG.Item.dataModels.vehicleBaseType = SimpleItemDataModel;
```

- [ ] **Step 4: Commit**

```bash
git add module/swse.mjs
git commit -m "feat: register all item and computer DataModels in CONFIG"
```

---

### Task 11: Implement Migration Framework

**Files:**
- Modify: `module/migration.mjs`
- Modify: `module/swse.mjs` (ready hook)

- [ ] **Step 1: Implement migration.mjs**

Replace the stub content with a proper migration framework:

```javascript
/**
 * Migration framework for the SWSE system.
 * Tracks the last migration version in a world setting and runs
 * any migrations needed to bring data up to the current version.
 */

const CURRENT_MIGRATION_VERSION = "14.0.0";

/**
 * Determine whether a migration is needed and execute it if so.
 * Called from the "ready" hook in swse.mjs.
 */
export async function migrateWorld() {
    if (!game.user.isGM) return;

    const currentVersion = game.settings.get("swse", "systemMigrationVersion") ?? "0";

    if (foundry.utils.isNewerVersion(CURRENT_MIGRATION_VERSION, currentVersion)) {
        ui.notifications.info(`Migrating SWSE system data to version ${CURRENT_MIGRATION_VERSION}. Please be patient.`);

        try {
            if (foundry.utils.isNewerVersion("14.0.0", currentVersion)) {
                await migrateToV14();
            }

            await game.settings.set("swse", "systemMigrationVersion", CURRENT_MIGRATION_VERSION);
            ui.notifications.info(`SWSE system migration to version ${CURRENT_MIGRATION_VERSION} complete.`);
        } catch (err) {
            console.error("SWSE | Migration failed:", err);
            ui.notifications.error("SWSE system migration failed. Check the console for details.");
        }
    }
}

/**
 * Migrate data from v13 to v14.
 */
async function migrateToV14() {
    console.log("SWSE | Running v14 migration...");

    // Migrate actors
    for (const actor of game.actors) {
        try {
            const updateData = migrateActorData(actor);
            if (!foundry.utils.isEmpty(updateData)) {
                console.log(`SWSE | Migrating actor: ${actor.name}`);
                await actor.update(updateData);
            }
        } catch (err) {
            console.error(`SWSE | Failed to migrate actor ${actor.name}:`, err);
        }
    }

    // Migrate items
    for (const item of game.items) {
        try {
            const updateData = migrateItemData(item);
            if (!foundry.utils.isEmpty(updateData)) {
                console.log(`SWSE | Migrating item: ${item.name}`);
                await item.update(updateData);
            }
        } catch (err) {
            console.error(`SWSE | Failed to migrate item ${item.name}:`, err);
        }
    }

    // Migrate compendium packs
    for (const pack of game.packs) {
        if (pack.metadata.packageType !== "world") continue;
        try {
            await migrateCompendium(pack);
        } catch (err) {
            console.error(`SWSE | Failed to migrate compendium ${pack.metadata.label}:`, err);
        }
    }
}

/**
 * Migrate a single actor's data. Returns an update object or empty object.
 */
function migrateActorData(actor) {
    const updateData = {};
    const source = actor.toObject();

    // Ensure changes arrays are proper arrays (legacy object format)
    if (source.items) {
        for (const item of source.items) {
            if (item.system?.changes && !Array.isArray(item.system.changes)) {
                // This will be handled by the item's prepareData, but flag it
                console.log(`SWSE | Actor ${actor.name} has item ${item.name} with non-array changes`);
            }
        }
    }

    return updateData;
}

/**
 * Migrate a single item's data. Returns an update object or empty object.
 */
function migrateItemData(item) {
    const updateData = {};
    const source = item.toObject();

    // Convert changes from object to array if needed
    if (source.system?.changes && !Array.isArray(source.system.changes)) {
        updateData["system.changes"] = Object.values(source.system.changes);
    }

    return updateData;
}

/**
 * Migrate a compendium pack.
 */
async function migrateCompendium(pack) {
    const type = pack.metadata.type;
    if (!["Actor", "Item"].includes(type)) return;

    const documents = await pack.getDocuments();
    const updates = [];

    for (const doc of documents) {
        let updateData;
        if (type === "Actor") {
            updateData = migrateActorData(doc);
        } else if (type === "Item") {
            updateData = migrateItemData(doc);
        }
        if (!foundry.utils.isEmpty(updateData)) {
            updateData._id = doc.id;
            updates.push(updateData);
        }
    }

    if (updates.length > 0) {
        console.log(`SWSE | Migrating ${updates.length} documents in compendium ${pack.metadata.label}`);
        await pack.documentClass.updateDocuments(updates, { pack: pack.collection });
    }
}
```

- [ ] **Step 2: Register the migration version setting and call migrateWorld**

In `module/swse.mjs`, add the import at the top (after the other imports):

```javascript
import {migrateWorld} from "./migration.mjs";
```

In the `registerSystemSettings()` function call area (or in `module/settings/core.mjs`), the migration version setting needs to be registered. Add this in the init hook, after `registerSystemSettings();` (line 60):

```javascript
    game.settings.register("swse", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: "0",
    });
```

In the existing `Hooks.on('ready', ...)` callback (around line 298), add at the beginning:

```javascript
    await migrateWorld();
```

- [ ] **Step 3: Commit**

```bash
git add module/migration.mjs module/swse.mjs
git commit -m "feat: implement migration framework with v14 migration support"
```

---

### Task 12: Reduce template.json to Type Declarations Only

In v14, template.json can still declare type names even when DataModels define the schema. We keep it minimal — just type lists, no template blocks or field definitions.

**Files:**
- Modify: `template.json`

- [ ] **Step 1: Replace template.json with minimal type declarations**

```json
{
  "Actor": {
    "types": ["character", "npc", "computer", "vehicle", "npc-vehicle"],
    "templates": {}
  },
  "Item": {
    "types": [
      "weapon", "armor", "equipment", "feat", "talent", "species", "class",
      "upgrade", "forcePower", "starShipManeuver", "affiliation", "forceTechnique",
      "forceSecret", "forceRegimen", "classFeature", "trait", "template",
      "vehicleSystem", "vehicleTemplate", "vehicleBaseType", "language",
      "background", "destiny", "beastAttack", "beastSense", "beastType",
      "beastQuality", "droid system", "hazard", "implant", "starshipManeuver"
    ],
    "templates": {}
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add template.json
git commit -m "chore: reduce template.json to type declarations only — schema now in DataModels"
```

---

### Task 13: Verify in Foundry VTT v14

**Files:** None (testing only)

- [ ] **Step 1: Launch Foundry VTT v14 and load the system**

Start Foundry VTT v14 and navigate to the system. Verify the system appears in the system list and can be activated for a world.

- [ ] **Step 2: Create a test world and verify actor creation**

Create a new world with the SWSE system. Open the Actors tab and create one of each type:
- Character
- NPC
- Vehicle
- NPC-Vehicle
- Computer

Verify each creates without errors in the console (F12 → Console tab).

- [ ] **Step 3: Verify item creation**

Open the Items tab and create one of each major category:
- Weapon
- Armor
- Equipment
- Feat
- Talent
- Species
- Class
- Force Power
- Language
- Template
- Upgrade

Verify each creates without errors.

- [ ] **Step 4: Verify compendium packs load**

Open the Compendium tab. Open at least one pack from each type (e.g., Weapons, Feats, Species, Vehicles, Units CL 0). Verify items display and can be viewed.

- [ ] **Step 5: Check for console errors**

Review the browser console for any errors or warnings related to schema, DataModel, or template.json. Fix any issues found before proceeding to Phase 2.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve schema issues found during v14 testing"
```

---

## Notes for Phase 2

Phase 2 (Document Class Updates) will cover:
- ActiveEffect changes migration (changes location, mode→type, origin format)
- Expanding the migration framework with ActiveEffect-specific migrations
- SWSEActor, SWSEItem, SWSETokenDocument API audit
- This plan should be created after Phase 1 is complete and verified
