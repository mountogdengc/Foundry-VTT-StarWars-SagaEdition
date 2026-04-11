<script>
  import TabBar from "../components/TabBar.svelte";
  import VehicleSummaryTab from "./vehicle-tabs/VehicleSummaryTab.svelte";
  import VehicleSkillsTab from "./vehicle-tabs/VehicleSkillsTab.svelte";
  import VehicleInventoryTab from "./vehicle-tabs/VehicleInventoryTab.svelte";
  import VehicleCrewTab from "./vehicle-tabs/VehicleCrewTab.svelte";
  import VehicleDetailsTab from "./vehicle-tabs/VehicleDetailsTab.svelte";
  import VehicleSettingsTab from "./vehicle-tabs/VehicleSettingsTab.svelte";

  let { actor } = $props();
  let activeTab = $state("summary");
  const theme = $derived(game.settings.get("swse", "sheetTheme") ?? "dark-scifi");

  const tabs = [
    { id: "summary", label: "Summary" },
    { id: "skills", label: "Skills" },
    { id: "inventory", label: "Systems" },
    { id: "crew", label: "Crew" },
    { id: "details", label: "Details" },
    { id: "settings", label: "Settings" },
  ];

  function onSelectTab(id) { activeTab = id; }
</script>

<div class="swse-sheet" data-theme={theme}>
  <TabBar {tabs} {activeTab} onSelect={onSelectTab} />
  <div class="swse-tab-content">
    {#if activeTab === "summary"}
      <VehicleSummaryTab {actor} />
    {:else if activeTab === "skills"}
      <VehicleSkillsTab {actor} />
    {:else if activeTab === "inventory"}
      <VehicleInventoryTab {actor} />
    {:else if activeTab === "crew"}
      <VehicleCrewTab {actor} />
    {:else if activeTab === "details"}
      <VehicleDetailsTab {actor} />
    {:else if activeTab === "settings"}
      <VehicleSettingsTab {actor} />
    {/if}
  </div>
</div>
