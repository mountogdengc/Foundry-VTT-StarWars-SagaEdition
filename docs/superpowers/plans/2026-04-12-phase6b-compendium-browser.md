# Phase 6b: Compendium Browser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a custom compendium browser with search, type/pack filtering, lazy loading, and drag support.

**Architecture:** ApplicationV2 host mounts a single Svelte 5 component. Data comes from pack indexes (lightweight). Results are filtered reactively and lazy-loaded on scroll.

**Tech Stack:** Foundry VTT v14 ApplicationV2, pack index API, Svelte 5, existing CSS theme system.

---

### Task 1: Create CompendiumBrowser Svelte component

**Files:**
- Create: `src/sheets/compendium/CompendiumBrowser.svelte`

- [ ] **Step 1: Create CompendiumBrowser.svelte**

```svelte
<script>
  let { } = $props();

  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");

  let searchText = $state("");
  let selectedType = $state("all");
  let enabledPacks = $state({});
  let allItems = $state([]);
  let loading = $state(true);
  let displayCount = $state(50);

  const itemTypes = [
    "all", "weapon", "armor", "equipment", "upgrade", "feat", "talent",
    "class", "species", "template", "forcePower", "forceSecret",
    "forceTechnique", "forceRegimen", "language", "affiliation",
    "background", "destiny", "trait", "beastAttack", "vehicleBaseType",
    "vehicleSystem", "hazard", "implant", "droid system",
  ];

  const filteredItems = $derived(() => {
    let items = allItems;

    if (selectedType !== "all") {
      items = items.filter(i => i.type === selectedType);
    }

    if (searchText.trim()) {
      const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      items = items.filter(i => regex.test(i.name));
    }

    items = items.filter(i => enabledPacks[i.packId] !== false);

    return items;
  });

  const displayItems = $derived(filteredItems().slice(0, displayCount));
  const totalCount = $derived(filteredItems().length);

  let debounceTimer;
  function onSearchInput(e) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchText = e.target.value;
      displayCount = 50;
    }, 200);
  }

  function onTypeChange(e) {
    selectedType = e.target.value;
    displayCount = 50;
  }

  function togglePack(packId) {
    enabledPacks = { ...enabledPacks, [packId]: !(enabledPacks[packId] ?? true) };
    displayCount = 50;
  }

  function onScroll(e) {
    const el = e.target;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      displayCount = Math.min(displayCount + 20, totalCount);
    }
  }

  function openItem(item) {
    const pack = game.packs.get(item.packId);
    if (pack) pack.getDocument(item.id).then(doc => doc?.sheet?.render(true));
  }

  function onDragStart(event, item) {
    const dragData = { type: "Item", uuid: `Compendium.${item.packId}.Item.${item.id}` };
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  // Load all pack indexes on mount
  async function loadPacks() {
    loading = true;
    const items = [];
    const packs = game.packs.filter(p =>
      p.metadata.packageType === "system" && p.documentName === "Item"
    );

    const packState = {};
    for (const pack of packs) {
      packState[pack.collection] = true;
      try {
        const index = await pack.getIndex();
        for (const entry of index) {
          items.push({
            id: entry._id,
            name: entry.name,
            img: entry.img || "icons/svg/item-bag.svg",
            type: entry.type || "unknown",
            packId: pack.collection,
            packLabel: pack.metadata.label,
          });
        }
      } catch (e) {
        console.warn(`SWSE | Failed to index pack ${pack.metadata.label}:`, e);
      }
    }

    items.sort((a, b) => a.name.localeCompare(b.name));
    allItems = items;
    enabledPacks = packState;
    loading = false;
  }

  $effect(() => { loadPacks(); });

  let showPacks = $state(false);
  const packList = $derived(Object.entries(enabledPacks).map(([id, enabled]) => {
    const pack = game.packs.get(id);
    return { id, label: pack?.metadata?.label ?? id, enabled };
  }));
</script>

<div class="swse-sheet" data-theme={theme}>
  <div class="swse-tab-content" onscroll={onScroll}>
    <!-- Search and filters -->
    <div style="display:flex; gap:8px; margin-bottom:8px; align-items:center;">
      <input class="swse-input" type="text" placeholder="Search..."
        oninput={onSearchInput}
        style="flex:1; text-align:left; font-size:13px; padding:4px 8px;" />
      <select class="swse-input" value={selectedType} onchange={onTypeChange}
        style="width:150px; text-align:left;">
        {#each itemTypes as t}
          <option value={t}>{t === "all" ? "All Types" : t}</option>
        {/each}
      </select>
      <button onclick={() => showPacks = !showPacks}
        style="background:none; border:1px solid var(--card-border); border-radius:3px; color:var(--label-color); cursor:pointer; padding:4px 8px; font-size:11px;">
        Packs {showPacks ? "▲" : "▼"}
      </button>
    </div>

    {#if showPacks}
      <div class="swse-card" style="margin-bottom:8px; max-height:120px; overflow-y:auto;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
          {#each packList as pack}
            <label style="display:flex; align-items:center; gap:4px; font-size:11px; cursor:pointer;">
              <input type="checkbox" checked={pack.enabled}
                onchange={() => togglePack(pack.id)} />
              {pack.label}
            </label>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Results -->
    {#if loading}
      <p style="text-align:center; color:var(--label-color); padding:24px;">Loading compendium data...</p>
    {:else}
      <table class="swse-item-list">
        <thead>
          <tr>
            <th style="width:24px;"></th>
            <th>Name</th>
            <th style="width:100px;">Type</th>
            <th style="width:140px;">Pack</th>
          </tr>
        </thead>
        <tbody>
          {#each displayItems as item}
            <tr draggable="true" ondragstart={(e) => onDragStart(e, item)} style="cursor:grab;">
              <td style="width:24px;">
                <img src={item.img} alt="" style="width:20px; height:20px; border:0;" />
              </td>
              <td class="swse-rollable" onclick={() => openItem(item)}>{item.name}</td>
              <td style="font-size:10px; color:var(--label-color);">{item.type}</td>
              <td style="font-size:10px; color:var(--label-color);">{item.packLabel}</td>
            </tr>
          {/each}
          {#if displayItems.length === 0}
            <tr><td colspan="4" style="text-align:center; color:var(--label-color); padding:12px;">No items match your search.</td></tr>
          {/if}
        </tbody>
      </table>
      <div style="text-align:center; color:var(--label-color); font-size:10px; padding:8px;">
        Showing {displayItems.length} of {totalCount} results
      </div>
    {/if}
  </div>
</div>
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/sheets/compendium/CompendiumBrowser.svelte
git commit -m "feat: add Compendium Browser Svelte component"
```

