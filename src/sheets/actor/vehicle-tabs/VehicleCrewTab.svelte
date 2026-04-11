<script>
  import CrewList from "../../components/CrewList.svelte";
  let { actor } = $props();
</script>

<CrewList {actor} />
