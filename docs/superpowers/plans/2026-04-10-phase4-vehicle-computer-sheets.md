# Phase 4: Vehicle & Computer Sheets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a tabbed Vehicle sheet (6 tabs) for vehicle/npc-vehicle actors and a minimal Computer sheet for computer actors.

**Architecture:** Same ApplicationV2 + Svelte 5 pattern as Phase 2. Vehicle sheet reuses existing shared components (AbilityScore, DefenseBlock, HealthBar, ShieldDisplay, SkillRow, ItemList, TabBar, ResourceBox). One new shared component (CrewList) for managing actorLinks. Computer sheet is a single panel with no tabs.

**Tech Stack:** Foundry VTT v14 ApplicationV2, Svelte 5 (runes mode), Vite 6, existing CSS theme system.

---

### Task 1: Create CrewList shared component

**Files:**
- Create: `src/sheets/components/CrewList.svelte`

- [ ] **Step 1: Create CrewList.svelte**

```svelte
<script>
  let { actor } = $props();

  const links = $derived(actor.system.actorLinks ?? []);

  async function resolveActorName(uuid) {
    try {
      const doc = await fromUuid(uuid);
      return doc?.name ?? "Unknown";
    } catch {
      return "Unknown";
    }
  }

  async function removeLink(index) {
    const updated = links.filter((_, i) => i !== index);
    await actor.update({ "system.actorLinks": updated });
  }

  function updatePosition(index, value) {
    const updated = links.map((l, i) => i === index ? { ...l, position: value } : l);
    actor.update({ "system.actorLinks": updated });
  }
</script>

<div class="swse-section">
  <div class="swse-section-header">Crew ({links.length})</div>

  {#if links.length > 0}
    <table class="swse-item-list">
      <thead>
        <tr>
          <th>Name</th>
          <th style="width:120px;">Position</th>
          <th style="width:80px;">Slot</th>
          <th style="width:40px;"></th>
        </tr>
      </thead>
      <tbody>
        {#each links as link, i}
          <tr>
            <td>
              {#await resolveActorName(link.uuid)}
                <em style="color:var(--label-color);">Loading...</em>
              {:then name}
                {name}
              {/await}
            </td>
            <td>
              <select class="swse-input" value={link.position}
                onchange={(e) => updatePosition(i, e.target.value)} style="text-align:left; font-size:11px;">
                <option value="neutral">Neutral</option>
                <option value="pilot">Pilot</option>
                <option value="copilot">Copilot</option>
                <option value="gunner">Gunner</option>
                <option value="commander">Commander</option>
                <option value="system operator">System Operator</option>
                <option value="engineer">Engineer</option>
                <option value="passenger">Passenger</option>
              </select>
            </td>
            <td style="font-size:11px; color:var(--label-color);">{link.slot ?? "—"}</td>
            <td style="text-align:center;">
              <button onclick={() => removeLink(i)}
                style="background:none; border:none; color:var(--label-color); cursor:pointer;"
                title="Remove"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p style="color:var(--label-color); text-align:center; padding:12px; font-size:11px;">
      No crew assigned. Drag actors onto this sheet to add crew.
    </p>
  {/if}
</div>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/sheets/components/CrewList.svelte
git commit -m "feat: add CrewList component for vehicle crew management"
```

---

### Task 2: Create Vehicle tab components

**Files:**
- Create: `src/sheets/actor/vehicle-tabs/VehicleSummaryTab.svelte`
- Create: `src/sheets/actor/vehicle-tabs/VehicleSkillsTab.svelte`
- Create: `src/sheets/actor/vehicle-tabs/VehicleInventoryTab.svelte`
- Create: `src/sheets/actor/vehicle-tabs/VehicleCrewTab.svelte`
- Create: `src/sheets/actor/vehicle-tabs/VehicleDetailsTab.svelte`
- Create: `src/sheets/actor/vehicle-tabs/VehicleSettingsTab.svelte`

- [ ] **Step 1: Create VehicleSummaryTab.svelte**

