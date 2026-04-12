import { getInheritableAttribute } from "../util/attribute-helper.mjs";
import { filterItemsByTypes } from "../util/util.mjs";

export function initializePolyglot() {
  Hooks.once("polyglot.init", (LanguageProvider) => {
    class SWSELanguageProvider extends LanguageProvider {
      async getLanguages() {
        const langs = {};
        this.languages = new Proxy(langs, {
          get(target, prop, receiver) {
            if (prop in target) return Reflect.get(target, prop, receiver);
            return { label: prop, font: "default", rng: "default" };
          },
        });
      }

      getUserLanguages(actor) {
        const known_languages = new Set();
        const literate_languages = new Set();

        const maySpeak = getInheritableAttribute({
          entity: actor,
          attributeKey: "maySpeak",
          reduce: "VALUES",
        });
        const limitedSpeech = maySpeak.length > 0;

        for (const lang of filterItemsByTypes(actor.items.values(), ["language"])) {
          if (limitedSpeech && !maySpeak.includes(lang.name)) {
            literate_languages.add(lang.name);
          } else {
            known_languages.add(lang.name);
          }
        }
        return [known_languages, literate_languages];
      }
    }

    game.polyglot.api.registerSystem(SWSELanguageProvider);
  });
}
