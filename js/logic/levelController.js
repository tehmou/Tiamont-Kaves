var levelControllerCreator = function(options) {
    var currentX, currentY,
        levelData = options.levelData,
        rules = defaultLevelInteractionRulesCreator(options),
        resolvePlayerPosition = function() {
            currentX = -1;
            currentY = -1;
            levelData.eachCell(function(x, y, cell) {
                if (!cell) {
                    return;
                }
                if (cell.is("player")) {
                    currentX = x;
                    currentY = y;
                }
            });
            if(currentX === -1 || currentY === -1) {
                throw "Could not find player!";
            }
        },
        move = function(deltaX, deltaY) {
            if (!levelData.is("player", currentX, currentY)) {
                // Something seriously wrong, fix!
                resolvePlayerPosition();
            }
            
            return rules.move({
                x: currentX,
                y: currentY,
                deltaX: deltaX,
                deltaY: deltaY
            });
        };

    resolvePlayerPosition();
    return {
        left: function() { move(-1, 0); },
        right: function() { move(1, 0); },
        up: function() { move(0, -1); },
        down: function() { move(0, 1); }
    };
};