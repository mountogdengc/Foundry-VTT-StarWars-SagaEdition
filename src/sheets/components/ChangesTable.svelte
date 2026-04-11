<script>
  let { item } = $props();

  const changes = $derived(item.system.changes ?? []);
  const isGM = $derived(game.user.isGM);

  function addChange() {
    const updated = [...changes, { key: "", value: "", mode: "add" }];
    item.update({ "system.changes": updated });
  }

  function removeChange(index) {
    const updated = changes.filter((_, i) => i !== index);
    item.update({ "system.changes": updated });
  }

  function updateChange(index, field, value) {
    const updated = changes.map((c, i) => i === index ? { ...c, [field]: value } : c);
    item.update({ "system.changes": updated });
  }
</script>

<div class="swse-section">
  <div class="swse-section-header">
    Changes ({changes.length})
    {#if isGM}
      <button onclick={addChange} style="float:right; background:none; border:none; color:var(--accent-color); cursor:pointer; font-size:12px;" title="Add Change">
        <i class="fas fa-plus"></i>
      </button>
    {/if}
  </div>

  {#if changes.length > 0}
    <table class="swse-item-list">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
          {#if isGM}<th style="width:40px;"></th>{/if}
        </tr>
      </thead>
      <tbody>
        {#each changes as change, i}
          <tr>
            {#if isGM}
              <td>
                <input class="swse-input" value={change.key ?? ""}
                  onchange={(e) => updateChange(i, "key", e.target.value)}
                  style="text-align:left; font-size:11px;" />
              </td>
              <td>
                <input class="swse-input" value={change.value ?? ""}
                  onchange={(e) => updateChange(i, "value", e.target.value)}
                  style="text-align:left; font-size:11px;" />
              </td>
              <td style="text-align:center;">
                <button onclick={() => removeChange(i)}
                  style="background:none; border:none; color:var(--label-color); cursor:pointer;"
                  title="Remove"><i class="fas fa-trash"></i></button>
              </td>
            {:else}
              <td style="font-size:11px;">{change.key ?? ""}</td>
              <td style="font-size:11px;">{change.value ?? ""}</td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p style="color:var(--label-color); text-align:center; padding:8px; font-size:11px;">No changes</p>
  {/if}
</div>
