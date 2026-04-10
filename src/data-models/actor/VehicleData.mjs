const fields = foundry.data.fields;

function abilityField(label) {
  return new fields.SchemaField({
    value: new fields.NumberField({ initial: 10, integer: true, min: 0, label: `${label} Score` }),
    base: new fields.NumberField({ nullable: true, initial: 10, integer: true, min: 0, label: `${label} Base` }),
    customBonus: new fields.NumberField({ initial: 0, integer: true, label: `${label} Custom` }),
  });
}

function skillField(ability, skill) {
  return new fields.SchemaField({
    ability: new fields.StringField({ initial: ability, blank: false, label: "Related Ability" }),
    trained: new fields.BooleanField({ initial: false, label: "Trained" }),
    manualBonus: new fields.NumberField({ initial: 0, integer: true, label: `Manual ${skill} Bonus` }),
    trainedOnly: new fields.BooleanField({ initial: false, label: "Trained Only" }),
    armorPenalty: new fields.BooleanField({ initial: false, label: "Armor Penalty" }),
    value: new fields.NumberField({ initial: 0, integer: true, label: `${skill} Mod` }),
  });
}

export class VehicleData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      abilities: new fields.SchemaField({
        str: abilityField("Strength"), dex: abilityField("Dexterity"),
        con: abilityField("Constitution"), int: abilityField("Intelligence"),
        wis: abilityField("Wisdom"), cha: abilityField("Charisma"),
      }),
      health: new fields.SchemaField({
        value: new fields.NumberField({ initial: 10, min: 0, integer: true, label: "Current HP" }),
        max: new fields.NumberField({ initial: 10, min: 0, integer: true, label: "Max HP" }),
        bonusHP: new fields.NumberField({ nullable: true, initial: null, min: 0, integer: true, label: "Bonus HP" }),
        override: new fields.NumberField({ nullable: true, initial: null, min: 0, integer: true, label: "HP Override" }),
      }),
      shields: new fields.SchemaField({
        value: new fields.NumberField({ step: 5, min: 0, integer: true, label: "Shield HP" }),
        max: new fields.NumberField({ nullable: true, initial: null, step: 5, min: 0, integer: true, label: "Max Shield HP" }),
      }),
      toggles: new fields.ObjectField({ label: "Stored Sheet Toggles" }),
      overrides: new fields.ObjectField({ label: "Stored Sheet Overrides" }),
      actorLinks: new fields.ArrayField(new fields.SchemaField({
        id: new fields.DocumentIdField(),
        uuid: new fields.StringField({ required: true }),
        position: new fields.StringField({ initial: "neutral" }),
        slot: new fields.StringField({ nullable: true, initial: null }),
      }), { label: "Actor Links", initial: [] }),
      defense: new fields.SchemaField({
        ref: new fields.SchemaField({ value: new fields.NumberField({ initial: 10, min: 0, label: "Reflex" }) }),
        fort: new fields.SchemaField({ value: new fields.NumberField({ initial: 10, min: 0, label: "Fortitude" }) }),
        will: new fields.SchemaField({ value: new fields.NumberField({ initial: 10, min: 0, label: "Will" }) }),
        reff: new fields.SchemaField({ value: new fields.NumberField({ initial: 10, min: 0, label: "Reflex (Flat-Footed)" }) }),
        special: new fields.StringField({ initial: "", label: "Special Defense" }),
        dt: new fields.SchemaField({ value: new fields.NumberField({ initial: 10, min: 0, label: "Damage Threshold" }) }),
        dr: new fields.NumberField({ initial: 0, min: 0, label: "Damage Reduction" }),
      }),
      skills: new fields.SchemaField({
        Initiative: skillField("dex", "Initiative"),
        Mechanics: skillField("int", "Mechanics"),
        Perception: skillField("wis", "Perception"),
        Pilot: skillField("dex", "Pilot"),
        Ride: skillField("dex", "Ride"),
        Stealth: skillField("dex", "Stealth"),
        "Use Computer": skillField("int", "Use Computer"),
      }),
      details: new fields.SchemaField({
        biography: new fields.HTMLField({ initial: "", label: "Biography" }),
        description: new fields.StringField({ initial: "", label: "Description" }),
        gender: new fields.StringField({ initial: "", label: "Gender" }),
        sex: new fields.StringField({ initial: "", label: "Sex" }),
        age: new fields.NumberField({ initial: 0, integer: true, label: "Age" }),
        height: new fields.StringField({ initial: "", label: "Height" }),
        weight: new fields.StringField({ initial: "", label: "Weight" }),
        species: new fields.StringField({ initial: "", label: "Species" }),
        classes: new fields.StringField({ initial: "", label: "Classes" }),
        senses: new fields.StringField({ initial: "", label: "Senses" }),
        lang: new fields.StringField({ initial: "", label: "Languages" }),
        specialHp: new fields.StringField({ initial: "", label: "Special HP" }),
        immunities: new fields.StringField({ initial: "", label: "Immunities" }),
        weaknesses: new fields.StringField({ initial: "", label: "Weaknesses" }),
        fightSpace: new fields.StringField({ initial: "", label: "Fighting Space" }),
        atkOptions: new fields.StringField({ initial: "", label: "Attack Options" }),
        specialActions: new fields.StringField({ initial: "", label: "Special Actions" }),
        forceP: new fields.StringField({ initial: "", label: "Force Powers" }),
        forceS: new fields.StringField({ initial: "", label: "Force Secrets" }),
        forceT: new fields.StringField({ initial: "", label: "Force Techniques" }),
        specialQualities: new fields.StringField({ initial: "", label: "Special Qualities" }),
        talents: new fields.StringField({ initial: "", label: "Talents" }),
        feats: new fields.StringField({ initial: "", label: "Feats" }),
        skills: new fields.StringField({ initial: "", label: "Skills" }),
        systems: new fields.StringField({ initial: "", label: "Systems" }),
        possesses: new fields.StringField({ initial: "", label: "Possessions" }),
        notes: new fields.StringField({ initial: "", label: "Notes" }),
      }),
      xp: new fields.StringField({ initial: "", label: "XP" }),
      baseAttack: new fields.NumberField({ initial: 0, integer: true, label: "Base Attack" }),
      grapple: new fields.NumberField({ initial: 0, integer: true, label: "Grapple" }),
      forcePoints: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Force Points" }),
      destinyPoints: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Destiny Points" }),
      darkSideScore: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Dark Side Score" }),
      level: new fields.SchemaField({ value: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Level" }) }),
      cl: new fields.SchemaField({ value: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Challenge Level" }) }),
      speed: new fields.SchemaField({
        base: new fields.NumberField({ initial: 6, integer: true, label: "Base Speed" }),
        swim: new fields.NumberField({ initial: 1.5, label: "Swim Speed" }),
        climb: new fields.NumberField({ initial: 1.5, label: "Climb Speed" }),
        fly: new fields.NumberField({ nullable: true, initial: null, label: "Fly Speed" }),
        special: new fields.StringField({ initial: "", label: "Special Speed" }),
      }),
      size: new fields.StringField({ initial: "Medium", label: "Size" }),
      reach: new fields.NumberField({ initial: 1, min: 1, integer: true, label: "Reach" }),
    };
  }
}
