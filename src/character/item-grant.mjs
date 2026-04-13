import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import { resolveEntity, cleanItemName } from "../util/compendium-stub.mjs";

/**
 * After adding a class to an actor, grant starting feats if this is the
 * character's first level or the first level of this class.
 * @param {Actor} actor
 * @param {Item} classItem - The class item on the actor
 * @param {boolean} isFirstCharacterLevel - Is this the character's very first level?
 */
export async function grantClassFeats(actor, classItem, isFirstCharacterLevel) {
  const feats = getInheritableAttribute({
    entity: classItem,
    attributeKey: "classFeat",
    reduce: "VALUES",
  }).map(f => cleanItemName(f));

  if (feats.length === 0) return;

  const isFirstLevelOfClass = classItem.levelsTaken?.length === 1;

  if (isFirstCharacterLevel) {
    // First character level — grant all starting feats or let player choose
    const availableClassFeats = getInheritableAttribute({
      entity: classItem,
      attributeKey: "availableClassFeats",
      reduce: "SUM",
    }) || 0;

    if (availableClassFeats > 0 && availableClassFeats < feats.length) {
      // Player must choose N feats from the list
      for (let i = 0; i < availableClassFeats; i++) {
        const owned = (actor.itemTypes?.feat || []).map(f => f.finalName || f.name);
        const available = feats.filter(f => !owned.includes(f));
        if (available.length === 0) break;
        const chosen = await selectFeatDialog(available, classItem.name);
        if (chosen) await addItemByName(actor, chosen, "feat");
      }
    } else {
      // Grant all starting feats automatically
      const names = feats.filter(f => !!f);
      if (names.length > 0) {
        for (const name of names) {
          await addItemByName(actor, name, "feat");
        }
        ui.notifications.info(`Granted starting feats: ${names.join(", ")}`);
      }
    }
  } else if (isFirstLevelOfClass) {
    // First level of a multiclass — choose one feat from class list + multiclass feats
    const multiclassFeats = getInheritableAttribute({
      entity: classItem,
      attributeKey: "multiclassFeat",
      reduce: "VALUES",
    }).map(f => cleanItemName(f));

    const available = [...feats, ...multiclassFeats];
    if (available.length > 0) {
      const chosen = await selectFeatDialog(available, classItem.name);
      if (chosen) await addItemByName(actor, chosen, "feat");
    }
  }
}

/**
 * Grant provided items from an item (traits, feats, etc. listed in providedItems).
 * @param {Actor} actor
 * @param {Item} item - The item whose providedItems to grant
 */
export async function grantProvidedItems(actor, item) {
  let providedItems = item.system?.providedItems;
  if (!providedItems) return;

  if (!Array.isArray(providedItems)) {
    providedItems = Object.values(providedItems);
  }

  for (const provided of providedItems) {
    if (!provided || !provided.name || !provided.type) continue;
    if (provided.modifier) continue; // Skip modification-type provided items

    try {
      await addItemByName(actor, provided.name, provided.type);
    } catch (e) {
      console.warn(`SWSE | Failed to grant provided item ${provided.name}:`, e);
    }
  }
}

/**
 * Look up an item by name and type from compendiums and add it to the actor.
 * @param {Actor} actor
 * @param {string} name
 * @param {string} type
 */
async function addItemByName(actor, name, type) {
  const { entity } = await resolveEntity({ name, type });
  if (entity) {
    await actor.createEmbeddedDocuments("Item", [entity.toObject()]);
  } else {
    console.warn(`SWSE | Could not find ${type} "${name}" in compendiums.`);
  }
}

/**
 * Show a dialog letting the player choose one feat from a list.
 * @param {string[]} feats - Available feat names
 * @param {string} className - Class name for dialog title
 * @returns {Promise<string|null>} The chosen feat name, or null if cancelled
 */
async function selectFeatDialog(feats, className) {
  if (feats.length === 0) return null;
  if (feats.length === 1) return feats[0];

  const options = feats.map(f => `<option value="${f}">${f}</option>`).join("");

  return Dialog.prompt({
    title: `Select a Starting Feat — ${className}`,
    content: `<p>Select a starting feat from <strong>${className}</strong>:</p>
      <div><select id="feat-select" style="width:100%; margin-top:8px;">${options}</select></div>`,
    callback: (html) => {
      return html.find("#feat-select")[0]?.value ?? html.querySelector("#feat-select")?.value ?? null;
    },
  });
}
