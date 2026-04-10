import { BaseFields, PrerequisiteFields, CategoryFields, SourceFields } from "./fields.mjs";

const fields = foundry.data.fields;

export class TalentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...BaseFields.common,
      ...PrerequisiteFields.common,
      ...CategoryFields.common,
      ...SourceFields.common,
      talentTree: new fields.StringField({ initial: "", label: "Talent Tree" }),
      talentTreeSource: new fields.StringField({ initial: "", label: "Talent Tree Source" }),
      talentTreeUrl: new fields.StringField({ initial: "", label: "Talent Tree URL" }),
      bonusTalentTree: new fields.StringField({ initial: "", label: "Bonus Talent Tree" }),
    };
  }
}
