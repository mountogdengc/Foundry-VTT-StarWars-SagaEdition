# Phase 5a: Attack Rolls + Chat Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add basic weapon attack rolls with styled chat cards and hotbar macro support.

**Architecture:** A `rollAttack(actor, weapon)` function computes attack and damage rolls using Foundry's Roll API, builds an HTML chat card, and sends it via `ChatMessage.create()`. The character sheet's ItemList component gets an attack button for weapons. A hotbar drop hook enables macro creation.

**Tech Stack:** Foundry VTT v14 Roll API, ChatMessage, Svelte 5, existing attribute-helper utilities.

---

### Task 1: Create chat card HTML builder

**Files:**
- Create: `src/combat/chat-card.mjs`

- [ ] **Step 1: Create chat-card.mjs**

```javascript
/**
 * Build HTML for an attack chat card.
 * @param {object} data
 * @param {string} data.actorName
 * @param {string} data.actorImg
 * @param {string} data.weaponName
 * @param {string} data.weaponImg
 * @param {string} data.attackTotal - rendered attack roll total
 * @param {string} data.attackTooltip - roll formula breakdown
 * @param {string} data.damageTotal - rendered damage roll total
 * @param {string} data.damageTooltip - roll formula breakdown
 * @param {boolean} data.isMelee
 * @returns {string} HTML string
 */
export function buildChatCardHTML(data) {
  const typeLabel = data.isMelee ? "Melee Attack" : "Ranged Attack";
  return `
    <div class="swse-chat-card" style="border:1px solid #1a3a5a; border-radius:4px; background:#0d1b2a; padding:0; font-family:'Signika',sans-serif; color:#c8d0d8;">
      <div style="display:flex; align-items:center; gap:8px; padding:8px; border-bottom:1px solid #1a3a5a;">
        <img src="${data.weaponImg}" alt="" style="width:32px; height:32px; border:0; border-radius:4px;" />
        <div>
          <div style="font-size:14px; font-weight:bold; color:#7ec8e3;">${data.weaponName}</div>
          <div style="font-size:10px; color:#4a8ab5;">${typeLabel} — ${data.actorName}</div>
        </div>
      </div>
      <div style="padding:8px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div style="text-align:center;">
          <div style="font-size:9px; color:#4a8ab5; text-transform:uppercase; letter-spacing:1px;">Attack</div>
          <div style="font-size:20px; font-weight:bold;" title="${data.attackTooltip}">${data.attackTotal}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:9px; color:#4a8ab5; text-transform:uppercase; letter-spacing:1px;">Damage</div>
          <div style="font-size:20px; font-weight:bold;" title="${data.damageTooltip}">${data.damageTotal}</div>
        </div>
      </div>
    </div>`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/combat/chat-card.mjs
git commit -m "feat: add attack chat card HTML builder"
```

---

### Task 2: Create core attack roll function

**Files:**
- Create: `src/combat/attack.mjs`
- Modify: `src/util/attack-stub.mjs`

- [ ] **Step 1: Create attack.mjs**

