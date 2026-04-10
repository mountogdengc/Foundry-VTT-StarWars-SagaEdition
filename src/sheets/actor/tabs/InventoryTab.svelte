<script>
  import ItemList from "../../components/ItemList.svelte";

  let { actor } = $props();

  const equippedItems = $derived(
    [...(actor.items ?? [])].filter(i => i.system?.equipped && ["weapon", "armor", "equipment", "upgrade"].includes(i.type))
  );
  const unequippedItems = $derived(
    [...(actor.items ?? [])].filter(i => !i.system?.equipped && ["weapon", "armor", "equipment", "upgrade"].includes(i.type))
  );
  const credits = $derived(actor.system.credits ?? 0);

  function updateCredits(e) {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) actor.update({ "system.credits": val });
  }
</script>

<div class="swse-section">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
    <div class="swse-section-header" style="margin-bottom:0;">Inventory</div>
    <div style="display:flex; align-items:center; gap:4px;">
      <span class="swse-label">Credits:</span>
      <input class="swse-input" type="number" value={credits}
        onchange={updateCredits} style="width:80px;" />
    </div>
  </div>
</div>

<div class="swse-section">
  <div class="swse-section-header">Equipped</div>
  <ItemList items={equippedItems} {actor} showEquip={true} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Unequipped</div>
  <ItemList items={unequippedItems} {actor} showEquip={true} />
</div>
