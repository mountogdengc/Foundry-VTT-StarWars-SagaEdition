import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import { resolveValueArray } from "../util/util.mjs";

export function prepareHealthDerivedData(system) {
  const actor = system.parent;
  const ignoreCon = actor.isDroid;

  const healthBonuses = [];
  for (const charClass of (actor.classes || [])) {
    healthBonuses.push(charClass.classLevelHealth);
    healthBonuses.push(ignoreCon ? 0 : (system.abilities.con?.mod ?? 0));
  }

  healthBonuses.push(
    ...getInheritableAttribute({
      entity: actor,
      attributeKey: "healthHardenedMultiplier",
      reduce: "NUMERIC_VALUES",
    }).map((value) => "*" + value)
  );

  const traitAttributes = getInheritableAttribute({
    entity: actor,
    attributeKey: "hitPointEq",
  });

  const { others, multipliers } = extractTraitValues(traitAttributes, healthBonuses);

  prepareSecondWinds(system);

  system.health.bonusHP = resolveValueArray(others, actor);
  system.health.max = system.overrides?.health ?? system.health.override ?? resolveValueArray(healthBonuses, actor);
  system.health.multipliers = multipliers;
  system.health.override = actor.system?.health?.override ?? null;
}

function extractTraitValues(traitAttributes, healthBonuses) {
  const others = [];
  const multipliers = [];

  for (const item of (traitAttributes || [])) {
    if (!item) continue;
    const value = item.value;
    others.push(value);
    healthBonuses.push(value);
    if (value && (String(value).startsWith("*") || String(value).startsWith("/"))) {
      multipliers.push(value);
    }
  }
  return { others, multipliers };
}

function prepareSecondWinds(system) {
  const bonusSecondWind = getInheritableAttribute({
    entity: system.parent,
    attributeKey: "bonusSecondWind",
    reduce: "SUM",
  });
  system.secondWinds = bonusSecondWind + (system.parent.isHeroic ? 1 : 0);
  system.toggles = system.toggles ?? {};
  system.toggles.secondWinds = system.toggles.secondWinds ?? {};
  for (let i = 0; i < system.secondWinds; ++i) {
    system.toggles.secondWinds[i] = system.toggles.secondWinds[i] ?? false;
  }
}
