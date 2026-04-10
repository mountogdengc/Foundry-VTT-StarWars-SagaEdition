# Phase 2: Character Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a functional character sheet with Svelte 5 components, 8 tabs, and 3 selectable themes for the SWSE Foundry VTT v14 system.

**Architecture:** An ApplicationV2 host class (`SWSECharacterSheet.mjs`) mounts a root Svelte 5 component (`CharacterSheet.svelte`) which renders a tab bar and the active tab. Shared sub-components handle abilities, defenses, skills, items, etc. Three CSS themes are toggled via a `data-theme` attribute and a client-side Foundry setting.

**Tech Stack:** Foundry VTT v14 ApplicationV2, Svelte 5 (runes mode), Vite 6, plain CSS with custom properties.

---

### Task 1: Create CSS themes and sheet layout styles

**Files:**
- Create: `src/styles/themes/dark-scifi.css`
- Create: `src/styles/themes/clean-neutral.css`
- Create: `src/styles/themes/dark-minimal.css`
- Create: `src/styles/sheet.css`
- Modify: `src/styles/swse.css`

- [ ] **Step 1: Create dark-scifi.css**

```css
.swse-sheet[data-theme="dark-scifi"] {
  --sheet-bg: #0a0a12;
  --sheet-color: #c8d0d8;
  --card-bg: linear-gradient(180deg, #0d1b2a 0%, #1b2838 100%);
  --card-bg-flat: #0d1b2a;
  --card-border: #1a3a5a;
  --label-color: #4a8ab5;
  --accent-color: #7ec8e3;
  --input-bg: #0d1b2a;
  --input-border: #1a3a5a;
  --tab-active-bg: #1a3a5a;
  --tab-active-color: #7ec8e3;
  --tab-inactive-color: #4a6a8a;
  --hp-color: #e74c3c;
  --shield-color: #3498db;
  --hover-bg: rgba(122, 200, 227, 0.08);
  --section-border: #1a3a5a;
}
```

- [ ] **Step 2: Create clean-neutral.css**

```css
.swse-sheet[data-theme="clean-neutral"] {
  --sheet-bg: #f4f1eb;
  --sheet-color: #2c2c2c;
  --card-bg: #ffffff;
  --card-bg-flat: #ffffff;
  --card-border: #d4cfc5;
  --label-color: #8b7355;
  --accent-color: #5a4a3a;
  --input-bg: #ffffff;
  --input-border: #d4cfc5;
  --tab-active-bg: #ffffff;
  --tab-active-color: #2c2c2c;
  --tab-inactive-color: #8b7355;
  --hp-color: #c0392b;
  --shield-color: #2980b9;
  --hover-bg: rgba(139, 115, 85, 0.08);
  --section-border: #d4cfc5;
}
```

- [ ] **Step 3: Create dark-minimal.css**

```css
.swse-sheet[data-theme="dark-minimal"] {
  --sheet-bg: #1a1a1e;
  --sheet-color: #e0e0e0;
  --card-bg: #252528;
  --card-bg-flat: #252528;
  --card-border: #444;
  --label-color: #aaa;
  --accent-color: #f0f0f0;
  --input-bg: #2a2a2e;
  --input-border: #555;
  --tab-active-bg: #333;
  --tab-active-color: #f0f0f0;
  --tab-inactive-color: #888;
  --hp-color: #e74c3c;
  --shield-color: #3498db;
  --hover-bg: rgba(255, 255, 255, 0.05);
  --section-border: #444;
}
```

- [ ] **Step 4: Create sheet.css with layout styles**

