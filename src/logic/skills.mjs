import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import { resolveValueArray, toNumber, filterItemsByTypes, equippedItems } from "../util/util.mjs";
import {
  defaultAttributes,
  getGroupedSkillMap,
  NEW_LINE,
  skillDetails,
  skills as getSkillList,
} from "../util/constants.mjs";
import { DEFAULT_SKILL } from "../util/classDefaults.mjs";
import { uppercaseFirstLetters } from "../documents/SWSEActor.mjs";

export function prepareSkillDerivedData(system) {
  const actor = system.parent;

  const groupedSkillMap = getGroupedSkillMap();
  const heavyLoadAffected = actor.heavyLoad;
  const halfCharacterLevel = Math.floor((system.level?.value ?? 0) / 2);

  const classSkills = _getClassSkills(actor);
  const automaticTrainedSkill = getInheritableAttribute({
    entity: actor,
    attributeKey: "automaticTrainedSkill",
    reduce: "VALUES_TO_LOWERCASE",
  });
  const skillBonusAttr = getInheritableAttribute({
    entity: actor,
    attributeKey: "skillBonus",
    reduce: "VALUES",
  });
  const untrainedSkillBonuses = getInheritableAttribute({
    entity: actor,
    attributeKey: "untrainedSkillBonus",
    reduce: "VALUES",
  }).map((skill) => (skill || "").toLowerCase());
  const reRollSkills = getInheritableAttribute({
    entity: actor,
    attributeKey: "skillReRoll",
  });
  const skillFocuses = getInheritableAttribute({
    entity: actor,
    attributeKey: "skillFocus",
    reduce: "VALUES",
  }).map((skill) => (skill || "").toLowerCase());

  const acPenalty = _generateArmorCheckPenalties(actor);
  const builtSkills = {};

  const resolvedSkills = _applyGroupedSkills(getSkillList(actor.type), groupedSkillMap);

  const nonSituationalSkills = [];
  const distinctSkillBonuses = [...new Set(skillBonusAttr.map(bonus => bonus.split(":")[0]))];
  for (const distinctSkillBonus of distinctSkillBonuses) {
    let isSub = false;
    const isAttribute = defaultAttributes.includes(_standardizedAttribute(distinctSkillBonus));
    for (const resolvedSkill of resolvedSkills) {
      if (distinctSkillBonus.toLowerCase().startsWith(resolvedSkill.toLowerCase())) {
        isSub = true;
        break;
      }
    }
    if (!isSub && !isAttribute) {
      nonSituationalSkills.push(distinctSkillBonus);
    }
  }
  resolvedSkills.push(...nonSituationalSkills);

  for (const resSkill of resolvedSkills) {
    const key = resSkill.toLowerCase();
    const customSkill = groupedSkillMap?.get(resSkill);
    const skill = _createNewSkill(resSkill, system.skills?.[resSkill] || {}, customSkill);
    const abilityMod = system.abilities[skill.ability]?.mod ?? 0;
    const notes = [];

    skill.isClass = _isClassSkill(key, actor, classSkills);
    if (key === "use the force" && !skill.isClass) {
      skill.hide = true;
    }

    const situationalSkillNames = customSkill?.grouped || [];
    const bonuses = [];

    bonuses.push({ value: halfCharacterLevel, description: `Half character level: ${halfCharacterLevel}` });
    bonuses.push({ value: abilityMod, description: `Ability Mod: ${abilityMod}` });
    skill.abilityBonus = abilityMod;

    if (automaticTrainedSkill.includes(key)) {
      skill.trained = true;
      skill.locked = true;
      if (!skill.isClass) skill.blockedSkill = true;
    }

    const trainedSkillBonus = skill.trained === true ? 5 : 0;
    bonuses.push({ value: trainedSkillBonus, description: `Trained Skill Bonus: ${trainedSkillBonus}` });

    const untrainedSkillBonus = !skill.trained && untrainedSkillBonuses.includes(key) ? 2 : 0;
    bonuses.push({ value: untrainedSkillBonus, description: `Untrained Skill Bonus: ${untrainedSkillBonus}` });
    skill.trainedBonus = trainedSkillBonus + untrainedSkillBonus;

    const abilitySkillBonus = actor.getAbilitySkillBonus(key);
    bonuses.push({ value: abilitySkillBonus, description: `Ability Skill Modifier: ${abilitySkillBonus}` });

    bonuses.push({ value: system.health?.condition ?? 0, description: `Condition Modifier: ${system.health?.condition ?? 0}` });

    if (skill.acp) {
      bonuses.push({ value: acPenalty, description: `Armor Class Penalty: ${acPenalty}` });
      skill.armorPenalty = acPenalty;
      if (heavyLoadAffected) {
        bonuses.push({ value: -10, description: "Heavy Load Penalty: -10" });
      }
    }

    if (skillFocuses.includes(key)) {
      let skillFocusBonus = 5;
      try {
        const skillFocusCalculationOption = game.settings.get("swse", "skillFocusCalculation");
        if (skillFocusCalculationOption === "charLevelUp") {
          skillFocusBonus = Math.ceil((system.level?.value ?? 0) / 2);
        } else if (skillFocusCalculationOption === "charLevelDown") {
          skillFocusBonus = Math.floor((system.level?.value ?? 0) / 2);
        }
      } catch (e) { /* setting may not exist yet */ }
      bonuses.push({ value: skillFocusBonus, description: `Skill Focus Bonus: ${skillFocusBonus}` });
      skill.focusBonus = skillFocusBonus;
      skill.focus = true;
    }

    const rawSkillBonuses = skillBonusAttr.filter(bonus => {
      const bonusKey = bonus.split(":")[0].toLowerCase();
      return bonusKey === resSkill.toLowerCase()
        || _standardizedAttribute(bonusKey) === _standardizedAttribute(skill.ability)
        || bonusKey === "all";
    });

    const miscBonuses = _resolveBonusesAndHandleModifiers(rawSkillBonuses);

    situationalSkillNames.push(
      ...skillBonusAttr
        .map(bonus => bonus.split(":")[0])
        .filter(bonus => bonus.toLowerCase() !== resSkill.toLowerCase() && bonus.toLowerCase().startsWith(resSkill.toLowerCase()))
    );

    const miscBonus = miscBonuses.reduce((prev, curr) => prev + toNumber(curr), 0);
    bonuses.push({ value: miscBonus, description: `Miscellaneous Bonus: ${miscBonus}` });
    skill.miscBonus = miscBonus;

    if (skill.manualBonus) {
      bonuses.push({ value: skill.manualBonus, description: `Manual Bonus: ${skill.manualBonus}` });
    }

    _addSkillRerollNotes(reRollSkills, key, notes, skill);

    const nonZeroBonuses = bonuses.filter((bonus) => bonus.value !== 0);
    skill.title = nonZeroBonuses.map((bonus) => bonus.description).join(NEW_LINE);
    skill.value = resolveValueArray(nonZeroBonuses.map((bonus) => bonus.value));

    _prepareSkillRollData(system, key, skill, notes);

    builtSkills[resSkill] = skill;
  }

  system.skills = builtSkills;
  _prepareRemainingSkills(system);
}

