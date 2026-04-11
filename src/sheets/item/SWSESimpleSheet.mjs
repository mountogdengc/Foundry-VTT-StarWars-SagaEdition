import { SWSEItemSheetBase } from "./SWSEItemSheetBase.mjs";
import SimpleSheet from "./SimpleSheet.svelte";

export class SWSESimpleSheet extends SWSEItemSheetBase {
  static DEFAULT_OPTIONS = {
    ...SWSEItemSheetBase.DEFAULT_OPTIONS,
    classes: ["swse", "swse-item-sheet", "swse-simple-sheet"],
    position: { width: 480, height: 400 },
  };

  get _svelteComponentClass() {
    return SimpleSheet;
  }
}
