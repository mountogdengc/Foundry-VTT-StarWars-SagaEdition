# Phase 3: Item Sheets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three grouped item sheets (Equipment, Feature, Simple) covering all item types with GM-editable changes tables and the existing theme system.

**Architecture:** A base ApplicationV2 host class (`SWSEItemSheetBase.mjs`) provides shared Svelte mount/unmount lifecycle. Three subclasses override window size and Svelte component. Each mounts a root Svelte component that reads `item.system.*` and updates via `item.update()`. Two new shared components (`ItemHeader`, `ChangesTable`) are reused across all three sheets.

**Tech Stack:** Foundry VTT v14 ItemSheetV2, Svelte 5 (runes mode), Vite 6, existing CSS theme system.

---

### Task 1: Create shared ItemHeader and ChangesTable components

**Files:**
- Create: `src/sheets/components/ItemHeader.svelte`
- Create: `src/sheets/components/ChangesTable.svelte`

- [ ] **Step 1: Create ItemHeader.svelte**

```svelte
<script>
  let { item } = $props();

  function openImagePicker() {
    const fp = new FilePicker({
      type: "image",
      current: item.img,
      callback: (path) => item.update({ img: path }),
    });
    fp.render(true);
  }

  function updateName(e) {
    item.update({ name: e.target.value });
  }

  const typeLabel = $derived(item.type.replace(/([A-Z])/g, " $1").trim());
</script>

<div class="swse-header" style="grid-template-columns: 80px 1fr auto;">
  <img class="swse-portrait" src={item.img} alt={item.name}
    onclick={openImagePicker} role="button" tabindex="0"
    onkeydown={(e) => e.key === "Enter" && openImagePicker()} />
  <div>
    <input class="swse-input swse-name" value={item.name}
      onchange={updateName} style="text-align:left; font-size:18px; font-weight:bold;" />
    <div class="swse-subtitle" style="text-transform:capitalize;">{typeLabel}</div>
  </div>
</div>
```

- [ ] **Step 2: Create ChangesTable.svelte**

```svelte
<script>
  let { item } = $props();

  const changes = $derived(item.system.changes ?? []);
  const isGM = $derived(game.user.isGM);

  function addChange() {
    const updated = [...changes, { key: "", value: "", mode: "add" }];
    item.update({ "system.changes": updated });
  }

  function removeChange(index) {
    const updated = changes.filter((_, i) => i !== index);
    item.update({ "system.changes": updated });
  }

  function updateChange(index, field, value) {
    const updated = changes.map((c, i) => i === index ? { ...c, [field]: value } : c);
    item.update({ "system.changes": updated });
  }
</script>

<div class="swse-section">
  <div class="swse-section-header">
    Changes ({changes.length})
    {#if isGM}
      <button onclick={addChange} style="float:right; background:none; border:none; color:var(--accent-color); cursor:pointer; font-size:12px;" title="Add Change">
        <i class="fas fa-plus"></i>
      </button>
    {/if}
  </div>

  {#if changes.length > 0}
    <table class="swse-item-list">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
          {#if isGM}<th style="width:40px;"></th>{/if}
        </tr>
      </thead>
      <tbody>
        {#each changes as change, i}
          <tr>
            {#if isGM}
              <td>
                <input class="swse-input" value={change.key ?? ""}
                  onchange={(e) => updateChange(i, "key", e.target.value)}
                  style="text-align:left; font-size:11px;" />
              </td>
              <td>
                <input class="swse-input" value={change.value ?? ""}
                  onchange={(e) => updateChange(i, "value", e.target.value)}
                  style="text-align:left; font-size:11px;" />
              </td>
              <td style="text-align:center;">
                <button onclick={() => removeChange(i)}
                  style="background:none; border:none; color:var(--label-color); cursor:pointer;"
                  title="Remove"><i class="fas fa-trash"></i></button>
              </td>
            {:else}
              <td style="font-size:11px;">{change.key ?? ""}</td>
              <td style="font-size:11px;">{change.value ?? ""}</td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p style="color:var(--label-color); text-align:center; padding:8px; font-size:11px;">No changes</p>
  {/if}
</div>
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/sheets/components/ItemHeader.svelte src/sheets/components/ChangesTable.svelte
git commit -m "feat: add shared ItemHeader and ChangesTable components for item sheets"
```

