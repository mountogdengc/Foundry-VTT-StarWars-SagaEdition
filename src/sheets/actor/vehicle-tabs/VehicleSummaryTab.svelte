<script>
  import AbilityScore from "../../components/AbilityScore.svelte";
  import HealthBar from "../../components/HealthBar.svelte";
  import ShieldDisplay from "../../components/ShieldDisplay.svelte";
  import ResourceBox from "../../components/ResourceBox.svelte";

  let { actor } = $props();

  const system = $derived(actor.system);
  const size = $derived(system.size ?? "Medium");
  const cl = $derived(system.cl?.value ?? 0);
  const speed = $derived(system.speed ?? {});

  const reflex = $derived(system.defense?.ref?.value ?? 10);
  const fort = $derived(system.defense?.fort?.value ?? 10);
  const will = $derived(system.defense?.will?.value ?? 10);
  const ffRef = $derived(system.defense?.reff?.value ?? 10);
  const dt = $derived(system.defense?.dt?.value ?? 10);
  const dr = $derived(system.defense?.dr ?? 0);

  function updateName(e) { actor.update({ name: e.target.value }); }
  function openPortraitPicker() {
    const fp = new FilePicker({ type: "image", current: actor.img, callback: (path) => actor.update({ img: path }) });
    fp.render(true);
  }
  function updateDefense(path) {
    return (e) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val)) actor.update({ [path]: val });
    };
  }
</script>

<div class="swse-header">
  <img class="swse-portrait" src={actor.img} alt={actor.name}
    onclick={openPortraitPicker} role="button" tabindex="0"
    onkeydown={(e) => e.key === "Enter" && openPortraitPicker()} />
  <div>
    <input class="swse-input swse-name" value={actor.name}
      onchange={updateName} style="text-align:left; font-size:18px; font-weight:bold;" />
    <div class="swse-subtitle">{size} Vehicle &bull; CL {cl}</div>
    <div class="swse-subtitle">
      Speed: {speed.base ?? 0}
      {#if speed.fly != null} &bull; Fly: {speed.fly}{/if}
      {#if speed.swim} &bull; Swim: {speed.swim}{/if}
      {#if speed.special} &bull; {speed.special}{/if}
    </div>
  </div>
  <HealthBar {actor} />
  <ShieldDisplay {actor} />
</div>

<div class="swse-section">
  <div class="swse-grid-6">
    {#each Object.entries(system.abilities) as [key, ability]}
      <AbilityScore {key} {ability} {actor} />
    {/each}
  </div>
</div>

<div class="swse-section">
  <div class="swse-section-header">Defenses</div>
  <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:6px;">
    <div class="swse-card" style="text-align:center;">
      <div class="swse-label">Reflex</div>
      <input class="swse-input" type="number" value={reflex} onchange={updateDefense("system.defense.ref.value")} style="font-size:18px; width:50px;" />
    </div>
    <div class="swse-card" style="text-align:center;">
      <div class="swse-label">Fort</div>
      <input class="swse-input" type="number" value={fort} onchange={updateDefense("system.defense.fort.value")} style="font-size:18px; width:50px;" />
    </div>
    <div class="swse-card" style="text-align:center;">
      <div class="swse-label">Will</div>
      <input class="swse-input" type="number" value={will} onchange={updateDefense("system.defense.will.value")} style="font-size:18px; width:50px;" />
    </div>
    <div class="swse-card" style="text-align:center;">
      <div class="swse-label">FF Ref</div>
      <input class="swse-input" type="number" value={ffRef} onchange={updateDefense("system.defense.reff.value")} style="font-size:18px; width:50px;" />
    </div>
    <div class="swse-card" style="text-align:center;">
      <div class="swse-label">DT</div>
      <input class="swse-input" type="number" value={dt} onchange={updateDefense("system.defense.dt.value")} style="font-size:18px; width:50px;" />
    </div>
    <div class="swse-card" style="text-align:center;">
      <div class="swse-label">DR</div>
      <input class="swse-input" type="number" value={dr} onchange={updateDefense("system.defense.dr")} style="font-size:18px; width:50px;" />
    </div>
  </div>
</div>

<div class="swse-section">
  <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:6px;">
    <ResourceBox label="BAB" value={system.baseAttack} path="system.baseAttack" {actor} />
    <ResourceBox label="Grapple" value={system.grapple} path="system.grapple" {actor} />
    <ResourceBox label="Force Pts" value={system.forcePoints} path="system.forcePoints" {actor} />
    <ResourceBox label="Destiny" value={system.destinyPoints} path="system.destinyPoints" {actor} />
    <ResourceBox label="Dark Side" value={system.darkSideScore} path="system.darkSideScore" {actor} />
  </div>
</div>
