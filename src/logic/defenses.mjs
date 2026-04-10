import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import { resolveValueArray, toNumber } from "../util/util.mjs";

export function prepareDefenseDerivedData(system) {
  const actor = system.parent;

  let condition = getInheritableAttribute({
    entity: actor,
    attributeKey: "condition",
    reduce: "FIRST",
  }) || "0";

  system.condition = condition;
  system.defense = system.defense ?? {};

  system.defense.fortitude = _resolveFort(actor, system, condition);
  system.defense.will = _resolveWill(actor, system, condition);
  system.defense.reflex = _resolveRef(actor, system, condition);
  system.defense.damageThreshold = _resolveDt(actor, system, system.defense.fortitude.total);
  system.defense.situationalBonuses = _getSituationalBonuses(actor);
  system.defense.damageReduction = getInheritableAttribute({
    entity: actor,
    attributeKey: "damageReduction",
    reduce: "SUM",
  });

  const armors = [];
  for (const armor of (actor.equipped || []).filter(item => item.type === "armor")) {
    armors.push(generateArmorBlock(actor, armor));
  }
  system.armors = armors;
}

function _resolveFort(actor, system, condition) {
  const conditionBonus = condition === "OUT" ? "0" : condition;

  const bonuses = [];
  bonuses.push(10);
  const heroicLevel = actor.heroicLevel;
  bonuses.push(heroicLevel);

  const ability = actor.isDroid ? "str" : "con";
  const abilityBonus = system.abilities[ability]?.mod ?? 0;
  bonuses.push(abilityBonus);

  const fortitudeDefenseBonus = getInheritableAttribute({
    entity: actor,
    attributeKey: "fortitudeDefenseBonus",
    reduce: ["SUM", "SUMMARY", "MAPPED"],
    attributeFilter: (attr) => !attr.modifier,
  });
  const otherBonus = fortitudeDefenseBonus["SUM"];
  let miscBonusTip = fortitudeDefenseBonus["SUMMARY"];
  miscBonusTip += `Condition: ${conditionBonus};  `;
  bonuses.push(otherBonus);

  const classBonus = getInheritableAttribute({
    entity: actor,
    attributeKey: "classFortitudeDefenseBonus",
    reduce: "MAX",
  }) || 0;
  bonuses.push(classBonus);

  const equipmentBonus = _getEquipmentFortBonus(actor);
  bonuses.push(equipmentBonus);
  bonuses.push(conditionBonus);

  const armorBonus = resolveValueArray([equipmentBonus, heroicLevel]);
  const miscBonuses = [conditionBonus, otherBonus];
  const miscBonus = resolveValueArray(miscBonuses);

  const name = "Fortitude";
  const total = resolveValueArray(bonuses, actor);
  actor.setResolvedVariable("@FortDef", total, name, name);

  const fortitudeDefense = system.defense?.fortitude || {};
  fortitudeDefense.total = fortitudeDefense.override ?? total;
  fortitudeDefense.abilityBonus = abilityBonus;
  fortitudeDefense.armorBonus = armorBonus;
  fortitudeDefense.classBonus = classBonus;
  fortitudeDefense.miscBonus = miscBonus;
  fortitudeDefense.miscBonusTip = miscBonusTip;
  fortitudeDefense.name = name;
  fortitudeDefense.defenseBlock = true;
  return fortitudeDefense;
}

function _resolveWill(actor, system, condition) {
  const conditionBonus = condition === "OUT" ? "0" : condition;
  const skip = ["vehicle", "npc-vehicle"].includes(actor.type);

  const bonuses = [];
  bonuses.push(10);
  const heroicLevel = actor.heroicLevel;
  bonuses.push(heroicLevel);

  const abilityBonus = system.abilities.wis?.mod ?? 0;
  bonuses.push(abilityBonus);

  // Implant interference
  const disruption = getInheritableAttribute({ entity: actor, attributeKey: "implantDisruption", reduce: "OR" });
  const training = getInheritableAttribute({ entity: actor, attributeKey: "implantTraining", reduce: "OR" });
  if (disruption && !training) {
    bonuses.push(-2);
  }

  const classBonus = getInheritableAttribute({
    entity: actor,
    attributeKey: "classWillDefenseBonus",
    reduce: "MAX",
  }) || 0;
  bonuses.push(classBonus);

  const willDefenseBonus = getInheritableAttribute({
    entity: actor,
    attributeKey: "willDefenseBonus",
    reduce: ["SUM", "SUMMARY", "MAPPED"],
    attributeFilter: (attr) => !attr.modifier,
  });
  const otherBonus = willDefenseBonus["SUM"];
  let miscBonusTip = willDefenseBonus["SUMMARY"];

  const miscBonuses = [otherBonus, conditionBonus];

  for (const val of getInheritableAttribute({ entity: actor, attributeKey: "applyBonusTo", reduce: "VALUES" })) {
    if (val.toLowerCase().endsWith(":will")) {
      const toks = val.split(":");
      const attributeKey = toks[0];
      if (attributeKey === "equipmentFortitudeDefenseBonus") {
        const equipmentFortBonus = _getEquipmentFortBonus(actor);
        miscBonuses.push(equipmentFortBonus);
        miscBonusTip += "Equipment Fort Bonus: " + equipmentFortBonus;
      } else {
        const inheritableAttribute = getInheritableAttribute({
          entity: actor,
          attributeKey,
          reduce: ["SUM", "SUMMARY", "MAPPED"],
          attributeFilter: (attr) => !attr.modifier,
        });
        miscBonuses.push(inheritableAttribute["SUM"]);
        miscBonusTip += inheritableAttribute["SUMMARY"];
      }
    }
  }

  miscBonusTip += `Condition: ${conditionBonus};  `;
  const miscBonus = resolveValueArray(miscBonuses);
  bonuses.push(miscBonus);

  const armorBonus = resolveValueArray([heroicLevel]);
  const total = resolveValueArray(bonuses, actor);
  const name = "Will";
  actor.setResolvedVariable("@WillDef", total, name, name);

  const willDefense = system.defense?.will || {};
  willDefense.total = willDefense.override ?? total;
  willDefense.abilityBonus = abilityBonus;
  willDefense.armorBonus = armorBonus;
  willDefense.classBonus = classBonus;
  willDefense.miscBonus = miscBonus;
  willDefense.miscBonusTip = miscBonusTip;
  willDefense.name = name;
  willDefense.skip = skip;
  willDefense.defenseBlock = true;
  return willDefense;
}

