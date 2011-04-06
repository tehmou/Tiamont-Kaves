var createTiamontKavesEngine = function (options) {
    var options = options || {},
        inputDisabled = false,
        initializedCallback = options.initializedCallback,
        newLevelCallback = options.newLevelCallback,
        levelCompletedCallback = options.levelCompletedCallback,
        playerMoveCallback = options.playerMoveCallback,

        levelRenderer, level, levelLogic,

        loadLevelFromData = function (data) {
            level = levelCreator(data);
            options.levelData = level.getLevelData();
            levelLogic = levelControllerCreator(options);
            level.renderer = levelRendererCreator({
                levelData: level.getLevelData(),
                spriteImages: pngSprites
            });
        },
        startLevel = function () {
            if(levelRenderer && levelRenderer.el) {
                $(levelRenderer.el).remove();
            }
            levelRenderer = level.renderer;
            levelRenderer.render();
            $("#container").append(levelRenderer.el);
            newLevelCallback && newLevelCallback(level.getName());
        },
        startLevelWithFlip = function () {
            var newLevelRenderer = level.renderer;
            newLevelRenderer.render();

            if(levelRenderer) {
                $(levelRenderer.el)
                        .css("position", "absolute")
                        .toggle(true);
                $(newLevelRenderer.el)
                        .css("position", "absolute")
                        .toggle(false);
                $("#container").append(newLevelRenderer.el);
                $(levelRenderer.el).fadeOut(200, "linear");
                $(newLevelRenderer.el).toggle(1200, "linear", function() {
                    $(levelRenderer.el).remove();
                    levelRenderer = newLevelRenderer;
                });
            } else {
                levelRenderer = newLevelRenderer;
                $("#container").append(levelRenderer.el);
            }
            newLevelCallback && newLevelCallback(level.getName());
        },
        startLevelCompleteAnimation = function (callback) {
            if (levelRenderer.startLevelCompleteAnimation) {
                levelRenderer.startLevelCompleteAnimation(callback);
            }
        },
        disableInput = function () {
            inputDisabled = true;
        },
        enableInput = function () {
            inputDisabled = false;
        },
        moveFinished = function () {
            enableInput();
            playerMoveCallback && playerMoveCallback();
        },
        renderAfterMove = function () {
            disableInput();
            levelRenderer.render({ renderEndCallback: moveFinished });
        };
        moveUp = function () {
            if (!inputDisabled) {
                levelLogic.up();
                renderAfterMove();
                }
        },
        moveDown = function () {
            if (!inputDisabled) {
                levelLogic.down();
                renderAfterMove();
            }
        },
        moveLeft = function () {
            if (!inputDisabled) {
                levelLogic.left();
                renderAfterMove();
            }
        },
        moveRight = function () {
            if (!inputDisabled) {
                levelLogic.right();
                renderAfterMove();
            }
        };

        initializedCallback && setTimeout(initializedCallback, 200);

    return {
        init: init,
        loadLevelFromData: loadLevelFromData,
        moveUp: moveUp, moveDown: moveDown,
        moveLeft: moveLeft, moveRight: moveRight,
        startLevel: startLevel,
        startLevelWithFlip: startLevelWithFlip,
        startLevelCompleteAnimation: startLevelCompleteAnimation,
        _debugGetLevelString: function () {
            var levelData = level.getLevelData(),
                data = levelData._getDebugData(),
                lines = [];

            for(var i = 0; i < data.length; i++) {
                for(var n = 0; n < data[i].length; n++) {
                    if(!lines[n]) {
                        lines[n] = "";
                    }
                    if (data[i][n].char === " ") {
                        lines[n] += data[i][n].ground === " " ? "_" : data[i][n].ground;
                    } else {
                        lines[n] += data[i][n].char;
                    }
                }
            }
            return {
                width: levelData.getWidth(),
                height: levelData.getHeight(),
                name: level.getName(),
                data: lines.join("\n")
            };
        },
        _debugLoadLevelFromString: function (newLevel, errd) {
            try {
                loadLevelFromData(newLevel);
            } catch (err) {
                errd(err);
            }
            startLevel();
        }
    };
};