---

### Task 2: Create host class and register in entry point

**Files:**
- Create: `src/sheets/compendium/SWSECompendiumBrowser.mjs`
- Modify: `src/swse.mjs`

- [ ] **Step 1: Create SWSECompendiumBrowser.mjs**

```javascript
import { mount, unmount } from "svelte";
import CompendiumBrowser from "./CompendiumBrowser.svelte";

export class SWSECompendiumBrowser extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "swse-compendium-browser",
    classes: ["swse", "swse-compendium-browser"],
    position: { width: 720, height: 600 },
    window: {
      title: "SWSE Compendium Browser",
      resizable: true,
      minimizable: true,
    },
    actions: {},
  };

  static PARTS = {
    browser: { template: "systems/swse/templates/blank.hbs" },
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

    this.#svelteComponent = mount(CompendiumBrowser, {
      target: result,
      props: {},
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

- [ ] **Step 2: Register in swse.mjs**

Add import at the top of `src/swse.mjs`:

```javascript
import { SWSECompendiumBrowser } from "./sheets/compendium/SWSECompendiumBrowser.mjs";
```

Add to the `game.swse` object inside the init hook:

```javascript
  game.swse = {
    SWSEActor,
    SWSEItem,
    rollAttack: executeMacroAttack,
    openCompendiumBrowser: () => new SWSECompendiumBrowser().render(true),
    version: "14.0.0",
  };
```

Add a sidebar button after the ready hook:

```javascript
Hooks.on("renderSidebarTab", (app, html) => {
  if (app.tabName !== "compendium") return;
  const header = html[0]?.querySelector(".directory-header") ?? html.querySelector?.(".directory-header");
  if (!header) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.classList.add("swse-compendium-btn");
  btn.innerHTML = '<i class="fas fa-atlas"></i> SWSE Browser';
  btn.style.cssText = "margin:4px; padding:4px 8px; font-size:12px;";
  btn.addEventListener("click", () => game.swse.openCompendiumBrowser());
  header.appendChild(btn);
});
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/sheets/compendium/ src/swse.mjs
git commit -m "feat: add Compendium Browser with search, filters, and drag support"
```

---

### Task 3: Test in Foundry v14

- [ ] **Step 1: Build**

```bash
npm run build
```

- [ ] **Step 2: Test opening the browser**

Click the "SWSE Browser" button in the compendium sidebar tab. The browser should open with all items loaded.

- [ ] **Step 3: Test search**

Type a weapon name. Results should filter in real-time (debounced).

- [ ] **Step 4: Test type filter**

Select "weapon" from the type dropdown. Only weapons should appear.

- [ ] **Step 5: Test pack filter**

Click "Packs", uncheck a pack. Its items should disappear from results.

- [ ] **Step 6: Test drag to actor**

Drag an item from the browser onto a character sheet. It should be added to the actor.

- [ ] **Step 7: Fix any issues and commit**

```bash
npm run build
git add -A
git commit -m "fix: resolve issues found during compendium browser testing"
```

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/sheets/compendium/CompendiumBrowser.svelte` | Create | 1 |
| `src/sheets/compendium/SWSECompendiumBrowser.mjs` | Create | 2 |
| `src/swse.mjs` | Modify | 2 |
