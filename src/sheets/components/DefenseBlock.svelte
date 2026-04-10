<script>
  let { label, defense } = $props();
  const value = $derived(defense?.total ?? defense?.value ?? 0);
  const tooltip = $derived(() => {
    const parts = [];
    if (defense?.abilityBonus) parts.push(`Ability: ${defense.abilityBonus}`);
    if (defense?.armorBonus) parts.push(`Armor/Level: ${defense.armorBonus}`);
    if (defense?.classBonus) parts.push(`Class: ${defense.classBonus}`);
    if (defense?.miscBonus) parts.push(`Misc: ${defense.miscBonus}`);
    return parts.join("\n") || "No bonuses";
  });
</script>

<div class="swse-card" style="text-align:center;" title={tooltip()}>
  <div class="swse-label">{label}</div>
  <div style="font-size:18px;">{value}</div>
</div>
