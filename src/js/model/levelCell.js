var CELL_TYPES = {
    X: "bigPlayer",
    x: "smallPlayer",
    S: "superMushroom",
    T: "tiamont",
    W: "wall",
    O: "bigStone",
    o: "smallStone",
    " ": "empty"
};

var GROUND_TYPES = {
    E: "exit",
    "1": "arrowUp",
    "2": "arrowRight",
    "3": "arrowDown",
    "4": "arrowLeft",
    " ": "clear"
};

var LevelCell = function (options) {
    this.char = " ";
    this.ground = " ";
    if(GROUND_TYPES.hasOwnProperty(options.char)) {
        this.ground = options.char;
    } else {
        this.char = options.char;
    }
};

LevelCell.prototype.getType = function () {
    if(CELL_TYPES.hasOwnProperty(this.char)) {
        return CELL_TYPES[this.char];
    } else {
        return null;
    }
};

LevelCell.prototype.getGroundType = function () {
    if(GROUND_TYPES.hasOwnProperty(this.ground)) {
        return GROUND_TYPES[this.ground];
    } else {
        return null;
    }
};

LevelCell.prototype.is = function (kind, deltaX, deltaY) {
    var type = this.getType();
    if(type && type === kind) { return true; }
    type = this.getGroundType();
    if(type && type === kind) { return true; }

    switch(kind) {
        case "player":
            return this.is("bigPlayer") || this.is("smallPlayer");

        case "secondHandPushable":
            return this.is("groundWalkable", deltaX, deltaY) && this.is("smallStone");

        case "pushable":
            return this.is("groundWalkable", deltaX, deltaY) && (this.is("bigStone") || this.is("smallStone"));

        case "groundWalkable":
            if (this.is("clear")) {
                return true;
            } else if (this.is("arrowUp")) {
                return deltaY == -1;
            } else if (this.is("arrowRight")) {
                return deltaX == 1;
            } else if (this.is("arrowDown")) {
                return deltaY == 1;
            } else if (this.is("arrowLeft")) {
                return deltaX == -1;
            } else {
                return false;
            }

        case "groundLeavable":
            if (this.is("clear")) {
                return true;
            } else if (this.is("arrowDown")) {
                return deltaY != -1;
            } else if (this.is("arrowLeft")) {
                return deltaX != 1;
            } else if (this.is("arrowUp")) {
                return deltaY != 1;
            } else if (this.is("arrowRight")) {
                return deltaX != -1;
            } else {
                return false;
            }

        case "emptyWalkable":
            return this.is("empty") && this.is("groundWalkable", deltaX, deltaY);

        case "walkable":
            return this.is("groundWalkable", deltaX, deltaY) && (this.is("empty") || this.is("tiamont"));

        default:
            return false;
    }
};

LevelCell.prototype.togglePlayerSize = function () {
    if(this.is("smallPlayer")) {
        this.char = "X";
        return true;
    } else if(this.is("bigPlayer")) {
        this.char = "x";
        return true;
    }
    return false;
};

LevelCell.prototype.erase = function () {
    this.char = " ";
    this.sprite = null;
};

LevelCell.prototype.moveFrom = function (src) {
    this.char = src.char;
    this.sprite = src.sprite;
    src.erase();
};