<script>
  let { items = [], actor, showEquip = false } = $props();
  function editItem(item) { item.sheet.render(true); }
  async function deleteItem(item) {
    const confirm = await Dialog.confirm({
      title: `Delete ${item.name}?`,
      content: `<p>Are you sure you want to delete <strong>${item.name}</strong>?</p>`,
    });
    if (confirm) await item.delete();
  }
  function toggleEquip(item) {
    item.update({ "system.equipped": !item.system.equipped });
  }
</script>

<table class="swse-item-list">
  <thead>
    <tr>
      {#if showEquip}<th style="width:24px;"></th>{/if}
      <th style="width:24px;"></th>
      <th>Name</th>
      <th style="width:60px; text-align:right;">Controls</th>
    </tr>
  </thead>
  <tbody>
    {#each items as item}
      <tr>
        {#if showEquip}
          <td style="width:24px; text-align:center;">
            <input type="checkbox" checked={item.system?.equipped ?? false}
              onchange={() => toggleEquip(item)} />
          </td>
        {/if}
        <td style="width:24px;">
          <img src={item.img} alt="" style="width:20px; height:20px; border:0;" />
        </td>
        <td class="swse-rollable" onclick={() => editItem(item)}>{item.name}</td>
        <td style="text-align:right;">
          <div class="swse-item-controls">
            <button onclick={() => editItem(item)} title="Edit"><i class="fas fa-edit"></i></button>
            <button onclick={() => deleteItem(item)} title="Delete"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    {/each}
    {#if items.length === 0}
      <tr><td colspan={showEquip ? 4 : 3} style="text-align:center; color:var(--label-color); padding:12px;">No items</td></tr>
    {/if}
  </tbody>
</table>
