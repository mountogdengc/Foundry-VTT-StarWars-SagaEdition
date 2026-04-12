# Phase 5b: Advanced Attack Bonuses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add proficiency, focus, specialization, finesse, armor check penalty, and generic bonus attributes to weapon attack rolls.

**Architecture:** A new `attack-helpers.mjs` file contains ported helper functions for weapon classification, proficiency checking, focus/specialization bonuses, and finesse logic. The existing `rollAttack()` in `attack.mjs` is updated to call these helpers and include all bonuses in the roll formulas and tooltips.

**Tech Stack:** Foundry VTT v14, existing `getInheritableAttribute` utility, constants from `constants.mjs`.

---

### Task 1: Create attack helper functions

**Files:**
- Create: `src/combat/attack-helpers.mjs`

- [ ] **Step 1: Create attack-helpers.mjs**

```javascript
import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import {
  RANGED_WEAPON_TYPES,
  LIGHTSABER_WEAPON_TYPES,
  SIMPLE_WEAPON_TYPES,
  weaponGroup,
} from "../util/constants.mjs";
import { toNumber, filterItemsByTypes, equippedItems } from "../util/util.mjs";

/**
 * Check if a weapon is ranged based on its subtype.
 */
export function isRanged(weapon) {
  const subtype = (weapon.system?.subtype || "").toLowerCase();
  return RANGED_WEAPON_TYPES.includes(subtype);
}

/**
 * Check if a weapon is melee based on its subtype.
 */
export function isMelee(weapon) {
  let subtype = weapon.system?.subtype;
  if (!subtype && weapon.type === "beastAttack") subtype = "Melee Natural Weapons";
  return weaponGroup["Melee Weapons"].includes(subtype);
}

/**
 * Check if a weapon is a lightsaber.
 */
export function isLightsaber(weapon) {
  const subtype = (weapon.system?.subtype || "").toLowerCase();
  return LIGHTSABER_WEAPON_TYPES.includes(subtype);
}

/**
 * Expand "simple weapons" into individual subtypes.
 */
function explodeProficiencies(proficiencies) {
  const result = [];
  for (const prof of (proficiencies || [])) {
    if (prof === "simple weapons") {
      result.push(...SIMPLE_WEAPON_TYPES);
    } else {
      result.push(prof);
    }
  }
  return result;
}

/**
 * Get the weapon descriptors used for proficiency/focus/specialization matching.
 * Includes weapon name, subtype, exotic overrides, and familiarity remappings.
 */
export function getWeaponDescriptors(actor, weapon) {
  const familiarities = {};
  getInheritableAttribute({
    entity: actor,
    attributeKey: "weaponFamiliarity",
  }).forEach(fam => {
    const toks = (fam.value || "").split(":");
    if (toks.length === 2) familiarities[toks[0]] = toks[1];
  });

  const exoticTypes = getInheritableAttribute({
    entity: weapon,
    attributeKey: "exoticWeapon",
    reduce: "VALUES",
  });

  const descriptors = exoticTypes.length > 0
    ? [...exoticTypes]
    : [weapon.name, weapon.system?.subtype, weapon.type].filter(Boolean);

  const remapped = [];
  for (const desc of descriptors) {
    if (familiarities[desc]) remapped.push(familiarities[desc]);
  }
  descriptors.push(...remapped);

  return descriptors.filter(Boolean);
}

/**
 * Get proficiency penalty. Returns -5 if not proficient, 0 if proficient.
 */
export function getProficiencyPenalty(actor, descriptors) {
  const rawProficiencies = getInheritableAttribute({
    entity: actor,
    attributeKey: "weaponProficiency",
    reduce: ["VALUES_TO_LOWERCASE", "UNIQUE"],
  });
  const proficiencies = explodeProficiencies(rawProficiencies);

  const isProficient = descriptors.some(
    wd => proficiencies.includes(wd.toLowerCase()) || wd === "Unarmed Attack" || wd === "beastAttack"
  );
  return isProficient ? 0 : -5;
}

/**
 * Get Weapon Focus attack bonus (+1 if focused, 0 otherwise).
 */
export function getFocusBonus(actor, descriptors) {
  const weaponFocus = explodeProficiencies(getInheritableAttribute({
    entity: actor,
    attributeKey: "weaponFocus",
    reduce: ["VALUES_TO_LOWERCASE", "UNIQUE"],
  }));
  return descriptors.some(wt => weaponFocus.includes(wt.toLowerCase())) ? 1 : 0;
}

/**
 * Get Greater Weapon Focus attack bonus (+1 if has greater focus, 0 otherwise).
 */
export function getGreaterFocusBonus(actor, descriptors) {
  const gwf = explodeProficiencies(getInheritableAttribute({
    entity: actor,
    attributeKey: "greaterWeaponFocus",
    reduce: ["VALUES_TO_LOWERCASE", "UNIQUE"],
  }));
  return descriptors.some(wt => gwf.includes(wt.toLowerCase())) ? 1 : 0;
}

/**
 * Check if actor has Weapon Focus for a set of descriptors.
 */
export function hasFocus(actor, descriptors) {
  return getFocusBonus(actor, descriptors) > 0;
}

/**
 * Get Weapon Specialization damage bonus (+2 if specialized, 0 otherwise).
 */
export function getSpecializationBonus(actor, descriptors) {
  const ws = explodeProficiencies(getInheritableAttribute({
    entity: actor,
    attributeKey: "weaponSpecialization",
    reduce: ["VALUES_TO_LOWERCASE", "UNIQUE"],
  }));
  return descriptors.some(wt => ws.includes(wt.toLowerCase())) ? 2 : 0;
}

/**
 * Get Greater Weapon Specialization damage bonus (+2 if has greater spec, 0 otherwise).
 */
export function getGreaterSpecializationBonus(actor, descriptors) {
  const gws = explodeProficiencies(getInheritableAttribute({
    entity: actor,
    attributeKey: "greaterWeaponSpecialization",
    reduce: ["VALUES_TO_LOWERCASE", "UNIQUE"],
  }));
  return descriptors.some(wt => gws.includes(wt.toLowerCase())) ? 2 : 0;
}

/**
 * Resolve the ability modifier for an attack roll.
 * Ranged: DEX. Melee: STR, or DEX if finessable and DEX is higher.
 */
export function resolveAttackAbilityMod(actor, weapon, descriptors) {
  const abilities = actor.system.abilities;
  if (isRanged(weapon)) {
    return { mod: abilities.dex?.mod ?? 0, label: "DEX" };
  }

  const strMod = abilities.str?.mod ?? 0;
  const dexMod = abilities.dex?.mod ?? 0;

  if (canFinesse(actor, weapon, descriptors) && dexMod > strMod) {
    // Check for custom finesse stats
    const finesseStats = getInheritableAttribute({
      entity: actor,
      attributeKey: "finesseStat",
      reduce: "VALUES",
    });

    let bestMod = dexMod;
    let bestLabel = "DEX";

    for (const stat of finesseStats) {
      const key = stat.toLowerCase().substring(0, 3);
      const mod = abilities[key]?.mod ?? 0;
      if (mod > bestMod) {
        bestMod = mod;
        bestLabel = stat.toUpperCase().substring(0, 3);
      }
    }

    if (bestMod > strMod) return { mod: bestMod, label: bestLabel };
  }

  return { mod: strMod, label: "STR" };
}

/**
 * Check if a melee weapon can use finesse (DEX for attack).
 */
function canFinesse(actor, weapon, descriptors) {
  const actorSize = getSizeIndex(actor);
  const weaponSize = getSizeIndex(weapon);
  const sizeDiff = actorSize - weaponSize;

  const isLight = sizeDiff > 0;
  const isOneHanded = sizeDiff >= 0;
  const focused = hasFocus(actor, descriptors);

  return isLight || (isOneHanded && focused) || isLightsaber(weapon);
}

/**
 * Get a numeric size index for comparison. Higher = larger.
 */
function getSizeIndex(entity) {
  const sizeStr = entity.system?.size ?? entity.size?.name ?? "Medium";
  const sizes = ["Fine", "Diminutive", "Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan", "Colossal"];
  const idx = sizes.findIndex(s => (sizeStr || "").toLowerCase().startsWith(s.toLowerCase()));
  return idx >= 0 ? idx : 4; // Default to Medium
}

/**
 * Resolve melee damage ability modifier. Two-handed weapons get 1.5x STR.
 */
export function resolveMeleeDamageMod(actor, weapon) {
  const strMod = actor.system.abilities.str?.mod ?? 0;
  if (strMod <= 0) return strMod;

  const actorSize = getSizeIndex(actor);
  const weaponSize = getSizeIndex(weapon);
  const sizeDiff = actorSize - weaponSize;

  let isTwoHanded = sizeDiff === -1; // weapon one size larger

  if (sizeDiff === 0) {
    const grips = getInheritableAttribute({
      entity: weapon,
      attributeKey: "grip",
      reduce: "VALUES",
    });
    if (grips.includes("two handed")) isTwoHanded = true;
  }

  return isTwoHanded ? Math.floor(strMod * 1.5) : strMod;
}

/**
 * Get generic toHitModifier bonuses from actor and weapon.
 */
export function getToHitModifiers(actor, weapon) {
  const mods = getInheritableAttribute({
    entity: [weapon, actor],
    attributeKey: "toHitModifier",
    itemFilter: (item) => item.type !== "weapon",
    reduce: "SUM",
  });
  return toNumber(mods) || 0;
}

/**
 * Get generic bonusDamage from actor and weapon.
 */
export function getBonusDamage(actor, weapon) {
  const mods = getInheritableAttribute({
    entity: [weapon, actor],
    attributeKey: "bonusDamage",
    itemFilter: (item) => item.type !== "weapon",
    reduce: "SUM",
  });
  return toNumber(mods) || 0;
}

/**
 * Generate armor check penalty for attack rolls.
 */
export function getArmorCheckPenalty(actor) {
  const armorProficiencies = getInheritableAttribute({
    entity: actor,
    attributeKey: "armorProficiency",
    reduce: "VALUES",
  });

  let lightProf = armorProficiencies.includes("light");
  let mediumProf = armorProficiencies.includes("medium") && lightProf;
  let heavyProf = armorProficiencies.includes("heavy") && mediumProf;

  let wearingLight = false, wearingMedium = false, wearingHeavy = false;

  const armorItems = filterItemsByTypes(equippedItems(actor), ["armor"]).map(a => a.system?.subtype);
  const actsAs = getInheritableAttribute({ entity: actor, attributeKey: "actsAs", reduce: "VALUES" });
  armorItems.push(...actsAs);

  for (const armor of armorItems) {
    if (armor === "Heavy Armor") wearingHeavy = true;
    if (armor === "Medium Armor") wearingMedium = true;
    if (armor === "Light Armor") wearingLight = true;
  }

  if (wearingHeavy && !heavyProf) return -10;
  if (wearingMedium && !mediumProf) return -5;
  if (wearingLight && !lightProf) return -2;
  return 0;
}
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/combat/attack-helpers.mjs
git commit -m "feat: add attack helper functions for proficiency, focus, specialization, finesse"
```

