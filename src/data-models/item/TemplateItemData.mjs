import { BaseFields, ModFields } from "./fields.mjs";

export class TemplateItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
      ...ModFields.common,
    };
  }
}
