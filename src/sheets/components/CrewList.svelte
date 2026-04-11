<script>
  let { actor } = $props();

  const links = $derived(actor.system.actorLinks ?? []);

  async function resolveActorName(uuid) {
    try {
      const doc = await fromUuid(uuid);
      return doc?.name ?? "Unknown";
    } catch {
      return "Unknown";
    }
  }

  async function removeLink(index) {
    const updated = links.filter((_, i) => i !== index);
    await actor.update({ "system.actorLinks": updated });
  }

  function updatePosition(index, value) {
    const updated = links.map((l, i) => i === index ? { ...l, position: value } : l);
    actor.update({ "system.actorLinks": updated });
  }
</script>

<div class="swse-section">
  <div class="swse-section-header">Crew ({links.length})</div>

  {#if links.length > 0}
    <table class="swse-item-list">
      <thead>
        <tr>
          <th>Name</th>
          <th style="width:120px;">Position</th>
          <th style="width:80px;">Slot</th>
          <th style="width:40px;"></th>
        </tr>
      </thead>
      <tbody>
        {#each links as link, i}
          <tr>
            <td>
              {#await resolveActorName(link.uuid)}
                <em style="color:var(--label-color);">Loading...</em>
              {:then name}
                {name}
              {/await}
            </td>
            <td>
              <select class="swse-input" value={link.position}
                onchange={(e) => updatePosition(i, e.target.value)} style="text-align:left; font-size:11px;">
                <option value="neutral">Neutral</option>
                <option value="pilot">Pilot</option>
                <option value="copilot">Copilot</option>
                <option value="gunner">Gunner</option>
                <option value="commander">Commander</option>
                <option value="system operator">System Operator</option>
                <option value="engineer">Engineer</option>
                <option value="passenger">Passenger</option>
              </select>
            </td>
            <td style="font-size:11px; color:var(--label-color);">{link.slot ?? "—"}</td>
            <td style="text-align:center;">
              <button onclick={() => removeLink(i)}
                style="background:none; border:none; color:var(--label-color); cursor:pointer;"
                title="Remove"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p style="color:var(--label-color); text-align:center; padding:12px; font-size:11px;">
      No crew assigned. Drag actors onto this sheet to add crew.
    </p>
  {/if}
</div>
