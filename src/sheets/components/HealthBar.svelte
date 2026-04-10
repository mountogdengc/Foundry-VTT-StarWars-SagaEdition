<script>
  let { actor } = $props();
  const hp = $derived(actor.system.health.value);
  const maxHp = $derived(actor.system.health.max);
  function updateHp(e) {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) actor.update({ "system.health.value": val });
  }
</script>

<div class="swse-card" style="text-align:center;">
  <div class="swse-label">Hit Points</div>
  <div style="display:flex; align-items:baseline; justify-content:center; gap:4px;">
    <input class="swse-input" type="number" value={hp}
      onchange={updateHp} style="width:50px; font-size:18px; color:var(--hp-color);" />
    <span style="color:var(--label-color);">/</span>
    <span style="font-size:18px;">{maxHp}</span>
  </div>
</div>
