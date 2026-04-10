const CURRENT_MIGRATION_VERSION = "14.0.0";

export async function migrateWorld() {
  if (!game.user.isGM) return;

  const currentVersion = game.settings.get("swse", "systemMigrationVersion") ?? "0";

  if (foundry.utils.isNewerVersion(CURRENT_MIGRATION_VERSION, currentVersion)) {
    ui.notifications.info(`Migrating SWSE system data to version ${CURRENT_MIGRATION_VERSION}. Please be patient.`);

    try {
      if (foundry.utils.isNewerVersion("14.0.0", currentVersion)) {
        await migrateToV14();
      }

      await game.settings.set("swse", "systemMigrationVersion", CURRENT_MIGRATION_VERSION);
      ui.notifications.info(`SWSE system migration to version ${CURRENT_MIGRATION_VERSION} complete.`);
    } catch (err) {
      console.error("SWSE | Migration failed:", err);
      ui.notifications.error("SWSE system migration failed. Check the console for details.");
    }
  }
}

async function migrateToV14() {
  console.log("SWSE | Running v14 migration...");

  for (const actor of game.actors) {
    try {
      const updateData = migrateActorData(actor);
      if (!foundry.utils.isEmpty(updateData)) {
        console.log(`SWSE | Migrating actor: ${actor.name}`);
        await actor.update(updateData);
      }
    } catch (err) {
      console.error(`SWSE | Failed to migrate actor ${actor.name}:`, err);
    }
  }

  for (const item of game.items) {
    try {
      const updateData = migrateItemData(item);
      if (!foundry.utils.isEmpty(updateData)) {
        console.log(`SWSE | Migrating item: ${item.name}`);
        await item.update(updateData);
      }
    } catch (err) {
      console.error(`SWSE | Failed to migrate item ${item.name}:`, err);
    }
  }

  for (const pack of game.packs) {
    if (pack.metadata.packageType !== "world") continue;
    try {
      await migrateCompendium(pack);
    } catch (err) {
      console.error(`SWSE | Failed to migrate compendium ${pack.metadata.label}:`, err);
    }
  }
}

function migrateActorData(actor) {
  const updateData = {};
  return updateData;
}

function migrateItemData(item) {
  const updateData = {};
  const source = item.toObject();

  if (source.system?.changes && !Array.isArray(source.system.changes)) {
    updateData["system.changes"] = Object.values(source.system.changes);
  }

  if (source.type === "starshipManeuver") {
    updateData.type = "starShipManeuver";
  }
  if (source.type === "vehicleTemplate") {
    updateData.type = "vehicleBaseType";
  }

  return updateData;
}

async function migrateCompendium(pack) {
  const type = pack.metadata.type;
  if (!["Actor", "Item"].includes(type)) return;

  const documents = await pack.getDocuments();
  const updates = [];

  for (const doc of documents) {
    let updateData;
    if (type === "Actor") {
      updateData = migrateActorData(doc);
    } else if (type === "Item") {
      updateData = migrateItemData(doc);
    }
    if (!foundry.utils.isEmpty(updateData)) {
      updateData._id = doc.id;
      updates.push(updateData);
    }
  }

  if (updates.length > 0) {
    console.log(`SWSE | Migrating ${updates.length} documents in compendium ${pack.metadata.label}`);
    await pack.documentClass.updateDocuments(updates, { pack: pack.collection });
  }
}
