<script>
  let { tabs, activeTab, onSelect } = $props();
</script>

<nav class="swse-tabs">
  {#each tabs as tab}
    {#if !tab.hidden}
      <button
        class:active={activeTab === tab.id}
        onclick={() => onSelect(tab.id)}
      >
        {tab.label}
      </button>
    {/if}
  {/each}
</nav>