```svelte
<script>
  import AbilityScore from "../../components/AbilityScore.svelte";
  import HealthBar from "../../components/HealthBar.svelte";
  import ShieldDisplay from "../../components/ShieldDisplay.svelte";
  import ResourceBox from "../../components/ResourceBox.svelte";

  let { actor } = $props();

  const system = $derived(actor.system);
  const size = $derived(system.size ?? "Medium");
  const cl = $derived(system.cl?.value ?? 0);
  const speed = $derived(system.speed ?? {});

  const reflex = $derived(system.defense?.ref?.value ?? 10);
  const fort = $derived(system.defense?.fort?.value ?? 10);
  const will = $derived(system.defense?.will?.value ?? 10);
  const ffRef = $derived(system.defense?.reff?.value ?? 10);
  const dt = $derived(system.defense?.dt?.value ?? 10);
  const dr = $derived(system.defense?.dr ?? 0);

  function updateName(e) { actor.update({ name: e.target.value }); }
  function openPortraitPicker() {
    const fp = new FilePicker({ type: "image", current: actor.img, callback: (path) => actor.update({ img: path }) });
    fp.render(true);
  }
  function updateDefense(path) {
    return (e) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val)) actor.update({ [path]: val });
    };
  }
</script>

<div class="swse-header">
  <img class="swse-portrait" src={actor.img} alt={actor.name}
    onclick={openPortraitPicker} role="button" tabindex="0"
    onkeydown={(e) => e.key === "Enter" && openPortraitPicker()} />
  <div>
    <input class="swse-input swse-name" value={actor.name}
      onchange={updateName} style="text-align:left; font-size:18px; font-weight:bold;" />
    <div class="swse-subtitle">{size} Vehicle &bull; CL {cl}</div>
    <div class="swse-subtitle">
      Speed: {speed.base ?? 0}
      {#if speed.fly != null} &bull; Fly: {speed.fly}{/if}
      {#if speed.swim} &bull; Swim: {speed.swim}{/if}
      {#if speed.special} &bull; {speed.special}{/if}
    </div>
  </div>
  <HealthBar {actor} />
  <ShieldDisplay {actor} />
</div>

<div class="swse-section">
  <div class="swse-grid-6">
    {#each Object.entries(system.abilities) as [key, ability]}
      <AbilityScore {key} {ability} {actor} />
    {/each}
  </div>
</div>

<div class="swse-section">
  <div class="swse-section-header">Defenses</div>
  <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:6px;">
    <div class="swse-card" style="text-align:center;">
      <div class="swse-label">Reflex</div>
      <input class="swse-input" type="number" value={reflex}
        onchange={updateDefense("system.defense.ref.value")} style="font-size:18px; width:50px;" />
    </div>
    <div class="swse-card" style="text-align:center;">
      <div class="swse-label">Fort</div>
      <input class="swse-input" type="number" value={fort}
        onchange={updateDefense("system.defense.fort.value")} style="font-size:18px; width:50px;" />
    </div>
    <div class="swse-card" style="text-align:center;">
      <div class="swse-label">Will</div>
      <input class="swse-input" type="number" value={will}
        onchange={updateDefense("system.defense.will.value")} style="font-size:18px; width:50px;" />
    </div>
    <div class="swse-card" style="text-align:center;">
      <div class="swse-label">FF Ref</div>
      <input class="swse-input" type="number" value={ffRef}
        onchange={updateDefense("system.defense.reff.value")} style="font-size:18px; width:50px;" />
    </div>
    <div class="swse-card" style="text-align:center;">
      <div class="swse-label">DT</div>
      <input class="swse-input" type="number" value={dt}
        onchange={updateDefense("system.defense.dt.value")} style="font-size:18px; width:50px;" />
    </div>
    <div class="swse-card" style="text-align:center;">
      <div class="swse-label">DR</div>
      <input class="swse-input" type="number" value={dr}
        onchange={updateDefense("system.defense.dr")} style="font-size:18px; width:50px;" />
    </div>
  </div>
</div>

<div class="swse-section">
  <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:6px;">
    <ResourceBox label="BAB" value={system.baseAttack} path="system.baseAttack" {actor} />
    <ResourceBox label="Grapple" value={system.grapple} path="system.grapple" {actor} />
    <ResourceBox label="Force Pts" value={system.forcePoints} path="system.forcePoints" {actor} />
    <ResourceBox label="Destiny" value={system.destinyPoints} path="system.destinyPoints" {actor} />
    <ResourceBox label="Dark Side" value={system.darkSideScore} path="system.darkSideScore" {actor} />
  </div>
</div>
```

