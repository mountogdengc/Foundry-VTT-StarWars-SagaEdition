# Phase 5c: Ammo Tracking, Area Templates, Vehicle Crew Attacks Design Spec

**Date:** 2026-04-12
**Scope:** Three combat subsystems added incrementally to the existing attack roll system.

---

## 5c-1: Ammunition Tracking

After an attack roll, if the weapon has ammunition, decrement it. When ammo reaches 0, mark it as expended.

**How ammo works in SWSE:**
- Weapons have an `ammunition` property accessed via their item class
- `weapon.ammunition.hasAmmunition` — boolean, whether weapon uses ammo
- `weapon.ammunition.current` — array of loaded ammo types
- `weapon.ammunition.decreaseAmmunition(type, count)` — decrement
- `weapon.ammunition.ejectSpentAmmunition(type)` — mark expended when empty
- `ammoUse` / `ammoUseMultiplier` inheritable attributes modify count per shot

**Integration:** Add `reduceAmmunition(weapon)` call at the end of `rollAttack()`. If weapon has no ammo system, skip silently.

**Files:**
- Modify: `src/combat/attack.mjs` — add ammo reduction after chat message

---

## 5c-2: Area Templates

Weapons with area-effect targeting (e.g., grenades, autofire) place a measured template on the canvas. Tokens inside the template are targeted.

**How it works:**
1. Weapon has a `template` attribute specifying shape (cone, circle, line) and size
2. Before rolling, place a preview template on the canvas
3. User positions and confirms the template
4. Find all tokens inside the template shape
5. Roll attack/damage and report results per target

**Key components:**
- `SWSETemplate` class — extends `MeasuredTemplate`, handles preview placement with mouse/keyboard events
- `selectActorsByTemplates(templates)` — finds tokens contained in template shapes
- `findContained(templateDoc)` — grid-based containment check

**Integration:** In `rollAttack()`, check if weapon has a template attribute. If so, place template before rolling, resolve against all contained actors.

**Files:**
- Create: `src/combat/template.mjs` — SWSETemplate class and template placement
- Modify: `src/combat/attack.mjs` — integrate template flow

---

## 5c-3: Vehicle Crew Attacks

Vehicle weapons are operated by crew members in specific positions (pilot, gunner, etc.). The crew member's stats modify the attack.

**How it works:**
- Vehicle weapons have a `position` attribute (pilot, gunner, etc.)
- The crew member in that position is the "operator"
- Attack uses operator's BAB, but vehicle's INT mod replaces ability mod
- If weapon position is "pilot" and operator has trained Pilot skill, +2 bonus
- Vehicle condition modifier applies in addition to operator condition

**Integration:** `rollAttack()` checks if the actor is a vehicle. If so, resolve the operator from `actorLinks` and use their stats with vehicle modifiers.

**Files:**
- Modify: `src/combat/attack.mjs` — vehicle crew attack path
- Modify: `src/combat/attack-helpers.mjs` — add crew resolution helpers

---

## Out of Scope

- Critical hit special effects (double damage, etc.)
- Attack modes (autofire, stun, rapid shot) — these modify attack/damage formulas
- Multi-attack / full attack actions
- Range penalty calculations based on token distance
