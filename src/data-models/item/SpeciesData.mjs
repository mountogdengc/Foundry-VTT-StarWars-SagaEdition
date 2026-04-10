import { BaseFields, CategoryFields } from "./fields.mjs";

const fields = foundry.data.fields;

export class SpeciesData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
      ...CategoryFields.common,
      traits: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Traits" }),
    };
  }
}