```css
/* sheet.css — layout styles using custom properties */
.swse-sheet {
  background: var(--sheet-bg);
  color: var(--sheet-color);
  font-family: "Signika", sans-serif;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Tab bar */
.swse-tabs {
  display: flex;
  gap: 2px;
  padding: 0 8px;
  border-bottom: 1px solid var(--section-border);
  flex-shrink: 0;
}

.swse-tabs button {
  background: none;
  border: none;
  padding: 6px 12px;
  color: var(--tab-inactive-color);
  cursor: pointer;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}

.swse-tabs button:hover {
  color: var(--tab-active-color);
}

.swse-tabs button.active {
  color: var(--tab-active-color);
  border-bottom-color: var(--accent-color);
}

/* Tab content area */
.swse-tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}

/* Card / stat block */
.swse-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 4px;
  padding: 8px;
}

/* Labels */
.swse-label {
  font-size: 9px;
  color: var(--label-color);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

/* Editable input */
.swse-input {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 3px;
  color: var(--sheet-color);
  padding: 2px 4px;
  font-size: inherit;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
}

.swse-input:focus {
  outline: 1px solid var(--accent-color);
  border-color: var(--accent-color);
}

/* Clickable / rollable */
.swse-rollable {
  cursor: pointer;
}

.swse-rollable:hover {
  color: var(--accent-color);
  text-shadow: 0 0 4px var(--accent-color);
}

/* Section rows */
.swse-row {
  display: flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 2px;
}

.swse-row:hover {
  background: var(--hover-bg);
}

/* Section divider */
.swse-section {
  margin-bottom: 8px;
}

.swse-section-header {
  font-size: 11px;
  color: var(--label-color);
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid var(--section-border);
  padding-bottom: 4px;
  margin-bottom: 6px;
}

/* Grid helpers */
.swse-grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.swse-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.swse-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr) auto; gap: 6px; }

/* Header area */
.swse-header {
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.swse-portrait {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  border: 1px solid var(--card-border);
  object-fit: cover;
  cursor: pointer;
}

.swse-portrait:hover {
  border-color: var(--accent-color);
}

.swse-name {
  font-size: 18px;
  font-weight: bold;
}

.swse-subtitle {
  font-size: 11px;
  color: var(--label-color);
}

/* Item list */
.swse-item-list {
  width: 100%;
  border-collapse: collapse;
}

.swse-item-list th {
  font-size: 9px;
  color: var(--label-color);
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: left;
  padding: 4px;
  border-bottom: 1px solid var(--section-border);
}

.swse-item-list td {
  padding: 4px;
  border-bottom: 1px solid var(--section-border);
}

.swse-item-list tr:hover {
  background: var(--hover-bg);
}

.swse-item-controls {
  display: flex;
  gap: 4px;
  opacity: 0.5;
}

.swse-item-list tr:hover .swse-item-controls {
  opacity: 1;
}

.swse-item-controls button {
  background: none;
  border: none;
  color: var(--label-color);
  cursor: pointer;
  padding: 2px;
  font-size: 12px;
}

.swse-item-controls button:hover {
  color: var(--accent-color);
}
```

- [ ] **Step 5: Update swse.css to import theme and sheet styles**

Replace the contents of `src/styles/swse.css` with:

```css
@import "./sheet.css";
@import "./themes/dark-scifi.css";
@import "./themes/clean-neutral.css";
@import "./themes/dark-minimal.css";
```

- [ ] **Step 6: Build and verify**

```bash
npm run build
```

Expected: Build succeeds. `dist/swse.css` contains all the theme and layout styles.

- [ ] **Step 7: Commit**

```bash
git add src/styles/
git commit -m "feat: add sheet layout CSS and three selectable themes"
```

---

### Task 2: Create shared sub-components

**Files:**
- Create: `src/sheets/components/AbilityScore.svelte`
- Create: `src/sheets/components/DefenseBlock.svelte`
- Create: `src/sheets/components/HealthBar.svelte`
- Create: `src/sheets/components/ShieldDisplay.svelte`
- Create: `src/sheets/components/ResourceBox.svelte`
- Create: `src/sheets/components/TabBar.svelte`
- Create: `src/sheets/components/SkillRow.svelte`
- Create: `src/sheets/components/ItemList.svelte`

- [ ] **Step 1: Create AbilityScore.svelte**

```svelte
<script>
  let { key, ability, actor } = $props();

  const label = key.toUpperCase();
  const score = $derived(ability.value ?? 10);
  const mod = $derived(ability.mod ?? Math.floor((score - 10) / 2));
  const modStr = $derived(mod >= 0 ? `+${mod}` : `${mod}`);

  async function roll() {
    const r = new Roll(`1d20 + ${mod}`);
    await r.evaluate();
    await r.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${label} Check`,
    });
  }
</script>

<div class="swse-card" style="text-align:center;">
  <div class="swse-label">{label}</div>
  <div class="swse-rollable" onclick={roll} style="font-size:18px;">{score}</div>
  <div style="font-size:12px; color:var(--label-color);">{modStr}</div>
</div>
```

- [ ] **Step 2: Create DefenseBlock.svelte**

```svelte
<script>
  let { label, defense } = $props();

  const value = $derived(defense?.total ?? defense?.value ?? 0);
  const tooltip = $derived(() => {
    const parts = [];
    if (defense?.abilityBonus) parts.push(`Ability: ${defense.abilityBonus}`);
    if (defense?.armorBonus) parts.push(`Armor/Level: ${defense.armorBonus}`);
    if (defense?.classBonus) parts.push(`Class: ${defense.classBonus}`);
    if (defense?.miscBonus) parts.push(`Misc: ${defense.miscBonus}`);
    return parts.join("\n") || "No bonuses";
  });
</script>

<div class="swse-card" style="text-align:center;" title={tooltip()}>
  <div class="swse-label">{label}</div>
  <div style="font-size:18px;">{value}</div>
</div>
```

- [ ] **Step 3: Create HealthBar.svelte**

```svelte
<script>
  let { actor } = $props();

  const hp = $derived(actor.system.health.value);
  const maxHp = $derived(actor.system.health.max);

  function updateHp(e) {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) actor.update({ "system.health.value": val });
  }
