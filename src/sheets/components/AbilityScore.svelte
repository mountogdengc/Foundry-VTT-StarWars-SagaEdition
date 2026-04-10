<script>
  let { key, ability, actor } = $props();
  const label = key.toUpperCase();
  const score = $derived(ability.value ?? 10);
  const mod = $derived(ability.mod ?? Math.floor((score - 10) / 2));
  const modStr = $derived(mod >= 0 ? `+${mod}` : `${mod}`);

  async function roll() {
    const r = new Roll(`1d20 + ${mod}`);
    await r.evaluate();
    await r.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${label} Check`,
    });
  }
</script>

<div class="swse-card" style="text-align:center;">
  <div class="swse-label">{label}</div>
  <div class="swse-rollable" onclick={roll} style="font-size:18px;">{score}</div>
  <div style="font-size:12px; color:var(--label-color);">{modStr}</div>
</div>
