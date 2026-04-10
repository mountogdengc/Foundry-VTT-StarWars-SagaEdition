<script>
  import ItemList from "../../components/ItemList.svelte";

  let { actor } = $props();

  const traits = $derived([...(actor.itemTypes?.trait ?? [])]);
  const affiliations = $derived([...(actor.itemTypes?.affiliation ?? [])]);
  const languages = $derived([...(actor.itemTypes?.language ?? [])]);
  const beastAttacks = $derived([...(actor.itemTypes?.beastAttack ?? [])]);
  const beastSenses = $derived([...(actor.itemTypes?.beastSense ?? [])]);
  const beastTypes = $derived([...(actor.itemTypes?.beastType ?? [])]);
  const beastQualities = $derived([...(actor.itemTypes?.beastQuality ?? [])]);
  const hasBeast = $derived(
    beastAttacks.length > 0 || beastSenses.length > 0 || beastTypes.length > 0 || beastQualities.length > 0
  );
</script>

<div class="swse-section">
  <div class="swse-section-header">Traits ({traits.length})</div>
  <ItemList items={traits} {actor} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Affiliations ({affiliations.length})</div>
  <ItemList items={affiliations} {actor} />
</div>

<div class="swse-section">
  <div class="swse-section-header">Languages ({languages.length})</div>
  <ItemList items={languages} {actor} />
</div>

{#if hasBeast}
  <div class="swse-section">
    <div class="swse-section-header">Beast</div>
    {#if beastAttacks.length > 0}
      <div class="swse-label" style="margin:4px 0;">Natural Weapons</div>
      <ItemList items={beastAttacks} {actor} />
    {/if}
    {#if beastSenses.length > 0}
      <div class="swse-label" style="margin:4px 0;">Senses</div>
      <ItemList items={beastSenses} {actor} />
    {/if}
    {#if beastTypes.length > 0}
      <div class="swse-label" style="margin:4px 0;">Types</div>
      <ItemList items={beastTypes} {actor} />
    {/if}
    {#if beastQualities.length > 0}
      <div class="swse-label" style="margin:4px 0;">Qualities</div>
      <ItemList items={beastQualities} {actor} />
    {/if}
  </div>
{/if}