function _resolveRef(actor, system, condition) {
  const conditionBonus = condition === "OUT" ? 0 : parseInt(condition);
  const bonuses = [{ value: 10, type: "Base" }];

  bonuses.push({ value: conditionBonus, type: "Condition" });

  const armorBonus = _getArmorBonus(actor);
  bonuses.push({ value: armorBonus, type: "Armor" });

  const abilityBonus = condition === "OUT" ? -5 : Math.min(
    system.abilities.dex?.mod ?? 0,
    _getEquipmentMaxDexBonus(actor)
  );
  bonuses.push({ value: abilityBonus, type: "Ability" });

  const reflexDefenseBonus = getInheritableAttribute({
    entity: actor,
    attributeKey: "reflexDefenseBonus",
    reduce: "SUM",
    attributeFilter: (attr) => !attr.modifier,
  });
  bonuses.push({ value: reflexDefenseBonus, type: "Miscellaneous" });

  const naturalArmorBonus = getInheritableAttribute({
    entity: actor,
    attributeKey: "naturalArmorReflexDefenseBonus",
    reduce: "SUM",
    attributeFilter: (attr) => !attr.modifier,
  });
  bonuses.push({ value: naturalArmorBonus, type: "Natural" });

  const classBonus = getInheritableAttribute({
    entity: actor,
    attributeKey: "classReflexDefenseBonus",
    reduce: "MAX",
  }) || 0;
  bonuses.push({ value: classBonus, type: "Class" });

  const dodgeBonus = getInheritableAttribute({
    entity: actor,
    attributeKey: "bonusDodgeReflexDefense",
    reduce: "SUM",
    attributeFilter: (attr) => !attr.modifier,
  });
  bonuses.push({ value: dodgeBonus, type: "Dodge" });

  if (game.settings.get("swse", "enableEncumbranceByWeight") && actor.weight >= actor.strainCapacity) {
    bonuses.push({ value: abilityBonus * -1, type: "Encumbrance" });
  }

  const total = resolveValueArray(bonuses.map(b => b.value), actor);
  const name = "Reflex";
  actor.setResolvedVariable("@RefDef", total, name, name);

  const reflexDefense = system.defense?.reflex || {};
  _applyBonuses(reflexDefense, total, bonuses);
  reflexDefense.bonuses = bonuses;
  reflexDefense.name = name;
  reflexDefense.skip = false;
  reflexDefense.defenseBlock = true;
  reflexDefense.defenseModifiers = [_resolveFFRef(actor, bonuses, reflexDefense.defenseModifiers)];
  return reflexDefense;
}

function _resolveFFRef(actor, bonuses, defenseModifiers) {
  let ffBonuses = JSON.parse(JSON.stringify(bonuses));
  ffBonuses = ffBonuses.filter(b => !((b.type === "Ability" && b.value > -1) || b.type === "Encumbrance"));

  const total = resolveValueArray(ffBonuses.map(b => b.value), actor);
  const name = "Reflex (Flat-Footed)";
  actor.setResolvedVariable("@RefFFDef", total, name, name);

  const ffReflexDefense = {};
  _applyBonuses(ffReflexDefense, total, ffBonuses);
  ffReflexDefense.name = name;
  ffReflexDefense.skip = false;
  ffReflexDefense.defenseBlock = true;
  return ffReflexDefense;
}

function _applyBonuses(defense, total, bonuses) {
  defense.total = defense.override ?? total;
  defense.abilityBonus = bonuses.find(b => b.type === "Ability")?.value || 0;
  defense.armorBonus = bonuses.find(b => b.type === "Armor")?.value || 0;
  defense.classBonus = bonuses.find(b => b.type === "Class")?.value || 0;
  const miscBonus = bonuses.filter(b => !["Ability", "Armor", "Class", "Base"].includes(b.type));
  defense.miscBonus = miscBonus.reduce((acc, obj) => acc + obj.value, 0);
  defense.miscBonusTip = miscBonus.map(b => `${b.type} ${b.value > -1 ? "Bonus" : "Modifier"}: ${b.value}`).join("\n");
}

