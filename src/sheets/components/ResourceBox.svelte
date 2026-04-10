<script>
  let { label, value, path, actor } = $props();
  function update(e) {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) actor.update({ [path]: val });
  }
</script>

<div class="swse-card" style="text-align:center;">
  <div class="swse-label">{label}</div>
  <input class="swse-input" type="number" value={value}
    onchange={update} style="width:50px; font-size:16px;" />
</div>
