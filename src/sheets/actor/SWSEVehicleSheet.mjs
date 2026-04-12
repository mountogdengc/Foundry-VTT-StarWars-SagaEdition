import { mount, unmount } from "svelte";
import VehicleSheet from "./VehicleSheet.svelte";

export class SWSEVehicleSheet extends foundry.applications.sheets.ActorSheetV2 {
  static DEFAULT_OPTIONS = {
    classes: ["swse", "swse-character-sheet", "swse-vehicle-sheet"],
    position: { width: 720, height: 700 },
    window: { resizable: true, minimizable: true },
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
    if (this.#svelteComponent) { unmount(this.#svelteComponent); this.#svelteComponent = null; }
    this.#svelteComponent = mount(VehicleSheet, { target: result, props: { actor: this.document } });
  }

  async close(options = {}) {
    if (this.#svelteComponent) { unmount(this.#svelteComponent); this.#svelteComponent = null; }
    return super.close(options);
  }

  _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    if (data.type === "Item") return this._onDropItem(event, data);
    if (data.type === "Actor") return this._onDropActor(event, data);
  }

  async _onDropItem(event, data) {
    const item = await Item.implementation.fromDropData(data);
    if (!item) return;
    if (item.parent?.id === this.document.id) return;
    return this.document.createEmbeddedDocuments("Item", [item.toObject()]);
  }

  async _onDropActor(event, data) {
    const droppedActor = await Actor.implementation.fromDropData(data);
    if (!droppedActor) return;
    const links = [...(this.document.system.actorLinks ?? [])];
    if (links.find(l => l.uuid === droppedActor.uuid)) return;
    links.push({ id: droppedActor.id, uuid: droppedActor.uuid, position: "neutral", slot: null });
    return this.document.update({ "system.actorLinks": links });
  }
}