- [ ] **Step 2: Create VehicleSkillsTab.svelte**

```svelte
<script>
  import SkillRow from "../../components/SkillRow.svelte";

  let { actor } = $props();

  const skills = $derived(actor.system.skills ?? {});
</script>

<div class="swse-section">
  <div class="swse-section-header">Vehicle Skills</div>
  <table class="swse-item-list">
    <thead>
      <tr>
        <th style="width:24px;">T</th>
        <th>Skill</th>
        <th style="width:36px; text-align:center;">Abl</th>
        <th style="width:48px; text-align:center;">Mod</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.entries(skills) as [name, skill]}
        <SkillRow {name} {skill} {actor} />
      {/each}
    </tbody>
  </table>
</div>
```

- [ ] **Step 3: Create VehicleInventoryTab.svelte**

```svelte
<script>
  import ItemList from "../../components/ItemList.svelte";

  let { actor } = $props();

  const equippedItems = $derived(
    [...(actor.items ?? [])].filter(i => i.system?.equipped && ["weapon", "armor", "vehicleSystem", "upgrade"].includes(i.type))
  );
  const unequippedItems = $derived(
    [...(actor.items ?? [])].filter(i => !i.system?.equipped && ["weapon", "armor", "vehicleSystem", "upgrade"].includes(i.type))
  );
</script>

<div class="swse-section">
  <div class="swse-section-header">Equipped Systems</div>
  <ItemList items={equippedItems} {actor} showEquip={true} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Unequipped</div>
  <ItemList items={unequippedItems} {actor} showEquip={true} />
</div>
```

- [ ] **Step 4: Create VehicleCrewTab.svelte**

```svelte
<script>
  import CrewList from "../../components/CrewList.svelte";

  let { actor } = $props();
</script>

<CrewList {actor} />
```

- [ ] **Step 5: Create VehicleDetailsTab.svelte**

```svelte
<script>
  let { actor } = $props();

  const system = $derived(actor.system);
  const details = $derived(system.details ?? {});
  const cl = $derived(system.cl?.value ?? 0);
  const size = $derived(system.size ?? "");
  const reach = $derived(system.reach ?? 1);
  const speed = $derived(system.speed ?? {});

  function updateField(path) {
    return (e) => actor.update({ [path]: e.target.value });
  }
  function updateNumber(path) {
    return (e) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val)) actor.update({ [path]: val });
    };
  }
</script>

<div class="swse-section">
  <div class="swse-section-header">Vehicle Stats</div>
  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
    <label class="swse-label">Challenge Level
      <input class="swse-input" type="number" value={cl} onchange={updateNumber("system.cl.value")} />
    </label>
    <label class="swse-label">Size
      <input class="swse-input" value={size} onchange={updateField("system.size")} style="text-align:left;" />
    </label>
    <label class="swse-label">Reach
      <input class="swse-input" type="number" value={reach} onchange={updateNumber("system.reach")} />
    </label>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:6px; margin-top:6px;">
    <label class="swse-label">Base Speed
      <input class="swse-input" type="number" value={speed.base ?? 0} onchange={updateNumber("system.speed.base")} />
    </label>
    <label class="swse-label">Fly Speed
      <input class="swse-input" type="number" value={speed.fly ?? ""} onchange={updateNumber("system.speed.fly")} />
    </label>
    <label class="swse-label">Swim Speed
      <input class="swse-input" type="number" value={speed.swim ?? 0} onchange={updateNumber("system.speed.swim")} />
    </label>
    <label class="swse-label">Climb Speed
      <input class="swse-input" type="number" value={speed.climb ?? 0} onchange={updateNumber("system.speed.climb")} />
    </label>
  </div>
  {#if details.fightSpace || details.specialQualities || details.specialActions}
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px;">
      {#if details.fightSpace}
        <div><span class="swse-label">Fighting Space</span><div style="font-size:11px;">{details.fightSpace}</div></div>
      {/if}
      {#if details.specialQualities}
        <div><span class="swse-label">Special Qualities</span><div style="font-size:11px;">{details.specialQualities}</div></div>
      {/if}
      {#if details.specialActions}
        <div><span class="swse-label">Special Actions</span><div style="font-size:11px;">{details.specialActions}</div></div>
      {/if}
    </div>
  {/if}
</div>

<div class="swse-section">
  <div class="swse-section-header">Notes</div>
  <div class="swse-card" style="min-height:80px;">
    {@html details.biography || "<em style='color:var(--label-color);'>No notes.</em>"}
  </div>
</div>
```

