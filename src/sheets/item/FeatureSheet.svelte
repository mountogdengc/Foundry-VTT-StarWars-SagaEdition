<script>
  import ItemHeader from "../components/ItemHeader.svelte";
  import ChangesTable from "../components/ChangesTable.svelte";

  let { item } = $props();

  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");
  const system = $derived(item.system);
  const description = $derived(system.description ?? "");
  const prerequisite = $derived(system.prerequisite);
  const hasPrereqs = $derived(prerequisite && Object.keys(prerequisite).length > 0);
  const categories = $derived(system.categories ?? []);
  const source = $derived(system.supplier?.name ?? "");

  // Talent-specific
  const isTalent = $derived(item.type === "talent");
  const talentTree = $derived(system.talentTree ?? "");
  const talentTreeSource = $derived(system.talentTreeSource ?? "");
  const bonusTalentTree = $derived(system.bonusTalentTree ?? "");

  // Class-specific
  const isClass = $derived(item.type === "class");
  const levels = $derived(system.levels ?? []);

  // Species-specific
  const isSpecies = $derived(item.type === "species");
  const traits = $derived(system.traits ?? []);

  function updateField(path) {
    return (e) => item.update({ [path]: e.target.value });
  }
</script>

<div class="swse-sheet" data-theme={theme}>
  <div class="swse-tab-content">
    <ItemHeader {item} />

    {#if hasPrereqs}
      <div class="swse-section">
        <div class="swse-section-header">Prerequisites</div>
        <div class="swse-card" style="font-size:11px;">
          {#each Object.entries(prerequisite) as [key, value]}
            <div><span style="color:var(--label-color);">{key}:</span> {JSON.stringify(value)}</div>
          {/each}
        </div>
      </div>
    {/if}

    {#if categories.length > 0 || source}
      <div class="swse-section">
        <div class="swse-section-header">Details</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          {#if categories.length > 0}
            <div>
              <span class="swse-label">Categories</span>
              <div style="font-size:11px;">{categories.join(", ")}</div>
            </div>
          {/if}
          {#if source}
            <div>
              <span class="swse-label">Source</span>
              <div style="font-size:11px;">{source}</div>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    {#if isTalent}
      <div class="swse-section">
        <div class="swse-section-header">Talent Tree</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <label class="swse-label">Tree
            <input class="swse-input" value={talentTree}
              onchange={updateField("system.talentTree")} style="text-align:left;" />
          </label>
          <label class="swse-label">Source
            <input class="swse-input" value={talentTreeSource}
              onchange={updateField("system.talentTreeSource")} style="text-align:left;" />
          </label>
          {#if bonusTalentTree}
            <label class="swse-label">Bonus Tree
              <input class="swse-input" value={bonusTalentTree}
                onchange={updateField("system.bonusTalentTree")} style="text-align:left;" />
            </label>
          {/if}
        </div>
      </div>
    {/if}

    {#if isClass && levels.length > 0}
      <div class="swse-section">
        <div class="swse-section-header">Class Levels ({levels.length})</div>
        <table class="swse-item-list">
          <thead><tr><th>Level</th><th>Details</th></tr></thead>
          <tbody>
            {#each levels as level, i}
              <tr>
                <td style="width:50px; text-align:center;">{i + 1}</td>
                <td style="font-size:11px;">{JSON.stringify(level)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    {#if isSpecies && traits.length > 0}
      <div class="swse-section">
        <div class="swse-section-header">Species Traits ({traits.length})</div>
        <table class="swse-item-list">
          <thead><tr><th>Trait</th></tr></thead>
          <tbody>
            {#each traits as trait}
              <tr><td style="font-size:11px;">{trait.finalName ?? trait.name ?? JSON.stringify(trait)}</td></tr>
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
