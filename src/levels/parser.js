import constants from '../common/const';

function getAtlasKey(symbol) {
    return constants.TILE_TO_ATLAS[symbol]
}

function getSprites(levelData, game) {
    return levelData.split(/\r\n|\r|\n/g).join('').split('').map((tileSymbol, tileIndex) => {
        var atlasKey = getAtlasKey(tileSymbol);
        if (typeof atlasKey == 'undefined') {
            return null;
        }

        var args = [game, tileIndex, atlasKey];
        return getTerrainSprite.apply(null, args);
    }).filter((sprite) => {
        return sprite != null;
    })
}

function getTerrainSprite(game, tileIndex, imageKey) {
    var sprite = new Phaser.Sprite(game, 16 + xCoord(tileIndex), 16 + yCoord(tileIndex), 'sprites', imageKey);
    game.physics.arcade.enable(sprite);
    sprite.body.immovable = true;
    sprite.extra = {
        entityType: constants.ATLAS_TO_ENTITY_TYPE[imageKey]
    };
    return sprite;
}

function xCoord(tileIndex) {
    return ((tileIndex % 26) * 8);
}

function yCoord(tileIndex) {
    return (Math.floor(tileIndex / 26) * 8);
}

export default getSprites;