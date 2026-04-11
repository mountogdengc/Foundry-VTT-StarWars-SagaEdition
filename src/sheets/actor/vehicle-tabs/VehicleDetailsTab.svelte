<script>
  let { actor } = $props();
  const system = $derived(actor.system);
  const details = $derived(system.details ?? {});
  const cl = $derived(system.cl?.value ?? 0);
  const size = $derived(system.size ?? "");
  const reach = $derived(system.reach ?? 1);
  const speed = $derived(system.speed ?? {});

  function updateField(path) { return (e) => actor.update({ [path]: e.target.value }); }
  function updateNumber(path) { return (e) => { const val = parseInt(e.target.value); if (!isNaN(val)) actor.update({ [path]: val }); }; }
</script>

<div class="swse-section">
  <div class="swse-section-header">Vehicle Stats</div>
  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
    <label class="swse-label">Challenge Level<input class="swse-input" type="number" value={cl} onchange={updateNumber("system.cl.value")} /></label>
    <label class="swse-label">Size<input class="swse-input" value={size} onchange={updateField("system.size")} style="text-align:left;" /></label>
    <label class="swse-label">Reach<input class="swse-input" type="number" value={reach} onchange={updateNumber("system.reach")} /></label>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:6px; margin-top:6px;">
    <label class="swse-label">Base Speed<input class="swse-input" type="number" value={speed.base ?? 0} onchange={updateNumber("system.speed.base")} /></label>
    <label class="swse-label">Fly Speed<input class="swse-input" type="number" value={speed.fly ?? ""} onchange={updateNumber("system.speed.fly")} /></label>
    <label class="swse-label">Swim Speed<input class="swse-input" type="number" value={speed.swim ?? 0} onchange={updateNumber("system.speed.swim")} /></label>
    <label class="swse-label">Climb Speed<input class="swse-input" type="number" value={speed.climb ?? 0} onchange={updateNumber("system.speed.climb")} /></label>
  </div>
  {#if details.fightSpace || details.specialQualities || details.specialActions}
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px;">
      {#if details.fightSpace}<div><span class="swse-label">Fighting Space</span><div style="font-size:11px;">{details.fightSpace}</div></div>{/if}
      {#if details.specialQualities}<div><span class="swse-label">Special Qualities</span><div style="font-size:11px;">{details.specialQualities}</div></div>{/if}
      {#if details.specialActions}<div><span class="swse-label">Special Actions</span><div style="font-size:11px;">{details.specialActions}</div></div>{/if}
    </div>
  {/if}
</div>

<div class="swse-section">
  <div class="swse-section-header">Notes</div>
  <div class="swse-card" style="min-height:80px;">
    {@html details.biography || "<em style='color:var(--label-color);'>No notes.</em>"}
  </div>
</div>
