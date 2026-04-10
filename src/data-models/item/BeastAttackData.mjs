import { BaseFields, PhysicalFields, CategoryFields, ModifiableFields, SourceFields, ModeFields } from "./fields.mjs";

export class BeastAttackData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
      ...PhysicalFields.common,
      ...CategoryFields.common,
      ...ModifiableFields.common,
      ...SourceFields.common,
      ...ModeFields.common,
    };
  }
}