function _resolveDt(actor, system, fortitudeTotal) {
  const total = [];
  total.push(fortitudeTotal);
  total.push(getInheritableAttribute({ entity: actor, attributeKey: "damageThresholdSizeModifier", reduce: "SUM" }));
  total.push(getInheritableAttribute({ entity: actor, attributeKey: "damageThresholdBonus", reduce: "SUM" }));
  total.push(
    ...getInheritableAttribute({ entity: actor, attributeKey: "damageThresholdHardenedMultiplier", reduce: "NUMERIC_VALUES" })
      .map(value => "*" + value)
  );

  const damageThreshold = system.defense?.damageThreshold || {};
  damageThreshold.total = resolveValueArray(total, actor);
  return damageThreshold;
}

function _getSituationalBonuses(actor) {
  const defenseBonuses = getInheritableAttribute({
    entity: actor,
    attributeKey: ["fortitudeDefenseBonus", "reflexDefenseBonus", "willDefenseBonus"],
    attributeFilter: (attr) => !!attr.modifier,
  });

  const situational = [];
  for (const defenseBonus of defenseBonuses) {
    const value = toNumber(defenseBonus.value);
    const defense = defenseBonus.key.replace("DefenseBonus", "");
    situational.push(
      `${(value > -1 ? "+" : "") + value} ${value < 0 ? "penalty" : "bonus"} to their ${defense} Defense to resist ${defenseBonus.modifier}`
    );
  }

  const immunities = getInheritableAttribute({ entity: actor, attributeKey: "immunity" });
  for (const immunity of immunities) {
    situational.push(`Immunity: ${immunity.value}`);
  }

  return situational;
}

function _getArmorBonus(actor) {
  const armorReflexDefenseBonus = getInheritableAttribute({
    entity: actor,
    attributeKey: "armorReflexDefenseBonus",
    reduce: "SUM",
    attributeFilter: (attr) => !attr.modifier,
  });

  if (["vehicle", "npc-vehicle"].includes(actor.type)) {
    if (actor.pilot) {
      const pilotArmorBonus = actor.pilot.items.filter(
        i => i.type === "class" && Object.values(i.system.changes || {}).find(a => a.key === "isHeroic")?.value
      ).length;
      return Math.max(pilotArmorBonus, armorReflexDefenseBonus);
    }
    return armorReflexDefenseBonus;
  }

  return _selectRefBonus(actor, armorReflexDefenseBonus);
}

function _selectRefBonus(actor, armorBonus) {
  if (armorBonus) {
    let proficientWithEquipped = true;
    for (const armor of (actor.equipped || []).filter(item => item.type === "armor")) {
      if (armor._parentIsProficientWithArmor && !armor._parentIsProficientWithArmor()) {
        proficientWithEquipped = false;
      }
    }
    if (proficientWithEquipped) {
      const improvedArmoredDefense = getInheritableAttribute({
        entity: actor,
        attributeKey: "improvedArmoredDefense",
        reduce: "OR",
      });
      if (improvedArmoredDefense) {
        return Math.max(armorBonus, actor.heroicLevel + Math.floor(armorBonus / 2));
      }
      const armoredDefense = getInheritableAttribute({
        entity: actor,
        attributeKey: "armoredDefense",
        reduce: "OR",
      });
      if (armoredDefense || actor.isFollower) {
        return Math.max(armorBonus, actor.heroicLevel);
      }
    }
    return armorBonus;
  }
  return actor.heroicLevel;
}

function _getEquipmentFortBonus(actor) {
  let bonus = 0;
  for (const item of (actor.equipped || [])) {
    if (item.fortitudeDefenseBonus) {
      bonus = Math.max(bonus, item.fortitudeDefenseBonus);
    }
  }
  return bonus;
}

function _getEquipmentMaxDexBonus(actor) {
  let bonus = 1000;
  for (const item of (actor.equipped || [])) {
    if (item.type !== "armor") continue;
    const maximumDexterityBonus = item.maximumDexterityBonus;
    if (!isNaN(maximumDexterityBonus)) {
      bonus = Math.min(bonus, maximumDexterityBonus);
    }
  }
  return bonus;
}

export function generateArmorBlock(actor, armor) {
  const attributes = getInheritableAttribute({
    entity: armor,
    attributeKey: "special",
    reduce: "VALUES",
  });
  if (armor._parentIsProficientWithArmor && !armor._parentIsProficientWithArmor()) {
    attributes.push("(Not Proficient)");
  }
  const notes = attributes.join(", ");
  return {
    name: armor.name,
    refDefense: armor.armorReflexDefenseBonus,
    fortDefense: armor.fortitudeDefenseBonus,
    maxDex: armor.maximumDexterityBonus,
    notes,
    subtype: armor.armorType,
    modes: armor.modes,
  };
}