---

### Task 2: Create base item sheet host class

**Files:**
- Create: `src/sheets/item/SWSEItemSheetBase.mjs`

- [ ] **Step 1: Create SWSEItemSheetBase.mjs**

```javascript
import { mount, unmount } from "svelte";

export class SWSEItemSheetBase extends foundry.applications.sheets.ItemSheetV2 {
  static DEFAULT_OPTIONS = {
    classes: ["swse", "swse-item-sheet"],
    position: { width: 520, height: 520 },
    window: {
      resizable: true,
      minimizable: true,
    },
    actions: {},
  };

  static PARTS = {
    sheet: { template: "systems/swse/templates/blank.hbs" },
  };

  /**
   * Subclasses override this to return their Svelte component class.
   * @returns {typeof import("svelte").SvelteComponent}
   */
  get _svelteComponentClass() {
    throw new Error("Subclass must override _svelteComponentClass");
  }

  #svelteComponent = null;

  async _renderHTML(context, options) {
    const div = document.createElement("div");
    div.classList.add("swse-sheet-mount");
    div.style.height = "100%";
    return div;
  }

  _replaceHTML(result, content, options) {
    content.replaceChildren(result);

    if (this.#svelteComponent) {
      unmount(this.#svelteComponent);
      this.#svelteComponent = null;
    }

    this.#svelteComponent = mount(this._svelteComponentClass, {
      target: result,
      props: { item: this.document },
    });
  }

  async close(options = {}) {
    if (this.#svelteComponent) {
      unmount(this.#svelteComponent);
      this.#svelteComponent = null;
    }
    return super.close(options);
  }
}
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/sheets/item/SWSEItemSheetBase.mjs
git commit -m "feat: add base item sheet host class with Svelte lifecycle"
```

---

### Task 3: Create Simple item sheet

**Files:**
- Create: `src/sheets/item/SimpleSheet.svelte`
- Create: `src/sheets/item/SWSESimpleSheet.mjs`

- [ ] **Step 1: Create SimpleSheet.svelte**

```svelte
<script>
  import ItemHeader from "../components/ItemHeader.svelte";
  import ChangesTable from "../components/ChangesTable.svelte";

  let { item } = $props();

  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");
  const description = $derived(item.system.description ?? "");
</script>

<div class="swse-sheet" data-theme={theme}>
  <div class="swse-tab-content">
    <ItemHeader {item} />

    <ChangesTable {item} />

    <div class="swse-section">
      <div class="swse-section-header">Description</div>
      <div class="swse-card" style="min-height:80px;">
        {@html description || "<em style='color:var(--label-color);'>No description.</em>"}
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Create SWSESimpleSheet.mjs**

```javascript
import { SWSEItemSheetBase } from "./SWSEItemSheetBase.mjs";
import SimpleSheet from "./SimpleSheet.svelte";

export class SWSESimpleSheet extends SWSEItemSheetBase {
  static DEFAULT_OPTIONS = {
    ...SWSEItemSheetBase.DEFAULT_OPTIONS,
    classes: ["swse", "swse-item-sheet", "swse-simple-sheet"],
    position: { width: 480, height: 400 },
  };

  get _svelteComponentClass() {
    return SimpleSheet;
  }
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/sheets/item/SimpleSheet.svelte src/sheets/item/SWSESimpleSheet.mjs
git commit -m "feat: add Simple item sheet for languages, affiliations, and other basic items"
```

---

### Task 4: Create Feature item sheet

**Files:**
- Create: `src/sheets/item/FeatureSheet.svelte`
- Create: `src/sheets/item/SWSEFeatureSheet.mjs`

- [ ] **Step 1: Create FeatureSheet.svelte**

```svelte
<script>
  import ItemHeader from "../components/ItemHeader.svelte";
  import ChangesTable from "../components/ChangesTable.svelte";

