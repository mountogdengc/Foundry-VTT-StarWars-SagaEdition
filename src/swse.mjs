import "./styles/swse.css";

Hooks.once("init", () => {
  console.log("SWSE | Initializing Star Wars Saga Edition system");
  game.swse = { version: "14.0.0" };
});

Hooks.once("ready", () => {
  console.log("SWSE | System ready");
});
