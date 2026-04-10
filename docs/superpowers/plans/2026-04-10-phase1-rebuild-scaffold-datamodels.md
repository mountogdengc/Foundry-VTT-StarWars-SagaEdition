# Phase 1: SWSE Rebuild — Scaffold + DataModels + Document Classes

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Star Wars Saga Edition system from scratch with Vite + Svelte 5 + AppV2, establishing the data layer and project foundation.

**Architecture:** Fresh branch wiping old code, new Vite build pipeline producing `dist/swse.js` + `dist/swse.css`. TypeDataModel classes define all actor/item schemas. Document classes port game logic from the existing codebase. Composition-based derived data functions replace the old mixin system. Foundry default sheets used until Phase 2 adds Svelte components.

**Tech Stack:** Foundry VTT v14, Vite 6, Svelte 5, TypeDataModel, AppV2

---

## File Map

### New Files (created in this plan)
```
src/
  swse.mjs                              # Entry point
  config.mjs                            # Game constants & config
  migration.mjs                         # Migration framework
  styles/swse.css                       # System CSS (minimal for Phase 1)
  data-models/
    actor/
      CharacterData.mjs                 # Character + NPC schema & derived data
      VehicleData.mjs                   # Vehicle + NPC-Vehicle schema
      ComputerData.mjs                  # Computer schema
    item/
      fields.mjs                        # Shared item field group definitions
      SimpleItemData.mjs                # 15+ simple item types
      WeaponData.mjs                    # Weapon items
      ArmorData.mjs                     # Armor items
      EquipmentData.mjs                 # Equipment items
      BeastAttackData.mjs               # Beast attack items
      TalentData.mjs                    # Talent items
      ClassData.mjs                     # Class items
      SpeciesData.mjs                   # Species items
      TemplateItemData.mjs              # Template items
      UpgradeData.mjs                   # Upgrade items
      LanguageData.mjs                  # Language items
  documents/
    SWSEActor.mjs                       # Custom Actor document class
    SWSEItem.mjs                        # Custom Item document class
    SWSEActiveEffect.mjs                # Custom ActiveEffect document class
  logic/
    abilities.mjs                       # Ability score calculations
    defenses.mjs                        # Defense calculations
    health.mjs                          # HP calculations
    shields.mjs                         # Shield calculations
    skills.mjs                          # Skill calculations
    traits.mjs                          # Level/class/trait resolution
  util/
    attribute-helper.mjs                # getInheritableAttribute (ported)
    util.mjs                            # General utilities (ported)
    prerequisite.mjs                    # Prerequisite system (ported)
    simple-cache.mjs                    # SimpleCache class (ported)
    constants.mjs                       # Game constants (ported)
    classDefaults.mjs                   # Default data shapes (ported)
    helpers.mjs                         # titleCase, depthMerge (ported)
package.json
vite.config.mjs
system.json                            # Updated for v14
```

### Kept Files (unchanged)
```
packs/                                  # All 47 compendium packs
lang/en.json                            # Localization
icon/                                   # Icons
```

### Removed Files (old codebase)
```
module/                                 # Entire old code directory
module_test/                            # Old test suite
templates/                              # Handlebars templates
scss/                                   # Old SCSS
css/                                    # Old compiled CSS
template.json                           # Replaced by DataModels
gulpfile.js                             # Replaced by Vite
```

---

### Task 1: Create rebuild branch and clean workspace

**Files:**
- Remove: `module/`, `module_test/`, `templates/`, `scss/`, `css/`, `template.json`, `gulpfile.js`
- Keep: `packs/`, `lang/`, `icon/`, `docs/`, `.git/`, `.gitignore`, `.gitattributes`

- [ ] **Step 1: Create a new branch from main**

```bash
cd "C:/Users/david/AppData/Local/FoundryVTT/Data/systems/StarWars-SagaEdition"
git checkout -b rebuild-v14
```

- [ ] **Step 2: Remove old codebase files**

```bash
rm -rf module/ module_test/ templates/ scss/ css/
rm -f template.json gulpfile.js package.json package-lock.json
rm -f "Attribute Documentation.md" CONTRIBUTING.MD README.md
```

- [ ] **Step 3: Commit the clean slate**

```bash
git add -A
git commit -m "chore: remove legacy v13 codebase for v14 rebuild"
```

---

### Task 2: Project scaffold — package.json and vite.config.mjs