- [ ] **Step 6: Create VehicleSettingsTab.svelte**

```svelte
<script>
  let { actor } = $props();

  const effects = $derived([...(actor.effects ?? [])]);
  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");

  function updateTheme(e) {
    game.settings.set("swse", "sheetTheme", e.target.value);
  }

  function toggleEffect(effect) {
    effect.update({ disabled: !effect.disabled });
  }
</script>

<div class="swse-section">
  <div class="swse-section-header">Sheet Theme</div>
  <select class="swse-input" value={theme} onchange={updateTheme} style="text-align:left;">
    <option value="dark-scifi">Dark Sci-Fi</option>
    <option value="clean-neutral">Clean & Neutral</option>
    <option value="dark-minimal">Dark Minimal</option>
  </select>
</div>

<div class="swse-section">
  <div class="swse-section-header">Active Effects ({effects.length})</div>
  {#if effects.length > 0}
    <table class="swse-item-list">
      <thead><tr><th></th><th>Name</th><th style="width:60px; text-align:center;">Enabled</th></tr></thead>
      <tbody>
        {#each effects as effect}
          <tr>
            <td style="width:24px;"><img src={effect.icon} alt="" style="width:20px; height:20px; border:0;" /></td>
            <td>{effect.name}</td>
            <td style="text-align:center;">
              <input type="checkbox" checked={!effect.disabled} onchange={() => toggleEffect(effect)} />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p style="color:var(--label-color); text-align:center; padding:12px;">No active effects</p>
  {/if}
</div>
```

- [ ] **Step 7: Build and verify**

```bash
npm run build
```

- [ ] **Step 8: Commit**

```bash
git add src/sheets/actor/vehicle-tabs/
git commit -m "feat: add vehicle tab components"
```

---

### Task 3: Create Vehicle root component and host class

**Files:**
- Create: `src/sheets/actor/VehicleSheet.svelte`
- Create: `src/sheets/actor/SWSEVehicleSheet.mjs`

- [ ] **Step 1: Create VehicleSheet.svelte**

```svelte
<script>
  import TabBar from "../components/TabBar.svelte";
  import VehicleSummaryTab from "./vehicle-tabs/VehicleSummaryTab.svelte";
  import VehicleSkillsTab from "./vehicle-tabs/VehicleSkillsTab.svelte";
  import VehicleInventoryTab from "./vehicle-tabs/VehicleInventoryTab.svelte";
  import VehicleCrewTab from "./vehicle-tabs/VehicleCrewTab.svelte";
  import VehicleDetailsTab from "./vehicle-tabs/VehicleDetailsTab.svelte";
  import VehicleSettingsTab from "./vehicle-tabs/VehicleSettingsTab.svelte";

  let { actor } = $props();

  let activeTab = $state("summary");

  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "skills", label: "Skills" },
    { id: "inventory", label: "Systems" },
    { id: "crew", label: "Crew" },
    { id: "details", label: "Details" },
    { id: "settings", label: "Settings" },
  ];

  function onSelectTab(id) {
    activeTab = id;
  }
</script>

<div class="swse-sheet" data-theme={theme}>
  <TabBar {tabs} {activeTab} onSelect={onSelectTab} />

  <div class="swse-tab-content">
    {#if activeTab === "summary"}
      <VehicleSummaryTab {actor} />
    {:else if activeTab === "skills"}
      <VehicleSkillsTab {actor} />
    {:else if activeTab === "inventory"}
      <VehicleInventoryTab {actor} />
    {:else if activeTab === "crew"}
      <VehicleCrewTab {actor} />
    {:else if activeTab === "details"}
      <VehicleDetailsTab {actor} />
    {:else if activeTab === "settings"}
      <VehicleSettingsTab {actor} />
    {/if}
  </div>
</div>
```