```javascript
import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import { toNumber } from "../util/util.mjs";
import { buildChatCardHTML } from "./chat-card.mjs";

/**
 * Determine if a weapon is melee based on its weapon group.
 * @param {Item} weapon
 * @returns {boolean}
 */
function isMeleeWeapon(weapon) {
  const groups = getInheritableAttribute({
    entity: weapon,
    attributeKey: "weaponGroup",
    reduce: "VALUES",
  });
  return groups.some(g => {
    const lower = (g || "").toLowerCase();
    return lower.includes("melee") || lower.includes("lightsaber");
  });
}

/**
 * Get the condition modifier for an actor.
 * @param {Actor} actor
 * @returns {number}
 */
function getConditionModifier(actor) {
  const condition = getInheritableAttribute({
    entity: actor,
    attributeKey: "condition",
    reduce: "FIRST",
  });
  if (!condition || condition === "OUT") return 0;
  return toNumber(condition) || 0;
}

/**
 * Roll an attack with a weapon and send results to chat.
 * @param {Actor} actor - The attacking actor
 * @param {Item} weapon - The weapon item
 */
export async function rollAttack(actor, weapon) {
  if (!actor || !weapon) return;

  const isMelee = isMeleeWeapon(weapon);

  // --- Attack Roll ---
  const bab = actor.baseAttackBonus ?? 0;
  const abilityMod = isMelee
    ? (actor.system.abilities.str?.mod ?? 0)
    : (actor.system.abilities.dex?.mod ?? 0);
  const conditionMod = getConditionModifier(actor);

  const attackBonus = bab + abilityMod + conditionMod;
  const attackRoll = new Roll(`1d20 + ${attackBonus}`);
  await attackRoll.evaluate();

  // --- Damage Roll ---
  const damageDice = getInheritableAttribute({
    entity: weapon,
    attributeKey: ["damage", "damageDie"],
    reduce: "SUM",
  });
  const halfHeroic = Math.floor((actor.heroicLevel ?? 0) / 2);
  const strMod = isMelee ? (actor.system.abilities.str?.mod ?? 0) : 0;
  const damageBonus = halfHeroic + strMod;

  let damageFormula = damageDice || "0";
  if (damageBonus > 0) {
    damageFormula += ` + ${damageBonus}`;
  } else if (damageBonus < 0) {
    damageFormula += ` - ${Math.abs(damageBonus)}`;
  }

  const damageRoll = new Roll(damageFormula);
  await damageRoll.evaluate();

  // --- Attack Tooltip ---
  const attackParts = [`BAB: ${bab}`];
  attackParts.push(`${isMelee ? "STR" : "DEX"}: ${abilityMod}`);
  if (conditionMod !== 0) attackParts.push(`Condition: ${conditionMod}`);
  const attackTooltip = attackParts.join("\n");

  // --- Damage Tooltip ---
  const damageParts = [`Dice: ${damageDice || "0"}`];
  if (halfHeroic) damageParts.push(`Half Heroic: ${halfHeroic}`);
  if (strMod) damageParts.push(`STR: ${strMod}`);
  const damageTooltip = damageParts.join("\n");

  // --- Chat Card ---
  const html = buildChatCardHTML({
    actorName: actor.name,
    actorImg: actor.img,
    weaponName: weapon.name,
    weaponImg: weapon.img,
    attackTotal: attackRoll.total,
    attackTooltip,
    damageTotal: damageRoll.total,
    damageTooltip,
    isMelee,
  });

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: html,
    rolls: [attackRoll, damageRoll],
    type: CONST.CHAT_MESSAGE_STYLES?.OTHER ?? 0,
  });
}
```

- [ ] **Step 2: Update attack-stub.mjs to re-export**

Replace the contents of `src/util/attack-stub.mjs` with:

```javascript
// Re-export from combat module
export { rollAttack } from "../combat/attack.mjs";
export class Attack {}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/combat/attack.mjs src/util/attack-stub.mjs
git commit -m "feat: add core attack roll function with chat card output"
```

---

### Task 3: Create hotbar macro support

**Files:**
- Create: `src/combat/macro.mjs`
- Modify: `src/util/macro-stub.mjs`

- [ ] **Step 1: Create macro.mjs**

```javascript
/**
 * Create a macro for a weapon attack when dropped on the hotbar.
 * @param {object} data - Drop data
 * @param {number} slot - Hotbar slot
 * @returns {Promise<boolean>} false to prevent default behavior
 */
export async function createAttackMacro(data, slot) {
  if (data.type !== "Item") return;

  const item = await Item.implementation.fromDropData(data);
  if (!item) return;
  if (item.type !== "weapon") return;

  const actor = item.parent;
  if (!actor) {
    ui.notifications.warn("This weapon is not owned by an actor.");
    return false;
  }

  const macroName = `Attack: ${item.name}`;
  const command = `game.swse.rollAttack("${actor.id}", "${item.id}");`;

  let macro = game.macros.find(m => m.name === macroName && m.command === command);
  if (!macro) {
    macro = await Macro.create({
      name: macroName,
      type: "script",
      img: item.img,
      command,
    });
  }

  await game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Execute an attack macro by actor and item ID.
 * Called from hotbar macro scripts.
 * @param {string} actorId
 * @param {string} itemId
 */
export async function executeMacroAttack(actorId, itemId) {
  const { rollAttack } = await import("./attack.mjs");
  const actor = game.actors.get(actorId);
  if (!actor) {
    ui.notifications.error("Actor not found.");
    return;
  }
  const item = actor.items.get(itemId);
  if (!item) {
    ui.notifications.error("Weapon not found on actor.");
    return;
  }
  await rollAttack(actor, item);
}
```

- [ ] **Step 2: Update macro-stub.mjs**

Replace the contents of `src/util/macro-stub.mjs` with:

```javascript
// Re-export from combat module
export { createAttackMacro } from "../combat/macro.mjs";
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/combat/macro.mjs src/util/macro-stub.mjs
git commit -m "feat: add hotbar macro support for weapon attacks"
```

---

