import { getInheritableAttribute } from "../util/attribute-helper.mjs";

export function prepareShieldsDerivedData(system) {
  const actor = system.parent;

  if (!system.overrides?.shields) {
    let shieldRating = getInheritableAttribute({
      entity: actor,
      attributeKey: "shieldRating",
      reduce: "SUM",
    });

    let advancedShieldRating = getInheritableAttribute({
      entity: actor,
      attributeKey: "advancedShieldRating",
      reduce: "MAX",
    });

    if (advancedShieldRating > 0) {
      if (shieldRating === 0) {
        shieldRating = advancedShieldRating * 2 + 10;
      } else {
        shieldRating = shieldRating + advancedShieldRating;
      }
    }
    system.shields.max = shieldRating;
  } else {
    system.shields.max = system.overrides.shields;
  }

  if (system.shields.value > system.shields.max) {
    system.shields.value = system.shields.max;
  }

  system.shields.failureChance = getInheritableAttribute({
    entity: actor,
    attributeKey: "shieldFailureChance",
    reduce: "MAX",
  });

  system.shields.active = !!actor.effects?.find(
    (effect) => effect.statuses?.has("shield") && effect.disabled === false
  );
}
