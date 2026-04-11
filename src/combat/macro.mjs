export async function createAttackMacro(data, slot) {
  if (data.type !== "Item") return;

  const item = await Item.implementation.fromDropData(data);
  if (!item) return;
  if (item.type !== "weapon") return;

  const actor = item.parent;
  if (!actor) {
    ui.notifications.warn("This weapon is not owned by an actor.");
    return false;
  }

  const macroName = `Attack: ${item.name}`;
  const command = `game.swse.rollAttack("${actor.id}", "${item.id}");`;

  let macro = game.macros.find(m => m.name === macroName && m.command === command);
  if (!macro) {
    macro = await Macro.create({
      name: macroName,
      type: "script",
      img: item.img,
      command,
    });
  }

  await game.user.assignHotbarMacro(macro, slot);
  return false;
}

export async function executeMacroAttack(actorId, itemId) {
  const { rollAttack } = await import("./attack.mjs");
  const actor = game.actors.get(actorId);
  if (!actor) {
    ui.notifications.error("Actor not found.");
    return;
  }
  const item = actor.items.get(itemId);
  if (!item) {
    ui.notifications.error("Weapon not found on actor.");
    return;
  }
  await rollAttack(actor, item);
}
