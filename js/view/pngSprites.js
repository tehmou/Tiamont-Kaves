var pngSprites = function () {
    var SPRITE_SIZE = 40,
        MARGIN = 1,
        SPRITE_FILE = "images/sprites_all-01.png",
        sprites = {
            exit: { coords: [0, 0] },
            tiamont: { coords: [1, 0] },
            wall: { coords: [2, 0] },
            bigStone: { coords: [3, 0] },
            smallStone: { coords: [4, 0] },
            
            arrowUp: { coords: [0, 1] },
            arrowRight: { coords: [1, 1] },
            arrowDown: { coords: [2, 1] },
            arrowLeft: { coords: [3, 1] }
        },
        createSpriteElement = function (spriteName) {
            var sprite = sprites[spriteName], div, img;

            if(!sprite) {
                return;
            }

            img = $("<img />")
                    .attr("src", SPRITE_FILE)
                    .css("position", "relative")
                    .css("left", -sprite.coords[0] * (SPRITE_SIZE + MARGIN))
                    .css("top", -sprite.coords[1] * (SPRITE_SIZE + MARGIN));

            div = $("<div></div>")
                    .css("width", SPRITE_SIZE)
                    .css("height", SPRITE_SIZE)
                    .css("overflow", "hidden")
                    .append(img);

            return div;
        },
        hasSprite = function (type) {
            return sprites.hasOwnProperty(type);
        };

    return {
        createSpriteElement: createSpriteElement,
        hasSprite: hasSprite
    };
}();