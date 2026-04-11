/**
 * Build HTML for an attack chat card.
 * @param {object} data
 * @param {string} data.actorName
 * @param {string} data.actorImg
 * @param {string} data.weaponName
 * @param {string} data.weaponImg
 * @param {string} data.attackTotal
 * @param {string} data.attackTooltip
 * @param {string} data.damageTotal
 * @param {string} data.damageTooltip
 * @param {boolean} data.isMelee
 * @returns {string} HTML string
 */
export function buildChatCardHTML(data) {
  const typeLabel = data.isMelee ? "Melee Attack" : "Ranged Attack";
  return `
    <div class="swse-chat-card" style="border:1px solid #1a3a5a; border-radius:4px; background:#0d1b2a; padding:0; font-family:'Signika',sans-serif; color:#c8d0d8;">
      <div style="display:flex; align-items:center; gap:8px; padding:8px; border-bottom:1px solid #1a3a5a;">
        <img src="${data.weaponImg}" alt="" style="width:32px; height:32px; border:0; border-radius:4px;" />
        <div>
          <div style="font-size:14px; font-weight:bold; color:#7ec8e3;">${data.weaponName}</div>
          <div style="font-size:10px; color:#4a8ab5;">${typeLabel} — ${data.actorName}</div>
        </div>
      </div>
      <div style="padding:8px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div style="text-align:center;">
          <div style="font-size:9px; color:#4a8ab5; text-transform:uppercase; letter-spacing:1px;">Attack</div>
          <div style="font-size:20px; font-weight:bold;" title="${data.attackTooltip}">${data.attackTotal}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:9px; color:#4a8ab5; text-transform:uppercase; letter-spacing:1px;">Damage</div>
          <div style="font-size:20px; font-weight:bold;" title="${data.damageTooltip}">${data.damageTotal}</div>
        </div>
      </div>
    </div>`;
}