function _getClassSkills(actor) {
  const classSkills = new Set();
  const skills = getInheritableAttribute({
    entity: actor,
    attributeKey: "classSkill",
    reduce: "VALUES",
  });
  for (const skill of skills) {
    if (["knowledge (all skills, taken individually)", "knowledge (all types, taken individually)"].includes(skill.toLowerCase())) {
      classSkills.add("knowledge (galactic lore)");
      classSkills.add("knowledge (bureaucracy)");
      classSkills.add("knowledge (life sciences)");
      classSkills.add("knowledge (physical sciences)");
      classSkills.add("knowledge (social sciences)");
      classSkills.add("knowledge (tactics)");
      classSkills.add("knowledge (technology)");
    } else {
      classSkills.add(skill.toLowerCase());
    }
  }
  return classSkills;
}

function _applyGroupedSkills(skillList, skillMap) {
  const skillsCopy = [...skillList];
  if (!skillMap || skillMap.size === 0) return skillsCopy.sort();
  skillsCopy.push(...Array.from(skillMap.keys()));
  const groupedSkills = [];
  for (const value of skillMap.values()) {
    if (value.grouped) groupedSkills.push(...value.grouped);
  }
  return skillsCopy.filter(s => !groupedSkills.includes(s)).sort();
}

function _resolveBonusesAndHandleModifiers(rawSkillBonuses) {
  const skillBonuses = [];
  let implant = 0;
  for (const skillBonus of rawSkillBonuses) {
    const toks = skillBonus.split(":");
    if (toks.length > 2) {
      const modifier = toks[2].toLowerCase().trim();
      if (modifier === "implant") {
        implant += parseInt(toks[1]);
      }
      continue;
    }
    skillBonuses.push(toks[1]);
  }
  if (implant) skillBonuses.push(Math.max(implant, -5));
  return skillBonuses;
}

function _createNewSkill(skill, actualSkill = {}, customSkill = {}) {
  return { ...DEFAULT_SKILL, ...(skillDetails[skill] || {}), ...(customSkill || {}), ...actualSkill };
}

