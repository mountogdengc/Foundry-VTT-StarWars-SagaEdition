import { BaseFields, PhysicalFields, ModFields } from "./fields.mjs";

const fields = foundry.data.fields;

export class UpgradeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
      ...PhysicalFields.common,
      ...ModFields.common,
      upgrade: new fields.ObjectField({ label: "Upgrade Data" }),
    };
  }
}
