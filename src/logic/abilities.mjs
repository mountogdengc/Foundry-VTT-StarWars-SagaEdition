import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import { getLongKey, resolveValueArray } from "../util/util.mjs";

export function prepareAbilityDerivedData(system) {
  const actor = system.parent;
  let abilityGenType = system.settings?.abilityGeneration?.value;
  if (abilityGenType === "Default") {
    abilityGenType = game.settings.get("swse", "defaultAttributeGenerationType") || "Manual";
  }

  for (const [key, ability] of Object.entries(system.abilities)) {
    if (abilityGenType !== "Manual") {
      const longKey = getLongKey(key);
      if (!longKey) continue;

      const bonuses = getInheritableAttribute({
        entity: actor,
        attributeKey: `${longKey}Bonus`,
        reduce: "VALUES",
      });
      ability.bonus = resolveValueArray(bonuses, actor);
    }

    if (ability.base === null) {
      ability.value = 10;
    } else {
      ability.value = ability.base + (ability.bonus ?? 0);
    }

    ability.mod = Math.floor((ability.value + ability.customBonus - 10) / 2);

    const totalModifiers = ability.mod + (system.health?.condition ?? 0);
    const label = CONFIG.SWSE?.Abilities?.abilitiesShort?.[key] ?? key.toUpperCase();

    ability.label = key.toUpperCase();
    actor.setResolvedVariable(
      "@" + key.toUpperCase() + "ROLL",
      "1d20" + (totalModifiers >= 0 ? " + " : " - ") + Math.abs(totalModifiers),
      label, label
    );
    actor.setResolvedVariable("@" + key.toUpperCase() + "MOD", totalModifiers, label + " Modifier", label + " Modifier");
    actor.setResolvedVariable("@" + key.toUpperCase() + "SCORE", ability.value, label + " Score", label + " Score");
  }
}