function _isClassSkill(key, actor, classSkills) {
  return key === "use the force" ? actor.isForceSensitive : classSkills.has(key);
}

function _prepareSkillRollData(system, key, skill, notes) {
  const actor = system.parent;
  const cleanName = actor.cleanSkillName(key);
  const variable = `@${cleanName}`;
  const label = uppercaseFirstLetters(key).replace("Knowledge", "K.");

  actor.resolvedVariables.set(variable, "1d20 + " + skill.value);
  actor.resolvedLabels.set(variable, label);
  actor.resolvedNotes.set(variable, notes);
}

function _addSkillRerollNotes(reRollSkills, key, notes, skill) {
  const applicableRerolls = reRollSkills.filter(
    (reroll) => reroll.value.toLowerCase() === key || reroll.value.toLowerCase() === "any"
  );
  for (const reroll of applicableRerolls) {
    notes.push(`[[/roll 1d20 + ${skill.value}]] ${reroll.sourceDescription}`);
  }
}

function _prepareRemainingSkills(system) {
  const availableCount = _getAvailableTrainedSkillCount(system);
  const trainedCount = Object.values(system.skills).filter(s => s.trained).length;
  const remaining = availableCount - trainedCount;
  system.remainingSkills = remaining < 0 ? false : remaining;
  system.tooManySkills = remaining < 0 ? Math.abs(remaining) : false;
}

function _getAvailableTrainedSkillCount(system) {
  const actor = system.parent;
  const intBonus = system.abilities.int?.mod ?? 0;
  let classBonus = 0;
  for (const co of (actor.itemTypes?.class || [])) {
    if (co.system?.levelsTaken?.includes(1)) {
      classBonus = getInheritableAttribute({
        entity: co,
        attributeKey: "trainedSkillsFirstLevel",
        reduce: "SUM",
      });
      break;
    }
  }
  const classSkills = Math.max(toNumber(resolveValueArray([classBonus, intBonus])), 1);
  const automaticTrainedSkill = getInheritableAttribute({
    entity: actor,
    attributeKey: "automaticTrainedSkill",
    reduce: "VALUES_TO_LOWERCASE",
  }).filter((value) => value === "#payload#").length;
  const otherSkills = getInheritableAttribute({
    entity: actor,
    attributeKey: "trainedSkills",
    reduce: "SUM",
  });
  return toNumber(resolveValueArray([classSkills, otherSkills, automaticTrainedSkill]));
}

function _standardizedAttribute(rerollKey) {
  if (!rerollKey) return rerollKey;
  switch (rerollKey.toLowerCase()) {
    case "dex": return "dexterity";
    case "str": return "strength";
    case "con": return "constitution";
    case "int": return "intelligence";
    case "wis": return "wisdom";
    case "cha": return "charisma";
    default: return rerollKey.toLowerCase();
  }
}

function _generateArmorCheckPenalties(actor) {
  const armorProficiencies = getInheritableAttribute({
    entity: actor,
    attributeKey: "armorProficiency",
    reduce: "VALUES",
  });
  const actsAs = getInheritableAttribute({
    entity: actor,
    attributeKey: "actsAs",
    reduce: "VALUES",
  });

  let lightProficiency = armorProficiencies.includes("light");
  let mediumProficiency = armorProficiencies.includes("medium");
  let heavyProficiency = armorProficiencies.includes("heavy");
  mediumProficiency = mediumProficiency && lightProficiency;
  heavyProficiency = heavyProficiency && mediumProficiency;

  let wearingLight = false;
  let wearingMedium = false;
  let wearingHeavy = false;

  const armorItems = filterItemsByTypes(equippedItems(actor), ["armor"]).map(a => a.system?.subtype);
  armorItems.push(...actsAs);
  for (const armor of armorItems) {
    if (armor === "Heavy Armor") wearingHeavy = true;
    if (armor === "Medium Armor") wearingMedium = true;
    if (armor === "Light Armor") wearingLight = true;
  }

  const energyShieldArmorTypes = getInheritableAttribute({
    entity: actor,
    attributeKey: "energyShieldArmorType",
    reduce: "VALUES",
  });

  if ((wearingHeavy && !heavyProficiency) || energyShieldArmorTypes.includes("Heavy Armor")) return -10;
  if ((wearingMedium && !mediumProficiency) || energyShieldArmorTypes.includes("Medium Armor")) return -5;
  if ((wearingLight && !lightProficiency) || energyShieldArmorTypes.includes("Light Armor")) return -2;
  return 0;
}
