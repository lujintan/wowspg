var wow = {};

(function() {
    var wowGlobalData = {};

    wow.define = function(key, val, scope) {
        var keyVal;
        if (typeof key == 'string') {
            keyVal = {};
            keyVal[key] = val;
            scope = scope || 'p';
        } else {
            keyVal = key;
            scope = val || 'p';
        }
        if (scope == 'g') {
            for (var k in keyVal) {
                if (keyVal.hasOwnProperty(k)) {
                    wowGlobalData[k] = keyVal[k];
                }
            }
        } else {}
    };
    wow.data = function(key, scope) {
        var scope = scope || 'p';
        if (scope == 'g') {
            return wowGlobalData[key];
        } else {}
    };
})();
