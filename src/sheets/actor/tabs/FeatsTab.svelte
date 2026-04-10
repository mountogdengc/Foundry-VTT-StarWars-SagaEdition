<script>
  import ItemList from "../../components/ItemList.svelte";

  let { actor } = $props();

  const feats = $derived([...(actor.itemTypes?.feat ?? [])]);
  const talents = $derived([...(actor.itemTypes?.talent ?? [])]);
</script>

<div class="swse-section">
  <div class="swse-section-header">Feats ({feats.length})</div>
  <ItemList items={feats} {actor} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Talents ({talents.length})</div>
  <ItemList items={talents} {actor} />
</div>
