import { SimpleCache } from "../util/simple-cache.mjs";

export class SWSEActor extends Actor {
  prepareData() {
    this.cache = new SimpleCache();
    this.resolvedVariables = this.resolvedVariables ?? new Map();
    this.resolvedLabels = this.resolvedLabels ?? new Map();
    this.resolvedNotes = this.resolvedNotes ?? new Map();
    this.formulaFunctions = this.formulaFunctions ?? new Map();
    super.prepareData();
  }

  getRollData() {
    const data = super.getRollData();
    return data;
  }

  getCached(key, fn) {
    return this.cache.getCached(key, fn);
  }

  setResolvedVariable(key, variable, label, notes) {
    this.resolvedVariables.set(key, variable);
    this.resolvedLabels.set(key, label);
    if (notes) this.resolvedNotes.set(key, notes);
  }

  async safeUpdate(data = {}, context = {}) {
    if (this.id && !this.compendium?.locked) {
      return this.update(data, context);
    }
  }
}

export function getEntityKey(entity) {
  return entity?.id || entity?._id;
}
