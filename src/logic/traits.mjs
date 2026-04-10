import { inheritableItems } from "../util/util.mjs";
import { ALPHA_FINAL_NAME } from "../util/util.mjs";

export function prepareTraitsDerivedData(system) {
  const actor = system.parent;

  system.level = system.level ?? {};
  system.level.value = actor.characterLevel;
  system.classSummary = actor.classSummary;
  system.classLevel = actor.classLevels;

  const activeTraits = inheritableItems(actor).filter(i => i.type === "trait");
  system.traits = activeTraits.sort(ALPHA_FINAL_NAME);

  system.baseAttack = actor.baseAttackBonus;
  system.grapple = actor.grapple;
}
