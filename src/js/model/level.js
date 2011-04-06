var levelCreator = function(json) {
    var name, levelData,
        readMirroredData = function (value) {
            var i, n, line,
                data = [], width = 0, height = 0;
            for (i = 0; i < value.length; i++) {
                line = value[i];
                for (n = 0; n < line.length; n++) {
                    if(!data[n]) {
                        data[n] = [];
                    }
                    data[n][i] = new LevelCell({
                        char: line.charAt(n)
                    });
                    width = Math.max(width, n + 1);
                    height = Math.max(height, i + 1);
                }
            }
            return { data: data, width: width, height: height};
        },
        loadFromJSON = function (json) {
            name = json.name;
            if(json.stringData) {
                json.mirroredData = json.stringData.replace(/_/g, " ").split("\n");
            }
            if(json.mirroredData) {
                return readMirroredData(json.mirroredData);
            }
            return {};
        };

        var data = loadFromJSON(json);
        levelData = levelDataContainerCreator(data);

    return {
        getLevelData: function() {
            return levelData;
        },
        getName: function() { return name; }
    };
    
};