  let { item } = $props();

  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");
  const system = $derived(item.system);
  const description = $derived(system.description ?? "");
  const prerequisite = $derived(system.prerequisite);
  const hasPrereqs = $derived(prerequisite && Object.keys(prerequisite).length > 0);
  const categories = $derived(system.categories ?? []);
  const source = $derived(system.supplier?.name ?? "");

  // Talent-specific
  const isTalent = $derived(item.type === "talent");
  const talentTree = $derived(system.talentTree ?? "");
  const talentTreeSource = $derived(system.talentTreeSource ?? "");
  const bonusTalentTree = $derived(system.bonusTalentTree ?? "");

  // Class-specific
  const isClass = $derived(item.type === "class");
  const levels = $derived(system.levels ?? []);

  // Species-specific
  const isSpecies = $derived(item.type === "species");
  const traits = $derived(system.traits ?? []);

  function updateField(path) {
    return (e) => item.update({ [path]: e.target.value });
  }
</script>

<div class="swse-sheet" data-theme={theme}>
  <div class="swse-tab-content">
    <ItemHeader {item} />

    {#if hasPrereqs}
      <div class="swse-section">
        <div class="swse-section-header">Prerequisites</div>
        <div class="swse-card" style="font-size:11px;">
          {#each Object.entries(prerequisite) as [key, value]}
            <div><span style="color:var(--label-color);">{key}:</span> {JSON.stringify(value)}</div>
          {/each}
        </div>
      </div>
    {/if}

    {#if categories.length > 0 || source}
      <div class="swse-section">
        <div class="swse-section-header">Details</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          {#if categories.length > 0}
            <div>
              <span class="swse-label">Categories</span>
              <div style="font-size:11px;">{categories.join(", ")}</div>
            </div>
          {/if}
          {#if source}
            <div>
              <span class="swse-label">Source</span>
              <div style="font-size:11px;">{source}</div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    {#if isTalent}
      <div class="swse-section">
        <div class="swse-section-header">Talent Tree</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <label class="swse-label">Tree
            <input class="swse-input" value={talentTree}
              onchange={updateField("system.talentTree")} style="text-align:left;" />
          </label>
          <label class="swse-label">Source
            <input class="swse-input" value={talentTreeSource}
              onchange={updateField("system.talentTreeSource")} style="text-align:left;" />
          </label>
          {#if bonusTalentTree}
            <label class="swse-label">Bonus Tree
              <input class="swse-input" value={bonusTalentTree}
                onchange={updateField("system.bonusTalentTree")} style="text-align:left;" />
            </label>
          {/if}
        </div>
      </div>
    {/if}

    {#if isClass && levels.length > 0}
      <div class="swse-section">
        <div class="swse-section-header">Class Levels ({levels.length})</div>
        <table class="swse-item-list">
          <thead><tr><th>Level</th><th>Details</th></tr></thead>
          <tbody>
            {#each levels as level, i}
              <tr>
                <td style="width:50px; text-align:center;">{i + 1}</td>
                <td style="font-size:11px;">{JSON.stringify(level)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    {#if isSpecies && traits.length > 0}
      <div class="swse-section">
        <div class="swse-section-header">Species Traits ({traits.length})</div>
        <table class="swse-item-list">
          <thead><tr><th>Trait</th></tr></thead>
          <tbody>
            {#each traits as trait}
              <tr><td style="font-size:11px;">{trait.finalName ?? trait.name ?? JSON.stringify(trait)}</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    <ChangesTable {item} />

    <div class="swse-section">
      <div class="swse-section-header">Description</div>
      <div class="swse-card" style="min-height:80px;">
        {@html description || "<em style='color:var(--label-color);'>No description.</em>"}
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Create SWSEFeatureSheet.mjs**

```javascript
import { SWSEItemSheetBase } from "./SWSEItemSheetBase.mjs";
import FeatureSheet from "./FeatureSheet.svelte";

export class SWSEFeatureSheet extends SWSEItemSheetBase {
  static DEFAULT_OPTIONS = {
    ...SWSEItemSheetBase.DEFAULT_OPTIONS,
    classes: ["swse", "swse-item-sheet", "swse-feature-sheet"],
    position: { width: 520, height: 520 },
  };

  get _svelteComponentClass() {
    return FeatureSheet;
  }
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/sheets/item/FeatureSheet.svelte src/sheets/item/SWSEFeatureSheet.mjs
git commit -m "feat: add Feature item sheet for feats, talents, classes, species, and force items"
```

---

### Task 5: Create Equipment item sheet

**Files:**
- Create: `src/sheets/item/EquipmentSheet.svelte`
- Create: `src/sheets/item/SWSEEquipmentSheet.mjs`

- [ ] **Step 1: Create EquipmentSheet.svelte**

```svelte
<script>
  import ItemHeader from "../components/ItemHeader.svelte";
  import ChangesTable from "../components/ChangesTable.svelte";

  let { item } = $props();

  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");
  const system = $derived(item.system);
  const description = $derived(system.description ?? "");

  // Physical properties
  const cost = $derived(system.cost ?? "");
  const weight = $derived(system.weight ?? "");
  const availability = $derived(system.availability ?? "");
  const subtype = $derived(system.subtype ?? "");
  const equipped = $derived(system.equipped ?? false);

  // Type checks
  const isWeapon = $derived(item.type === "weapon");
  const isArmor = $derived(item.type === "armor");
  const armorType = $derived(system.armorType ?? "");

  // Modes
  const modes = $derived(system.modes ?? []);
  const hasModes = $derived(modes.length > 0);

  function updateField(path) {
    return (e) => item.update({ [path]: e.target.value });
  }

  function toggleEquipped() {
    item.update({ "system.equipped": !equipped });
  }
</script>

<div class="swse-sheet" data-theme={theme}>
  <div class="swse-tab-content">
    <ItemHeader {item} />

    <!-- Physical properties -->
    <div class="swse-section">
      <div class="swse-section-header">Properties</div>
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
        <label class="swse-label">Cost
          <input class="swse-input" value={cost}
            onchange={updateField("system.cost")} style="text-align:left;" />
        </label>
        <label class="swse-label">Weight
          <input class="swse-input" value={weight}
            onchange={updateField("system.weight")} style="text-align:left;" />
        </label>
        <label class="swse-label">Availability
          <input class="swse-input" value={availability}
            onchange={updateField("system.availability")} style="text-align:left;" />
        </label>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px;">
        {#if isArmor}
          <label class="swse-label">Armor Type
            <select class="swse-input" value={armorType}
              onchange={updateField("system.armorType")} style="text-align:left;">
              <option value="">None</option>
              <option value="Light Armor">Light</option>
              <option value="Medium Armor">Medium</option>
              <option value="Heavy Armor">Heavy</option>
            </select>
          </label>
        {/if}
        {#if subtype && !isArmor}
          <label class="swse-label">Subtype
            <input class="swse-input" value={subtype}
              onchange={updateField("system.subtype")} style="text-align:left;" />
          </label>
        {/if}
        <label style="display:flex; align-items:center; gap:8px; margin-top:12px;">
          <input type="checkbox" checked={equipped} onchange={toggleEquipped} />
          <span>Equipped</span>
        </label>
      </div>
    </div>

    {#if hasModes}
      <div class="swse-section">
        <div class="swse-section-header">Modes ({modes.length})</div>
        <table class="swse-item-list">
          <thead><tr><th>Mode</th><th>Details</th></tr></thead>
          <tbody>
            {#each modes as mode, i}
              <tr>
                <td style="font-size:11px;">{mode.name ?? `Mode ${i + 1}`}</td>
                <td style="font-size:11px;">{mode.group ?? ""}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    <ChangesTable {item} />

    <div class="swse-section">
      <div class="swse-section-header">Description</div>
      <div class="swse-card" style="min-height:80px;">
        {@html description || "<em style='color:var(--label-color);'>No description.</em>"}
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Create SWSEEquipmentSheet.mjs**

```javascript
import { SWSEItemSheetBase } from "./SWSEItemSheetBase.mjs";
import EquipmentSheet from "./EquipmentSheet.svelte";

export class SWSEEquipmentSheet extends SWSEItemSheetBase {
  static DEFAULT_OPTIONS = {
    ...SWSEItemSheetBase.DEFAULT_OPTIONS,
    classes: ["swse", "swse-item-sheet", "swse-equipment-sheet"],
    position: { width: 520, height: 580 },
  };

  get _svelteComponentClass() {
    return EquipmentSheet;
  }
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/sheets/item/EquipmentSheet.svelte src/sheets/item/SWSEEquipmentSheet.mjs
git commit -m "feat: add Equipment item sheet for weapons, armor, equipment, and upgrades"
```

---

### Task 6: Register all item sheets in the entry point

**Files:**
- Modify: `src/swse.mjs`

- [ ] **Step 1: Add imports**

Add these imports at the top of `src/swse.mjs`, after the existing imports:

```javascript
import { SWSEEquipmentSheet } from "./sheets/item/SWSEEquipmentSheet.mjs";
import { SWSEFeatureSheet } from "./sheets/item/SWSEFeatureSheet.mjs";
import { SWSESimpleSheet } from "./sheets/item/SWSESimpleSheet.mjs";
```

- [ ] **Step 2: Add sheet registration**

Add inside the `Hooks.once("init", ...)` callback, after the existing `Actors.registerSheet` block:

```javascript
  // Item sheet registration
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

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/swse.mjs
git commit -m "feat: register all item sheets in entry point"
```

---

### Task 7: Test in Foundry v14 and fix issues

**Files:** Various — depends on errors found

- [ ] **Step 1: Build the system**

```bash
npm run build
```

- [ ] **Step 2: Launch Foundry VTT v14 and test item sheets**

Open Foundry VTT v14, load the SWSE world. Test opening items of different types:

- Open a weapon item → should show Equipment sheet with physical properties, equip toggle, changes, description
- Open an armor item → should show Equipment sheet with armor type dropdown
- Open a feat → should show Feature sheet with prerequisites, categories, changes, description
- Open a talent → should show Feature sheet with talent tree fields
- Open a class → should show Feature sheet with class levels
- Open a species → should show Feature sheet with species traits
- Open a language → should show Simple sheet with changes and description
- Open any other item type → should show Simple sheet

Check browser console (F12) for errors.

- [ ] **Step 3: Verify GM changes editing**

As a GM, open any item sheet and:
- Click the + button on the Changes section to add a change
- Edit the key and value fields
- Click the trash icon to remove a change
- Verify changes persist after closing and reopening the sheet

- [ ] **Step 4: Verify theme applies**

Item sheets should use the same theme as the character sheet (from the `sheetTheme` client setting).

- [ ] **Step 5: Fix any issues found**

Common issues to watch for:
- `equipped` field may not exist on all item data models — guard with `??`
- Svelte mount/unmount lifecycle mismatches
- `items.system.changes` may be an object instead of array on old data (migration should handle this)
- CSS class conflicts with Foundry defaults

- [ ] **Step 6: Rebuild and commit fixes**

```bash
npm run build
git add -A
git commit -m "fix: resolve issues found during item sheet testing"
```

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/sheets/components/ItemHeader.svelte` | Create | 1 |
| `src/sheets/components/ChangesTable.svelte` | Create | 1 |
| `src/sheets/item/SWSEItemSheetBase.mjs` | Create | 2 |
| `src/sheets/item/SimpleSheet.svelte` | Create | 3 |
| `src/sheets/item/SWSESimpleSheet.mjs` | Create | 3 |
| `src/sheets/item/FeatureSheet.svelte` | Create | 4 |
| `src/sheets/item/SWSEFeatureSheet.mjs` | Create | 4 |
| `src/sheets/item/EquipmentSheet.svelte` | Create | 5 |
| `src/sheets/item/SWSEEquipmentSheet.mjs` | Create | 5 |
| `src/swse.mjs` | Modify | 6 |
