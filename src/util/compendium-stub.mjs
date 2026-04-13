/**
 * Get compendium packs matching an item type.
 * @param {string|object} item - Item type string or object with .type/.pack
 * @returns {CompendiumCollection[]}
 */
export function getCompendium(item) {
  if (!item) return [];
  if (Array.isArray(item)) {
    return item.flatMap(i => getCompendium(i));
  }

  const packs = [...game.packs];
  let type = null;

  if (typeof item === "string") {
    type = item.toLowerCase();
  } else if (item.pack) {
    return packs.filter(pack => pack.collection.startsWith(item.pack));
  } else {
    type = (item.type || "").toLowerCase();
  }

  const typePackMap = {
    feat: "swse.feats",
    talent: "swse.talents",
    species: "swse.species",
    class: "swse.classes",
    trait: "swse.traits",
    template: "swse.templates",
    affiliation: "swse.affiliations",
    background: "swse.backgrounds",
    destiny: "swse.destinies",
    language: "swse.languages",
    forcepower: "swse.force-powers",
    forcesecret: "swse.force-secrets",
    forcetechnique: "swse.force-techniques",
    forceregimen: "swse.force-regimens",
    weapon: "swse.weapon",
    armor: "swse.armor",
    equipment: "swse.equipment",
    upgrade: "swse.upgrade",
    hazard: "swse.hazard",
    implant: "swse.implant",
    vehiclebasetype: "swse.vehicle-base-types",
    vehiclesystem: "swse.vehicle-systems",
    beastattack: "swse.beast-components",
    beasttype: "swse.beast-components",
  };

  const prefix = typePackMap[type];
  if (prefix) {
    return packs.filter(p => p.collection.startsWith("world.") || p.collection.startsWith(prefix));
  }
  return [];
}

/**
 * Resolve an item reference to an actual Item document from compendiums.
 * @param {object} item - { name, type } or { uuid } or a full Item
 * @returns {Promise<{entity: Item|null, itemName: string, payload: string}>}
 */
export async function resolveEntity(item) {
  if (!item) return { entity: null, itemName: "", payload: "" };

  // Already a full item document
  if (item.system || item instanceof Item) {
    return { entity: item.clone ? item.clone() : item, itemName: item.name, payload: "" };
  }

  // UUID-based lookup
  if (item.uuid) {
    try {
      const doc = await fromUuid(item.uuid);
      return { entity: doc?.clone() ?? null, itemName: doc?.name ?? "", payload: "" };
    } catch {
      return { entity: null, itemName: item.name || "", payload: "" };
    }
  }

  // Name-based lookup from compendiums
  if (item.name && item.type) {
    const { itemName, payload } = resolveItemNameAndPayload(item.name);
    const cleanName = cleanItemName(itemName);

    const compendiums = getCompendium(item);
    for (const pack of compendiums) {
      const index = await pack.getIndex();
      const entry = index.find(f => f.name === cleanName);
      if (entry) {
        try {
          const doc = await pack.getDocument(entry._id);
          return { entity: doc?.clone() ?? null, itemName, payload };
        } catch {
          continue;
        }
      }
    }
  }

  return { entity: null, itemName: item.name || "", payload: "" };
}

function resolveItemNameAndPayload(name) {
  const result = /^([\w\s]*) \(([()\-\w\s*:+]*)\)/.exec(name);
  if (result) {
    return { itemName: result[1], payload: result[2] };
  }
  return { itemName: name, payload: "" };
}

export function cleanItemName(name) {
  return (name || "").replace("*", "").trim();
}
