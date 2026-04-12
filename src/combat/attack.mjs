import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import { toNumber } from "../util/util.mjs";
import { buildChatCardHTML } from "./chat-card.mjs";
import { placeTemplate, findActorsInTemplate, cleanupTemplates } from "./template.mjs";
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
  resolveCrewOperator,
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
    console.debug("SWSE | Ammo tracking skipped:", e.message);
  }
}

export async function rollAttack(actor, weapon) {
  if (!actor || !weapon) return;

  const isMelee = isMeleeWeapon(weapon);
  const descriptors = getWeaponDescriptors(actor, weapon);

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
    vehicleBonus = actor.system.abilities.int?.mod ?? 0;
  }

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
      const tVal = typeof templateAttr === "string" ? templateAttr : (templateAttr.value || "");
      const [shape, sizeStr] = tVal.split(",");
      if (shape && sizeStr) {
        placedTemplate = await placeTemplate({
          t: shape.trim(),
          distance: parseFloat(sizeStr.trim()),
        });
        if (!placedTemplate) return;
        areaTargets = findActorsInTemplate(placedTemplate);
      }
    } catch (e) {
      console.warn("SWSE | Template placement failed:", e);
    }
  }

  // --- Attack Bonuses ---
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

  let pilotBonus = 0;
  if (isVehicle && crewPosition === "pilot" && operator.system?.skills?.Pilot?.trained) {
    pilotBonus = 2;
  }

  const vehicleConditionMod = isVehicle ? getConditionModifier(actor) : 0;

  const attackTotal = bab + abilityMod + conditionMod + profPenalty + focusBonus
    + greaterFocusBonus + acPenalty + toHitMod + pilotBonus + vehicleConditionMod;
  const attackRoll = new Roll(`1d20 + ${attackTotal}`);
  await attackRoll.evaluate();

  // --- Damage Bonuses ---
  const damageDice = getInheritableAttribute({
    entity: weapon,
    attributeKey: ["damage", "damageDie"],
    reduce: "SUM",
  });
  const halfHeroic = Math.floor((operator.heroicLevel ?? 0) / 2);
  const meleeDmgMod = isMelee && !isVehicle ? resolveMeleeDamageMod(operator, weapon) : 0;
  const specBonus = getSpecializationBonus(operator, descriptors);
  const greaterSpecBonus = getGreaterSpecializationBonus(operator, descriptors);
  const bonusDmg = getBonusDamage(operator, weapon);

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
  if (pilotBonus !== 0) attackParts.push(`Trained Pilot: +${pilotBonus}`);
  if (vehicleConditionMod !== 0) attackParts.push(`Vehicle Condition: ${vehicleConditionMod}`);
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
  const displayName = isVehicle ? `${actor.name} (${operator.name})` : actor.name;

  const html = buildChatCardHTML({
    actorName: displayName,
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

  // --- Ammo Tracking ---
  await reduceAmmunition(weapon);

  // --- Area Template Cleanup ---
  if (placedTemplate) {
    await cleanupTemplates([placedTemplate]);
  }
}
