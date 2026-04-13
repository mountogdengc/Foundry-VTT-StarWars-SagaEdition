const fields = foundry.data.fields;

export class BaseFields {
  static get common() {
    return {
      finalName: new fields.StringField({ initial: "", label: "Final Name" }),
      description: new fields.HTMLField({ initial: "", label: "Description" }),
      textDescription: new fields.StringField({ initial: "", label: "Text Description" }),
      sourceString: new fields.StringField({ initial: "", label: "Source" }),
      attributes: new fields.ObjectField({ label: "Attributes" }),
      changes: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Changes" }),
      choices: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Choices" }),
      modes: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Modes" }),
      providedItems: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Provided Items" }),
      payload: new fields.StringField({ initial: "", label: "Payload" }),
      buildInstructions: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Build Instructions" }),
    };
  }
}

export class PhysicalFields {
  static get common() {
    return {
      cost: new fields.StringField({ initial: "", label: "Cost" }),
      weight: new fields.StringField({ initial: "", label: "Weight" }),
      availability: new fields.StringField({ initial: "", label: "Availability" }),
      size: new fields.StringField({ initial: "", label: "Size" }),
      type: new fields.StringField({ initial: "", label: "Type" }),
      subtype: new fields.StringField({ initial: "", label: "Subtype" }),
      quantity: new fields.NumberField({ initial: 1, integer: true, label: "Quantity" }),
    };
  }
}

export class ModifiableFields {
  static get common() {
    return {
      items: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Items" }),
    };
  }
}

export class ModFields {
  static get common() {
    return {
      hasItemOwner: new fields.BooleanField({ initial: false, label: "Has Item Owner" }),
    };
  }
}

export class PrerequisiteFields {
  static get common() {
    return {
      prerequisite: new fields.ObjectField({ nullable: true, initial: null, label: "Prerequisite" }),
    };
  }
}

export class CategoryFields {
  static get common() {
    return {
      categories: new fields.ArrayField(new fields.StringField(), { initial: [], label: "Categories" }),
    };
  }
}

export class SourceFields {
  static get common() {
    return {
      supplier: new fields.ObjectField({ label: "Supplier" }),
      possibleProviders: new fields.ArrayField(new fields.StringField(), { initial: [], label: "Possible Providers" }),
      isSupplied: new fields.BooleanField({ initial: false, label: "Is Supplied" }),
    };
  }
}

export class ModeFields {
  static get common() {
    return {
      activeModes: new fields.ArrayField(new fields.StringField(), { initial: [], label: "Active Modes" }),
    };
  }
}

export class LevelFields {
  static get common() {
    return {
      levels: new fields.ArrayField(new fields.ObjectField(), { initial: [], label: "Levels" }),
      levelsTaken: new fields.ArrayField(new fields.NumberField({ integer: true }), { initial: [], label: "Levels Taken" }),
    };
  }
}

export class ItemHealthFields {
  static get common() {
    return {};
  }
}
