<script>
  import AbilityScore from "../../components/AbilityScore.svelte";
  import DefenseBlock from "../../components/DefenseBlock.svelte";
  import HealthBar from "../../components/HealthBar.svelte";
  import ShieldDisplay from "../../components/ShieldDisplay.svelte";
  import ResourceBox from "../../components/ResourceBox.svelte";

  let { actor } = $props();

  const system = $derived(actor.system);
  const classSummary = $derived(system.classSummary ?? "");
  const xp = $derived(system.xp ?? "");

  function openPortraitPicker() {
    const fp = new FilePicker({
      type: "image",
      current: actor.img,
      callback: (path) => actor.update({ img: path }),
    });
    fp.render(true);
  }

  function updateName(e) {
    actor.update({ name: e.target.value });
  }
</script>

<!-- Header: portrait + name + HP + shields -->
<div class="swse-header">
  <img class="swse-portrait" src={actor.img} alt={actor.name}
    onclick={openPortraitPicker} />
  <div>
    <input class="swse-input swse-name" value={actor.name}
      onchange={updateName} style="text-align:left; font-size:18px; font-weight:bold;" />
    <div class="swse-subtitle">{classSummary}</div>
    <div class="swse-subtitle">XP: {xp}</div>
  </div>
  <HealthBar {actor} />
  <ShieldDisplay {actor} />
</div>

<!-- Abilities -->
<div class="swse-section">
  <div class="swse-grid-6">
    {#each Object.entries(system.abilities) as [key, ability]}
      <AbilityScore {key} {ability} {actor} />
    {/each}
  </div>
</div>

<!-- Defenses -->
<div class="swse-section">
  <div class="swse-grid-3">
    <DefenseBlock label="Reflex" defense={system.defense?.reflex} />
    <DefenseBlock label="Fortitude" defense={system.defense?.fortitude} />
    <DefenseBlock label="Will" defense={system.defense?.will} />
    <DefenseBlock label="DT" defense={system.defense?.damageThreshold} />
  </div>
</div>

<!-- Combat stats -->
<div class="swse-section">
  <div class="swse-grid-4" style="grid-template-columns: repeat(5, 1fr);">
    <ResourceBox label="BAB" value={system.baseAttack} path="system.baseAttack" {actor} />
    <ResourceBox label="Grapple" value={system.grapple} path="system.grapple" {actor} />
    <ResourceBox label="Force Pts" value={system.forcePoints} path="system.forcePoints" {actor} />
    <ResourceBox label="Destiny" value={system.destinyPoints} path="system.destinyPoints" {actor} />
    <ResourceBox label="Dark Side" value={system.darkSideScore} path="system.darkSideScore" {actor} />
  </div>
</div>
