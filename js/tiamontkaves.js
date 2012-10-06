var tiamontKavesCreator = function (options) {
    var tiamontKavesEngine,
        levelCompletedCallback = options.levelCompletedCallback,
        gameCompletedCallback = options.gameCompletedCallback,
        currentLevelIndex,
        increaseOrStartLevelIndex = function () {
            if(currentLevelIndex === undefined) {
                currentLevelIndex = 0;
            } else {
                currentLevelIndex++;
            }
        },
        reloadLevel = function () {
            if(currentLevelIndex >= 0) {
                if(currentLevelIndex >= LEVELS.length) {
                    gameCompleted();
                    currentLevelIndex = currentLevelIndex % LEVELS.length;
                    currentLevelIndex = 0;
                    reloadLevel();
                } else {
                    tiamontKavesEngine.loadLevelFromData(LEVELS[currentLevelIndex]);
                }
            }
        },
        loadNextLevel = function () {
            increaseOrStartLevelIndex();
            reloadLevel();
            tiamontKavesEngine.startLevelWithFlip();
        },
        loadLevelByIndex = function (index) {
            currentLevelIndex = index;
            reloadLevel();
            tiamontKavesEngine.startLevelWithFlip();
        },
        restartLevel = function () {
            reloadLevel();
            tiamontKavesEngine.startLevelWithFlip();
        },
        levelCompleted = function () {
            tiamontKavesEngine.startLevelCompleteAnimation(function () {
                levelCompletedCallback && levelCompletedCallback();
                loadNextLevel();
            });
        },
        gameCompleted = function () {
            tiamontKavesEngine.startLevelCompleteAnimation(gameCompletedCallback);
        };

        // Override levelCompleted to augment it.
        options.levelCompletedCallback = levelCompleted;

        tiamontKavesEngine = createTiamontKavesEngine(options);
        tiamontKavesEngine.restartLevel = restartLevel;
        tiamontKavesEngine.getCurrentLevelIndex = function () { return currentLevelIndex; };
        tiamontKavesEngine.loadNextLevel = loadNextLevel;
        tiamontKavesEngine.loadLevelByIndex = loadLevelByIndex;

    return tiamontKavesEngine;
};