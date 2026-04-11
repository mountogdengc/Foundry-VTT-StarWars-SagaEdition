import "./styles/swse.css";
import { SWSE, initializeStatusEffects } from "./config.mjs";
import { CharacterData } from "./data-models/actor/CharacterData.mjs";
import { VehicleData } from "./data-models/actor/VehicleData.mjs";
import { ComputerData } from "./data-models/actor/ComputerData.mjs";
import { SimpleItemData } from "./data-models/item/SimpleItemData.mjs";
import { WeaponData } from "./data-models/item/WeaponData.mjs";
import { ArmorData } from "./data-models/item/ArmorData.mjs";
import { EquipmentData } from "./data-models/item/EquipmentData.mjs";
import { BeastAttackData } from "./data-models/item/BeastAttackData.mjs";
import { TalentData } from "./data-models/item/TalentData.mjs";
import { ClassData } from "./data-models/item/ClassData.mjs";
import { SpeciesData } from "./data-models/item/SpeciesData.mjs";
import { TemplateItemData } from "./data-models/item/TemplateItemData.mjs";
import { UpgradeData } from "./data-models/item/UpgradeData.mjs";
import { LanguageData } from "./data-models/item/LanguageData.mjs";
import { SWSEActor } from "./documents/SWSEActor.mjs";
import { SWSEItem } from "./documents/SWSEItem.mjs";
import { SWSEActiveEffect } from "./documents/SWSEActiveEffect.mjs";
import { migrateWorld } from "./migration.mjs";
import { SWSECharacterSheet } from "./sheets/actor/SWSECharacterSheet.mjs";
import { SWSEVehicleSheet } from "./sheets/actor/SWSEVehicleSheet.mjs";
import { SWSEComputerSheet } from "./sheets/actor/SWSEComputerSheet.mjs";
import { SWSEEquipmentSheet } from "./sheets/item/SWSEEquipmentSheet.mjs";
import { SWSEFeatureSheet } from "./sheets/item/SWSEFeatureSheet.mjs";
import { SWSESimpleSheet } from "./sheets/item/SWSESimpleSheet.mjs";
import { rollAttack } from "./combat/attack.mjs";
import { createAttackMacro, executeMacroAttack } from "./combat/macro.mjs";

