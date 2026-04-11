import { mount, unmount } from "svelte";
import ComputerSheet from "./ComputerSheet.svelte";

export class SWSEComputerSheet extends foundry.applications.sheets.ActorSheetV2 {
  static DEFAULT_OPTIONS = {
    classes: ["swse", "swse-character-sheet", "swse-computer-sheet"],
    position: { width: 480, height: 400 },
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
    this.#svelteComponent = mount(ComputerSheet, { target: result, props: { actor: this.document } });
  }

  async close(options = {}) {
    if (this.#svelteComponent) { unmount(this.#svelteComponent); this.#svelteComponent = null; }
    return super.close(options);
  }
}
