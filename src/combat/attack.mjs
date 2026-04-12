import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import { toNumber } from "../util/util.mjs";
import { buildChatCardHTML } from "./chat-card.mjs";

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

  const bab = actor.baseAttackBonus ?? 0;
  const abilityMod = isMelee
    ? (actor.system.abilities.str?.mod ?? 0)
    : (actor.system.abilities.dex?.mod ?? 0);
  const conditionMod = getConditionModifier(actor);

  const attackBonus = bab + abilityMod + conditionMod;
  const attackRoll = new Roll(`1d20 + ${attackBonus}`);
  await attackRoll.evaluate();

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

  const attackParts = [`BAB: ${bab}`];
  attackParts.push(`${isMelee ? "STR" : "DEX"}: ${abilityMod}`);
  if (conditionMod !== 0) attackParts.push(`Condition: ${conditionMod}`);
  const attackTooltip = attackParts.join("\n");

  const damageParts = [`Dice: ${damageDice || "0"}`];
  if (halfHeroic) damageParts.push(`Half Heroic: ${halfHeroic}`);
  if (strMod) damageParts.push(`STR: ${strMod}`);
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
