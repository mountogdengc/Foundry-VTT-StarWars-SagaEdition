import { mount, unmount } from "svelte";
import CharacterSheet from "./CharacterSheet.svelte";

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
    return this.document.createEmbeddedDocuments("Item", [item.toObject()]);
  }
}
