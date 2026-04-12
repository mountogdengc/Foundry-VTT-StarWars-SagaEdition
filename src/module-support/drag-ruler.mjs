const RUN_MULTIPLIER = 4;
const ENCUMBERED_RUN_MULTIPLIER = 3;

export function initializeDragRuler() {
  Hooks.once("dragRuler.ready", (SpeedProvider) => {
    class SWSESpeedProvider extends SpeedProvider {
      get colors() {
        return [
          { id: "move", default: 0x00FF00, name: "swse.speeds.move" },
          { id: "double", default: 0xFFFF00, name: "swse.speeds.double" },
          { id: "run", default: 0xFF8000, name: "swse.speeds.run" },
          { id: "fly", default: 0x0000FF, name: "swse.speeds.fly" },
        ];
      }

      getRanges(token) {
        const speeds = token.actor?.gridSpeeds || [{ value: 6 }];
        const heavyArmor = token.actor?.heaviestArmorType === "Heavy";
        const runMultiplier = heavyArmor ? ENCUMBERED_RUN_MULTIPLIER : RUN_MULTIPLIER;

        const fastest = speeds.reduce((best, cur) => (cur.value > best.value ? cur : best));

        return [
          { range: fastest.value, color: "move" },
          { range: fastest.value * 2, color: "double" },
          { range: fastest.value * runMultiplier, color: "run" },
        ];
      }
    }

    dragRuler.registerSystem("swse", SWSESpeedProvider);
  });
}
