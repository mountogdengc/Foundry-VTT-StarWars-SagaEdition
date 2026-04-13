import { mount, unmount } from "svelte";
import CharacterSheet from "./CharacterSheet.svelte";
import { meetsPrerequisites, formatPrerequisites } from "../../util/prerequisite.mjs";

export class SWSECharacterSheet extends foundry.applications.sheets.ActorSheetV2 {
  static DEFAULT_OPTIONS = {
    classes: ["swse", "swse-character-sheet"],
    position: { width: 720, height: 700 },
    window: {
      resizable: true,
      minimizable: true,
    },
    actions: {},
  };

  static PARTS = {
    sheet: { template: "systems/swse/templates/blank.hbs" },
  };

  #svelteComponent = null;

  async _renderHTML(context, options) {
    const div = document.createElement("div");
    div.classList.add("swse-sheet-mount");
    div.style.height = "100%";
    return div;
  }

  _replaceHTML(result, content, options) {
    content.replaceChildren(result);

    if (this.#svelteComponent) {
      unmount(this.#svelteComponent);
      this.#svelteComponent = null;
    }

    this.#svelteComponent = mount(CharacterSheet, {
      target: result,
      props: { actor: this.document },
    });
  }

  async close(options = {}) {
    if (this.#svelteComponent) {
      unmount(this.#svelteComponent);
      this.#svelteComponent = null;
    }
    return super.close(options);
  }

  _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    if (data.type === "Item") {
      return this._onDropItem(event, data);
    }
  }

  async _onDropItem(event, data) {
    const item = await Item.implementation.fromDropData(data);
    if (!item) return;
    if (item.parent?.id === this.document.id) return;

    // Check prerequisites unless actor has ignorePrerequisites enabled
    const ignorePrereqs = this.document.system.settings?.ignorePrerequisites?.value;
    if (!ignorePrereqs && item.system?.prerequisite) {
      const result = meetsPrerequisites(this.document, item.system.prerequisite, { isAdd: true });
      if (result.doesFail) {
        const failureHtml = formatPrerequisites(result.failureList);
        const confirmed = await Dialog.confirm({
          title: `Prerequisites Not Met: ${item.name}`,
          content: `<p><strong>${item.name}</strong> has unmet prerequisites:</p>${failureHtml}<p>Add it anyway?</p>`,
        });
        if (!confirmed) return;
      }
    }

    // Class level management — stack levels on existing class instead of creating duplicate
    if (item.type === "class") {
      return this._onDropClass(item);
    }

    return this.document.createEmbeddedDocuments("Item", [item.toObject()]);
  }

  /**
   * Handle dropping a class item. If the class already exists on the actor,
   * add a new level to it. Otherwise create it as a new item with level 1.
   */
  async _onDropClass(item) {
    const actor = this.document;

    // Calculate next character level
    let maxLevel = 0;
    for (const classItem of (actor.itemTypes?.class || [])) {
      for (const lvl of (classItem.levelsTaken || [])) {
        if (lvl > maxLevel) maxLevel = lvl;
      }
    }
    const nextLevel = maxLevel + 1;

    // Check if this class already exists on the actor
    const existing = actor.itemTypes?.class?.find(c => c.name === item.name);
    if (existing) {
      const levels = [...(existing.levelsTaken || [])];
      levels.push(nextLevel);
      await existing.update({ "system.levelsTaken": levels });
      ui.notifications.info(`${actor.name} took level ${levels.length} of ${existing.name} (Character Level ${nextLevel}).`);
      return;
    }

    // New class — create with level 1
    const itemData = item.toObject();
    itemData.system.levelsTaken = [nextLevel];
    const [created] = await actor.createEmbeddedDocuments("Item", [itemData]);
    ui.notifications.info(`${actor.name} took level 1 of ${created.name} (Character Level ${nextLevel}).`);
  }
}