</script>

<div class="swse-card" style="text-align:center;">
  <div class="swse-label">Hit Points</div>
  <div style="display:flex; align-items:baseline; justify-content:center; gap:4px;">
    <input class="swse-input" type="number" value={hp}
      onchange={updateHp} style="width:50px; font-size:18px; color:var(--hp-color);" />
    <span style="color:var(--label-color);">/</span>
    <span style="font-size:18px;">{maxHp}</span>
  </div>
</div>
```

- [ ] **Step 4: Create ShieldDisplay.svelte**

```svelte
<script>
  let { actor } = $props();

  const shields = $derived(actor.system.shields.value ?? 0);
  const maxShields = $derived(actor.system.shields.max ?? 0);
  const active = $derived(actor.system.shields.active ?? false);

  function updateShields(e) {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) actor.update({ "system.shields.value": val });
  }
</script>

<div class="swse-card" style="text-align:center;">
  <div class="swse-label">
    Shields {#if active}<span style="color:var(--shield-color);">●</span>{/if}
  </div>
  <div style="display:flex; align-items:baseline; justify-content:center; gap:4px;">
    <input class="swse-input" type="number" value={shields}
      onchange={updateShields} style="width:50px; font-size:18px; color:var(--shield-color);" />
    <span style="color:var(--label-color);">/</span>
    <span style="font-size:18px;">{maxShields}</span>
  </div>
</div>
```

- [ ] **Step 5: Create ResourceBox.svelte**

```svelte
<script>
  let { label, value, path, actor } = $props();

  function update(e) {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) actor.update({ [path]: val });
  }
</script>

<div class="swse-card" style="text-align:center;">
  <div class="swse-label">{label}</div>
  <input class="swse-input" type="number" value={value}
    onchange={update} style="width:50px; font-size:16px;" />
</div>
```

- [ ] **Step 6: Create TabBar.svelte**

```svelte
<script>
  let { tabs, activeTab, onSelect } = $props();
</script>

