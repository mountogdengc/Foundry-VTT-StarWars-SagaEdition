<script>
  import TabBar from "../components/TabBar.svelte";
  import SummaryTab from "./tabs/SummaryTab.svelte";
  import SkillsTab from "./tabs/SkillsTab.svelte";
  import InventoryTab from "./tabs/InventoryTab.svelte";
  import FeatsTab from "./tabs/FeatsTab.svelte";
  import ForceTab from "./tabs/ForceTab.svelte";
  import TraitsTab from "./tabs/TraitsTab.svelte";
  import DetailsTab from "./tabs/DetailsTab.svelte";
  import SettingsTab from "./tabs/SettingsTab.svelte";

  let { actor } = $props();

  let activeTab = $state("summary");

  const isForceSensitive = $derived(actor.isForceSensitive ?? false);
  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");

  const tabs = $derived([
    { id: "summary", label: "Summary" },
    { id: "skills", label: "Skills" },
    { id: "inventory", label: "Inventory" },
    { id: "feats", label: "Feats & Talents" },
    { id: "force", label: "The Force", hidden: !isForceSensitive },
    { id: "traits", label: "Traits & Languages" },
    { id: "details", label: "Details" },
    { id: "settings", label: "Settings" },
  ]);

  function onSelectTab(id) {
    activeTab = id;
  }
</script>

<div class="swse-sheet" data-theme={theme}>
  <TabBar {tabs} {activeTab} onSelect={onSelectTab} />

  <div class="swse-tab-content">
    {#if activeTab === "summary"}
      <SummaryTab {actor} />
    {:else if activeTab === "skills"}
      <SkillsTab {actor} />
    {:else if activeTab === "inventory"}
      <InventoryTab {actor} />
    {:else if activeTab === "feats"}
      <FeatsTab {actor} />
    {:else if activeTab === "force"}
      <ForceTab {actor} />
    {:else if activeTab === "traits"}
      <TraitsTab {actor} />
    {:else if activeTab === "details"}
      <DetailsTab {actor} />
    {:else if activeTab === "settings"}
      <SettingsTab {actor} />
    {/if}
  </div>
</div>
