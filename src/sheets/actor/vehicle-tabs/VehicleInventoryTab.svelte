<script>
  import ItemList from "../../components/ItemList.svelte";
  let { actor } = $props();
  const equippedItems = $derived([...(actor.items ?? [])].filter(i => i.system?.equipped && ["weapon", "armor", "vehicleSystem", "upgrade"].includes(i.type)));
  const unequippedItems = $derived([...(actor.items ?? [])].filter(i => !i.system?.equipped && ["weapon", "armor", "vehicleSystem", "upgrade"].includes(i.type)));
</script>

<div class="swse-section">
  <div class="swse-section-header">Equipped Systems</div>
  <ItemList items={equippedItems} {actor} showEquip={true} />
</div>
<div class="swse-section">
  <div class="swse-section-header">Unequipped</div>
  <ItemList items={unequippedItems} {actor} showEquip={true} />
</div>
