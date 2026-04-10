import { SimpleCache } from "../util/simple-cache.mjs";
import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import { filterItemsByTypes, resolveValueArray, toNumber, inheritableItems } from "../util/util.mjs";

export class SWSEActor extends Actor {
  prepareData() {
    this.cache = new SimpleCache();
    this.resolvedVariables = this.resolvedVariables ?? new Map();
    this.resolvedLabels = this.resolvedLabels ?? new Map();
    this.resolvedNotes = this.resolvedNotes ?? new Map();
    this.formulaFunctions = this.formulaFunctions ?? new Map();
    super.prepareData();
  }

  getRollData() {
    const data = super.getRollData();
    return data;
  }

  getCached(key, fn) {
    return this.cache.getCached(key, fn);
  }

  setResolvedVariable(key, variable, label, notes) {
    this.resolvedVariables.set(key, variable);
    this.resolvedLabels.set(key, label);
    if (notes) this.resolvedNotes.set(key, notes);
  }

  async safeUpdate(data = {}, context = {}) {
    if (this.id && !this.compendium?.locked) {
      return this.update(data, context);
    }
  }

  // --- Computed getters used by logic functions ---

  get attributes() {
    return this.system.abilities;
  }

  get condition() {
    return this.system.condition;
  }

  get classes() {
    return this.getCached("classes", () => {
      const classes = [];
      for (const co of (this.itemTypes?.class || [])) {
        const levelsTaken = co.system?.levelsTaken || [];
        for (const [i, characterLevel] of levelsTaken.entries()) {
          classes.push({
            id: co.id,
            img: co.img,
            name: co.name,
            levelUpHitPoints: co.levelUpHitPoints,
            classLevelHealth: co.classLevelHealth?.(i + 1, characterLevel) ?? 0,
            isLatest: false,
            classLevel: i + 1,
            characterLevel,
            isFollowerTemplate: co.isFollowerTemplate,
          });
        }
      }
      return classes;
    });
  }

  get characterLevel() {
    return this.getCached("characterLevel", () => {
      const classes = this.classes;
      const charLevel = classes ? classes.length : 0;
      this.resolvedVariables.set("@charLevel", charLevel);
      return charLevel;
    });
  }

  get heroicLevel() {
    return this.getCached("heroicLevel", () => {
      const classObjects = filterItemsByTypes((this.items || new Map()).values(), ["class"]);
      let heroicLevel = 0;
      for (const co of classObjects) {
        if (getInheritableAttribute({ entity: co, attributeKey: "isHeroic", reduce: "OR" })) {
          heroicLevel += (co.system?.levelsTaken?.length || 0);
        }
      }
      this.resolvedVariables.set("@heroicLevel", heroicLevel);
      return heroicLevel;
    });
  }

  get isHeroic() {
    return this.getCached("isHeroic", () => {
      return getInheritableAttribute({ entity: this, attributeKey: "isHeroic", reduce: "OR" });
    });
  }

  get isDroid() {
    if (this.type === "vehicle" || this.type === "npc-vehicle") return false;
    for (const species of (this.itemTypes?.species || [])) {
      for (const change of (species.system?.changes || [])) {
        if (change.key === "isDroid" && (change.value === true || change.value === "true")) {
          return true;
        }
      }
    }
    return false;
  }

  get isForceSensitive() {
    const forceSensitivity = this.items?.find(i => i.name === "Force Sensitivity");
    return !!forceSensitivity && !this.isDroid;
  }

  get isFollower() {
    return getInheritableAttribute({ entity: this, attributeKey: "follower", reduce: "OR" });
  }

  get equipped() {
    return this.getCached("equipped", () => {
      const items = [];
      for (const item of (this.items || [])) {
        if (item.system?.equipped) items.push(item);
      }
      return items;
    });
  }

  get baseAttackBonus() {
    return this.getCached("baseAttackBonus", () => {
      return getInheritableAttribute({ entity: this, attributeKey: "baseAttackBonus", reduce: "SUM" });
    });
  }

  get grapple() {
    return this.getCached("grapple", () => {
      let condition = getInheritableAttribute({ entity: this, attributeKey: "condition", reduce: "SUM" });
      if (condition === "OUT") condition = 0;
      const attrs = this.attributes;
      return this.baseAttackBonus
        + Math.max(attrs.str?.mod || 0, attrs.dex?.mod || 0)
        + getInheritableAttribute({ entity: this, attributeKey: "grappleBonus", reduce: "SUM" })
        + getInheritableAttribute({ entity: this, attributeKey: "grappleSizeModifier", reduce: "SUM" })
        + (toNumber(condition) || 0);
    });
  }

  get classSummary() {
    return this.getCached("classSummary", () => {
      const counts = {};
      for (const co of (this.itemTypes?.class || [])) {
        const name = co.name;
        counts[name] = (counts[name] || 0) + (co.system?.levelsTaken?.length || 0);
      }
      return Object.entries(counts).map(([name, lvl]) => `${name} ${lvl}`).join(" / ");
    });
  }

  get classLevels() {
    return this.getCached("classLevels", () => {
      const levels = {};
      for (const co of (this.itemTypes?.class || [])) {
        levels[co.name] = co.system?.levelsTaken?.length || 0;
      }
      return levels;
    });
  }

  ignoreCon() {
    return this.isDroid;
  }

  itemsWithTypes(types) {
    const items = [];
    for (const type of types) {
      try {
        items.push(...(this.itemTypes[type] || []));
      } catch (e) {
        console.error("INVALID ITEM TYPE: " + type, e);
      }
    }
    return items;
  }

  getTraitAttributesByKey(attributeKey) {
    return getInheritableAttribute({
      entity: this,
      attributeKey,
      itemFilter: (item => item.type === "trait"),
    });
  }

  getAbilitySkillBonus(skill) {
    if (skill.toLowerCase() === "stealth") {
      return getInheritableAttribute({ entity: this, attributeKey: "sneakModifier", reduce: "SUM" });
    }
    if (skill.toLowerCase() === "perception") {
      return getInheritableAttribute({ entity: this, attributeKey: "perceptionModifier", reduce: "SUM" });
    }
    return 0;
  }

  cleanSkillName(key) {
    return uppercaseFirstLetters(key)
      .replace("Knowledge ", "K")
      .replace("(", "")
      .replace(")", "")
      .replace(" ", "")
      .replace(" ", "");
  }
}

export function getEntityKey(entity) {
  return entity?.id || entity?._id;
}

export function uppercaseFirstLetters(s) {
  const words = s.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (words[i][0] === "(") {
      words[i] = words[i][0] + words[i][1].toUpperCase() + words[i].substr(2);
    } else {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
  }
  return words.join(" ");
}
