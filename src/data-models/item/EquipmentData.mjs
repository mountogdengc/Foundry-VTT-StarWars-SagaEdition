import { BaseFields, PhysicalFields, CategoryFields, ModifiableFields, SourceFields } from "./fields.mjs";

const fields = foundry.data.fields;

export class EquipmentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
      ...PhysicalFields.common,
      ...CategoryFields.common,
      ...ModifiableFields.common,
      ...SourceFields.common,
      equipment: new fields.ObjectField({ label: "Equipment Data" }),
    };
  }
}