---

### Task 2: Integrate helpers into rollAttack

**Files:**
- Modify: `src/combat/attack.mjs`

- [ ] **Step 1: Replace attack.mjs with enhanced version**

Replace the entire contents of `src/combat/attack.mjs` with:

```javascript
import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import { toNumber } from "../util/util.mjs";
import { buildChatCardHTML } from "./chat-card.mjs";
import {
  isMelee as isMeleeWeapon,
  isRanged,
  getWeaponDescriptors,
  getProficiencyPenalty,
  getFocusBonus,
  getGreaterFocusBonus,
  getSpecializationBonus,
  getGreaterSpecializationBonus,
  resolveAttackAbilityMod,
  resolveMeleeDamageMod,
  getToHitModifiers,
  getBonusDamage,
  getArmorCheckPenalty,
} from "./attack-helpers.mjs";

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
  const descriptors = getWeaponDescriptors(actor, weapon);

  // --- Attack Bonuses ---
  const bab = actor.baseAttackBonus ?? 0;
  const { mod: abilityMod, label: abilityLabel } = resolveAttackAbilityMod(actor, weapon, descriptors);
  const conditionMod = getConditionModifier(actor);
  const profPenalty = getProficiencyPenalty(actor, descriptors);
  const focusBonus = getFocusBonus(actor, descriptors);
  const greaterFocusBonus = getGreaterFocusBonus(actor, descriptors);
  const acPenalty = getArmorCheckPenalty(actor);
  const toHitMod = getToHitModifiers(actor, weapon);

  const attackTotal = bab + abilityMod + conditionMod + profPenalty + focusBonus + greaterFocusBonus + acPenalty + toHitMod;
  const attackRoll = new Roll(`1d20 + ${attackTotal}`);
  await attackRoll.evaluate();

  // --- Damage Bonuses ---
  const damageDice = getInheritableAttribute({
    entity: weapon,
    attributeKey: ["damage", "damageDie"],
    reduce: "SUM",
  });
  const halfHeroic = Math.floor((actor.heroicLevel ?? 0) / 2);
  const meleeDmgMod = isMelee ? resolveMeleeDamageMod(actor, weapon) : 0;
  const specBonus = getSpecializationBonus(actor, descriptors);
  const greaterSpecBonus = getGreaterSpecializationBonus(actor, descriptors);
  const bonusDmg = getBonusDamage(actor, weapon);

  const damageBonus = halfHeroic + meleeDmgMod + specBonus + greaterSpecBonus + bonusDmg;

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
  attackParts.push(`${abilityLabel}: ${abilityMod}`);
  if (conditionMod !== 0) attackParts.push(`Condition: ${conditionMod}`);
  if (profPenalty !== 0) attackParts.push(`Not Proficient: ${profPenalty}`);
  if (focusBonus !== 0) attackParts.push(`Weapon Focus: +${focusBonus}`);
  if (greaterFocusBonus !== 0) attackParts.push(`Greater Focus: +${greaterFocusBonus}`);
  if (acPenalty !== 0) attackParts.push(`Armor Penalty: ${acPenalty}`);
  if (toHitMod !== 0) attackParts.push(`Other: ${toHitMod > 0 ? "+" : ""}${toHitMod}`);
  const attackTooltip = attackParts.join("\n");

  // --- Damage Tooltip ---
  const damageParts = [`Dice: ${damageDice || "0"}`];
  if (halfHeroic) damageParts.push(`Half Heroic: +${halfHeroic}`);
  if (meleeDmgMod) damageParts.push(`${abilityLabel}: ${meleeDmgMod > 0 ? "+" : ""}${meleeDmgMod}`);
  if (specBonus) damageParts.push(`Specialization: +${specBonus}`);
  if (greaterSpecBonus) damageParts.push(`Greater Spec: +${greaterSpecBonus}`);
  if (bonusDmg) damageParts.push(`Bonus: ${bonusDmg > 0 ? "+" : ""}${bonusDmg}`);
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
  });
}
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/combat/attack.mjs
git commit -m "feat: integrate proficiency, focus, specialization, finesse into attack rolls"
```

---

### Task 3: Test in Foundry v14 and fix issues

**Files:** Various — depends on errors found

- [ ] **Step 1: Build**

```bash
npm run build
```

- [ ] **Step 2: Test attack with proficient weapon**

Open a character with a weapon they're proficient with (e.g., a blaster pistol on a character with "Pistols" proficiency). Attack. Tooltip should NOT show "Not Proficient" penalty.

- [ ] **Step 3: Test attack with non-proficient weapon**

Give a character a weapon type they lack proficiency for. Attack. Tooltip should show "Not Proficient: -5".

- [ ] **Step 4: Test Weapon Focus bonus**

If the character has Weapon Focus for the weapon type, tooltip should show "Weapon Focus: +1".

- [ ] **Step 5: Verify tooltip breakdown**

Hover over the attack and damage totals. All applicable bonuses should be listed.

- [ ] **Step 6: Fix any issues and commit**

```bash
npm run build
git add -A
git commit -m "fix: resolve issues found during advanced attack bonus testing"
```

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/combat/attack-helpers.mjs` | Create | 1 |
| `src/combat/attack.mjs` | Modify | 2 |
