export const SWSE = {};

Object.defineProperty(SWSE, "Combat", {
  get() {
    return {
      get range() {
        const homebrewRanges = game.settings?.get("swse", "homebrewRanges");
        if (homebrewRanges) {
          return {
            pointBlank: { distance: 1, label: "Point-Blank" },
            short: { distance: 6, label: "Short" },
            medium: { distance: 12, label: "Medium" },
            long: { distance: 24, label: "Long" },
          };
        }
        return {};
      },
      rangePenalty: {
        pointBlank: 0,
        short: 0,
        medium: -2,
        long: -5,
      },
    };
  },
});

SWSE.Abilities = {
  abilities: {
    str: "Strength",
    dex: "Dexterity",
    con: "Constitution",
    int: "Intelligence",
    wis: "Wisdom",
    cha: "Charisma",
  },
  abilitiesShort: {
    str: "STR",
    dex: "DEX",
    con: "CON",
    int: "INT",
    wis: "WIS",
    cha: "CHA",
  },
  droidSkip: {
    con: true,
  },
  standardScorePackage: [8, 10, 12, 13, 14, 15],
  abilityCost: {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 6, 15: 8, 16: 10, 17: 13, 18: 16,
  },
  defaultAbilityRoll: "4d6kh3",
  defaultPointBuyTotal: 25,
  droidPointBuyTotal: 18,
};

SWSE.Skills = {
  skills: {
    acrobatics: "Acrobatics", climb: "Climb", deception: "Deception",
    endurance: "Endurance", "gather information": "Gather Information",
    initiative: "Initiative", jump: "Jump",
    "knowledge (bureaucracy)": "Knowledge (Bureaucracy)",
    "knowledge (galactic lore)": "Knowledge (Galactic Lore)",
    "knowledge (life sciences)": "Knowledge (Life Sciences)",
    "knowledge (physical sciences)": "Knowledge (Physical Sciences)",
    "knowledge (social sciences)": "Knowledge (Social Sciences)",
    "knowledge (tactics)": "Knowledge (Tactics)",
    "knowledge (technology)": "Knowledge (Technology)",
    mechanics: "Mechanics", perception: "Perception", persuasion: "Persuasion",
    pilot: "Pilot", ride: "Ride", stealth: "Stealth", survival: "Survival",
    swim: "Swim", "treat injury": "Treat Injury", "use computer": "Use Computer",
    "use the force": "Use the Force",
  },
};

SWSE.Defense = {
  defense: {
    ref: { ability: "dex" },
    fort: { ability: "con" },
    will: { ability: "wis" },
  },
};

SWSE.conditionTrack = [0, -1, -2, -5, -10];
SWSE.RecognizedAttributes = [];

export function initializeStatusEffects(config) {
  config.statusEffects = [
    { id: "condition1", label: "Condition -1", icon: "icons/svg/downgrade.svg", changes: [] },
    { id: "condition2", label: "Condition -2", icon: "icons/svg/downgrade.svg", changes: [] },
    { id: "condition5", label: "Condition -5", icon: "icons/svg/downgrade.svg", changes: [] },
    { id: "condition10", label: "Condition -10", icon: "icons/svg/downgrade.svg", changes: [] },
    { id: "helpless", label: "Helpless", icon: "icons/svg/paralysis.svg", changes: [] },
    { id: "lowGravity", label: "Low Gravity", icon: "icons/svg/falling.svg", changes: [] },
    { id: "highGravity", label: "High Gravity", icon: "icons/svg/falling.svg", changes: [] },
    { id: "zeroGravity", label: "Zero Gravity", icon: "icons/svg/falling.svg", changes: [] },
    { id: "shield", label: "Shield Active", icon: "icons/svg/mage-shield.svg", changes: [] },
    { id: "standardCover", label: "Standard Cover", icon: "icons/svg/tower.svg", changes: [] },
    { id: "improvedCover", label: "Improved Cover", icon: "icons/svg/tower.svg", changes: [] },
    { id: "totalCover", label: "Total Cover", icon: "icons/svg/tower.svg", changes: [] },
  ];
}
