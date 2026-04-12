# Phase 5b: Advanced Attack Bonuses Design Spec

**Date:** 2026-04-12
**Scope:** Add proficiency, focus, specialization, finesse, armor check penalty, and generic bonus attributes to the existing attack roll system.

---

## Overview

Enhance `rollAttack()` from Phase 5a with the full suite of SWSE combat modifiers. These bonuses are computed from inheritable attributes on the actor and weapon, following the same pattern as the old attack-handler.mjs.

---

## Attack Roll Bonuses (added to existing formula)

| Bonus | Source | Value | Condition |
|-------|--------|-------|-----------|
| Proficiency | `weaponProficiency` attribute vs weapon descriptors | -5 if not proficient | Always checked |
| Weapon Focus | `weaponFocus` attribute vs weapon descriptors | +1 | If actor has focus for this weapon type |
| Greater Weapon Focus | `greaterWeaponFocus` attribute | +1 | Stacks with Focus |
| Armor Check Penalty | Equipped armor vs proficiency | -2/-5/-10 | If wearing non-proficient armor |
| Finesse | Actor DEX vs STR | Use higher of DEX/STR for melee | If weapon is finessable |
| toHitModifier | Generic inheritable attribute | Varies | From any item on actor or weapon |
| Condition | `condition` attribute | Varies | Already implemented in 5a |

## Damage Roll Bonuses (added to existing formula)

| Bonus | Source | Value | Condition |
|-------|--------|-------|-----------|
| Weapon Specialization | `weaponSpecialization` attribute | +2 | If actor has specialization |
| Greater Weapon Specialization | `greaterWeaponSpecialization` attribute | +2 | Stacks |
| bonusDamage | Generic inheritable attribute | Varies | From any item on actor or weapon |

## Weapon Descriptors

A weapon's "descriptors" determine which proficiency/focus/specialization entries match it. Descriptors include:
- Weapon name (e.g., "Blaster Pistol")
- Weapon subtype (e.g., "Pistols")
- Weapon type ("weapon")
- Exotic weapon overrides (from `exoticWeapon` attribute)
- Weapon familiarity remappings (from `weaponFamiliarity` attribute)

## Finesse Rules

A melee weapon can use DEX instead of STR if:
- The weapon is lighter than the wielder's size (one size category smaller), OR
- The weapon is one-handed AND the actor has Weapon Focus with it, OR
- The weapon is a lightsaber

The actor may also have a `finesseStat` attribute that specifies alternative stats.

## Melee Damage Ability Modifier

For melee weapons, STR mod is added to damage. If wielding two-handed (weapon same size as wielder with "two handed" grip, or one size larger), STR mod is multiplied by 1.5x (rounded down) if positive.

## Proficiency Explosion

"Simple weapons" proficiency expands to include all simple weapon subtypes. Weapon familiarity can remap exotic weapons to other proficiency groups.

---

## File Changes

| File | Action |
|------|--------|
| `src/combat/attack-helpers.mjs` | Create — port proficiency, focus, specialization, finesse helper functions |
| `src/combat/attack.mjs` | Modify — integrate all bonus calculations into rollAttack() |

---

## Out of Scope

- Range modifiers and distance calculation (5c)
- Ammunition tracking (5c)
- Area templates and target selection (5c)
- Vehicle crew attacks (5c)
- Critical hit effects
- Attack modes (autofire, stun)
- Multi-attack / full attack
