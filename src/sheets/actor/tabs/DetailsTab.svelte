<script>
  let { actor } = $props();

  const details = $derived(actor.system.details ?? {});
  const classSummary = $derived(actor.system.classSummary ?? "");
  const classLevels = $derived(actor.system.classLevel ?? {});

  function updateField(path) {
    return (e) => actor.update({ [path]: e.target.value });
  }

  function updateNumber(path) {
    return (e) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val)) actor.update({ [path]: val });
    };
  }
</script>

<div class="swse-section">
  <div class="swse-section-header">Class Progression</div>
  <div style="margin-bottom:8px; color:var(--label-color);">{classSummary}</div>
  {#if Object.keys(classLevels).length > 0}
    <table class="swse-item-list">
      <thead><tr><th>Class</th><th style="width:60px; text-align:center;">Levels</th></tr></thead>
      <tbody>
        {#each Object.entries(classLevels) as [name, levels]}
          <tr><td>{name}</td><td style="text-align:center;">{levels}</td></tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>

<div class="swse-section">
  <div class="swse-section-header">Personal Details</div>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
    <label class="swse-label">Gender
      <input class="swse-input" value={details.gender} onchange={updateField("system.details.gender")} />
    </label>
    <label class="swse-label">Sex
      <input class="swse-input" value={details.sex} onchange={updateField("system.details.sex")} />
    </label>
    <label class="swse-label">Age
      <input class="swse-input" type="number" value={details.age} onchange={updateNumber("system.details.age")} />
    </label>
    <label class="swse-label">Height
      <input class="swse-input" value={details.height} onchange={updateField("system.details.height")} />
    </label>
    <label class="swse-label">Weight
      <input class="swse-input" value={details.weight} onchange={updateField("system.details.weight")} />
    </label>
    <label class="swse-label">Player
      <input class="swse-input" value={details.player} onchange={updateField("system.details.player")} />
    </label>
  </div>
</div>

<div class="swse-section">
  <div class="swse-section-header">Biography</div>
  <div class="swse-card" style="min-height:150px;">
    {@html details.biography || "<em style='color:var(--label-color);'>No biography written.</em>"}
  </div>
</div>
