<script>
  import SkillRow from "../../components/SkillRow.svelte";
  let { actor } = $props();
  const skills = $derived(actor.system.skills ?? {});
</script>

<div class="swse-section">
  <div class="swse-section-header">Vehicle Skills</div>
  <table class="swse-item-list">
    <thead><tr><th style="width:24px;">T</th><th>Skill</th><th style="width:36px; text-align:center;">Abl</th><th style="width:48px; text-align:center;">Mod</th></tr></thead>
    <tbody>
      {#each Object.entries(skills) as [name, skill]}
        <SkillRow {name} {skill} {actor} />
      {/each}
    </tbody>
  </table>
</div>