- [ ] **Step 2: Create SWSEVehicleSheet.mjs**

```javascript
import { mount, unmount } from "svelte";
import VehicleSheet from "./VehicleSheet.svelte";

export class SWSEVehicleSheet extends foundry.applications.sheets.ActorSheetV2 {
  static DEFAULT_OPTIONS = {
    classes: ["swse", "swse-character-sheet", "swse-vehicle-sheet"],
    position: { width: 720, height: 700 },
    window: {
      resizable: true,
      minimizable: true,
    },
    actions: {},
  };

  static PARTS = {
    sheet: { template: "systems/swse/templates/blank.hbs" },
  };

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

    this.#svelteComponent = mount(VehicleSheet, {
      target: result,
      props: { actor: this.document },
    });
  }

  async close(options = {}) {
    if (this.#svelteComponent) {
      unmount(this.#svelteComponent);
      this.#svelteComponent = null;
    }
    return super.close(options);
  }

  _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    if (data.type === "Item") return this._onDropItem(event, data);
    if (data.type === "Actor") return this._onDropActor(event, data);
  }

  async _onDropItem(event, data) {
    const item = await Item.implementation.fromDropData(data);
    if (!item) return;
    if (item.parent?.id === this.document.id) return;
    return this.document.createEmbeddedDocuments("Item", [item.toObject()]);
  }

  async _onDropActor(event, data) {
    const droppedActor = await Actor.implementation.fromDropData(data);
    if (!droppedActor) return;
    const links = [...(this.document.system.actorLinks ?? [])];
    if (links.find(l => l.uuid === droppedActor.uuid)) return;
    links.push({ id: droppedActor.id, uuid: droppedActor.uuid, position: "neutral", slot: null });
    return this.document.update({ "system.actorLinks": links });
  }
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/sheets/actor/VehicleSheet.svelte src/sheets/actor/SWSEVehicleSheet.mjs
git commit -m "feat: add Vehicle root component and ApplicationV2 host with crew drop"
```

---

### Task 4: Create Computer sheet

**Files:**
- Create: `src/sheets/actor/ComputerSheet.svelte`
- Create: `src/sheets/actor/SWSEComputerSheet.mjs`

- [ ] **Step 1: Create ComputerSheet.svelte**

```svelte
<script>
  import ItemHeader from "../components/ItemHeader.svelte";

  let { actor } = $props();

  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");
  const content = $derived(actor.system.content ?? "");
  const cursor = $derived(actor.system.cursor ?? "root");
  const attributes = $derived(actor.system.attributes ?? {});
  const attrEntries = $derived(Object.entries(attributes));

  function updateCursor(e) {
    actor.update({ "system.cursor": e.target.value });
  }

  function updateName(e) {
    actor.update({ name: e.target.value });
  }

  function openImagePicker() {
    const fp = new FilePicker({ type: "image", current: actor.img, callback: (path) => actor.update({ img: path }) });
    fp.render(true);
  }
</script>

<div class="swse-sheet" data-theme={theme}>
  <div class="swse-tab-content">
    <div class="swse-header" style="grid-template-columns: 80px 1fr auto;">
      <img class="swse-portrait" src={actor.img} alt={actor.name}
        onclick={openImagePicker} role="button" tabindex="0"
        onkeydown={(e) => e.key === "Enter" && openImagePicker()} />
      <div>
        <input class="swse-input swse-name" value={actor.name}
          onchange={updateName} style="text-align:left; font-size:18px; font-weight:bold;" />
        <div class="swse-subtitle">Computer</div>
      </div>
    </div>

    <div class="swse-section">
      <div class="swse-section-header">Cursor</div>
      <input class="swse-input" value={cursor} onchange={updateCursor} style="text-align:left;" />
    </div>

    <div class="swse-section">
      <div class="swse-section-header">Content</div>
      <div class="swse-card" style="min-height:120px;">
        {@html content || "<em style='color:var(--label-color);'>No content.</em>"}
      </div>
    </div>

    {#if attrEntries.length > 0}
      <div class="swse-section">
        <div class="swse-section-header">Attributes</div>
        <table class="swse-item-list">
          <thead><tr><th>Key</th><th>Value</th></tr></thead>
          <tbody>
            {#each attrEntries as [key, value]}
              <tr>
                <td style="font-size:11px;">{key}</td>
                <td style="font-size:11px;">{typeof value === "object" ? JSON.stringify(value) : value}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
```