<nav class="swse-tabs">
  {#each tabs as tab}
    {#if !tab.hidden}
      <button
        class:active={activeTab === tab.id}
        onclick={() => onSelect(tab.id)}
      >
        {tab.label}
      </button>
    {/if}
  {/each}
</nav>
```

- [ ] **Step 7: Create SkillRow.svelte**

```svelte
<script>
  let { name, skill, actor } = $props();

  const total = $derived(skill.value ?? 0);
  const trained = $derived(skill.trained ?? false);
  const abilityMod = $derived(skill.abilityBonus ?? 0);
  const abilityLabel = $derived((skill.ability ?? "").toUpperCase());
  const focused = $derived(skill.focus ?? false);

  async function roll() {
    const r = new Roll(`1d20 + ${total}`);
    await r.evaluate();
    await r.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${name} Check`,
    });
  }

  function toggleTrained() {
    actor.update({ [`system.skills.${name}.trained`]: !trained });
  }
</script>

<tr class="swse-row">
  <td style="width:24px; text-align:center;">
    <input type="checkbox" checked={trained} onchange={toggleTrained} />
  </td>
  <td class="swse-rollable" onclick={roll} style="font-weight:{focused ? 'bold' : 'normal'};">
    {name} {#if focused}<span style="color:var(--accent-color);">★</span>{/if}
  </td>
  <td style="width:36px; text-align:center; color:var(--label-color); font-size:10px;">{abilityLabel}</td>
  <td style="width:48px; text-align:center;">{total >= 0 ? `+${total}` : total}</td>
</tr>
```

- [ ] **Step 8: Create ItemList.svelte**

```svelte
<script>
  let { items = [], actor, showEquip = false } = $props();

  function editItem(item) {
    item.sheet.render(true);
  }

  async function deleteItem(item) {
    const confirm = await Dialog.confirm({
      title: `Delete ${item.name}?`,
      content: `<p>Are you sure you want to delete <strong>${item.name}</strong>?</p>`,
    });
    if (confirm) await item.delete();
  }

  function toggleEquip(item) {
    item.update({ "system.equipped": !item.system.equipped });
  }
</script>

<table class="swse-item-list">
  <thead>
    <tr>
      {#if showEquip}<th style="width:24px;"></th>{/if}
      <th style="width:24px;"></th>
      <th>Name</th>
      <th style="width:60px; text-align:right;">Controls</th>
    </tr>
  </thead>
  <tbody>
    {#each items as item}
      <tr>
        {#if showEquip}
          <td style="width:24px; text-align:center;">
            <input type="checkbox" checked={item.system?.equipped ?? false}
              onchange={() => toggleEquip(item)} />
          </td>
        {/if}
        <td style="width:24px;">
          <img src={item.img} alt="" style="width:20px; height:20px; border:0;" />
        </td>
        <td class="swse-rollable" onclick={() => editItem(item)}>{item.name}</td>
        <td style="text-align:right;">
          <div class="swse-item-controls">
            <button onclick={() => editItem(item)} title="Edit"><i class="fas fa-edit"></i></button>
            <button onclick={() => deleteItem(item)} title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    {/each}
    {#if items.length === 0}
      <tr><td colspan={showEquip ? 4 : 3} style="text-align:center; color:var(--label-color); padding:12px;">No items</td></tr>
    {/if}
  </tbody>
</table>
```

- [ ] **Step 9: Build and verify**

```bash
npm run build
```

Expected: Build succeeds with no errors. Svelte components are compiled.

- [ ] **Step 10: Commit**

```bash
git add src/sheets/components/
git commit -m "feat: add shared Svelte sub-components for character sheet"
```

---

### Task 3: Create Summary tab

**Files:**
- Create: `src/sheets/actor/tabs/SummaryTab.svelte`

- [ ] **Step 1: Create SummaryTab.svelte**

```svelte
<script>
  import AbilityScore from "../../components/AbilityScore.svelte";
  import DefenseBlock from "../../components/DefenseBlock.svelte";
  import HealthBar from "../../components/HealthBar.svelte";
  import ShieldDisplay from "../../components/ShieldDisplay.svelte";
  import ResourceBox from "../../components/ResourceBox.svelte";

  let { actor } = $props();

  const system = $derived(actor.system);
  const classSummary = $derived(system.classSummary ?? "");
  const xp = $derived(system.xp ?? "");

  function openPortraitPicker() {
    const fp = new FilePicker({
      type: "image",
      current: actor.img,
      callback: (path) => actor.update({ img: path }),
    });
    fp.render(true);
  }

  function updateName(e) {
    actor.update({ name: e.target.value });
  }
</script>

<!-- Header: portrait + name + HP + shields -->
<div class="swse-header">
  <img class="swse-portrait" src={actor.img} alt={actor.name}
    onclick={openPortraitPicker} />
  <div>
    <input class="swse-input swse-name" value={actor.name}
      onchange={updateName} style="text-align:left; font-size:18px; font-weight:bold;" />
    <div class="swse-subtitle">{classSummary}</div>
    <div class="swse-subtitle">XP: {xp}</div>
  </div>
  <HealthBar {actor} />
  <ShieldDisplay {actor} />
</div>

<!-- Abilities -->
<div class="swse-section">
  <div class="swse-grid-6">
    {#each Object.entries(system.abilities) as [key, ability]}
      <AbilityScore {key} {ability} {actor} />
    {/each}
  </div>
</div>

<!-- Defenses -->
<div class="swse-section">
  <div class="swse-grid-3">
    <DefenseBlock label="Reflex" defense={system.defense?.reflex} />
    <DefenseBlock label="Fortitude" defense={system.defense?.fortitude} />
    <DefenseBlock label="Will" defense={system.defense?.will} />
    <DefenseBlock label="DT" defense={system.defense?.damageThreshold} />
  </div>
</div>

<!-- Combat stats -->
<div class="swse-section">
  <div class="swse-grid-4" style="grid-template-columns: repeat(5, 1fr);">
    <ResourceBox label="BAB" value={system.baseAttack} path="system.baseAttack" {actor} />
    <ResourceBox label="Grapple" value={system.grapple} path="system.grapple" {actor} />
    <ResourceBox label="Force Pts" value={system.forcePoints} path="system.forcePoints" {actor} />
    <ResourceBox label="Destiny" value={system.destinyPoints} path="system.destinyPoints" {actor} />
    <ResourceBox label="Dark Side" value={system.darkSideScore} path="system.darkSideScore" {actor} />
  </div>
</div>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/sheets/actor/tabs/SummaryTab.svelte
git commit -m "feat: add Summary tab component"
```

---

### Task 4: Create Skills tab

**Files:**
- Create: `src/sheets/actor/tabs/SkillsTab.svelte`

- [ ] **Step 1: Create SkillsTab.svelte**

```svelte
<script>
  import SkillRow from "../../components/SkillRow.svelte";

  let { actor } = $props();

  const skills = $derived(actor.system.skills ?? {});
  const remainingSkills = $derived(actor.system.remainingSkills);
  const tooManySkills = $derived(actor.system.tooManySkills);
</script>

<div class="swse-section">
  <div class="swse-section-header">
    Skills
    {#if remainingSkills !== false && remainingSkills !== undefined}
      <span style="float:right; font-size:10px;">
        Trained skills remaining: <strong>{remainingSkills}</strong>
      </span>
    {/if}
    {#if tooManySkills}
      <span style="float:right; font-size:10px; color:var(--hp-color);">
        Too many trained skills: <strong>{tooManySkills}</strong> over
      </span>
    {/if}
  </div>

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
        {#if !skill.hide}
          <SkillRow {name} {skill} {actor} />
        {/if}
      {/each}
    </tbody>
  </table>
</div>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/sheets/actor/tabs/SkillsTab.svelte
git commit -m "feat: add Skills tab component"
```

---

### Task 5: Create Inventory tab

**Files:**
- Create: `src/sheets/actor/tabs/InventoryTab.svelte`

- [ ] **Step 1: Create InventoryTab.svelte**

```svelte
<script>
  import ItemList from "../../components/ItemList.svelte";

  let { actor } = $props();

  const equippedItems = $derived(
    (actor.items ?? []).filter(i => i.system?.equipped && ["weapon", "armor", "equipment", "upgrade"].includes(i.type))
  );
  const unequippedItems = $derived(
    (actor.items ?? []).filter(i => !i.system?.equipped && ["weapon", "armor", "equipment", "upgrade"].includes(i.type))
  );
  const credits = $derived(actor.system.credits ?? 0);

  function updateCredits(e) {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) actor.update({ "system.credits": val });
  }
</script>

<div class="swse-section">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
    <div class="swse-section-header" style="margin-bottom:0;">Inventory</div>
    <div style="display:flex; align-items:center; gap:4px;">
      <span class="swse-label">Credits:</span>
      <input class="swse-input" type="number" value={credits}
        onchange={updateCredits} style="width:80px;" />
    </div>
  </div>
</div>

<div class="swse-section">
  <div class="swse-section-header">Equipped</div>
  <ItemList items={equippedItems} {actor} showEquip={true} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Unequipped</div>
  <ItemList items={unequippedItems} {actor} showEquip={true} />
</div>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/sheets/actor/tabs/InventoryTab.svelte
git commit -m "feat: add Inventory tab component"
```

---

### Task 6: Create Feats & Talents tab

**Files:**
- Create: `src/sheets/actor/tabs/FeatsTab.svelte`

- [ ] **Step 1: Create FeatsTab.svelte**

```svelte
<script>
  import ItemList from "../../components/ItemList.svelte";

  let { actor } = $props();

  const feats = $derived([...(actor.itemTypes?.feat ?? [])]);
  const talents = $derived([...(actor.itemTypes?.talent ?? [])]);
</script>

<div class="swse-section">
  <div class="swse-section-header">Feats ({feats.length})</div>
  <ItemList items={feats} {actor} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Talents ({talents.length})</div>
  <ItemList items={talents} {actor} />
</div>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/sheets/actor/tabs/FeatsTab.svelte
git commit -m "feat: add Feats & Talents tab component"
```

---

### Task 7: Create Force tab

**Files:**
- Create: `src/sheets/actor/tabs/ForceTab.svelte`

- [ ] **Step 1: Create ForceTab.svelte**

```svelte
<script>
  import ItemList from "../../components/ItemList.svelte";

  let { actor } = $props();

  const forcePowers = $derived([...(actor.itemTypes?.forcePower ?? [])]);
  const forceSecrets = $derived([...(actor.itemTypes?.forceSecret ?? [])]);
  const forceTechniques = $derived([...(actor.itemTypes?.forceTechnique ?? [])]);
  const forceRegimens = $derived([...(actor.itemTypes?.forceRegimen ?? [])]);
</script>

<div class="swse-section">
  <div class="swse-section-header">Force Powers ({forcePowers.length})</div>
  <ItemList items={forcePowers} {actor} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Force Secrets ({forceSecrets.length})</div>
  <ItemList items={forceSecrets} {actor} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Force Techniques ({forceTechniques.length})</div>
  <ItemList items={forceTechniques} {actor} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Force Regimens ({forceRegimens.length})</div>
  <ItemList items={forceRegimens} {actor} />
</div>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/sheets/actor/tabs/ForceTab.svelte
git commit -m "feat: add Force tab component"
```

---

### Task 8: Create Traits & Languages tab

**Files:**
- Create: `src/sheets/actor/tabs/TraitsTab.svelte`

- [ ] **Step 1: Create TraitsTab.svelte**

```svelte
<script>
  import ItemList from "../../components/ItemList.svelte";

  let { actor } = $props();

  const traits = $derived([...(actor.itemTypes?.trait ?? [])]);
  const affiliations = $derived([...(actor.itemTypes?.affiliation ?? [])]);
  const languages = $derived([...(actor.itemTypes?.language ?? [])]);
  const beastAttacks = $derived([...(actor.itemTypes?.beastAttack ?? [])]);
  const beastSenses = $derived([...(actor.itemTypes?.beastSense ?? [])]);
  const beastTypes = $derived([...(actor.itemTypes?.beastType ?? [])]);
  const beastQualities = $derived([...(actor.itemTypes?.beastQuality ?? [])]);
  const hasBeast = $derived(
    beastAttacks.length > 0 || beastSenses.length > 0 || beastTypes.length > 0 || beastQualities.length > 0
  );
</script>

<div class="swse-section">
  <div class="swse-section-header">Traits ({traits.length})</div>
  <ItemList items={traits} {actor} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Affiliations ({affiliations.length})</div>
  <ItemList items={affiliations} {actor} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Languages ({languages.length})</div>
  <ItemList items={languages} {actor} />
</div>

{#if hasBeast}
  <div class="swse-section">
    <div class="swse-section-header">Beast</div>
    {#if beastAttacks.length > 0}
      <div class="swse-label" style="margin:4px 0;">Natural Weapons</div>
      <ItemList items={beastAttacks} {actor} />
    {/if}
    {#if beastSenses.length > 0}
      <div class="swse-label" style="margin:4px 0;">Senses</div>
      <ItemList items={beastSenses} {actor} />
    {/if}
    {#if beastTypes.length > 0}
      <div class="swse-label" style="margin:4px 0;">Types</div>
      <ItemList items={beastTypes} {actor} />
    {/if}
    {#if beastQualities.length > 0}
      <div class="swse-label" style="margin:4px 0;">Qualities</div>
      <ItemList items={beastQualities} {actor} />
    {/if}
  </div>
{/if}
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/sheets/actor/tabs/TraitsTab.svelte
git commit -m "feat: add Traits & Languages tab component"
```

---

### Task 9: Create Details tab

**Files:**
- Create: `src/sheets/actor/tabs/DetailsTab.svelte`

- [ ] **Step 1: Create DetailsTab.svelte**

```svelte
<script>
  let { actor } = $props();

  const details = $derived(actor.system.details ?? {});
  const classSummary = $derived(actor.system.classSummary ?? "");
  const classLevels = $derived(actor.system.classLevel ?? {});

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
  <div class="swse-section-header">Class Progression</div>
  <div style="margin-bottom:8px; color:var(--label-color);">{classSummary}</div>
  {#if Object.keys(classLevels).length > 0}
    <table class="swse-item-list">
      <thead><tr><th>Class</th><th style="width:60px; text-align:center;">Levels</th></tr></thead>
      <tbody>
        {#each Object.entries(classLevels) as [name, levels]}
          <tr><td>{name}</td><td style="text-align:center;">{levels}</td></tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<div class="swse-section">
  <div class="swse-section-header">Personal Details</div>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
    <label class="swse-label">Gender
      <input class="swse-input" value={details.gender} onchange={updateField("system.details.gender")} />
    </label>
    <label class="swse-label">Sex
      <input class="swse-input" value={details.sex} onchange={updateField("system.details.sex")} />
    </label>
    <label class="swse-label">Age
      <input class="swse-input" type="number" value={details.age} onchange={updateNumber("system.details.age")} />
    </label>
    <label class="swse-label">Height
      <input class="swse-input" value={details.height} onchange={updateField("system.details.height")} />
    </label>
    <label class="swse-label">Weight
      <input class="swse-input" value={details.weight} onchange={updateField("system.details.weight")} />
    </label>
    <label class="swse-label">Player
      <input class="swse-input" value={details.player} onchange={updateField("system.details.player")} />
    </label>
  </div>
</div>

<div class="swse-section">
  <div class="swse-section-header">Biography</div>
  <div class="swse-card" style="min-height:150px;">
    {@html details.biography || "<em style='color:var(--label-color);'>No biography written.</em>"}
  </div>
</div>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/sheets/actor/tabs/DetailsTab.svelte
git commit -m "feat: add Details tab component"
```

---

### Task 10: Create Settings tab

**Files:**
- Create: `src/sheets/actor/tabs/SettingsTab.svelte`

- [ ] **Step 1: Create SettingsTab.svelte**

```svelte
<script>
  let { actor } = $props();

  const settings = $derived(actor.system.settings ?? {});
  const isNPC = $derived(settings.isNPC?.value ?? false);
  const ignorePrereqs = $derived(settings.ignorePrerequisites?.value ?? false);
  const abilityGen = $derived(settings.abilityGeneration?.value ?? "Default");
  const effects = $derived([...(actor.effects ?? [])]);

  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");

  function updateNPC(e) {
    actor.update({ "system.settings.isNPC.value": e.target.checked });
  }

  function updateIgnorePrereqs(e) {
    actor.update({ "system.settings.ignorePrerequisites.value": e.target.checked });
  }

  function updateAbilityGen(e) {
    actor.update({ "system.settings.abilityGeneration.value": e.target.value });
  }

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
  <div class="swse-section-header">Character Settings</div>
  <div style="display:flex; flex-direction:column; gap:8px;">
    <label style="display:flex; align-items:center; gap:8px;">
      <input type="checkbox" checked={isNPC} onchange={updateNPC} />
      <span>Is NPC</span>
    </label>
    <label style="display:flex; align-items:center; gap:8px;">
      <input type="checkbox" checked={ignorePrereqs} onchange={updateIgnorePrereqs} />
      <span>Ignore Prerequisites</span>
    </label>
    <label class="swse-label">Ability Generation
      <select class="swse-input" value={abilityGen} onchange={updateAbilityGen} style="text-align:left;">
        <option value="Default">Default</option>
        <option value="Manual">Manual</option>
        <option value="Roll">Roll</option>
        <option value="Point Buy">Point Buy</option>
        <option value="Standard Array">Standard Array</option>
      </select>
    </label>
  </div>
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

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/sheets/actor/tabs/SettingsTab.svelte
git commit -m "feat: add Settings tab component with theme selector"
```

---

### Task 11: Create root CharacterSheet.svelte and ApplicationV2 host

**Files:**
- Create: `src/sheets/actor/CharacterSheet.svelte`
- Create: `src/sheets/actor/SWSECharacterSheet.mjs`

- [ ] **Step 1: Create CharacterSheet.svelte**

```svelte
<script>
  import TabBar from "../components/TabBar.svelte";
  import SummaryTab from "./tabs/SummaryTab.svelte";
  import SkillsTab from "./tabs/SkillsTab.svelte";
  import InventoryTab from "./tabs/InventoryTab.svelte";
  import FeatsTab from "./tabs/FeatsTab.svelte";
  import ForceTab from "./tabs/ForceTab.svelte";
  import TraitsTab from "./tabs/TraitsTab.svelte";
  import DetailsTab from "./tabs/DetailsTab.svelte";
  import SettingsTab from "./tabs/SettingsTab.svelte";

  let { actor } = $props();

  let activeTab = $state("summary");

  const isForceSensitive = $derived(actor.isForceSensitive ?? false);
  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");

  const tabs = $derived([
    { id: "summary", label: "Summary" },
    { id: "skills", label: "Skills" },
    { id: "inventory", label: "Inventory" },
    { id: "feats", label: "Feats & Talents" },
    { id: "force", label: "The Force", hidden: !isForceSensitive },
    { id: "traits", label: "Traits & Languages" },
    { id: "details", label: "Details" },
    { id: "settings", label: "Settings" },
  ]);

  function onSelectTab(id) {
    activeTab = id;
  }
</script>

<div class="swse-sheet" data-theme={theme}>
  <TabBar {tabs} {activeTab} onSelect={onSelectTab} />

  <div class="swse-tab-content">
    {#if activeTab === "summary"}
      <SummaryTab {actor} />
    {:else if activeTab === "skills"}
      <SkillsTab {actor} />
    {:else if activeTab === "inventory"}
      <InventoryTab {actor} />
    {:else if activeTab === "feats"}
      <FeatsTab {actor} />
    {:else if activeTab === "force"}
      <ForceTab {actor} />
    {:else if activeTab === "traits"}
      <TraitsTab {actor} />
    {:else if activeTab === "details"}
      <DetailsTab {actor} />
    {:else if activeTab === "settings"}
      <SettingsTab {actor} />
    {/if}
  </div>
</div>
```

- [ ] **Step 2: Create SWSECharacterSheet.mjs**

```javascript
import { mount, unmount } from "svelte";
import CharacterSheet from "./CharacterSheet.svelte";

export class SWSECharacterSheet extends foundry.applications.sheets.ActorSheetV2 {
  static DEFAULT_OPTIONS = {
    classes: ["swse", "swse-character-sheet"],
    position: { width: 720, height: 700 },
    window: {
      resizable: true,
      minimizable: true,
    },
    actions: {},
  };

  static PARTS = {
    sheet: { template: "templates/blank.hbs" },
  };

  #svelteComponent = null;

  async _renderHTML(context, options) {
    const div = document.createElement("div");
    div.classList.add("swse-sheet-mount");
    div.style.height = "100%";
    return div;
  }

  _replaceHTML(result, content, options) {
    // Clear previous content
    content.replaceChildren(result);

    // Destroy old Svelte component if it exists
    if (this.#svelteComponent) {
      unmount(this.#svelteComponent);
      this.#svelteComponent = null;
    }

    // Mount new Svelte component
    this.#svelteComponent = mount(CharacterSheet, {
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
    if (data.type === "Item") {
      return this._onDropItem(event, data);
    }
  }

  async _onDropItem(event, data) {
    const item = await Item.implementation.fromDropData(data);
    if (!item) return;

    // If the item is from this actor, do nothing (no reorder in Phase 2)
    if (item.parent?.id === this.document.id) return;

    // Create the item on this actor
    return this.document.createEmbeddedDocuments("Item", [item.toObject()]);
  }
}
```

- [ ] **Step 3: Create blank template**

Create `templates/blank.hbs` (required by ApplicationV2 PARTS, but we replace it with Svelte):

```handlebars
<div></div>
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: Build succeeds. The Svelte components and host class are compiled.

- [ ] **Step 5: Commit**

```bash
git add src/sheets/actor/CharacterSheet.svelte src/sheets/actor/SWSECharacterSheet.mjs templates/
git commit -m "feat: add ApplicationV2 host and root CharacterSheet Svelte component"
```

---

### Task 12: Register the sheet and theme setting in the entry point

**Files:**
- Modify: `src/swse.mjs`

- [ ] **Step 1: Add sheet import and registration**

Add to the top of `src/swse.mjs`, after the existing imports:

```javascript
import { SWSECharacterSheet } from "./sheets/actor/SWSECharacterSheet.mjs";
```

Add inside the `Hooks.once("init", ...)` callback, after the status effects block and before the settings block:

```javascript
  // Sheet registration
  Actors.registerSheet("swse", SWSECharacterSheet, {
    types: ["character", "npc"],
    makeDefault: true,
    label: "SWSE Character Sheet",
  });
```

Add the theme setting alongside the existing settings:

```javascript
  game.settings.register("swse", "sheetTheme", {
    name: "Sheet Theme",
    hint: "Visual theme for character sheets.",
    scope: "client",
    config: false,
    type: String,
    default: "dark-scifi",
    choices: {
      "dark-scifi": "Dark Sci-Fi",
      "clean-neutral": "Clean & Neutral",
      "dark-minimal": "Dark Minimal",
    },
  });
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/swse.mjs
git commit -m "feat: register character sheet and theme setting"
```

---

### Task 13: Test in Foundry v14 and fix issues

**Files:** Various — depends on errors found

- [ ] **Step 1: Build the system**

```bash
npm run build
```

- [ ] **Step 2: Launch Foundry VTT v14 and open a character**

Open Foundry VTT v14, load the SWSE world. Open an existing character actor. Check the browser console (F12) for errors during sheet rendering.

- [ ] **Step 3: Verify tab switching**

Click through all 8 tabs. Each should render without console errors.

- [ ] **Step 4: Verify Summary tab data**

Confirm abilities, defenses, HP, shields, and combat stats display with correct values from the data model.

- [ ] **Step 5: Verify Skills tab**

Confirm skill list renders with trained checkboxes and totals. Click a skill name to test rolling.

- [ ] **Step 6: Verify Inventory tab**

Create a weapon or armor item on the actor. Confirm it appears in the equipped/unequipped lists. Test equip toggle.

- [ ] **Step 7: Verify theme switching**

Go to Settings tab, change theme dropdown. Sheet should re-render with the new theme colors.

- [ ] **Step 8: Fix any issues found**

Address console errors, layout problems, or broken interactions. Common issues:
- Svelte mount/unmount lifecycle issues with Foundry re-renders
- Missing data paths causing undefined access
- CSS specificity conflicts with Foundry's default styles
- ApplicationV2 API differences from documentation

- [ ] **Step 9: Rebuild and commit fixes**

```bash
npm run build
git add -A
git commit -m "fix: resolve issues found during character sheet testing"
```

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/styles/themes/dark-scifi.css` | Create | 1 |
| `src/styles/themes/clean-neutral.css` | Create | 1 |
| `src/styles/themes/dark-minimal.css` | Create | 1 |
| `src/styles/sheet.css` | Create | 1 |
| `src/styles/swse.css` | Modify | 1 |
| `src/sheets/components/AbilityScore.svelte` | Create | 2 |
| `src/sheets/components/DefenseBlock.svelte` | Create | 2 |
| `src/sheets/components/HealthBar.svelte` | Create | 2 |
| `src/sheets/components/ShieldDisplay.svelte` | Create | 2 |
| `src/sheets/components/ResourceBox.svelte` | Create | 2 |
| `src/sheets/components/TabBar.svelte` | Create | 2 |
| `src/sheets/components/SkillRow.svelte` | Create | 2 |
| `src/sheets/components/ItemList.svelte` | Create | 2 |
| `src/sheets/actor/tabs/SummaryTab.svelte` | Create | 3 |
| `src/sheets/actor/tabs/SkillsTab.svelte` | Create | 4 |
| `src/sheets/actor/tabs/InventoryTab.svelte` | Create | 5 |
| `src/sheets/actor/tabs/FeatsTab.svelte` | Create | 6 |
| `src/sheets/actor/tabs/ForceTab.svelte` | Create | 7 |
| `src/sheets/actor/tabs/TraitsTab.svelte` | Create | 8 |
| `src/sheets/actor/tabs/DetailsTab.svelte` | Create | 9 |
| `src/sheets/actor/tabs/SettingsTab.svelte` | Create | 10 |
| `src/sheets/actor/CharacterSheet.svelte` | Create | 11 |
| `src/sheets/actor/SWSECharacterSheet.mjs` | Create | 11 |
| `templates/blank.hbs` | Create | 11 |
| `src/swse.mjs` | Modify | 12 |