### Task 4: Add attack button to ItemList and wire up entry point

**Files:**
- Modify: `src/sheets/components/ItemList.svelte`
- Modify: `src/swse.mjs`

- [ ] **Step 1: Add attack button to ItemList.svelte**

In `src/sheets/components/ItemList.svelte`, add the import and attack function at the top of the `<script>` block, after the existing props:

```javascript
  async function attackWithItem(item) {
    const { rollAttack } = await import("../../combat/attack.mjs");
    const actor = item.parent;
    if (actor) await rollAttack(actor, item);
  }
```

In the table header row, add a new column before the Controls column:

```svelte
      <th style="width:24px;"></th>
```

In the table body row, add the attack button cell before the controls cell — but only for weapons:

```svelte
        <td style="width:24px; text-align:center;">
          {#if item.type === "weapon"}
            <button onclick={() => attackWithItem(item)}
              style="background:none; border:none; color:var(--accent-color); cursor:pointer; font-size:12px;"
              title="Attack"><i class="fas fa-dice-d20"></i></button>
          {/if}
        </td>
```

The full updated ItemList.svelte should look like:

```svelte
<script>
  let { items = [], actor, showEquip = false } = $props();
  function editItem(item) { item.sheet.render(true); }
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
  async function attackWithItem(item) {
    const { rollAttack } = await import("../../combat/attack.mjs");
    const actor = item.parent;
    if (actor) await rollAttack(actor, item);
  }
</script>

<table class="swse-item-list">
  <thead>
    <tr>
      {#if showEquip}<th style="width:24px;"></th>{/if}
      <th style="width:24px;"></th>
      <th>Name</th>
      <th style="width:24px;"></th>
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
        <td style="width:24px; text-align:center;">
          {#if item.type === "weapon"}
            <button onclick={() => attackWithItem(item)}
              style="background:none; border:none; color:var(--accent-color); cursor:pointer; font-size:12px;"
              title="Attack"><i class="fas fa-dice-d20"></i></button>
          {/if}
        </td>
        <td style="text-align:right;">
          <div class="swse-item-controls">
            <button onclick={() => editItem(item)} title="Edit"><i class="fas fa-edit"></i></button>
            <button onclick={() => deleteItem(item)} title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    {/each}
    {#if items.length === 0}
      <tr><td colspan={showEquip ? 5 : 4} style="text-align:center; color:var(--label-color); padding:12px;">No items</td></tr>
    {/if}
  </tbody>
</table>
```

- [ ] **Step 2: Wire up entry point**

In `src/swse.mjs`, add import at the top:

```javascript
import { rollAttack } from "./combat/attack.mjs";
import { createAttackMacro, executeMacroAttack } from "./combat/macro.mjs";
```

Inside the `Hooks.once("init", ...)` callback, add to the `game.swse` object:

```javascript
  game.swse = {
    SWSEActor,
    SWSEItem,
    rollAttack: executeMacroAttack,
    version: "14.0.0",
  };
```

After the `Hooks.once("ready", ...)` block, add the hotbar hook:

```javascript
Hooks.on("hotbarDrop", (bar, data, slot) => {
  return createAttackMacro(data, slot);
});
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/sheets/components/ItemList.svelte src/swse.mjs
git commit -m "feat: add attack button to item list and hotbar macro hook"
```

---

### Task 5: Test in Foundry v14 and fix issues

**Files:** Various — depends on errors found

- [ ] **Step 1: Build**

```bash
npm run build
```

- [ ] **Step 2: Test weapon attack from sheet**

Open a character with a weapon equipped. Click the d20 icon next to the weapon. Verify:
- Attack roll appears in chat with styled card
- Attack total = d20 + BAB + ability mod + condition
- Damage total = weapon damage + half heroic level (+ STR for melee)
- Tooltip shows breakdown

- [ ] **Step 3: Test hotbar macro**

Drag a weapon from the character sheet to the hotbar. Click the macro. Verify it triggers the same attack roll.

- [ ] **Step 4: Fix any issues and commit**

```bash
npm run build
git add -A
git commit -m "fix: resolve issues found during attack system testing"
```

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/combat/chat-card.mjs` | Create | 1 |
| `src/combat/attack.mjs` | Create | 2 |
| `src/util/attack-stub.mjs` | Modify | 2 |
| `src/combat/macro.mjs` | Create | 3 |
| `src/util/macro-stub.mjs` | Modify | 3 |
| `src/sheets/components/ItemList.svelte` | Modify | 4 |
| `src/swse.mjs` | Modify | 4 |