- [ ] **Step 2: Create SWSEComputerSheet.mjs**

```javascript
import { mount, unmount } from "svelte";
import ComputerSheet from "./ComputerSheet.svelte";

export class SWSEComputerSheet extends foundry.applications.sheets.ActorSheetV2 {
  static DEFAULT_OPTIONS = {
    classes: ["swse", "swse-character-sheet", "swse-computer-sheet"],
    position: { width: 480, height: 400 },
    window: {
      resizable: true,
      minimizable: true,
    },
    actions: {},
  };

  static PARTS = {
    sheet: { template: "systems/swse/templates/blank.hbs" },
  };

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

    this.#svelteComponent = mount(ComputerSheet, {
      target: result,
      props: { actor: this.document },
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

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/sheets/actor/ComputerSheet.svelte src/sheets/actor/SWSEComputerSheet.mjs
git commit -m "feat: add Computer sheet with content, cursor, and attributes display"
```

---

### Task 5: Register Vehicle and Computer sheets

**Files:**
- Modify: `src/swse.mjs`

- [ ] **Step 1: Add imports**

Add after existing sheet imports at top of `src/swse.mjs`:

```javascript
import { SWSEVehicleSheet } from "./sheets/actor/SWSEVehicleSheet.mjs";
import { SWSEComputerSheet } from "./sheets/actor/SWSEComputerSheet.mjs";
```

- [ ] **Step 2: Add registration**

Add inside `Hooks.once("init", ...)` after the existing `Actors.registerSheet` block:

```javascript
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

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/swse.mjs
git commit -m "feat: register Vehicle and Computer sheets"
```

---

### Task 6: Test in Foundry v14 and fix issues

**Files:** Various — depends on errors found

- [ ] **Step 1: Build**

```bash
npm run build
```

- [ ] **Step 2: Test Vehicle sheet**

Open a vehicle actor. Verify: Summary tab (defenses editable, abilities, HP, shields, speed), Skills tab (7 vehicle skills), Inventory (vehicle systems), Crew tab (actorLinks display), Details tab (CL, size, reach, speeds), Settings tab.

- [ ] **Step 3: Test crew drag-drop**

Drag a character actor onto the vehicle sheet. It should appear in the Crew tab. Change position dropdown. Remove crew member.

- [ ] **Step 4: Test Computer sheet**

Open a computer actor. Verify: name, content display, cursor field, attributes display.

- [ ] **Step 5: Fix any issues and commit**

```bash
npm run build
git add -A
git commit -m "fix: resolve issues found during vehicle/computer sheet testing"
```

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/sheets/components/CrewList.svelte` | Create | 1 |
| `src/sheets/actor/vehicle-tabs/VehicleSummaryTab.svelte` | Create | 2 |
| `src/sheets/actor/vehicle-tabs/VehicleSkillsTab.svelte` | Create | 2 |
| `src/sheets/actor/vehicle-tabs/VehicleInventoryTab.svelte` | Create | 2 |
| `src/sheets/actor/vehicle-tabs/VehicleCrewTab.svelte` | Create | 2 |
| `src/sheets/actor/vehicle-tabs/VehicleDetailsTab.svelte` | Create | 2 |
| `src/sheets/actor/vehicle-tabs/VehicleSettingsTab.svelte` | Create | 2 |
| `src/sheets/actor/VehicleSheet.svelte` | Create | 3 |
| `src/sheets/actor/SWSEVehicleSheet.mjs` | Create | 3 |
| `src/sheets/actor/ComputerSheet.svelte` | Create | 4 |
| `src/sheets/actor/SWSEComputerSheet.mjs` | Create | 4 |
| `src/swse.mjs` | Modify | 5 |
