import { SimpleCache } from "../util/simple-cache.mjs";

export class SWSEItem extends Item {
  prepareData() {
    super.prepareData();
    this.hasItemOwner = this.hasItemOwner || false;
    this.cache = new SimpleCache();

    if (!Array.isArray(this.system.changes)) {
      this.system.changes = Object.values(this.system.changes || {});
    } else {
      this.system.changes = this.system.changes || [];
    }

    this.system.quantity = Number.isInteger(this.system.quantity) ? this.system.quantity : 1;
  }

  get displayName() {
    return SWSEItem.buildItemName(this);
  }

  get changes() {
    return this.system.changes || [];
  }

  get finalName() {
    return this.system.finalName || this.name;
  }

  static buildItemName(item) {
    const prefix = item.system?.prefix || "";
    const suffix = item.system?.suffix || "";
    const name = item.system?.finalName || item.name;
    return `${prefix}${name}${suffix}`.trim();
  }

  canUserModify(user, action, data) {
    let canModify = super.canUserModify(user, action, data);
    if (canModify && this.pack) {
      let pack = game.packs.get(this.pack);
      if (pack?.metadata?.packageType === "system") {
        return false;
      }
    }
    return canModify;
  }

  getCached(key, fn) {
    return this.cache.getCached(key, fn);
  }

  async safeUpdate(data = {}, context = {}) {
    if (this.id && !this.compendium?.locked) {
      return this.update(data, context);
    }
  }
}