Hooks.once("init", () => {
  console.log("SWSE | Initializing Star Wars Saga Edition system");

  game.swse = {
    SWSEActor,
    SWSEItem,
    rollAttack: executeMacroAttack,
    version: "14.0.0",
  };

  // Config
  CONFIG.SWSE = SWSE;

  // Combat
  CONFIG.Combat.initiative = CONFIG.Combat.initiative ?? {};
  CONFIG.Combat.initiative.formula = "1d20 + @initiative";
  CONFIG.Combat.initiative.decimals = 2;

  // Actor DataModels
  CONFIG.Actor.dataModels.character = CharacterData;
  CONFIG.Actor.dataModels.npc = CharacterData;
  CONFIG.Actor.dataModels.vehicle = VehicleData;
  CONFIG.Actor.dataModels["npc-vehicle"] = VehicleData;
  CONFIG.Actor.dataModels.computer = ComputerData;

  // Item DataModels
  CONFIG.Item.dataModels.trait = SimpleItemData;
  CONFIG.Item.dataModels.feat = SimpleItemData;
  CONFIG.Item.dataModels.beastSense = SimpleItemData;
  CONFIG.Item.dataModels.beastType = SimpleItemData;
  CONFIG.Item.dataModels.beastQuality = SimpleItemData;
  CONFIG.Item.dataModels.forcePower = SimpleItemData;
  CONFIG.Item.dataModels.forceSecret = SimpleItemData;
  CONFIG.Item.dataModels.forceRegimen = SimpleItemData;
  CONFIG.Item.dataModels.forceTechnique = SimpleItemData;
  CONFIG.Item.dataModels.starShipManeuver = SimpleItemData;
  CONFIG.Item.dataModels.affiliation = SimpleItemData;
  CONFIG.Item.dataModels.background = SimpleItemData;
  CONFIG.Item.dataModels.destiny = SimpleItemData;
  CONFIG.Item.dataModels.classFeature = SimpleItemData;
  CONFIG.Item.dataModels.hazard = SimpleItemData;
  CONFIG.Item.dataModels.implant = SimpleItemData;
  CONFIG.Item.dataModels["droid system"] = SimpleItemData;
  CONFIG.Item.dataModels.vehicleSystem = SimpleItemData;
  CONFIG.Item.dataModels.vehicleBaseType = SimpleItemData;
  CONFIG.Item.dataModels.weapon = WeaponData;
  CONFIG.Item.dataModels.armor = ArmorData;
  CONFIG.Item.dataModels.equipment = EquipmentData;
  CONFIG.Item.dataModels.beastAttack = BeastAttackData;
  CONFIG.Item.dataModels.talent = TalentData;
  CONFIG.Item.dataModels.class = ClassData;
  CONFIG.Item.dataModels.species = SpeciesData;
  CONFIG.Item.dataModels.template = TemplateItemData;
  CONFIG.Item.dataModels.upgrade = UpgradeData;
  CONFIG.Item.dataModels.language = LanguageData;

  // Document classes
  CONFIG.Actor.documentClass = SWSEActor;
  CONFIG.Item.documentClass = SWSEItem;
  CONFIG.ActiveEffect.documentClass = SWSEActiveEffect;

  // Status effects
  initializeStatusEffects(CONFIG);

  // Sheet registration
  foundry.documents.collections.Actors.registerSheet("swse", SWSECharacterSheet, {
    types: ["character", "npc"],
    makeDefault: true,
    label: "SWSE Character Sheet",
  });

  foundry.documents.collections.Actors.registerSheet("swse", SWSEVehicleSheet, {
    types: ["vehicle", "npc-vehicle"],
    makeDefault: true,
    label: "SWSE Vehicle Sheet",
  });

  foundry.documents.collections.Actors.registerSheet("swse", SWSEComputerSheet, {
    types: ["computer"],
    makeDefault: true,
    label: "SWSE Computer Sheet",
  });

  // Item sheet registration
  foundry.documents.collections.Items.registerSheet("swse", SWSEEquipmentSheet, {
    types: ["weapon", "armor", "equipment", "upgrade"],
    makeDefault: true,
    label: "SWSE Equipment Sheet",
  });

  foundry.documents.collections.Items.registerSheet("swse", SWSEFeatureSheet, {
    types: ["feat", "talent", "class", "species", "template", "forcePower", "forceSecret", "forceTechnique", "forceRegimen", "starShipManeuver"],
    makeDefault: true,
    label: "SWSE Feature Sheet",
  });

  foundry.documents.collections.Items.registerSheet("swse", SWSESimpleSheet, {
    types: ["language", "affiliation", "background", "destiny", "classFeature", "hazard", "implant", "droid system", "vehicleSystem", "vehicleBaseType", "beastAttack", "beastSense", "beastType", "beastQuality"],
    makeDefault: true,
    label: "SWSE Simple Sheet",
  });

  // Settings
  game.settings.register("swse", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: "0",
  });

  game.settings.register("swse", "defaultAttributeGenerationType", {
    name: "Default Attribute Generation Type",
    hint: "How ability scores are generated by default.",
    scope: "world",
    config: true,
    type: String,
    default: "Manual",
    choices: { Manual: "Manual", Roll: "Roll", "Point Buy": "Point Buy", "Standard Array": "Standard Array" },
  });

  game.settings.register("swse", "homebrewRanges", {
    name: "Homebrew Ranges",
    hint: "Use homebrew range bands.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("swse", "homebrewUseLilLiteralistSkills", {
    name: "Use Lil Literalist Skill Groups",
    hint: "Use homebrew grouped skill variant by Lil Literalist.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("swse", "homebrewUseDarthauthorSkills", {
    name: "Use Darthauthor Skill Groups",
    hint: "Use homebrew grouped skill variant by Darthauthor.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("swse", "skillFocusCalculation", {
    name: "Skill Focus Calculation",
    hint: "How Skill Focus bonus is calculated.",
    scope: "world",
    config: true,
    type: String,
    default: "flat",
    choices: { flat: "Flat (+5)", charLevelUp: "Half Level (Round Up)", charLevelDown: "Half Level (Round Down)" },
  });

  game.settings.register("swse", "enableEncumbranceByWeight", {
    name: "Enable Encumbrance by Weight",
    hint: "Apply encumbrance penalties based on carried weight.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register("swse", "sheetTheme", {
    name: "Sheet Theme",
    hint: "Visual theme for character sheets.",
    scope: "client",
    config: false,
    type: String,
    default: "dark-scifi",
    choices: {
      "dark-scifi": "Dark Sci-Fi",
      "clean-neutral": "Clean & Neutral",
      "dark-minimal": "Dark Minimal",
    },
  });
});

Hooks.once("ready", async () => {
  console.log("SWSE | System ready");
  await migrateWorld();
});

Hooks.on("hotbarDrop", (bar, data, slot) => {
  return createAttackMacro(data, slot);
});
