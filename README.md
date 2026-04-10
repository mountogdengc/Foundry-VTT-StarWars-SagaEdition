# Star Wars: Saga Edition — Foundry VTT System

A game system for [Foundry Virtual Tabletop](https://foundryvtt.com/) implementing the *Star Wars: Saga Edition* RPG.

## Requirements

- Foundry VTT v14

## Installation

Install from the Foundry VTT package manager, or paste this manifest URL into **Install System**:

```
https://raw.githubusercontent.com/mountogdengc/Foundry-VTT-StarWars-SagaEdition/main/system.json
```

## Features

- **Actor types:** Character, NPC, Vehicle, NPC-Vehicle, Computer
- **Item types:** Weapons, Armor, Equipment, Feats, Talents, Force Powers, Force Secrets, Force Techniques, Force Regimens, Classes, Species, Templates, Upgrades, Languages, Affiliations, Backgrounds, Destinies, Beast components, and more
- **Derived data:** Ability scores, defenses (Reflex / Fortitude / Will), health, shields, skills — all calculated automatically from class levels, equipped items, and inheritable attributes
- **47 compendium packs** covering classes, species, feats, talents, Force powers, equipment, and pre-built NPCs organized by challenge level (CL 0–20)

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- Foundry VTT v14 installed locally

### Setup

```bash
npm install
```

### Build

```bash
npm run build       # one-time production build
npm run dev         # watch mode — rebuilds on file changes
```

Output goes to `dist/swse.js` and `dist/swse.css`.

### Project Structure

```
src/
├── swse.mjs                  # Entry point — hooks, registration, settings
├── config.mjs                # Game constants (abilities, defenses, sizes, etc.)
├── migration.mjs             # World migration framework
├── data-models/
│   ├── actor/                # TypeDataModel schemas (Character, Vehicle, Computer)
│   └── item/                 # TypeDataModel schemas (Weapon, Armor, Class, Species, …)
├── documents/
│   ├── SWSEActor.mjs         # Actor document class with computed getters
│   ├── SWSEItem.mjs          # Item document class
│   └── SWSEActiveEffect.mjs  # ActiveEffect overrides
├── logic/                    # Standalone derived-data functions
│   ├── abilities.mjs         # Ability score bonuses and modifiers
│   ├── defenses.mjs          # Reflex, Fortitude, Will, Damage Threshold
│   ├── health.mjs            # HP, second winds
│   ├── shields.mjs           # Shield rating, failure chance
│   ├── skills.mjs            # Skill bonuses, armor check penalties
│   └── traits.mjs            # Level, base attack, grapple
├── sheets/                   # Actor and Item sheet UI (Svelte 5)
├── styles/
│   └── swse.css              # System CSS
└── util/                     # Shared utilities
    ├── attribute-helper.mjs  # getInheritableAttribute — core attribute engine
    ├── constants.mjs         # Skill lists, size arrays, weapon groups, etc.
    ├── util.mjs              # resolveValueArray, filtering, dice helpers
    └── …
```

### Architecture

- **Build:** Vite 6 + Svelte 5 — single ES module output
- **Data layer:** Foundry v14 `TypeDataModel` classes define schemas via `defineSchema()`. Derived data is computed in standalone logic functions called from `prepareDerivedData()`.
- **Attribute engine:** Items carry `changes` arrays. `getInheritableAttribute()` walks all equipped/inheritable items, resolves prerequisites, and reduces values — this powers nearly every derived stat.
- **Sheets:** Foundry `ApplicationV2` host classes mount Svelte 5 components (in progress).

### Contributing

1. Fork the repository
2. Create a feature branch from `rebuild-v14`
3. Run `npm run dev` for watch-mode builds
4. Test in Foundry VTT v14
5. Submit a pull request

## Credits

- **Author:** Andy Lijewski
- **Contributors:** See git history

## License

[Creative Commons Attribution-ShareAlike 3.0](https://creativecommons.org/licenses/by-sa/3.0/legalcode)
