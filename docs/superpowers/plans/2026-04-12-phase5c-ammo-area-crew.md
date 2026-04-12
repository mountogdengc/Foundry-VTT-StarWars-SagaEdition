# Phase 5c: Ammo, Area Templates, Vehicle Crew Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ammunition tracking, area-effect template targeting, and vehicle crew attack support to the combat system.

**Architecture:** Three incremental additions to the existing `rollAttack()` function. Ammo uses a simple charge-based system. Area templates use Foundry's MeasuredTemplate API. Vehicle crew attacks resolve the operator from actorLinks and substitute their stats.

**Tech Stack:** Foundry VTT v14 MeasuredTemplate, Canvas API, existing attack system.

---

### Task 1: Ammunition tracking

**Files:**
- Modify: `src/combat/attack.mjs`

- [ ] **Step 1: Add ammo reduction to rollAttack**

After the `ChatMessage.create()` call at the end of `rollAttack()` in `src/combat/attack.mjs`, add ammunition handling:

```javascript
  // --- Ammo Tracking ---
  await reduceAmmunition(weapon);
```

Add this function above `rollAttack()`:

```javascript
/**
 * Reduce ammunition after an attack. If the weapon tracks ammo via
 * the ammunition delegate, use it. Otherwise skip silently.
 */
async function reduceAmmunition(weapon) {
  if (!weapon.ammunition?.hasAmmunition) return;

  try {
    const ammoModifiers = getInheritableAttribute({
      entity: weapon,
      attributeKey: ["ammoUse", "ammoUseMultiplier"],
    });

    let count = 1;
    const useCounts = ammoModifiers.filter(m => m.key === "ammoUse").map(m => parseInt(m.value));
    if (useCounts.length > 0) count = Math.max(count, ...useCounts);

    for (const mod of ammoModifiers.filter(m => m.key === "ammoUseMultiplier")) {
      count *= parseInt(mod.value, 10);
    }

    for (const ammo of weapon.ammunition.current) {
      const response = await weapon.ammunition.decreaseAmmunition(ammo.type, count);
      if (response.remaining === 0) {
        await weapon.ammunition.ejectSpentAmmunition(ammo.type);
      }
    }
  } catch (e) {
    // Ammunition delegate may not be fully ported — fail silently
    console.debug("SWSE | Ammo tracking skipped:", e.message);
  }
}
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/combat/attack.mjs
git commit -m "feat: add ammunition tracking to attack rolls"
```

---

### Task 2: Area template targeting

**Files:**
- Create: `src/combat/template.mjs`
- Modify: `src/combat/attack.mjs`

- [ ] **Step 1: Create template.mjs**

```javascript
/**
 * Place a measured template on the canvas and wait for user confirmation.
 * @param {object} templateData - Template configuration
 * @param {string} templateData.t - Template shape ("circle", "cone", "ray", "rect")
 * @param {number} templateData.distance - Size in grid units
 * @returns {Promise<MeasuredTemplateDocument|null>} The placed template or null if cancelled
 */
export async function placeTemplate(templateData) {
  const templateDoc = new CONFIG.MeasuredTemplate.documentClass(
    foundry.utils.mergeObject({
      user: game.user.id,
      direction: 0,
      x: 0,
      y: 0,
      fillColor: game.user.color,
      flags: { swse: { cleanUp: true } },
    }, templateData),
    { parent: canvas.scene }
  );

  const template = new CONFIG.MeasuredTemplate.objectClass(templateDoc);
  const result = await previewTemplate(template);
  if (!result) return null;

  const [created] = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [template.document.toObject()]);
  return created;
}

/**
 * Show a template preview that follows the mouse until confirmed or cancelled.
 */
function previewTemplate(template) {
  return new Promise((resolve) => {
    template.draw();
    canvas.templates.activate();
    canvas.templates.preview.addChild(template);

    const handlers = {
      move(event) {
        const pos = event.data?.getLocalPosition(canvas.app.stage) ?? event.getLocalPosition(canvas.app.stage);
        const snapped = canvas.grid.getSnappedPoint(pos, { mode: CONST.GRID_SNAPPING_MODES.CENTER });
        template.document.updateSource({ x: snapped.x, y: snapped.y });
        template.refresh();
      },
      confirm() {
        cleanup();
        resolve(template);
      },
      cancel() {
        cleanup();
        resolve(null);
      },
      rotate(event) {
        if (event.ctrlKey) event.preventDefault();
        const delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
        const direction = template.document.direction + (delta * Math.sign(event.deltaY));
        template.document.updateSource({ direction });
        template.refresh();
      },
    };

    function cleanup() {
      canvas.stage.off("mousemove", handlers.move);
      canvas.stage.off("mouseup", handlers.confirm);
      canvas.app.view.oncontextmenu = null;
      canvas.app.view.onwheel = null;
      canvas.templates.preview.removeChild(template);
      canvas.templates.deactivate();
    }

    canvas.stage.on("mousemove", handlers.move);
    canvas.stage.on("mouseup", handlers.confirm);
    canvas.app.view.oncontextmenu = handlers.cancel;
    canvas.app.view.onwheel = handlers.rotate;
  });
}

/**
 * Find all token actors contained within a placed template.
 * @param {MeasuredTemplateDocument} templateDoc
 * @returns {Actor[]}
 */
export function findActorsInTemplate(templateDoc) {
  const { size } = templateDoc.parent.grid;
  const object = templateDoc.object;
  if (!object) return [];

  const contained = [];
  for (const tokenDoc of templateDoc.parent.tokens) {
    const { width, height, x: tokx, y: toky } = tokenDoc;
    const startX = width >= 1 ? 0.5 : width / 2;
    const startY = height >= 1 ? 0.5 : height / 2;
    let found = false;
    for (let x = startX; x < width && !found; x++) {
      for (let y = startY; y < height && !found; y++) {
        const point = {
          x: tokx + x * size - templateDoc.x,
          y: toky + y * size - templateDoc.y,
        };
        if (object._computeShape().contains(point.x, point.y)) {
          if (tokenDoc.actor) contained.push(tokenDoc.actor);
          found = true;
        }
      }
    }
  }
  return contained;
}

/**
 * Clean up templates flagged for removal.
 * @param {MeasuredTemplateDocument[]} templates
 */
export async function cleanupTemplates(templates = []) {
  for (const template of templates) {
    if (template.flags?.swse?.cleanUp) {
      await template.delete();
    }
  }
}
```

