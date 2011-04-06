var levelDataContainerCreator = function (options) {
    var data = options.data,
        width = options.width,
        height = options.height;

    return {
        _getDebugData: function () { return data; },
        getWidth: function () { return width; },
        getHeight: function () { return height; },
        eachCell: function (f) {
            var x, y;
            for (x = 0; x < data.length; x++) {
                for (y = 0; y < data[x].length; y++) {
                    f.apply(data[x][y], [x, y, data[x][y]]);
                }
            }
        },
        isInsideBounds: function (pos) {
            return pos && pos.x >= 0 && pos.y >= 0 && pos.x < width && pos.y < height;
        },
        getCell: function (pos) {
            if (this.isInsideBounds(pos)) {
                return data[pos.x][pos.y];
            } else {
                return null;
            }
        },
        is: function (kind, pos) {
            var cell;
            if(!kind || kind === "") {
                return false;
            }
            cell = this.getCell(pos);
            return cell && cell.is(kind, pos.deltaX, pos.deltaY);
        },
        moveFromTo: function(fromPos, toPos) {
            var fromCell = this.getCell(fromPos),
                toCell = this.getCell(toPos);
            if (fromCell && toCell) {
                toCell.moveFrom(fromCell);
            }
        },
        erase: function (pos) {
            var cell = this.getCell(pos);
            cell && cell.erase();
        },
        togglePlayerSize: function (pos) {
            var cell = this.getCell(pos);
            cell && cell.togglePlayerSize();
        },
        countOf: function (kind) {
            var num = 0;
            this.eachCell(function (x, y, cell) {
               if (cell.is(kind)) {
                   num++;
               }
            });
            return num;
        },
        setAnimation: function (type, pos) {
            var cell = this.getCell(pos);
            if (cell && cell.hasOwnProperty("sprite") && cell.sprite.hasOwnProperty("nextAnimation")) {
                cell.sprite.nextAnimation = type;
            }
        }
    };
};