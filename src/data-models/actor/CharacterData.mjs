import { prepareAbilityDerivedData } from "../../logic/abilities.mjs";
import { prepareDefenseDerivedData } from "../../logic/defenses.mjs";
import { prepareHealthDerivedData } from "../../logic/health.mjs";
import { prepareShieldsDerivedData } from "../../logic/shields.mjs";
import { prepareSkillDerivedData } from "../../logic/skills.mjs";
import { prepareTraitsDerivedData } from "../../logic/traits.mjs";

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

export class CharacterData extends foundry.abstract.TypeDataModel {
  static migrateData(source) {
    if (source.forcePoints && typeof source.forcePoints === "object") {
      source.forcePoints = source.forcePoints.quantity || 0;
    }
    if (source.forcePoints !== undefined) {
      source.forcePoints = parseInt(source.forcePoints) || 0;
    }
    return super.migrateData(source);
  }

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
      xp: new fields.StringField({ initial: "", label: "XP" }),
      baseAttack: new fields.NumberField({ initial: 0, integer: true, label: "Base Attack" }),
      grapple: new fields.NumberField({ initial: 0, integer: true, label: "Grapple" }),
      forcePoints: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Force Points" }),
      destinyPoints: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Destiny Points" }),
      darkSideScore: new fields.NumberField({ initial: 0, min: 0, integer: true, label: "Dark Side Score" }),
      skills: new fields.SchemaField({
        Acrobatics: skillField("dex", "Acrobatics"),
        Climb: skillField("str", "Climb"),
        Deception: skillField("cha", "Deception"),
        Endurance: skillField("str", "Endurance"),
        "Gather Information": skillField("int", "Gather Information"),
        Initiative: skillField("dex", "Initiative"),
        Jump: skillField("str", "Jump"),
        "Knowledge (Bureaucracy)": skillField("int", "Knowledge (Bureaucracy)"),
        "Knowledge (Galactic Lore)": skillField("int", "Knowledge (Galactic Lore)"),
        "Knowledge (Life Sciences)": skillField("int", "Knowledge (Life Sciences)"),
        "Knowledge (Physical Sciences)": skillField("int", "Knowledge (Physical Sciences)"),
        "Knowledge (Social Sciences)": skillField("int", "Knowledge (Social Sciences)"),
        "Knowledge (Tactics)": skillField("int", "Knowledge (Tactics)"),
        "Knowledge (Technology)": skillField("int", "Knowledge (Technology)"),
        Mechanics: skillField("int", "Mechanics"),
        Perception: skillField("wis", "Perception"),
        Persuasion: skillField("cha", "Persuasion"),
        Pilot: skillField("dex", "Pilot"),
        Ride: skillField("dex", "Ride"),
        Stealth: skillField("dex", "Stealth"),
        Survival: skillField("wis", "Survival"),
        Swim: skillField("str", "Swim"),
        "Treat Injury": skillField("wis", "Treat Injury"),
        "Use Computer": skillField("int", "Use Computer"),
        "Use the Force": skillField("cha", "Use the Force"),
      }),
      details: new fields.SchemaField({
        biography: new fields.HTMLField({ initial: "", label: "Biography" }),
        description: new fields.StringField({ initial: "", label: "Description" }),
        gender: new fields.StringField({ initial: "", label: "Gender" }),
        sex: new fields.StringField({ initial: "", label: "Sex" }),
        age: new fields.NumberField({ initial: 0, integer: true, label: "Age" }),
        height: new fields.StringField({ initial: "", label: "Height" }),
        weight: new fields.StringField({ initial: "", label: "Weight" }),
        player: new fields.StringField({ initial: "", label: "Player" }),
      }),
      settings: new fields.SchemaField({
        isNPC: new fields.SchemaField({
          value: new fields.BooleanField({ initial: false, label: "Is NPC" }),
        }),
        ignorePrerequisites: new fields.SchemaField({
          value: new fields.BooleanField({ initial: false, label: "Ignore Prerequisites" }),
        }),
        abilityGeneration: new fields.SchemaField({
          value: new fields.StringField({ initial: "Default", label: "Ability Generation Type" }),
        }),
      }),
      credits: new fields.NumberField({ initial: 0, integer: true, min: 0, label: "Credits" }),
    };
  }

  prepareDerivedData() {
    this.parent.cache?.invalidateAll();
    prepareTraitsDerivedData(this);
    prepareAbilityDerivedData(this);
    prepareSkillDerivedData(this);
    prepareShieldsDerivedData(this);
    prepareDefenseDerivedData(this);
    prepareHealthDerivedData(this);
  }
}
