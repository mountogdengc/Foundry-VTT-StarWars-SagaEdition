/**
 * Place a measured template on the canvas and wait for user confirmation.
 */
export async function placeTemplate(templateData) {
  const templateDoc = new CONFIG.MeasuredTemplate.documentClass(
    foundry.utils.mergeObject({
      user: game.user.id,
      direction: 0,
      x: 0,
      y: 0,
      fillColor: game.user.color,
      flags: { swse: { cleanUp: true } },
    }, templateData),
    { parent: canvas.scene }
  );

  const template = new CONFIG.MeasuredTemplate.objectClass(templateDoc);
  const result = await previewTemplate(template);
  if (!result) return null;

  const [created] = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [template.document.toObject()]);
  return created;
}

function previewTemplate(template) {
  return new Promise((resolve) => {
    template.draw();
    canvas.templates.activate();
    canvas.templates.preview.addChild(template);

    const handlers = {
      move(event) {
        const pos = event.data?.getLocalPosition(canvas.app.stage) ?? event.getLocalPosition(canvas.app.stage);
        const snapped = canvas.grid.getSnappedPoint(pos, { mode: CONST.GRID_SNAPPING_MODES.CENTER });
        template.document.updateSource({ x: snapped.x, y: snapped.y });
        template.refresh();
      },
      confirm() {
        cleanup();
        resolve(template);
      },
      cancel() {
        cleanup();
        resolve(null);
      },
      rotate(event) {
        if (event.ctrlKey) event.preventDefault();
        const delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
        const direction = template.document.direction + (delta * Math.sign(event.deltaY));
        template.document.updateSource({ direction });
        template.refresh();
      },
    };

    function cleanup() {
      canvas.stage.off("mousemove", handlers.move);
      canvas.stage.off("mouseup", handlers.confirm);
      canvas.app.view.oncontextmenu = null;
      canvas.app.view.onwheel = null;
      canvas.templates.preview.removeChild(template);
      canvas.templates.deactivate();
    }

    canvas.stage.on("mousemove", handlers.move);
    canvas.stage.on("mouseup", handlers.confirm);
    canvas.app.view.oncontextmenu = handlers.cancel;
    canvas.app.view.onwheel = handlers.rotate;
  });
}

export function findActorsInTemplate(templateDoc) {
  const { size } = templateDoc.parent.grid;
  const object = templateDoc.object;
  if (!object) return [];

  const contained = [];
  for (const tokenDoc of templateDoc.parent.tokens) {
    const { width, height, x: tokx, y: toky } = tokenDoc;
    const startX = width >= 1 ? 0.5 : width / 2;
    const startY = height >= 1 ? 0.5 : height / 2;
    let found = false;
    for (let x = startX; x < width && !found; x++) {
      for (let y = startY; y < height && !found; y++) {
        const point = {
          x: tokx + x * size - templateDoc.x,
          y: toky + y * size - templateDoc.y,
        };
        if (object._computeShape().contains(point.x, point.y)) {
          if (tokenDoc.actor) contained.push(tokenDoc.actor);
          found = true;
        }
      }
    }
  }
  return contained;
}

export async function cleanupTemplates(templates = []) {
  for (const template of templates) {
    if (template.flags?.swse?.cleanUp) {
      await template.delete();
    }
  }
}
