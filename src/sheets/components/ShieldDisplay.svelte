<script>
  let { actor } = $props();
  const shields = $derived(actor.system.shields.value ?? 0);
  const maxShields = $derived(actor.system.shields.max ?? 0);
  const active = $derived(actor.system.shields.active ?? false);
  function updateShields(e) {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) actor.update({ "system.shields.value": val });
  }
</script>

<div class="swse-card" style="text-align:center;">
  <div class="swse-label">
    Shields {#if active}<span style="color:var(--shield-color);">●</span>{/if}
  </div>
  <div style="display:flex; align-items:baseline; justify-content:center; gap:4px;">
    <input class="swse-input" type="number" value={shields}
      onchange={updateShields} style="width:50px; font-size:18px; color:var(--shield-color);" />
    <span style="color:var(--label-color);">/</span>
    <span style="font-size:18px;">{maxShields}</span>
  </div>
</div>
