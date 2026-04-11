<script>
  let { item } = $props();

  function openImagePicker() {
    const fp = new FilePicker({
      type: "image",
      current: item.img,
      callback: (path) => item.update({ img: path }),
    });
    fp.render(true);
  }

  function updateName(e) {
    item.update({ name: e.target.value });
  }

  const typeLabel = $derived(item.type.replace(/([A-Z])/g, " $1").trim());
</script>

<div class="swse-header" style="grid-template-columns: 80px 1fr auto;">
  <img class="swse-portrait" src={item.img} alt={item.name}
    onclick={openImagePicker} role="button" tabindex="0"
    onkeydown={(e) => e.key === "Enter" && openImagePicker()} />
  <div>
    <input class="swse-input swse-name" value={item.name}
      onchange={updateName} style="text-align:left; font-size:18px; font-weight:bold;" />
    <div class="swse-subtitle" style="text-transform:capitalize;">{typeLabel}</div>
  </div>
</div>
