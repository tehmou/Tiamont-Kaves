var tiamontLevelCodec = function () {
    return {
        encodeLevel: function (level) {
            var result = "?name=" + escape(level.name) + "&" + "stringData=" + escape(level.stringData);
            return result;
        },
        decodeLevel: function (string) {
            var vars = string.split(/\&/g);
            var result = {};
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                result[pair[0]] = unescape(pair[1]);
            }
            return result;
        }
    };

}()