- [ ] **Step 2: Integrate area targeting into rollAttack**

In `src/combat/attack.mjs`, add import at the top:

```javascript
import { placeTemplate, findActorsInTemplate, cleanupTemplates } from "./template.mjs";
```

Before the attack roll computation in `rollAttack()`, add template detection. Insert this block after `const descriptors = getWeaponDescriptors(...)` and before the attack bonus calculation:

```javascript
  // --- Area Template Check ---
  const templateAttr = getInheritableAttribute({
    entity: weapon,
    attributeKey: "template",
    reduce: "FIRST",
  });

  let areaTargets = null;
  let placedTemplate = null;

  if (templateAttr) {
    try {
      const [shape, sizeStr] = (typeof templateAttr === "string" ? templateAttr : templateAttr.value || "").split(",");
      if (shape && sizeStr) {
        placedTemplate = await placeTemplate({
          t: shape.trim(),
          distance: parseFloat(sizeStr.trim()),
        });
        if (!placedTemplate) return; // User cancelled
        areaTargets = findActorsInTemplate(placedTemplate);
      }
    } catch (e) {
      console.warn("SWSE | Template placement failed:", e);
    }
  }
```

After the `ChatMessage.create()` call, add target info and cleanup:

```javascript
  // --- Area Template Cleanup ---
  if (placedTemplate) {
    await cleanupTemplates([placedTemplate]);
  }
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/combat/template.mjs src/combat/attack.mjs
git commit -m "feat: add area-effect template targeting for weapon attacks"
```

---

### Task 3: Vehicle crew attacks

**Files:**
- Modify: `src/combat/attack.mjs`
- Modify: `src/combat/attack-helpers.mjs`

- [ ] **Step 1: Add crew resolution helper to attack-helpers.mjs**

Add at the end of `src/combat/attack-helpers.mjs`:

```javascript
/**
 * Resolve the crew operator for a vehicle weapon attack.
 * Finds the actor linked in the weapon's position slot.
 * @param {Actor} vehicle - The vehicle actor
 * @param {Item} weapon - The weapon being fired
 * @returns {Promise<{operator: Actor|null, position: string}>}
 */
export async function resolveCrewOperator(vehicle, weapon) {
  const weaponPosition = getInheritableAttribute({
    entity: weapon,
    attributeKey: "weaponPosition",
    reduce: "FIRST",
  }) || "gunner";

  const position = typeof weaponPosition === "string" ? weaponPosition : (weaponPosition.value || "gunner");
  const links = vehicle.system.actorLinks ?? [];
  const link = links.find(l => l.position === position) || links.find(l => l.position === "pilot");

  if (!link) return { operator: null, position };

  try {
    const operator = await fromUuid(link.uuid);
    return { operator, position };
  } catch {
    return { operator: null, position };
  }
}
```

- [ ] **Step 2: Add vehicle attack path to rollAttack**

