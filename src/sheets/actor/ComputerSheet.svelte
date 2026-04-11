<script>
  let { actor } = $props();

  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");
  const content = $derived(actor.system.content ?? "");
  const cursor = $derived(actor.system.cursor ?? "root");
  const attributes = $derived(actor.system.attributes ?? {});
  const attrEntries = $derived(Object.entries(attributes));

  function updateCursor(e) { actor.update({ "system.cursor": e.target.value }); }
  function updateName(e) { actor.update({ name: e.target.value }); }
  function openImagePicker() {
    const fp = new FilePicker({ type: "image", current: actor.img, callback: (path) => actor.update({ img: path }) });
    fp.render(true);
  }
</script>

<div class="swse-sheet" data-theme={theme}>
  <div class="swse-tab-content">
    <div class="swse-header" style="grid-template-columns: 80px 1fr auto;">
      <img class="swse-portrait" src={actor.img} alt={actor.name}
        onclick={openImagePicker} role="button" tabindex="0"
        onkeydown={(e) => e.key === "Enter" && openImagePicker()} />
      <div>
        <input class="swse-input swse-name" value={actor.name}
          onchange={updateName} style="text-align:left; font-size:18px; font-weight:bold;" />
        <div class="swse-subtitle">Computer</div>
      </div>
    </div>

    <div class="swse-section">
      <div class="swse-section-header">Cursor</div>
      <input class="swse-input" value={cursor} onchange={updateCursor} style="text-align:left;" />
    </div>

    <div class="swse-section">
      <div class="swse-section-header">Content</div>
      <div class="swse-card" style="min-height:120px;">
        {@html content || "<em style='color:var(--label-color);'>No content.</em>"}
      </div>
    </div>

    {#if attrEntries.length > 0}
      <div class="swse-section">
        <div class="swse-section-header">Attributes</div>
        <table class="swse-item-list">
          <thead><tr><th>Key</th><th>Value</th></tr></thead>
          <tbody>
            {#each attrEntries as [key, value]}
              <tr>
                <td style="font-size:11px;">{key}</td>
                <td style="font-size:11px;">{typeof value === "object" ? JSON.stringify(value) : value}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
