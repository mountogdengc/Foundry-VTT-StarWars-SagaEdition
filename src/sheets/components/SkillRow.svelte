<script>
  let { name, skill, actor } = $props();
  const total = $derived(skill.value ?? 0);
  const trained = $derived(skill.trained ?? false);
  const abilityLabel = $derived((skill.ability ?? "").toUpperCase());
  const focused = $derived(skill.focus ?? false);

  async function roll() {
    const r = new Roll(`1d20 + ${total}`);
    await r.evaluate();
    await r.toMessage({
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${name} Check`,
    });
  }
  function toggleTrained() {
    actor.update({ [`system.skills.${name}.trained`]: !trained });
  }
</script>

<tr class="swse-row">
  <td style="width:24px; text-align:center;">
    <input type="checkbox" checked={trained} onchange={toggleTrained} />
  </td>
  <td class="swse-rollable" onclick={roll} style="font-weight:{focused ? 'bold' : 'normal'};">
    {name} {#if focused}<span style="color:var(--accent-color);">★</span>{/if}
  </td>
  <td style="width:36px; text-align:center; color:var(--label-color); font-size:10px;">{abilityLabel}</td>
  <td style="width:48px; text-align:center;">{total >= 0 ? `+${total}` : total}</td>
</tr>
