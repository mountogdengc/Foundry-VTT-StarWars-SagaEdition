import { mount, unmount } from "svelte";
import CompendiumBrowser from "./CompendiumBrowser.svelte";

export class SWSECompendiumBrowser extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "swse-compendium-browser",
    classes: ["swse", "swse-compendium-browser"],
    position: { width: 720, height: 600 },
    window: {
      title: "SWSE Compendium Browser",
      resizable: true,
      minimizable: true,
    },
    actions: {},
  };

  static PARTS = {
    browser: { template: "systems/swse/templates/blank.hbs" },
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

    this.#svelteComponent = mount(CompendiumBrowser, {
      target: result,
      props: {},
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