In `src/combat/attack.mjs`, add the import:

```javascript
import { resolveCrewOperator } from "./attack-helpers.mjs";
```

(Add `resolveCrewOperator` to the existing import list from `./attack-helpers.mjs`.)

At the beginning of `rollAttack()`, after `const isMelee = ...` and `const descriptors = ...`, add vehicle detection:

```javascript
  // --- Vehicle Crew Resolution ---
  const isVehicle = ["vehicle", "npc-vehicle"].includes(actor.type);
  let operator = actor;
  let vehicleBonus = 0;
  let crewPosition = "";

  if (isVehicle) {
    const crew = await resolveCrewOperator(actor, weapon);
    crewPosition = crew.position;
    if (crew.operator) {
      operator = crew.operator;
    } else {
      ui.notifications.warn(`No crew member in ${crewPosition} position.`);
      return;
    }
    // Vehicle attacks use vehicle INT mod instead of operator ability
    vehicleBonus = actor.system.abilities.int?.mod ?? 0;
  }
```

Then modify the attack bonus calculation to use `operator` for BAB and condition, and add vehicle-specific bonuses:

Replace the attack bonus block with:

```javascript
  const bab = operator.baseAttackBonus ?? 0;
  const { mod: abilityMod, label: abilityLabel } = isVehicle
    ? { mod: vehicleBonus, label: "Vehicle INT" }
    : resolveAttackAbilityMod(operator, weapon, descriptors);
  const conditionMod = getConditionModifier(operator);
  const profPenalty = getProficiencyPenalty(operator, descriptors);
  const focusBonus = getFocusBonus(operator, descriptors);
  const greaterFocusBonus = getGreaterFocusBonus(operator, descriptors);
  const acPenalty = isVehicle ? 0 : getArmorCheckPenalty(operator);
  const toHitMod = getToHitModifiers(operator, weapon);

  // Vehicle-specific: trained pilot bonus
  let pilotBonus = 0;
  if (isVehicle && crewPosition === "pilot" && operator.system?.skills?.Pilot?.trained) {
    pilotBonus = 2;
  }

  // Vehicle condition (in addition to operator condition)
  const vehicleConditionMod = isVehicle ? getConditionModifier(actor) : 0;

  const attackTotal = bab + abilityMod + conditionMod + profPenalty + focusBonus
    + greaterFocusBonus + acPenalty + toHitMod + pilotBonus + vehicleConditionMod;
```

Update the tooltip to include vehicle-specific entries:

```javascript
  if (pilotBonus !== 0) attackParts.push(`Trained Pilot: +${pilotBonus}`);
  if (vehicleConditionMod !== 0) attackParts.push(`Vehicle Condition: ${vehicleConditionMod}`);
```

For damage, use operator's heroic level:

```javascript
  const halfHeroic = Math.floor((operator.heroicLevel ?? 0) / 2);
  const meleeDmgMod = isMelee && !isVehicle ? resolveMeleeDamageMod(operator, weapon) : 0;
  const specBonus = getSpecializationBonus(operator, descriptors);
  const greaterSpecBonus = getGreaterSpecializationBonus(operator, descriptors);
  const bonusDmg = getBonusDamage(operator, weapon);
```

Update the chat card actor name for vehicles:

```javascript
  const displayName = isVehicle ? `${actor.name} (${operator.name})` : actor.name;
```

And use `displayName` in the chat card and speaker.

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/combat/attack.mjs src/combat/attack-helpers.mjs
git commit -m "feat: add vehicle crew attack resolution"
```

---

### Task 4: Test all three subsystems in Foundry

**Files:** Various — depends on errors found

- [ ] **Step 1: Build**

```bash
npm run build
```

- [ ] **Step 2: Test ammo tracking**

Create a weapon with ammunition (if the ammunition delegate exists). Verify ammo decrements after attack. If ammo delegate isn't ported, verify no errors occur.

- [ ] **Step 3: Test area template**

If a weapon has a `template` attribute in its changes (e.g., `template: "circle,6"`), clicking attack should prompt template placement. If no such weapon exists in the compendium, this is tested later.

- [ ] **Step 4: Test vehicle crew attack**

Open a vehicle actor. Add a crew member (drag a character onto the vehicle sheet). Add a weapon to the vehicle. Click the attack button. Verify the attack uses the crew member's BAB and the vehicle's INT mod.

- [ ] **Step 5: Fix any issues and commit**

```bash
npm run build
git add -A
git commit -m "fix: resolve issues found during 5c testing"
```

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/combat/attack.mjs` | Modify | 1, 2, 3 |
| `src/combat/template.mjs` | Create | 2 |
| `src/combat/attack-helpers.mjs` | Modify | 3 |
