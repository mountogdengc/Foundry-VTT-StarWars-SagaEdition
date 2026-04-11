import { SWSEItemSheetBase } from "./SWSEItemSheetBase.mjs";
import FeatureSheet from "./FeatureSheet.svelte";

export class SWSEFeatureSheet extends SWSEItemSheetBase {
  static DEFAULT_OPTIONS = {
    ...SWSEItemSheetBase.DEFAULT_OPTIONS,
    classes: ["swse", "swse-item-sheet", "swse-feature-sheet"],
    position: { width: 520, height: 520 },
  };

  get _svelteComponentClass() {
    return FeatureSheet;
  }
}
