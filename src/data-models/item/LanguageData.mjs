import { BaseFields } from "./fields.mjs";

export class LanguageData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
    };
  }
}
