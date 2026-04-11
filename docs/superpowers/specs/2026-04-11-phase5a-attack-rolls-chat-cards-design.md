# Phase 5a: Basic Attack Rolls + Chat Cards Design Spec

**Date:** 2026-04-11
**Scope:** Basic weapon attack rolls and styled chat cards. Click weapon to roll attack + damage.

---

## Overview

Add basic attack functionality: clicking a weapon on the character sheet rolls attack and damage, displaying results in a styled chat card. Weapons can be dragged to the hotbar to create attack macros. This is the foundation — proficiency/focus/specialization, area targeting, and vehicle crew attacks come in later sub-phases.

---

## Attack Roll

**Formula:** `1d20 + BAB + ability modifier + condition modifier`

- **BAB:** `actor.baseAttackBonus` (already computed in Phase 1)
- **Ability modifier:** STR mod for melee weapons, DEX mod for ranged weapons
- **Condition modifier:** from `getInheritableAttribute(actor, "condition")`
- **Melee vs ranged detection:** check weapon's inheritable attributes for weapon group. Groups containing "melee", "lightsaber" → melee. Everything else → ranged.

---

## Damage Roll

**Formula:** weapon damage dice + half heroic level + STR mod (melee only)

- **Damage dice:** `getInheritableAttribute(weapon, ["damage", "damageDie"], reduce: "SUM")`
- **Half heroic level:** `Math.floor(actor.heroicLevel / 2)`
- **STR mod:** `actor.system.abilities.str.mod` (melee weapons only)

---

## Chat Card

A styled HTML message sent to chat showing:

```
┌──────────────────────────────┐
│ [Weapon Icon] Weapon Name    │
│ Attacker Name                │
├──────────────────────────────┤
│ Attack:  [roll result]       │
│ Damage:  [roll result]       │
└──────────────────────────────┘
```

Uses Foundry's `ChatMessage.create()` with an HTML content string. The card uses inline styles matching the system's dark theme for consistency in chat. Roll results use Foundry's inline roll rendering (clickable to expand).

---

## Weapon Detection (Melee vs Ranged)

Uses `getInheritableAttribute` to check weapon group:

```javascript
const weaponGroups = getInheritableAttribute({
  entity: weapon,
  attributeKey: "weaponGroup",
  reduce: "VALUES",
});
```

Melee groups: any group containing "melee" or "lightsaber" (case insensitive).
Everything else is ranged.

---

## UI Integration

### Character Sheet

Modify `ItemList.svelte` to show an attack button (crossed swords icon) on weapon-type items. Clicking it calls `rollAttack(actor, item)`.

### Hotbar Macro

When a weapon item is dropped on the hotbar, create a script macro that calls:
```javascript
game.swse.rollAttack(actorId, itemId);
```

Register the hotbar drop handler in `src/swse.mjs` via the `hotbarDrop` hook.

---

## File Inventory

```
src/
├── combat/
│   ├── attack.mjs              # rollAttack(actor, weapon) — core attack logic
│   ├── chat-card.mjs           # buildChatCardHTML(data) — chat card template
│   └── macro.mjs               # createAttackMacro(data) — hotbar macro creation
├── sheets/
│   └── components/
│       └── ItemList.svelte     # Modified — add attack button for weapons
└── swse.mjs                    # Modified — expose rollAttack, register hotbarDrop hook
```

---

## Out of Scope (Phase 5b/5c)

- Proficiency bonuses and penalties
- Weapon Focus / Weapon Specialization bonuses
- Finesse (DEX for melee)
- Range modifiers and effective range
- Area-effect templates and target selection
- Ammunition tracking
- Vehicle crew attacks
- Critical hit effects
- Attack modes (autofire, stun, etc.)
- Multi-attack / full attack actions
