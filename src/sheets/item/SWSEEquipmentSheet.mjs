import { SWSEItemSheetBase } from "./SWSEItemSheetBase.mjs";
import EquipmentSheet from "./EquipmentSheet.svelte";

export class SWSEEquipmentSheet extends SWSEItemSheetBase {
  static DEFAULT_OPTIONS = {
    ...SWSEItemSheetBase.DEFAULT_OPTIONS,
    classes: ["swse", "swse-item-sheet", "swse-equipment-sheet"],
    position: { width: 520, height: 580 },
  };

  get _svelteComponentClass() {
    return EquipmentSheet;
  }
}
