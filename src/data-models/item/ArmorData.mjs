import { BaseFields, PhysicalFields, CategoryFields, ModifiableFields, SourceFields } from "./fields.mjs";

const fields = foundry.data.fields;

export class ArmorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
      ...PhysicalFields.common,
      ...CategoryFields.common,
      ...ModifiableFields.common,
      ...SourceFields.common,
      armorType: new fields.StringField({ initial: "", label: "Armor Type" }),
    };
  }
}
