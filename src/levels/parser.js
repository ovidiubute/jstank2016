import constants from "../common/const";

function getAtlasKey(symbol) {
  return constants.TILE_TO_ATLAS[symbol];
}

function getSprites(levelData, scene) {
  return levelData
    .split(/\r\n|\r|\n/g)
    .join("")
    .split("")
    .map((tileSymbol, tileIndex) => {
      const atlasKey = getAtlasKey(tileSymbol);
      if (typeof atlasKey === "undefined") {
        return null;
      }

      return getTerrainSprite(scene, tileIndex, atlasKey);
    })
    .filter((sprite) => sprite != null);
}

function getTerrainSprite(scene, tileIndex, imageKey) {
  const sprite = scene.physics.add.sprite(
    16 + xCoord(tileIndex),
    16 + yCoord(tileIndex),
    "sprites",
    imageKey
  );

  sprite.setImmovable(true);
  sprite.extra = {
    entityType: constants.ATLAS_TO_ENTITY_TYPE[imageKey],
  };

  return sprite;
}

function xCoord(tileIndex) {
  return (tileIndex % 26) * 8;
}

function yCoord(tileIndex) {
  return Math.floor(tileIndex / 26) * 8;
}

export default getSprites;
