import { mount, unmount } from "svelte";

export class SWSEItemSheetBase extends foundry.applications.sheets.ItemSheetV2 {
  static DEFAULT_OPTIONS = {
    classes: ["swse", "swse-item-sheet"],
    position: { width: 520, height: 520 },
    window: {
      resizable: true,
      minimizable: true,
    },
    actions: {},
  };

  static PARTS = {
    sheet: { template: "systems/swse/templates/blank.hbs" },
  };

  /**
   * Subclasses override this to return their Svelte component class.
   */
  get _svelteComponentClass() {
    throw new Error("Subclass must override _svelteComponentClass");
  }

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

    this.#svelteComponent = mount(this._svelteComponentClass, {
      target: result,
      props: { item: this.document },
    });
  }

  async close(options = {}) {
    if (this.#svelteComponent) {
      unmount(this.#svelteComponent);
      this.#svelteComponent = null;
    }
    return super.close(options);
  }
}
