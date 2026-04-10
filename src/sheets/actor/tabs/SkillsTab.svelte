<script>
  import SkillRow from "../../components/SkillRow.svelte";

  let { actor } = $props();

  const skills = $derived(actor.system.skills ?? {});
  const remainingSkills = $derived(actor.system.remainingSkills);
  const tooManySkills = $derived(actor.system.tooManySkills);
</script>

<div class="swse-section">
  <div class="swse-section-header">
    Skills
    {#if remainingSkills !== false && remainingSkills !== undefined}
      <span style="float:right; font-size:10px;">
        Trained skills remaining: <strong>{remainingSkills}</strong>
      </span>
    {/if}
    {#if tooManySkills}
      <span style="float:right; font-size:10px; color:var(--hp-color);">
        Too many trained skills: <strong>{tooManySkills}</strong> over
      </span>
    {/if}
  </div>

  <table class="swse-item-list">
    <thead>
      <tr>
        <th style="width:24px;">T</th>
        <th>Skill</th>
        <th style="width:36px; text-align:center;">Abl</th>
        <th style="width:48px; text-align:center;">Mod</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.entries(skills) as [name, skill]}
        {#if !skill.hide}
          <SkillRow {name} {skill} {actor} />
        {/if}
      {/each}
    </tbody>
  </table>
</div>
