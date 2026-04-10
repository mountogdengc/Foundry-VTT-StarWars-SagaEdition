const fields = foundry.data.fields;

export class ComputerData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      content: new fields.HTMLField({ initial: "", label: "Content" }),
      cursor: new fields.StringField({ initial: "root", label: "Cursor" }),
      attributes: new fields.ObjectField({ label: "Attributes" }),
    };
  }
}
