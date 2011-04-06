var levelRendererCreator = function(options) {
    var el, levelData,
        sprites = [], spriteImages,
        cellWidth = 40,
        cellHeight = 40,
        padding = 7,
        createSprite = function (type, char) {
            var elem, sprite;
            if(spriteImages.hasSprite(type)) {
                elem = spriteImages.createSpriteElement(type);
            } else {
                elem = $("<span>" + char + "</span>");
            }

            elem
                    .css("position", "absolute")
                    .css("width", cellWidth + "px")
                    .css("text-align", "center")
                    .css("font-size", "32px");

            sprite = {elem: elem, type: char};
            sprites.push(sprite);
            return sprite;
        },
        createSpriteForCell = function (cell) {
            cell.sprite = createSprite(cell.getType(), cell.char);
            $(el).append(cell.sprite.elem);
        },
        createGroundSpriteForCell = function (cell) {
            cell.groundSprite = createSprite(cell.getGroundType(), cell.ground);
            $(el).append(cell.groundSprite.elem);
        },
        render = function(callback) {
            var i, bgWidth, bgHeight;

            if (!levelData || !el) {
                return;
            }

            bgWidth = (levelData.getWidth()) * cellWidth + 2*padding;
            bgHeight = (levelData.getHeight()) * cellHeight + 2*padding;

            $(el)
                    .css("width", bgWidth + "px")
                    .css("height", bgHeight + "px");

            for (i = 0; i < sprites.length; i++) {
                sprites[i].hasOwner = false;
            }
            levelData.eachCell(function(x, y, cell) {
                var newLeft = x * cellWidth + padding,
                    newTop = y * cellHeight + padding;

                if (!cell.groundSprite || cell.groundSprite.type !== cell.ground) {
                    createGroundSpriteForCell(cell);
                }
                if (!cell.sprite || cell.sprite.type !== cell.char) {
                    createSpriteForCell(cell);
                }

                if (cell.groundSprite) {
                    cell.groundSprite.hasOwner = true;
                    $(cell.groundSprite.elem)
                            .css("z-index", 0)
                            .css("left", newLeft)
                            .css("top", newTop);
                }
                if (cell.sprite) {
                    cell.sprite.hasOwner = true;
                    $(cell.sprite.elem)
                            .css("z-index", 1)
                            .animate({
                                left: newLeft, top: newTop
                            }, {
                                duration: cell.sprite.nextAnimation === "slow" ? 500 : 150
                            });
                    cell.sprite.nextAnimation = "";
                }
            });
            for (i = 0; i < sprites.length; i++) {
                if (sprites[i].hasOwner == false) {
                    $(sprites[i].elem).toggle(200);
                    sprites.splice(i, 1);
                }
            }

            callback && callback();
        };

    levelData = options.levelData;
    spriteImages = options.spriteImages;

    el = document.createElement("div");
    $(el)
            .css("position", "absolute")
            .css("background-color", "#999")
            .css("border", "1px solid #000");

    return {
        el: el,
        render: render
    };
};