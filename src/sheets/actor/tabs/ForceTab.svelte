<script>
  import ItemList from "../../components/ItemList.svelte";

  let { actor } = $props();

  const forcePowers = $derived([...(actor.itemTypes?.forcePower ?? [])]);
  const forceSecrets = $derived([...(actor.itemTypes?.forceSecret ?? [])]);
  const forceTechniques = $derived([...(actor.itemTypes?.forceTechnique ?? [])]);
  const forceRegimens = $derived([...(actor.itemTypes?.forceRegimen ?? [])]);
</script>

<div class="swse-section">
  <div class="swse-section-header">Force Powers ({forcePowers.length})</div>
  <ItemList items={forcePowers} {actor} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Force Secrets ({forceSecrets.length})</div>
  <ItemList items={forceSecrets} {actor} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Force Techniques ({forceTechniques.length})</div>
  <ItemList items={forceTechniques} {actor} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Force Regimens ({forceRegimens.length})</div>
  <ItemList items={forceRegimens} {actor} />
</div>
