<script>
  import ItemHeader from "../components/ItemHeader.svelte";
  import ChangesTable from "../components/ChangesTable.svelte";

  let { item } = $props();

  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");
  const description = $derived(item.system.description ?? "");
</script>

<div class="swse-sheet" data-theme={theme}>
  <div class="swse-tab-content">
    <ItemHeader {item} />

    <ChangesTable {item} />

    <div class="swse-section">
      <div class="swse-section-header">Description</div>
      <div class="swse-card" style="min-height:80px;">
        {@html description || "<em style='color:var(--label-color);'>No description.</em>"}
      </div>
    </div>
  </div>
</div>
