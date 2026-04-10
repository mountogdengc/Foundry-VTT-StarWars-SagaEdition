<script>
  let { actor } = $props();

  const settings = $derived(actor.system.settings ?? {});
  const isNPC = $derived(settings.isNPC?.value ?? false);
  const ignorePrereqs = $derived(settings.ignorePrerequisites?.value ?? false);
  const abilityGen = $derived(settings.abilityGeneration?.value ?? "Default");
  const effects = $derived([...(actor.effects ?? [])]);

  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");

  function updateNPC(e) {
    actor.update({ "system.settings.isNPC.value": e.target.checked });
  }

  function updateIgnorePrereqs(e) {
    actor.update({ "system.settings.ignorePrerequisites.value": e.target.checked });
  }

  function updateAbilityGen(e) {
    actor.update({ "system.settings.abilityGeneration.value": e.target.value });
  }

  function updateTheme(e) {
    game.settings.set("swse", "sheetTheme", e.target.value);
  }

  function toggleEffect(effect) {
    effect.update({ disabled: !effect.disabled });
  }
</script>

<div class="swse-section">
  <div class="swse-section-header">Sheet Theme</div>
  <select class="swse-input" value={theme} onchange={updateTheme} style="text-align:left;">
    <option value="dark-scifi">Dark Sci-Fi</option>
    <option value="clean-neutral">Clean & Neutral</option>
    <option value="dark-minimal">Dark Minimal</option>
  </select>
</div>

<div class="swse-section">
  <div class="swse-section-header">Character Settings</div>
  <div style="display:flex; flex-direction:column; gap:8px;">
    <label style="display:flex; align-items:center; gap:8px;">
      <input type="checkbox" checked={isNPC} onchange={updateNPC} />
      <span>Is NPC</span>
    </label>
    <label style="display:flex; align-items:center; gap:8px;">
      <input type="checkbox" checked={ignorePrereqs} onchange={updateIgnorePrereqs} />
      <span>Ignore Prerequisites</span>
    </label>
    <label class="swse-label">Ability Generation
      <select class="swse-input" value={abilityGen} onchange={updateAbilityGen} style="text-align:left;">
        <option value="Default">Default</option>
        <option value="Manual">Manual</option>
        <option value="Roll">Roll</option>
        <option value="Point Buy">Point Buy</option>
        <option value="Standard Array">Standard Array</option>
      </select>
    </label>
  </div>
</div>

<div class="swse-section">
  <div class="swse-section-header">Active Effects ({effects.length})</div>
  {#if effects.length > 0}
    <table class="swse-item-list">
      <thead><tr><th></th><th>Name</th><th style="width:60px; text-align:center;">Enabled</th></tr></thead>
      <tbody>
        {#each effects as effect}
          <tr>
            <td style="width:24px;"><img src={effect.icon} alt="" style="width:20px; height:20px; border:0;" /></td>
            <td>{effect.name}</td>
            <td style="text-align:center;">
              <input type="checkbox" checked={!effect.disabled} onchange={() => toggleEffect(effect)} />
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p style="color:var(--label-color); text-align:center; padding:12px;">No active effects</p>
  {/if}
</div>
