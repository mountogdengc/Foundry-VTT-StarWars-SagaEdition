import { BaseFields, PrerequisiteFields, ItemHealthFields, LevelFields } from "./fields.mjs";

export class ClassData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
      ...PrerequisiteFields.common,
      ...ItemHealthFields.common,
      ...LevelFields.common,
    };
  }
}
