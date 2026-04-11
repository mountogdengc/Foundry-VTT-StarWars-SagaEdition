<script>
  import ItemHeader from "../components/ItemHeader.svelte";
  import ChangesTable from "../components/ChangesTable.svelte";

  let { item } = $props();

  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");
  const system = $derived(item.system);
  const description = $derived(system.description ?? "");

  // Physical properties
  const cost = $derived(system.cost ?? "");
  const weight = $derived(system.weight ?? "");
  const availability = $derived(system.availability ?? "");
  const subtype = $derived(system.subtype ?? "");
  const equipped = $derived(system.equipped ?? false);

  // Type checks
  const isWeapon = $derived(item.type === "weapon");
  const isArmor = $derived(item.type === "armor");
  const armorType = $derived(system.armorType ?? "");

  // Modes
  const modes = $derived(system.modes ?? []);
  const hasModes = $derived(modes.length > 0);

  function updateField(path) {
    return (e) => item.update({ [path]: e.target.value });
  }

  function toggleEquipped() {
    item.update({ "system.equipped": !equipped });
  }
</script>

<div class="swse-sheet" data-theme={theme}>
  <div class="swse-tab-content">
    <ItemHeader {item} />

    <!-- Physical properties -->
    <div class="swse-section">
      <div class="swse-section-header">Properties</div>
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
        <label class="swse-label">Cost
          <input class="swse-input" value={cost}
            onchange={updateField("system.cost")} style="text-align:left;" />
        </label>
        <label class="swse-label">Weight
          <input class="swse-input" value={weight}
            onchange={updateField("system.weight")} style="text-align:left;" />
        </label>
        <label class="swse-label">Availability
          <input class="swse-input" value={availability}
            onchange={updateField("system.availability")} style="text-align:left;" />
        </label>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:6px;">
        {#if isArmor}
          <label class="swse-label">Armor Type
            <select class="swse-input" value={armorType}
              onchange={updateField("system.armorType")} style="text-align:left;">
              <option value="">None</option>
              <option value="Light Armor">Light</option>
              <option value="Medium Armor">Medium</option>
              <option value="Heavy Armor">Heavy</option>
            </select>
          </label>
        {/if}
        {#if subtype && !isArmor}
          <label class="swse-label">Subtype
            <input class="swse-input" value={subtype}
              onchange={updateField("system.subtype")} style="text-align:left;" />
          </label>
        {/if}
        <label style="display:flex; align-items:center; gap:8px; margin-top:12px;">
          <input type="checkbox" checked={equipped} onchange={toggleEquipped} />
          <span>Equipped</span>
        </label>
      </div>
    </div>

    {#if hasModes}
      <div class="swse-section">
        <div class="swse-section-header">Modes ({modes.length})</div>
        <table class="swse-item-list">
          <thead><tr><th>Mode</th><th>Details</th></tr></thead>
          <tbody>
            {#each modes as mode, i}
              <tr>
                <td style="font-size:11px;">{mode.name ?? `Mode ${i + 1}`}</td>
                <td style="font-size:11px;">{mode.group ?? ""}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    <ChangesTable {item} />

    <div class="swse-section">
      <div class="swse-section-header">Description</div>
      <div class="swse-card" style="min-height:80px;">
        {@html description || "<em style='color:var(--label-color);'>No description.</em>"}
      </div>
    </div>
  </div>
</div>
