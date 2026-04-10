export class SWSEActiveEffect extends ActiveEffect {
  get transfer() {
    if (this.parent instanceof Item) {
      return !this.disabled && !this.isSuppressed;
    }
    return false;
  }

  set transfer(value) {
    // Controlled by item ownership, not directly settable
  }

  get isDisabled() {
    return this.disabled;
  }

  async safeUpdate(data = {}, context = {}) {
    if (this.id) {
      return this.update(data, context);
    }
  }
}
