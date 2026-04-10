import { BaseFields, PhysicalFields, CategoryFields, ModifiableFields, SourceFields, ModeFields } from "./fields.mjs";

const fields = foundry.data.fields;

export class WeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
      ...PhysicalFields.common,
      ...CategoryFields.common,
      ...ModifiableFields.common,
      ...SourceFields.common,
      ...ModeFields.common,
      weapon: new fields.ObjectField({ label: "Weapon Data" }),
    };
  }
}