**Files:**
- Create: `package.json`
- Create: `vite.config.mjs`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "swse",
  "version": "14.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite build --watch --mode development",
    "build": "vite build"
  },
  "devDependencies": {
    "svelte": "^5.0.0",
    "@sveltejs/vite-plugin-svelte": "^5.0.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.mjs**

```javascript
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/swse.mjs"),
      formats: ["es"],
      fileName: "swse",
    },
    rollupOptions: {
      output: {
        assetFileNames: "swse.[ext]",
      },
    },
  },
});
```

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

- [ ] **Step 4: Commit**

```bash
git add package.json vite.config.mjs package-lock.json .gitignore
git commit -m "chore: add Vite + Svelte 5 build scaffold"
```

---

### Task 3: Update system.json for v14

**Files:**
- Modify: `system.json`

- [ ] **Step 1: Replace system.json with v14 configuration**

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
  "authors": [
    {
      "name": "Andy Lijewski",
      "email": "lijewskirocks@gmail.com",
      "discord": "AndyL#7253",
      "url": "https://github.com/kypvalanx"
    },
    {
      "name": "mountogdengc",
      "url": "https://github.com/mountogdengc"
    }
  ],
  "esmodules": ["dist/swse.js"],
  "styles": ["dist/swse.css"],
  "documentTypes": {
    "Actor": {
      "character": {},
      "npc": {},
      "computer": {},
      "vehicle": {},
      "npc-vehicle": {}
    },
    "Item": {
      "weapon": {},
      "armor": {},
      "equipment": {},
      "feat": {},
      "talent": {},
      "species": {},
      "class": {},
      "upgrade": {},
      "forcePower": {},
      "starShipManeuver": {},
      "affiliation": {},
      "forceTechnique": {},
      "forceSecret": {},
      "forceRegimen": {},
      "classFeature": {},
      "trait": {},
      "template": {},
      "vehicleSystem": {},
      "vehicleBaseType": {},
      "language": {},
      "background": {},
      "destiny": {},
      "beastAttack": {},
      "beastSense": {},
      "beastType": {},
      "beastQuality": {},
      "droid system": {},
      "hazard": {},
      "implant": {}
    }
  },
  "packs": [
    { "name": "affiliations", "label": "Affiliations", "path": "packs/affiliations", "type": "Item", "system": "swse" },
    { "name": "armor", "label": "Armor", "path": "packs/armor", "type": "Item", "system": "swse" },
    { "name": "weapons", "label": "Weapons", "path": "packs/weapon", "type": "Item", "system": "swse" },
    { "name": "equipment", "label": "Equipment", "path": "packs/equipment", "type": "Item", "system": "swse" },
    { "name": "hazard", "label": "Hazards", "path": "packs/hazard", "type": "Item", "system": "swse" },
    { "name": "implant", "label": "Implants", "path": "packs/implant", "type": "Item", "system": "swse" },
    { "name": "backgrounds", "label": "Backgrounds", "path": "packs/backgrounds", "type": "Item", "system": "swse" },
    { "name": "classes", "label": "Classes", "path": "packs/classes", "type": "Item", "system": "swse" },
    { "name": "droid-systems", "label": "Droid Systems", "path": "packs/droid-system", "type": "Item", "system": "swse" },
    { "name": "feats", "label": "Feats", "path": "packs/feats", "type": "Item", "system": "swse" },
    { "name": "force-powers", "label": "Force Powers", "path": "packs/force-powers", "type": "Item", "system": "swse" },
    { "name": "force-regimens", "label": "Force Regimens", "path": "packs/force-regimens", "type": "Item", "system": "swse" },
    { "name": "force-secrets", "label": "Force Secrets", "path": "packs/force-secrets", "type": "Item", "system": "swse" },
    { "name": "force-techniques", "label": "Force Techniques", "path": "packs/force-techniques", "type": "Item", "system": "swse" },
    { "name": "species", "label": "Species", "path": "packs/species", "type": "Item", "system": "swse" },
    { "name": "talents", "label": "Talents", "path": "packs/talents", "type": "Item", "system": "swse" },
    { "name": "templates", "label": "Templates", "path": "packs/templates", "type": "Item", "system": "swse" },
    { "name": "traits", "label": "Traits", "path": "packs/traits", "type": "Item", "system": "swse" },
    { "name": "destinies", "label": "Destinies", "path": "packs/destinies", "type": "Item", "system": "swse" },
    { "name": "vehicle-base-types", "label": "Vehicle Base Types", "path": "packs/vehicle-base-types", "type": "Item", "system": "swse" },
    { "name": "vehicle-systems", "label": "Vehicle Systems", "path": "packs/vehicle-systems", "type": "Item", "system": "swse" },
    { "name": "beast-components", "label": "Beast Components", "path": "packs/beast-components", "type": "Item", "system": "swse" },
    { "name": "languages", "label": "Languages", "path": "packs/languages", "type": "Item", "system": "swse" },
    { "name": "vehicles", "label": "Vehicles", "path": "packs/vehicles", "type": "Actor", "system": "swse" },
    { "name": "upgrades", "label": "Upgrades", "path": "packs/upgrade", "type": "Item", "system": "swse" },
    { "name": "units-cl-0", "label": "Units CL  0", "path": "packs/units-cl-0", "type": "Actor", "system": "swse" },
    { "name": "units-cl-1", "label": "Units CL  1", "path": "packs/units-cl-1", "type": "Actor", "system": "swse" },
    { "name": "units-cl-2", "label": "Units CL  2", "path": "packs/units-cl-2", "type": "Actor", "system": "swse" },
    { "name": "units-cl-3", "label": "Units CL  3", "path": "packs/units-cl-3", "type": "Actor", "system": "swse" },
    { "name": "units-cl-4", "label": "Units CL  4", "path": "packs/units-cl-4", "type": "Actor", "system": "swse" },
    { "name": "units-cl-5", "label": "Units CL  5", "path": "packs/units-cl-5", "type": "Actor", "system": "swse" },
    { "name": "units-cl-6", "label": "Units CL  6", "path": "packs/units-cl-6", "type": "Actor", "system": "swse" },
    { "name": "units-cl-7", "label": "Units CL  7", "path": "packs/units-cl-7", "type": "Actor", "system": "swse" },
    { "name": "units-cl-8", "label": "Units CL  8", "path": "packs/units-cl-8", "type": "Actor", "system": "swse" },
    { "name": "units-cl-9", "label": "Units CL  9", "path": "packs/units-cl-9", "type": "Actor", "system": "swse" },
    { "name": "units-cl-10", "label": "Units CL 10", "path": "packs/units-cl-10", "type": "Actor", "system": "swse" },
    { "name": "units-cl-11", "label": "Units CL 11", "path": "packs/units-cl-11", "type": "Actor", "system": "swse" },
    { "name": "units-cl-12", "label": "Units CL 12", "path": "packs/units-cl-12", "type": "Actor", "system": "swse" },
    { "name": "units-cl-13", "label": "Units CL 13", "path": "packs/units-cl-13", "type": "Actor", "system": "swse" },
    { "name": "units-cl-14", "label": "Units CL 14", "path": "packs/units-cl-14", "type": "Actor", "system": "swse" },
    { "name": "units-cl-15", "label": "Units CL 15", "path": "packs/units-cl-15", "type": "Actor", "system": "swse" },
    { "name": "units-cl-16", "label": "Units CL 16", "path": "packs/units-cl-16", "type": "Actor", "system": "swse" },
    { "name": "units-cl-17", "label": "Units CL 17", "path": "packs/units-cl-17", "type": "Actor", "system": "swse" },
    { "name": "units-cl-18", "label": "Units CL 18", "path": "packs/units-cl-18", "type": "Actor", "system": "swse" },
    { "name": "units-cl-19", "label": "Units CL 19", "path": "packs/units-cl-19", "type": "Actor", "system": "swse" },
    { "name": "units-cl-20", "label": "Units CL 20", "path": "packs/units-cl-20", "type": "Actor", "system": "swse" },
    { "name": "region-effects", "label": "Region Effects", "path": "packs/region-effects", "type": "Macro", "system": "swse" }
  ],
  "languages": [
    { "lang": "en", "name": "English", "path": "lang/en.json" }
  ],
  "grid": {
    "distance": 1,
    "units": "squares"
  },
  "primaryTokenAttribute": "health",
  "secondaryTokenAttribute": "shields",
  "url": "https://github.com/mountogdengc/Foundry-VTT-StarWars-SagaEdition",
  "manifest": "https://raw.githubusercontent.com/mountogdengc/Foundry-VTT-StarWars-SagaEdition/rebuild-v14/system.json",
  "download": "https://github.com/mountogdengc/Foundry-VTT-StarWars-SagaEdition/archive/refs/tags/14.0.0.zip",
  "license": "https://creativecommons.org/licenses/by-sa/3.0/legalcode"
}
```

- [ ] **Step 2: Commit**

```bash
git add system.json
git commit -m "chore: update system.json for v14 with Vite output and documentTypes"
```

---

### Task 4: Create minimal entry point and CSS to verify build

**Files:**
- Create: `src/swse.mjs`
- Create: `src/styles/swse.css`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p src/styles src/data-models/actor src/data-models/item src/documents src/logic src/util src/sheets
```

- [ ] **Step 2: Create minimal CSS**

Create `src/styles/swse.css`:

```css
/* Star Wars Saga Edition — System CSS */
/* Note: Do NOT import tailwindcss — its preflight breaks Foundry icons */

:root {
  --swse-blue: #4a90d9;
  --swse-red: #d9534f;
  --swse-green: #5cb85c;
  --swse-amber: #f0ad4e;
  --swse-bg-dark: #1a1a2e;
  --swse-bg-panel: #16213e;
  --swse-border: #333;
  --swse-text: #e0e0e0;
  --swse-text-dim: #888;
}
```

- [ ] **Step 3: Create minimal entry point**

Create `src/swse.mjs`:

```javascript
import "./styles/swse.css";

Hooks.once("init", () => {
  console.log("SWSE | Initializing Star Wars Saga Edition system");

  game.swse = {
    version: "14.0.0",
  };
});

Hooks.once("ready", () => {
  console.log("SWSE | System ready");
});
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: `dist/swse.js` and `dist/swse.css` created without errors.

- [ ] **Step 5: Commit**

```bash
git add src/ dist/
git commit -m "feat: add minimal entry point and CSS — verify Vite build works"
```

---

### Task 5: Port utility files

These files are ported from the old codebase with minimal changes — mainly updating import paths from `../common/` to `../util/` and removing any DOM/jQuery dependencies.

**Files:**
- Create: `src/util/simple-cache.mjs`
- Create: `src/util/helpers.mjs`
- Create: `src/util/constants.mjs`
- Create: `src/util/classDefaults.mjs`
- Create: `src/util/util.mjs`

- [ ] **Step 1: Create simple-cache.mjs**

Port from `module/common/simple-cache.mjs`. This file has no external dependencies:

```javascript
export class SimpleCache {
  #cache = new Map();

  getCached(key, fn) {
    if (!this.#cache.has(key)) {
      this.#cache.set(key, fn());
    }
    return this.#cache.get(key);
  }

  invalidate(key) {
    this.#cache.delete(key);
  }

