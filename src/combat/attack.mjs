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

export async function rollAttack(actor, weapon) {
  if (!actor || !weapon) return;

  const isMelee = isMeleeWeapon(weapon);
  const descriptors = getWeaponDescriptors(actor, weapon);

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

  const attackParts = [`BAB: ${bab}`];
  attackParts.push(`${abilityLabel}: ${abilityMod}`);
  if (conditionMod !== 0) attackParts.push(`Condition: ${conditionMod}`);
  if (profPenalty !== 0) attackParts.push(`Not Proficient: ${profPenalty}`);
  if (focusBonus !== 0) attackParts.push(`Weapon Focus: +${focusBonus}`);
  if (greaterFocusBonus !== 0) attackParts.push(`Greater Focus: +${greaterFocusBonus}`);
  if (acPenalty !== 0) attackParts.push(`Armor Penalty: ${acPenalty}`);
  if (toHitMod !== 0) attackParts.push(`Other: ${toHitMod > 0 ? "+" : ""}${toHitMod}`);
  const attackTooltip = attackParts.join("\n");

  const damageParts = [`Dice: ${damageDice || "0"}`];
  if (halfHeroic) damageParts.push(`Half Heroic: +${halfHeroic}`);
  if (meleeDmgMod) damageParts.push(`${abilityLabel}: ${meleeDmgMod > 0 ? "+" : ""}${meleeDmgMod}`);
  if (specBonus) damageParts.push(`Specialization: +${specBonus}`);
  if (greaterSpecBonus) damageParts.push(`Greater Spec: +${greaterSpecBonus}`);
  if (bonusDmg) damageParts.push(`Bonus: ${bonusDmg > 0 ? "+" : ""}${bonusDmg}`);
  const damageTooltip = damageParts.join("\n");

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
