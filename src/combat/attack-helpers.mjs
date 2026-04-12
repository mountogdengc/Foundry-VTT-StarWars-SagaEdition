import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import {
  RANGED_WEAPON_TYPES,
  LIGHTSABER_WEAPON_TYPES,
  SIMPLE_WEAPON_TYPES,
  weaponGroup,
} from "../util/constants.mjs";
import { toNumber, filterItemsByTypes, equippedItems } from "../util/util.mjs";

export function isRanged(weapon) {
  const subtype = (weapon.system?.subtype || "").toLowerCase();
  return RANGED_WEAPON_TYPES.includes(subtype);
}

export function isMelee(weapon) {
  let subtype = weapon.system?.subtype;
  if (!subtype && weapon.type === "beastAttack") subtype = "Melee Natural Weapons";
  return weaponGroup["Melee Weapons"].includes(subtype);
}

export function isLightsaber(weapon) {
  const subtype = (weapon.system?.subtype || "").toLowerCase();
  return LIGHTSABER_WEAPON_TYPES.includes(subtype);
}

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

export function getFocusBonus(actor, descriptors) {
  const weaponFocus = explodeProficiencies(getInheritableAttribute({
    entity: actor,
    attributeKey: "weaponFocus",
    reduce: ["VALUES_TO_LOWERCASE", "UNIQUE"],
  }));
  return descriptors.some(wt => weaponFocus.includes(wt.toLowerCase())) ? 1 : 0;
}

export function getGreaterFocusBonus(actor, descriptors) {
  const gwf = explodeProficiencies(getInheritableAttribute({
    entity: actor,
    attributeKey: "greaterWeaponFocus",
    reduce: ["VALUES_TO_LOWERCASE", "UNIQUE"],
  }));
  return descriptors.some(wt => gwf.includes(wt.toLowerCase())) ? 1 : 0;
}

export function hasFocus(actor, descriptors) {
  return getFocusBonus(actor, descriptors) > 0;
}

export function getSpecializationBonus(actor, descriptors) {
  const ws = explodeProficiencies(getInheritableAttribute({
    entity: actor,
    attributeKey: "weaponSpecialization",
    reduce: ["VALUES_TO_LOWERCASE", "UNIQUE"],
  }));
  return descriptors.some(wt => ws.includes(wt.toLowerCase())) ? 2 : 0;
}

export function getGreaterSpecializationBonus(actor, descriptors) {
  const gws = explodeProficiencies(getInheritableAttribute({
    entity: actor,
    attributeKey: "greaterWeaponSpecialization",
    reduce: ["VALUES_TO_LOWERCASE", "UNIQUE"],
  }));
  return descriptors.some(wt => gws.includes(wt.toLowerCase())) ? 2 : 0;
}

export function resolveAttackAbilityMod(actor, weapon, descriptors) {
  const abilities = actor.system.abilities;
  if (isRanged(weapon)) {
    return { mod: abilities.dex?.mod ?? 0, label: "DEX" };
  }

  const strMod = abilities.str?.mod ?? 0;
  const dexMod = abilities.dex?.mod ?? 0;

  if (canFinesse(actor, weapon, descriptors) && dexMod > strMod) {
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

function canFinesse(actor, weapon, descriptors) {
  const actorSize = getSizeIndex(actor);
  const weaponSize = getSizeIndex(weapon);
  const sizeDiff = actorSize - weaponSize;

  const isLight = sizeDiff > 0;
  const isOneHanded = sizeDiff >= 0;
  const focused = hasFocus(actor, descriptors);

  return isLight || (isOneHanded && focused) || isLightsaber(weapon);
}

function getSizeIndex(entity) {
  const sizeStr = entity.system?.size ?? entity.size?.name ?? "Medium";
  const sizes = ["Fine", "Diminutive", "Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan", "Colossal"];
  const idx = sizes.findIndex(s => (sizeStr || "").toLowerCase().startsWith(s.toLowerCase()));
  return idx >= 0 ? idx : 4;
}

export function resolveMeleeDamageMod(actor, weapon) {
  const strMod = actor.system.abilities.str?.mod ?? 0;
  if (strMod <= 0) return strMod;

  const actorSize = getSizeIndex(actor);
  const weaponSize = getSizeIndex(weapon);
  const sizeDiff = actorSize - weaponSize;

  let isTwoHanded = sizeDiff === -1;

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

export function getToHitModifiers(actor, weapon) {
  const mods = getInheritableAttribute({
    entity: [weapon, actor],
    attributeKey: "toHitModifier",
    itemFilter: (item) => item.type !== "weapon",
    reduce: "SUM",
  });
  return toNumber(mods) || 0;
}

export function getBonusDamage(actor, weapon) {
  const mods = getInheritableAttribute({
    entity: [weapon, actor],
    attributeKey: "bonusDamage",
    itemFilter: (item) => item.type !== "weapon",
    reduce: "SUM",
  });
  return toNumber(mods) || 0;
}

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