  invalidateAll() {
    this.#cache.clear();
  }
}
```

- [ ] **Step 2: Create helpers.mjs**

Port `titleCase` and `depthMerge` from `module/common/helpers.mjs`. Only port functions used by game logic — skip Handlebars helpers:

```javascript
export function titleCase(str) {
  if (!str) return str;
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

export function depthMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], depthMerge(target[key], source[key]));
    }
  }
  return Object.assign(target || {}, source);
}
```

- [ ] **Step 3: Port constants.mjs**

Port from `module/common/constants.mjs`. Copy the complete file, updating only the import paths. Key exports: `PHYSICAL_SKILLS`, `dieSize`, `dieSize_vanilla`, `dieType`, `sizeArray`, `SIZE_CHANGES`, `SCALABLE_CHANGES`, `ITEM_ONLY_ATTRIBUTES`, `UNINHERITABLE_AMMO_CHANGES`, `WEAPON_INCLUSION_LIST`, `skills`, `uniqueKey`, `weaponGroup`, `KNOWN_WEIRD_UNITS`, `skillDetails`, `defaultAttributes`, `getGroupedSkillMap`, `NEW_LINE`, `DEFAULT_SKILL`.

The file is large (~300 lines of constant definitions). Port it verbatim — these are pure data declarations with no framework dependencies.

- [ ] **Step 4: Port classDefaults.mjs**

Port from `module/common/classDefaults.mjs`. Contains `DEFAULT_LEVEL_EFFECT`, `DEFAULT_MODE_EFFECT`, `DEFAULT_MODIFICATION_EFFECT`, `DEFAULT_SKILL`. These are plain objects with no dependencies.

- [ ] **Step 5: Port util.mjs**

Port from `module/common/util.mjs`. This is the largest utility file (~600 lines). Port all exported functions EXCEPT DOM/UI-specific ones:

**Port these** (game logic):
`unique`, `notEmpty`, `range`, `resolveValueArray`, `resolveExpression`, `getVariableFromActorData`, `filterItemsByTypes`, `getBonusString`, `getLongKey`, `toShortAttribute`, `increaseDieType`, `increaseDieSize`, `adjustDieSize`, `toBoolean`, `toNumber`, `resolveAttackRange`, `getOrdinal`, `d20Result`, `getAttackRange`, `resolveExpressionReduce`, `reduceArray`, `parseModifiers`, `getEntityFromCompendiums`, `innerJoin`, `fullJoin`, `equippedItems`, `inheritableItems`, `resolveWeight`, `COMMMA_LIST`, `ALPHA_FINAL_NAME`, `convertOverrideToMode`, `linkEffects`, `appendTerms`, `appendTerm`, `appendDieTerm`, `appendNumericTerm`, `getCleanListFromCSV`, `toChat`, `attackOptions`, `numericOverrideOptions`, `getDistance`, `mergeColor`, `getActorFromId`, `plus`, `mult`, `minus`, `addBlankModificationEffect`, `addBlankMode`

**Skip these** (DOM/UI — belongs in Phase 2 Svelte components):
`handleExclusiveSelect`, `handleAttackSelect`, `onCollapseToggle`, `getParentByHTMLClass`, `viewableEntityFromEntityType`

Update import paths: any `import from "../common/..."` becomes `import from "./..."` within `src/util/`.

- [ ] **Step 6: Commit**

```bash
git add src/util/
git commit -m "feat: port utility files (cache, helpers, constants, util)"
```

---

### Task 6: Port attribute-helper.mjs and prerequisite.mjs

These are critical game logic files used by nearly every derived data function.

**Files:**
- Create: `src/util/attribute-helper.mjs`
- Create: `src/util/prerequisite.mjs`

- [ ] **Step 1: Port attribute-helper.mjs**

Port from `module/attribute-helper.mjs`. Update imports:
- `"./common/util.mjs"` → `"./util.mjs"`
- `"./item/item.mjs"` → `"../documents/SWSEItem.mjs"`
- `"./prerequisite.mjs"` → `"./prerequisite.mjs"`
- `"./common/constants.mjs"` → `"./constants.mjs"`
- `"./actor/actor.mjs"` → `"../documents/SWSEActor.mjs"`
- `"./active-effect/active-effect.mjs"` → `"../documents/SWSEActiveEffect.mjs"`

Remove the `UnarmedAttack` import — that will be handled in a later phase if needed. For now, add a stub or conditional check.

Key exports to preserve: `getInheritableAttribute`, `getResolvedSize`, `appendSourceMeta`

- [ ] **Step 2: Port prerequisite.mjs**

Port from `module/prerequisite.mjs`. Update imports:
- `"./common/util.mjs"` → `"./util.mjs"`
- `"./common/constants.mjs"` → `"./constants.mjs"`
- `"./attribute-helper.mjs"` → `"./attribute-helper.mjs"`
- `"./actor/actor.mjs"` → `"../documents/SWSEActor.mjs"`
- `"./item/item.mjs"` → `"../documents/SWSEItem.mjs"`
- `"./common/simple-cache.mjs"` → `"./simple-cache.mjs"`

Key exports to preserve: `meetsPrerequisites`, `formatPrerequisites`

- [ ] **Step 3: Commit**

```bash
git add src/util/attribute-helper.mjs src/util/prerequisite.mjs
git commit -m "feat: port attribute-helper and prerequisite system"
```

---

### Task 7: Create config.mjs

**Files:**
- Create: `src/config.mjs`

- [ ] **Step 1: Port and consolidate config**

Port from `module/common/config.mjs`. The SWSE config object contains abilities, skills, defenses, combat ranges, condition track, and status effects. Update imports and keep the same structure:

```javascript
export const SWSE = {};

// Combat ranges — conditional on homebrew setting
Object.defineProperty(SWSE, "Combat", {
  get() {
    return {
      get range() {
        const homebrewRanges = game.settings?.get("swse", "homebrewRanges");
        if (homebrewRanges) {
          return {
            pointBlank: { distance: 1, label: "Point-Blank" },
            short: { distance: 6, label: "Short" },
            medium: { distance: 12, label: "Medium" },
            long: { distance: 24, label: "Long" },
          };
        }
        return {};
      },
      rangePenalty: {
        pointBlank: 0,
        short: 0,
        medium: -2,
        long: -5,
      },
    };
  },
});

SWSE.Abilities = {
  abilities: {
    str: "Strength",
    dex: "Dexterity",
    con: "Constitution",
    int: "Intelligence",
    wis: "Wisdom",
    cha: "Charisma",
  },
  abilitiesShort: {
    str: "STR",
    dex: "DEX",
    con: "CON",
    int: "INT",
    wis: "WIS",
    cha: "CHA",
  },
  droidSkip: {
    con: true,
  },
  standardScorePackage: [8, 10, 12, 13, 14, 15],
  abilityCost: {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 6, 15: 8, 16: 10, 17: 13, 18: 16,
  },
  defaultAbilityRoll: "4d6kh3",
  defaultPointBuyTotal: 25,
  droidPointBuyTotal: 18,
};

SWSE.Skills = {
  skills: {
    acrobatics: "Acrobatics", climb: "Climb", deception: "Deception",
    endurance: "Endurance", "gather information": "Gather Information",
    initiative: "Initiative", jump: "Jump",
    "knowledge (bureaucracy)": "Knowledge (Bureaucracy)",
    "knowledge (galactic lore)": "Knowledge (Galactic Lore)",
    "knowledge (life sciences)": "Knowledge (Life Sciences)",
    "knowledge (physical sciences)": "Knowledge (Physical Sciences)",
    "knowledge (social sciences)": "Knowledge (Social Sciences)",
    "knowledge (tactics)": "Knowledge (Tactics)",
    "knowledge (technology)": "Knowledge (Technology)",
    mechanics: "Mechanics", perception: "Perception", persuasion: "Persuasion",
    pilot: "Pilot", ride: "Ride", stealth: "Stealth", survival: "Survival",
    swim: "Swim", "treat injury": "Treat Injury", "use computer": "Use Computer",
    "use the force": "Use the Force",
  },
};

SWSE.Defense = {
  defense: {
    ref: { ability: "dex" },
    fort: { ability: "con" },
    will: { ability: "wis" },
  },
};

SWSE.conditionTrack = [0, -1, -2, -5, -10];
SWSE.RecognizedAttributes = [];

