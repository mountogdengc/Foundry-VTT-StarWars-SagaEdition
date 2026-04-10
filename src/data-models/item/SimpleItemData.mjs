import { BaseFields, CategoryFields, SourceFields, PrerequisiteFields } from "./fields.mjs";

export class SimpleItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
      ...CategoryFields.common,
      ...SourceFields.common,
      ...PrerequisiteFields.common,
    };
  }
}
