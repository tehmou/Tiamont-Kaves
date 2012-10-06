var defaultLevelInteractionRulesCreator = function (options) {
    var levelData = options.levelData,
        levelCompletedCallback = options.levelCompletedCallback,
        tooFewDiamondsCallback = options.tooFewDiamondsCallback,
        positionStruct = function (options) {
            return {
                x: options.x,
                y: options.y,
                deltaX: options.deltaX,
                deltaY: options.deltaY,
                advance: function () {
                    var result = positionStruct(this);
                    result.x += result.deltaX;
                    result.y += result.deltaY;
                    return result;
                }
            }
        };

    return {
        move: function(options) {
            var currentPos = positionStruct(options),
                desiredPos = currentPos.advance(),
                behindDesiredPos = desiredPos.advance();

            if (!levelData.isInsideBounds(desiredPos) ||
                !levelData.is("groundLeavable", currentPos)) {
                return false;
            }

            if(levelData.is("exit", desiredPos)) {
                var countOfTiamonts = levelData.countOf("tiamont");
                if (countOfTiamonts === 0) {
                    levelData.moveFromTo(currentPos, desiredPos);
                    levelCompletedCallback && levelCompletedCallback(this);
                } else {
                    tooFewDiamondsCallback && tooFewDiamondsCallback(countOfTiamonts);
                }
                return false;
            }

            if(levelData.is("smallPlayer", currentPos)) {
                if (levelData.is("secondHandPushable", desiredPos) &&
                    levelData.is("emptyWalkable", behindDesiredPos)) {
                    levelData.moveFromTo(desiredPos, behindDesiredPos)
                }
            } else {
                if (levelData.is("pushable", desiredPos) &&
                    levelData.is("emptyWalkable", behindDesiredPos)) {
                    if(levelData.is("bigStone", desiredPos)) {
                        levelData.setAnimation("slow", currentPos);
                        levelData.setAnimation("slow", desiredPos);
                    }
                    levelData.moveFromTo(desiredPos, behindDesiredPos);
                } else if(levelData.is("secondHandPushable", desiredPos)) {

                    var secondHandPush = function (lastPos) {
                        var curPos = lastPos.advance();
                        if (levelData.is("secondHandPushable", curPos)) {
                            if(secondHandPush(curPos)) {
                                levelData.moveFromTo(lastPos, curPos);
                                return true;
                            } else {
                                return false;
                            }
                        } else if (levelData.is("emptyWalkable", curPos)) {
                            levelData.moveFromTo(lastPos, curPos);
                            return true;
                        }
                    };

                    secondHandPush(desiredPos);
                }
            }

            if (levelData.is("walkable", desiredPos)) {
                if(levelData.is("superMushroom", desiredPos)) {
                    levelData.togglePlayerSize(currentPos);
                }
                levelData.moveFromTo(currentPos, desiredPos);
                levelData.erase(currentPos);

                return desiredPos;
            }

            return null;
        }
    };
};