export function initializeStatusEffects(config) {
  config.statusEffects = [
    { id: "condition1", label: "Condition -1", icon: "icons/svg/downgrade.svg", changes: [] },
    { id: "condition2", label: "Condition -2", icon: "icons/svg/downgrade.svg", changes: [] },
    { id: "condition5", label: "Condition -5", icon: "icons/svg/downgrade.svg", changes: [] },
    { id: "condition10", label: "Condition -10", icon: "icons/svg/downgrade.svg", changes: [] },
    { id: "helpless", label: "Helpless", icon: "icons/svg/paralysis.svg", changes: [] },
    { id: "lowGravity", label: "Low Gravity", icon: "icons/svg/falling.svg", changes: [] },
    { id: "highGravity", label: "High Gravity", icon: "icons/svg/falling.svg", changes: [] },
    { id: "zeroGravity", label: "Zero Gravity", icon: "icons/svg/falling.svg", changes: [] },
    { id: "shield", label: "Shield Active", icon: "icons/svg/mage-shield.svg", changes: [] },
    { id: "standardCover", label: "Standard Cover", icon: "icons/svg/tower.svg", changes: [] },
    { id: "improvedCover", label: "Improved Cover", icon: "icons/svg/tower.svg", changes: [] },
    { id: "totalCover", label: "Total Cover", icon: "icons/svg/tower.svg", changes: [] },
  ];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/config.mjs
git commit -m "feat: add SWSE config with abilities, skills, defenses, status effects"
```

---

### Task 8: Create item field definitions

**Files:**
- Create: `src/data-models/item/fields.mjs`

- [ ] **Step 1: Create shared item field groups**

```javascript
const fields = foundry.data.fields;

/** "base" template — shared by ALL item types */
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

/** "item" template — physical items with cost, weight, etc. */
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

/** "modifiable" template — items that can contain sub-items */
export class ModifiableFields {
  static get common() {
    return {
      items: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Items" }),
    };
  }
}

/** "mod" template — items owned by other items */
export class ModFields {
  static get common() {
    return {
      hasItemOwner: new fields.BooleanField({ initial: false, label: "Has Item Owner" }),
    };
  }
}

/** "prerequisites" template */
export class PrerequisiteFields {
  static get common() {
    return {
      prerequisite: new fields.ObjectField({ nullable: true, initial: null, label: "Prerequisite" }),
    };
  }
}

/** "categories" template */
export class CategoryFields {
  static get common() {
    return {
      categories: new fields.ArrayField(new fields.StringField(), { initial: [], label: "Categories" }),
    };
  }
}

/** "source" template — supplier/provider tracking */
export class SourceFields {
  static get common() {
    return {
      supplier: new fields.ObjectField({ label: "Supplier" }),
      possibleProviders: new fields.ArrayField(new fields.StringField(), { initial: [], label: "Possible Providers" }),
      isSupplied: new fields.BooleanField({ initial: false, label: "Is Supplied" }),
    };
  }
}

/** "mode" template — active modes */
export class ModeFields {
  static get common() {
    return {
      activeModes: new fields.ArrayField(new fields.StringField(), { initial: [], label: "Active Modes" }),
    };
  }
}

/** "levels" template — class levels */
export class LevelFields {
  static get common() {
    return {
      levels: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Levels" }),
    };
  }
}

/** "health" template — empty placeholder for class HP tracking */
export class ItemHealthFields {
  static get common() {
    return {};
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data-models/item/fields.mjs
git commit -m "feat: add shared item field group definitions"
```

---

### Task 9: Create all item DataModels

**Files:**
- Create: `src/data-models/item/SimpleItemData.mjs`
- Create: `src/data-models/item/WeaponData.mjs`
- Create: `src/data-models/item/ArmorData.mjs`
- Create: `src/data-models/item/EquipmentData.mjs`
- Create: `src/data-models/item/BeastAttackData.mjs`
- Create: `src/data-models/item/TalentData.mjs`
- Create: `src/data-models/item/ClassData.mjs`
- Create: `src/data-models/item/SpeciesData.mjs`
- Create: `src/data-models/item/TemplateItemData.mjs`
- Create: `src/data-models/item/UpgradeData.mjs`
- Create: `src/data-models/item/LanguageData.mjs`

- [ ] **Step 1: Create SimpleItemData.mjs**

Covers: trait, feat, beastSense, beastType, beastQuality, forcePower, forceSecret, forceRegimen, forceTechnique, starShipManeuver, affiliation, background, destiny, classFeature, hazard, implant, droid system, vehicleSystem, vehicleBaseType

```javascript
import { BaseFields, CategoryFields, SourceFields, PrerequisiteFields } from "./fields.mjs";

export class SimpleItemData extends foundry.abstract.TypeDataModel {
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

- [ ] **Step 2: Create WeaponData.mjs**

```javascript
import { BaseFields, PhysicalFields, CategoryFields, ModifiableFields, SourceFields, ModeFields } from "./fields.mjs";

const fields = foundry.data.fields;

export class WeaponData extends foundry.abstract.TypeDataModel {
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

- [ ] **Step 3: Create ArmorData.mjs**

```javascript
import { BaseFields, PhysicalFields, CategoryFields, ModifiableFields, SourceFields } from "./fields.mjs";

const fields = foundry.data.fields;

export class ArmorData extends foundry.abstract.TypeDataModel {
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

- [ ] **Step 4: Create EquipmentData.mjs**

```javascript
import { BaseFields, PhysicalFields, CategoryFields, ModifiableFields, SourceFields } from "./fields.mjs";

const fields = foundry.data.fields;

export class EquipmentData extends foundry.abstract.TypeDataModel {
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

- [ ] **Step 5: Create BeastAttackData.mjs**

```javascript
import { BaseFields, PhysicalFields, CategoryFields, ModifiableFields, SourceFields, ModeFields } from "./fields.mjs";

export class BeastAttackData extends foundry.abstract.TypeDataModel {
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

- [ ] **Step 6: Create TalentData.mjs**

```javascript
import { BaseFields, PrerequisiteFields, CategoryFields, SourceFields } from "./fields.mjs";

const fields = foundry.data.fields;

export class TalentData extends foundry.abstract.TypeDataModel {
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

- [ ] **Step 7: Create ClassData.mjs**

```javascript
import { BaseFields, PrerequisiteFields, ItemHealthFields, LevelFields } from "./fields.mjs";

export class ClassData extends foundry.abstract.TypeDataModel {
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

- [ ] **Step 8: Create SpeciesData.mjs**

```javascript
import { BaseFields, CategoryFields } from "./fields.mjs";

const fields = foundry.data.fields;

export class SpeciesData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
      ...CategoryFields.common,
      traits: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Traits" }),
    };
  }
}
```

- [ ] **Step 9: Create TemplateItemData.mjs**

```javascript
import { BaseFields, ModFields } from "./fields.mjs";

export class TemplateItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
      ...ModFields.common,
    };
  }
}
```

- [ ] **Step 10: Create UpgradeData.mjs**

```javascript
import { BaseFields, PhysicalFields, ModFields } from "./fields.mjs";

const fields = foundry.data.fields;

export class UpgradeData extends foundry.abstract.TypeDataModel {
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

- [ ] **Step 11: Create LanguageData.mjs**

```javascript
import { BaseFields } from "./fields.mjs";

export class LanguageData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
    };
  }
}
```

- [ ] **Step 12: Commit**

```bash
git add src/data-models/item/
git commit -m "feat: add all 11 item TypeDataModel classes"
```

---

### Task 10: Create actor DataModels — schema only

Create the actor DataModels with `defineSchema()` but WITHOUT `prepareDerivedData()` yet. The logic functions that power derived data will be added in Task 12.

**Files:**
- Create: `src/data-models/actor/CharacterData.mjs`
- Create: `src/data-models/actor/VehicleData.mjs`
- Create: `src/data-models/actor/ComputerData.mjs`

- [ ] **Step 1: Create CharacterData.mjs (schema only)**

Port the schema from the existing `CharacterDataModel.defineSchema()`. Uses the same field structure from `AbilityFields`, `HealthFields`, `ShieldFields`, `SkillFields`, `TraitsFields`, `DetailFields` — but defined inline here rather than via external template classes (we'll create those after confirming the schema works):

```javascript
const fields = foundry.data.fields;

function abilityField(label) {
  return new fields.SchemaField({
    value: new fields.NumberField({ initial: 10, integer: true, min: 0, label: `${label} Score` }),
    base: new fields.NumberField({ nullable: true, initial: 10, integer: true, min: 0, label: `${label} Base` }),
    customBonus: new fields.NumberField({ initial: 0, integer: true, label: `${label} Custom` }),
  });
}

function skillField(ability, skill) {
  return new fields.SchemaField({
    ability: new fields.StringField({ initial: ability, blank: false, label: "Related Ability" }),
    trained: new fields.BooleanField({ initial: false, label: "Trained" }),
    manualBonus: new fields.NumberField({ initial: 0, integer: true, label: `Manual ${skill} Bonus` }),
    trainedOnly: new fields.BooleanField({ initial: false, label: "Trained Only" }),
    armorPenalty: new fields.BooleanField({ initial: false, label: "Armor Penalty" }),
    value: new fields.NumberField({ initial: 0, integer: true, label: `${skill} Mod` }),
  });
}

export class CharacterData extends foundry.abstract.TypeDataModel {
  static migrateData(source) {
    if (source.forcePoints && typeof source.forcePoints === "object") {
      source.forcePoints = source.forcePoints.quantity || 0;
    }
    if (source.forcePoints !== undefined) {
      source.forcePoints = parseInt(source.forcePoints) || 0;
    }
    return super.migrateData(source);
  }

  static defineSchema() {
    return {
      // Abilities
      abilities: new fields.SchemaField({
        str: abilityField("Strength"),
        dex: abilityField("Dexterity"),
        con: abilityField("Constitution"),
        int: abilityField("Intelligence"),
        wis: abilityField("Wisdom"),
        cha: abilityField("Charisma"),
      }),
      // Health
      health: new fields.SchemaField({
        value: new fields.NumberField({ initial: 10, min: 0, integer: true, label: "Current HP" }),
        max: new fields.NumberField({ initial: 10, min: 0, integer: true, label: "Max HP" }),
        bonusHP: new fields.NumberField({ nullable: true, initial: null, min: 0, integer: true, label: "Bonus HP" }),
        override: new fields.NumberField({ nullable: true, initial: null, min: 0, integer: true, label: "HP Override" }),
      }),
      // Shields
      shields: new fields.SchemaField({
        value: new fields.NumberField({ step: 5, min: 0, integer: true, label: "Shield HP" }),
        max: new fields.NumberField({ nullable: true, initial: null, step: 5, min: 0, integer: true, label: "Max Shield HP" }),
      }),
      // Sheet state
      toggles: new fields.ObjectField({ label: "Stored Sheet Toggles" }),
      overrides: new fields.ObjectField({ label: "Stored Sheet Overrides" }),
      actorLinks: new fields.ArrayField(new fields.SchemaField({
        id: new fields.DocumentIdField(),
        uuid: new fields.StringField({ required: true }),
        position: new fields.StringField({ initial: "neutral" }),
        slot: new fields.StringField({ nullable: true, initial: null }),
      }), { label: "Actor Links", initial: [] }),
      // Character traits
      xp: new fields.StringField({ initial: "", label: "XP" }),
      baseAttack: new fields.NumberField({ initial: 0, integer: true, label: "Base Attack" }),
      grapple: new fields.NumberField({ initial: 0, integer: true, label: "Grapple" }),
      forcePoints: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Force Points" }),
      destinyPoints: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Destiny Points" }),
      darkSideScore: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Dark Side Score" }),
      // Skills (23 character skills)
      skills: new fields.SchemaField({
        Acrobatics: skillField("dex", "Acrobatics"),
        Climb: skillField("str", "Climb"),
        Deception: skillField("cha", "Deception"),
        Endurance: skillField("str", "Endurance"),
        "Gather Information": skillField("int", "Gather Information"),
        Initiative: skillField("dex", "Initiative"),
        Jump: skillField("str", "Jump"),
        "Knowledge (Bureaucracy)": skillField("int", "Knowledge (Bureaucracy)"),
        "Knowledge (Galactic Lore)": skillField("int", "Knowledge (Galactic Lore)"),
        "Knowledge (Life Sciences)": skillField("int", "Knowledge (Life Sciences)"),
        "Knowledge (Physical Sciences)": skillField("int", "Knowledge (Physical Sciences)"),
        "Knowledge (Social Sciences)": skillField("int", "Knowledge (Social Sciences)"),
        "Knowledge (Tactics)": skillField("int", "Knowledge (Tactics)"),
        "Knowledge (Technology)": skillField("int", "Knowledge (Technology)"),
        Mechanics: skillField("int", "Mechanics"),
        Perception: skillField("wis", "Perception"),
        Persuasion: skillField("cha", "Persuasion"),
        Pilot: skillField("dex", "Pilot"),
        Ride: skillField("dex", "Ride"),
        Stealth: skillField("dex", "Stealth"),
        Survival: skillField("wis", "Survival"),
        Swim: skillField("str", "Swim"),
        "Treat Injury": skillField("wis", "Treat Injury"),
        "Use Computer": skillField("int", "Use Computer"),
        "Use the Force": skillField("cha", "Use the Force"),
      }),
      // Details
      details: new fields.SchemaField({
        biography: new fields.HTMLField({ initial: "", label: "Biography" }),
        description: new fields.StringField({ initial: "", label: "Description" }),
        gender: new fields.StringField({ initial: "", label: "Gender" }),
        sex: new fields.StringField({ initial: "", label: "Sex" }),
        age: new fields.NumberField({ initial: 0, integer: true, label: "Age" }),
        height: new fields.StringField({ initial: "", label: "Height" }),
        weight: new fields.StringField({ initial: "", label: "Weight" }),
        player: new fields.StringField({ initial: "", label: "Player" }),
      }),
      // Settings
      settings: new fields.SchemaField({
        isNPC: new fields.SchemaField({
          value: new fields.BooleanField({ initial: false, label: "Is NPC" }),
        }),
        ignorePrerequisites: new fields.SchemaField({
          value: new fields.BooleanField({ initial: false, label: "Ignore Prerequisites" }),
        }),
        abilityGeneration: new fields.SchemaField({
          value: new fields.StringField({ initial: "Default", label: "Ability Generation Type" }),
        }),
      }),
      // Credits
      credits: new fields.NumberField({ initial: 0, integer: true, min: 0, label: "Credits" }),
    };
  }

  // prepareDerivedData() will be added in Task 12 after logic functions exist
}
```

- [ ] **Step 2: Create VehicleData.mjs (schema only)**

```javascript
const fields = foundry.data.fields;

function abilityField(label) {
  return new fields.SchemaField({
    value: new fields.NumberField({ initial: 10, integer: true, min: 0, label: `${label} Score` }),
    base: new fields.NumberField({ nullable: true, initial: 10, integer: true, min: 0, label: `${label} Base` }),
    customBonus: new fields.NumberField({ initial: 0, integer: true, label: `${label} Custom` }),
  });
}

function skillField(ability, skill) {
  return new fields.SchemaField({
    ability: new fields.StringField({ initial: ability, blank: false, label: "Related Ability" }),
    trained: new fields.BooleanField({ initial: false, label: "Trained" }),
    manualBonus: new fields.NumberField({ initial: 0, integer: true, label: `Manual ${skill} Bonus` }),
    trainedOnly: new fields.BooleanField({ initial: false, label: "Trained Only" }),
    armorPenalty: new fields.BooleanField({ initial: false, label: "Armor Penalty" }),
    value: new fields.NumberField({ initial: 0, integer: true, label: `${skill} Mod` }),
  });
}

export class VehicleData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      // Abilities
      abilities: new fields.SchemaField({
        str: abilityField("Strength"),
        dex: abilityField("Dexterity"),
        con: abilityField("Constitution"),
        int: abilityField("Intelligence"),
        wis: abilityField("Wisdom"),
        cha: abilityField("Charisma"),
      }),
      // Health
      health: new fields.SchemaField({
        value: new fields.NumberField({ initial: 10, min: 0, integer: true, label: "Current HP" }),
        max: new fields.NumberField({ initial: 10, min: 0, integer: true, label: "Max HP" }),
        bonusHP: new fields.NumberField({ nullable: true, initial: null, min: 0, integer: true, label: "Bonus HP" }),
        override: new fields.NumberField({ nullable: true, initial: null, min: 0, integer: true, label: "HP Override" }),
      }),
      // Shields
      shields: new fields.SchemaField({
        value: new fields.NumberField({ step: 5, min: 0, integer: true, label: "Shield HP" }),
        max: new fields.NumberField({ nullable: true, initial: null, step: 5, min: 0, integer: true, label: "Max Shield HP" }),
      }),
      // Sheet state
      toggles: new fields.ObjectField({ label: "Stored Sheet Toggles" }),
      overrides: new fields.ObjectField({ label: "Stored Sheet Overrides" }),
      actorLinks: new fields.ArrayField(new fields.SchemaField({
        id: new fields.DocumentIdField(),
        uuid: new fields.StringField({ required: true }),
        position: new fields.StringField({ initial: "neutral" }),
        slot: new fields.StringField({ nullable: true, initial: null }),
      }), { label: "Actor Links", initial: [] }),
      // NPC-style defenses
      defense: new fields.SchemaField({
        ref: new fields.SchemaField({ value: new fields.NumberField({ initial: 10, min: 0, label: "Reflex" }) }),
        fort: new fields.SchemaField({ value: new fields.NumberField({ initial: 10, min: 0, label: "Fortitude" }) }),
        will: new fields.SchemaField({ value: new fields.NumberField({ initial: 10, min: 0, label: "Will" }) }),
        reff: new fields.SchemaField({ value: new fields.NumberField({ initial: 10, min: 0, label: "Reflex (Flat-Footed)" }) }),
        special: new fields.StringField({ initial: "", label: "Special Defense" }),
        dt: new fields.SchemaField({ value: new fields.NumberField({ initial: 10, min: 0, label: "Damage Threshold" }) }),
        dr: new fields.NumberField({ initial: 0, min: 0, label: "Damage Reduction" }),
      }),
      // Vehicle skills (7)
      skills: new fields.SchemaField({
        Initiative: skillField("dex", "Initiative"),
        Mechanics: skillField("int", "Mechanics"),
        Perception: skillField("wis", "Perception"),
        Pilot: skillField("dex", "Pilot"),
        Ride: skillField("dex", "Ride"),
        Stealth: skillField("dex", "Stealth"),
        "Use Computer": skillField("int", "Use Computer"),
      }),
      // NPC-style details
      details: new fields.SchemaField({
        biography: new fields.HTMLField({ initial: "", label: "Biography" }),
        description: new fields.StringField({ initial: "", label: "Description" }),
        gender: new fields.StringField({ initial: "", label: "Gender" }),
        sex: new fields.StringField({ initial: "", label: "Sex" }),
        age: new fields.NumberField({ initial: 0, integer: true, label: "Age" }),
        height: new fields.StringField({ initial: "", label: "Height" }),
        weight: new fields.StringField({ initial: "", label: "Weight" }),
        species: new fields.StringField({ initial: "", label: "Species" }),
        classes: new fields.StringField({ initial: "", label: "Classes" }),
        senses: new fields.StringField({ initial: "", label: "Senses" }),
        lang: new fields.StringField({ initial: "", label: "Languages" }),
        specialHp: new fields.StringField({ initial: "", label: "Special HP" }),
        immunities: new fields.StringField({ initial: "", label: "Immunities" }),
        weaknesses: new fields.StringField({ initial: "", label: "Weaknesses" }),
        fightSpace: new fields.StringField({ initial: "", label: "Fighting Space" }),
        atkOptions: new fields.StringField({ initial: "", label: "Attack Options" }),
        specialActions: new fields.StringField({ initial: "", label: "Special Actions" }),
        forceP: new fields.StringField({ initial: "", label: "Force Powers" }),
        forceS: new fields.StringField({ initial: "", label: "Force Secrets" }),
        forceT: new fields.StringField({ initial: "", label: "Force Techniques" }),
        specialQualities: new fields.StringField({ initial: "", label: "Special Qualities" }),
        talents: new fields.StringField({ initial: "", label: "Talents" }),
        feats: new fields.StringField({ initial: "", label: "Feats" }),
        skills: new fields.StringField({ initial: "", label: "Skills" }),
        systems: new fields.StringField({ initial: "", label: "Systems" }),
        possesses: new fields.StringField({ initial: "", label: "Possessions" }),
        notes: new fields.StringField({ initial: "", label: "Notes" }),
      }),
      // NPC traits
      xp: new fields.StringField({ initial: "", label: "XP" }),
      baseAttack: new fields.NumberField({ initial: 0, integer: true, label: "Base Attack" }),
      grapple: new fields.NumberField({ initial: 0, integer: true, label: "Grapple" }),
      forcePoints: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Force Points" }),
      destinyPoints: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Destiny Points" }),
      darkSideScore: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Dark Side Score" }),
      level: new fields.SchemaField({ value: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Level" }) }),
      cl: new fields.SchemaField({ value: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Challenge Level" }) }),
      speed: new fields.SchemaField({
        base: new fields.NumberField({ initial: 6, integer: true, label: "Base Speed" }),
        swim: new fields.NumberField({ initial: 1.5, label: "Swim Speed" }),
        climb: new fields.NumberField({ initial: 1.5, label: "Climb Speed" }),
        fly: new fields.NumberField({ nullable: true, initial: null, label: "Fly Speed" }),
        special: new fields.StringField({ initial: "", label: "Special Speed" }),
      }),
      size: new fields.StringField({ initial: "Medium", label: "Size" }),
      reach: new fields.NumberField({ initial: 1, min: 1, integer: true, label: "Reach" }),
    };
  }

  // prepareDerivedData() will be added in Task 12
}
```

- [ ] **Step 3: Create ComputerData.mjs**

```javascript
const fields = foundry.data.fields;

export class ComputerData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      content: new fields.HTMLField({ initial: "", label: "Content" }),
      cursor: new fields.StringField({ initial: "root", label: "Cursor" }),
      attributes: new fields.ObjectField({ label: "Attributes" }),
    };
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/data-models/actor/
git commit -m "feat: add actor TypeDataModel classes (Character, Vehicle, Computer)"
```

---

### Task 11: Create stub Document classes

Create minimal document classes that will be expanded as we port game logic in subsequent tasks. These stubs are enough to register with Foundry and load existing data.

**Files:**
- Create: `src/documents/SWSEActor.mjs`
- Create: `src/documents/SWSEItem.mjs`
- Create: `src/documents/SWSEActiveEffect.mjs`

- [ ] **Step 1: Create SWSEActor.mjs stub**

```javascript
import { SimpleCache } from "../util/simple-cache.mjs";

export class SWSEActor extends Actor {
  prepareData() {
    this.cache = new SimpleCache();
    this.resolvedVariables = this.resolvedVariables ?? new Map();
    this.resolvedLabels = this.resolvedLabels ?? new Map();
    this.resolvedNotes = this.resolvedNotes ?? new Map();
    this.formulaFunctions = this.formulaFunctions ?? new Map();
    super.prepareData();
  }

  getRollData() {
    const data = super.getRollData();
    return data;
  }

  getCached(key, fn) {
    return this.cache.getCached(key, fn);
  }

  setResolvedVariable(key, variable, label, notes) {
    this.resolvedVariables.set(key, variable);
    this.resolvedLabels.set(key, label);
    if (notes) this.resolvedNotes.set(key, notes);
  }

  async safeUpdate(data = {}, context = {}) {
    if (this.id && !this.compendium?.locked) {
      return this.update(data, context);
    }
  }
}

export function getEntityKey(entity) {
  return entity?.id || entity?._id;
}
```

- [ ] **Step 2: Create SWSEItem.mjs stub**

```javascript
import { SimpleCache } from "../util/simple-cache.mjs";

export class SWSEItem extends Item {
  prepareData() {
    super.prepareData();
    this.hasItemOwner = this.hasItemOwner || false;
    this.cache = new SimpleCache();

    // Normalize changes to array
    if (!Array.isArray(this.system.changes)) {
      this.system.changes = Object.values(this.system.changes || {});
    } else {
      this.system.changes = this.system.changes || [];
    }

    this.system.quantity = Number.isInteger(this.system.quantity) ? this.system.quantity : 1;
  }

  get displayName() {
    return SWSEItem.buildItemName(this);
  }

  get changes() {
    return this.system.changes || [];
  }

  get finalName() {
    return this.system.finalName || this.name;
  }

  static buildItemName(item) {
    const prefix = item.system?.prefix || "";
    const suffix = item.system?.suffix || "";
    const name = item.system?.finalName || item.name;
    return `${prefix}${name}${suffix}`.trim();
  }

  canUserModify(user, action, data) {
    let canModify = super.canUserModify(user, action, data);
    if (canModify && this.pack) {
      let pack = game.packs.get(this.pack);
      if (pack?.metadata?.packageType === "system") {
        return false;
      }
    }
    return canModify;
  }

  getCached(key, fn) {
    return this.cache.getCached(key, fn);
  }

  async safeUpdate(data = {}, context = {}) {
    if (this.id && !this.compendium?.locked) {
      return this.update(data, context);
    }
  }
}
```

- [ ] **Step 3: Create SWSEActiveEffect.mjs stub**

```javascript
export class SWSEActiveEffect extends ActiveEffect {
  get transfer() {
    if (this.parent instanceof Item) {
      return !this.disabled && !this.isSuppressed;
    }
    return false;
  }

  set transfer(value) {
    // Controlled by item ownership, not directly settable
  }

  get isDisabled() {
    return this.disabled;
  }

  async safeUpdate(data = {}, context = {}) {
    if (this.id) {
      return this.update(data, context);
    }
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/documents/
git commit -m "feat: add stub Document classes (SWSEActor, SWSEItem, SWSEActiveEffect)"
```

---

### Task 12: Create logic functions and wire up prepareDerivedData

Port the derived data calculation logic from the old mixin classes into standalone functions. Wire them into the DataModel `prepareDerivedData()` methods.

**Files:**
- Create: `src/logic/abilities.mjs`
- Create: `src/logic/defenses.mjs`
- Create: `src/logic/health.mjs`
- Create: `src/logic/shields.mjs`
- Create: `src/logic/skills.mjs`
- Create: `src/logic/traits.mjs`
- Modify: `src/data-models/actor/CharacterData.mjs`

- [ ] **Step 1: Create abilities.mjs**

Port `AbilityFunctions._prepareAbilityDerivedData()` as a standalone function. The logic is the same — it receives the DataModel instance instead of `this`:

```javascript
import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import { getLongKey, resolveValueArray } from "../util/util.mjs";

export function prepareAbilityDerivedData(system) {
  const actor = system.parent;
  let abilityGenType = system.settings?.abilityGeneration?.value;
  if (abilityGenType === "Default") {
    abilityGenType = game.settings.get("swse", "defaultAttributeGenerationType") || "Manual";
  }

  for (const [key, ability] of Object.entries(system.abilities)) {
    if (abilityGenType !== "Manual") {
      const longKey = getLongKey(key);
      if (!longKey) continue;

      const bonuses = getInheritableAttribute({
        entity: actor,
        attributeKey: `${longKey}Bonus`,
        reduce: "VALUES",
      });
      ability.bonus = resolveValueArray(bonuses, actor);
    }

    if (ability.base === null) {
      ability.value = 10;
    } else {
      ability.value = ability.base + (ability.bonus ?? 0);
    }

    ability.mod = Math.floor((ability.value + ability.customBonus - 10) / 2);

    const totalModifiers = ability.mod + (system.health.condition ?? 0);
    const label = CONFIG.SWSE.Abilities.abilitiesShort[key];

    ability.label = key.toUpperCase();
    actor.setResolvedVariable(
      "@" + key.toUpperCase() + "ROLL",
      "1d20" + (totalModifiers >= 0 ? " + " : " - ") + Math.abs(totalModifiers),
      label, label
    );
    actor.setResolvedVariable("@" + key.toUpperCase() + "MOD", totalModifiers, label + " Modifier", label + " Modifier");
    actor.setResolvedVariable("@" + key.toUpperCase() + "SCORE", ability.value, label + " Score", label + " Score");
  }
}
```

- [ ] **Step 2: Create traits.mjs, defenses.mjs, health.mjs, shields.mjs, skills.mjs**

Each file ports the corresponding `*Functions._prepare*DerivedData()` method as a standalone function with the same signature pattern: `export function prepare*DerivedData(system) { ... }`.

Port these from the old codebase files, changing:
- `this` → `system` parameter
- `this.parent` → `system.parent`
- Internal `this.` field access → `system.` field access
- Import paths updated to `../util/` prefix

**traits.mjs** — port `TraitsFunctions._prepareCharacterTraitsDerivedData()` from `module/actor/data/templates/traits.mjs`

**defenses.mjs** — port `DefenseFunctions._prepareDefenseDerivedData()` from `module/actor/data/templates/defenses.mjs`. Also port the defense resolver functions from `module/actor/defense.mjs` (`resolveDefenses`, `generateArmorBlock`).

**health.mjs** — port `HealthFunctions._prepareHealthDerivedData()` and `_prepareSecondWinds()` from `module/actor/data/templates/health.mjs`. Also port `resolveShield` from `module/actor/health.mjs`.

**shields.mjs** — port `ShieldFunctions._prepareShieldsDerivedData()` from `module/actor/data/templates/shields.mjs`.

**skills.mjs** — port `SkillFunctions._prepareSkillDerivedData()` and all helper methods (`applyGroupedSkills`, `resolveBonusesAndHandleModifiers`, `createNewSkill`, `configureSkill`, `isClassSkill`, `_prepareSkillRollData`, `_addSkillRerollNotes`, `_prepareRemainingSkills`, `cleanSkillName`, `uppercaseFirstLetters`, `standardizedAttribute`) as standalone functions or a single exported object with methods.

- [ ] **Step 3: Add prepareDerivedData to CharacterData**

Add this method to the `CharacterData` class in `src/data-models/actor/CharacterData.mjs`:

```javascript
import { prepareAbilityDerivedData } from "../../logic/abilities.mjs";
import { prepareDefenseDerivedData } from "../../logic/defenses.mjs";
import { prepareHealthDerivedData } from "../../logic/health.mjs";
import { prepareShieldsDerivedData } from "../../logic/shields.mjs";
import { prepareSkillDerivedData } from "../../logic/skills.mjs";
import { prepareTraitsDerivedData } from "../../logic/traits.mjs";
```

Then add the method to the class body:

```javascript
  prepareDerivedData() {
    this.parent.cache?.invalidateAll();
    prepareTraitsDerivedData(this);
    prepareAbilityDerivedData(this);
    prepareSkillDerivedData(this);
    prepareShieldsDerivedData(this);
    prepareDefenseDerivedData(this);
    prepareHealthDerivedData(this);
  }
```

- [ ] **Step 4: Commit**

```bash
git add src/logic/ src/data-models/actor/CharacterData.mjs
git commit -m "feat: add composition-based derived data logic functions"
```

---

### Task 13: Create migration framework

**Files:**
- Create: `src/migration.mjs`

- [ ] **Step 1: Create migration.mjs**

```javascript
const CURRENT_MIGRATION_VERSION = "14.0.0";

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

async function migrateToV14() {
  console.log("SWSE | Running v14 migration...");

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

  for (const pack of game.packs) {
    if (pack.metadata.packageType !== "world") continue;
    try {
      await migrateCompendium(pack);
    } catch (err) {
      console.error(`SWSE | Failed to migrate compendium ${pack.metadata.label}:`, err);
    }
  }
}

function migrateActorData(actor) {
  const updateData = {};
  return updateData;
}

function migrateItemData(item) {
  const updateData = {};
  const source = item.toObject();

  // Convert changes from object to array if needed
  if (source.system?.changes && !Array.isArray(source.system.changes)) {
    updateData["system.changes"] = Object.values(source.system.changes);
  }

  // Consolidate deprecated types
  if (source.type === "starshipManeuver") {
    updateData.type = "starShipManeuver";
  }
  if (source.type === "vehicleTemplate") {
    updateData.type = "vehicleBaseType";
  }

  return updateData;
}

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

- [ ] **Step 2: Commit**

```bash
git add src/migration.mjs
git commit -m "feat: add migration framework with v14 type consolidation"
```

---

### Task 14: Wire up the full entry point

Connect all DataModels, Document classes, config, settings, and migration into the entry point.

**Files:**
- Modify: `src/swse.mjs`

- [ ] **Step 1: Replace src/swse.mjs with the full entry point**

```javascript
import "./styles/swse.css";
import { SWSE, initializeStatusEffects } from "./config.mjs";
import { CharacterData } from "./data-models/actor/CharacterData.mjs";
import { VehicleData } from "./data-models/actor/VehicleData.mjs";
import { ComputerData } from "./data-models/actor/ComputerData.mjs";
import { SimpleItemData } from "./data-models/item/SimpleItemData.mjs";
import { WeaponData } from "./data-models/item/WeaponData.mjs";
import { ArmorData } from "./data-models/item/ArmorData.mjs";
import { EquipmentData } from "./data-models/item/EquipmentData.mjs";
import { BeastAttackData } from "./data-models/item/BeastAttackData.mjs";
import { TalentData } from "./data-models/item/TalentData.mjs";
import { ClassData } from "./data-models/item/ClassData.mjs";
import { SpeciesData } from "./data-models/item/SpeciesData.mjs";
import { TemplateItemData } from "./data-models/item/TemplateItemData.mjs";
import { UpgradeData } from "./data-models/item/UpgradeData.mjs";
import { LanguageData } from "./data-models/item/LanguageData.mjs";
import { SWSEActor } from "./documents/SWSEActor.mjs";
import { SWSEItem } from "./documents/SWSEItem.mjs";
import { SWSEActiveEffect } from "./documents/SWSEActiveEffect.mjs";
import { migrateWorld } from "./migration.mjs";

Hooks.once("init", () => {
  console.log("SWSE | Initializing Star Wars Saga Edition system");

  game.swse = {
    SWSEActor,
    SWSEItem,
    version: "14.0.0",
  };

  // Config
  CONFIG.SWSE = SWSE;

  // Combat
  CONFIG.Combat.initiative = CONFIG.Combat.initiative ?? {};
  CONFIG.Combat.initiative.formula = "1d20 + @initiative";
  CONFIG.Combat.initiative.decimals = 2;

  // Actor DataModels
  CONFIG.Actor.dataModels.character = CharacterData;
  CONFIG.Actor.dataModels.npc = CharacterData;
  CONFIG.Actor.dataModels.vehicle = VehicleData;
  CONFIG.Actor.dataModels["npc-vehicle"] = VehicleData;
  CONFIG.Actor.dataModels.computer = ComputerData;

  // Item DataModels
  CONFIG.Item.dataModels.trait = SimpleItemData;
  CONFIG.Item.dataModels.feat = SimpleItemData;
  CONFIG.Item.dataModels.beastSense = SimpleItemData;
  CONFIG.Item.dataModels.beastType = SimpleItemData;
  CONFIG.Item.dataModels.beastQuality = SimpleItemData;
  CONFIG.Item.dataModels.forcePower = SimpleItemData;
  CONFIG.Item.dataModels.forceSecret = SimpleItemData;
  CONFIG.Item.dataModels.forceRegimen = SimpleItemData;
  CONFIG.Item.dataModels.forceTechnique = SimpleItemData;
  CONFIG.Item.dataModels.starShipManeuver = SimpleItemData;
  CONFIG.Item.dataModels.affiliation = SimpleItemData;
  CONFIG.Item.dataModels.background = SimpleItemData;
  CONFIG.Item.dataModels.destiny = SimpleItemData;
  CONFIG.Item.dataModels.classFeature = SimpleItemData;
  CONFIG.Item.dataModels.hazard = SimpleItemData;
  CONFIG.Item.dataModels.implant = SimpleItemData;
  CONFIG.Item.dataModels["droid system"] = SimpleItemData;
  CONFIG.Item.dataModels.vehicleSystem = SimpleItemData;
  CONFIG.Item.dataModels.vehicleBaseType = SimpleItemData;
  CONFIG.Item.dataModels.weapon = WeaponData;
  CONFIG.Item.dataModels.armor = ArmorData;
  CONFIG.Item.dataModels.equipment = EquipmentData;
  CONFIG.Item.dataModels.beastAttack = BeastAttackData;
  CONFIG.Item.dataModels.talent = TalentData;
  CONFIG.Item.dataModels.class = ClassData;
  CONFIG.Item.dataModels.species = SpeciesData;
  CONFIG.Item.dataModels.template = TemplateItemData;
  CONFIG.Item.dataModels.upgrade = UpgradeData;
  CONFIG.Item.dataModels.language = LanguageData;

  // Document classes
  CONFIG.Actor.documentClass = SWSEActor;
  CONFIG.Item.documentClass = SWSEItem;
  CONFIG.ActiveEffect.documentClass = SWSEActiveEffect;

  // Status effects
  initializeStatusEffects(CONFIG);

  // Migration version setting
  game.settings.register("swse", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: "0",
  });

  // Placeholder settings for features that reference them
  game.settings.register("swse", "defaultAttributeGenerationType", {
    name: "Default Attribute Generation Type",
    hint: "How ability scores are generated by default.",
    scope: "world",
    config: true,
    type: String,
    default: "Manual",
    choices: { Manual: "Manual", Roll: "Roll", "Point Buy": "Point Buy", "Standard Array": "Standard Array" },
  });

  game.settings.register("swse", "homebrewRanges", {
    name: "Homebrew Ranges",
    hint: "Use homebrew range bands.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  // Use Foundry default sheets for Phase 1
  // Custom Svelte sheets will be added in Phase 2
});

Hooks.once("ready", async () => {
  console.log("SWSE | System ready");
  await migrateWorld();
});
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: `dist/swse.js` and `dist/swse.css` build without errors.

- [ ] **Step 3: Commit**

```bash
git add src/swse.mjs dist/
git commit -m "feat: wire up full entry point with all DataModels and Document classes"
```

---

### Task 15: Build, load in Foundry v14, and fix issues

**Files:** Various — depends on errors found

- [ ] **Step 1: Build the system**

```bash
npm run build
```

Fix any build errors (missing imports, syntax issues).

- [ ] **Step 2: Launch Foundry VTT v14 and activate the system**

Open Foundry VTT v14, create a new world with the SWSE system. Check the browser console (F12) for errors during system initialization.

- [ ] **Step 3: Test actor creation**

Create one of each actor type:
- Character
- NPC
- Vehicle
- NPC-Vehicle
- Computer

Each should create without console errors. Open the default sheet — it should display the schema fields.

- [ ] **Step 4: Test item creation**

Create one of each major item type:
- Weapon, Armor, Equipment, Feat, Talent, Species, Class, Force Power, Language, Template, Upgrade

Each should create without console errors.

- [ ] **Step 5: Test compendium packs**

Open at least 3 compendium packs (e.g., Weapons, Feats, Species). Verify items load and display.

- [ ] **Step 6: Fix any issues found**

Address console errors, schema mismatches, or missing fields. Common issues to watch for:
- Field type mismatches between existing pack data and new schema
- Missing imports causing undefined errors
- Circular dependency issues between document classes and utility files

- [ ] **Step 7: Rebuild and commit fixes**

```bash
npm run build
git add -A
git commit -m "fix: resolve issues found during v14 testing"
```

---

## Notes for Phase 2

Phase 2 (Character Sheet) will add:
- `src/sheets/actor/CharacterSheet.mjs` — AppV2 host with Svelte mount
- `src/sheets/actor/CharacterSheet.svelte` — Main character sheet component
- Tab components: Summary, Skills, Inventory, Features, Details
- Sheet registration replacing Foundry defaults
- Full CSS for the character sheet UI
