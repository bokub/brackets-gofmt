/*jslint vars: true, nomen: true, devel: false*/
/*global define, brackets, $*/

define(function (require, exports, module) {
    "use strict";

    var _                   = brackets.getModule("thirdparty/lodash"),
        PreferencesManager  = brackets.getModule("preferences/PreferencesManager"),
        StateManager        = PreferencesManager.stateManager,
        prefix              = "brackets-gofmt";

    var defaultPreferences = {
        "gofmtShortcut": {                  "type": "string",            "value": "Ctrl-Alt-F"        },
        "goPath": {                         "type": "string",            "value": ""                  },
        "useGoImports": {                   "type": "boolean",           "value": false               },
        "gofmtPath": {                      "type": "string",           "value": "/usr/bin/gofmt"     },
        "goimportsPath": {                  "type": "string",           "value": "/usr/bin/goimports" }
    };

    var prefs = PreferencesManager.getExtensionPrefs(prefix);
    _.each(defaultPreferences, function (definition, key) {
        if (definition.os && definition.os[brackets.platform]) {
            prefs.definePreference(key, definition.type, definition.os[brackets.platform].value);
        } else {
            prefs.definePreference(key, definition.type, definition.value);
        }
    });
    prefs.save();

    function get(key) {
        var location = defaultPreferences[key] ? PreferencesManager : StateManager;
        var args = arguments;
        args[0] = prefix + "." + key;
        return location.get.apply(location, args);
    }

    function set(key) {
        var location = defaultPreferences[key] ? PreferencesManager : StateManager;
        var args = arguments;
        args[0] = prefix + "." + key;
        return location.set.apply(location, args);
    }

    function getAll() {
        var obj = {};
        _.each(defaultPreferences, function (definition, key) {
            obj[key] = get(key);
        });
        return obj;
    }

    function getDefaults() {
        var obj = {};
        _.each(defaultPreferences, function (definition, key) {
            var defaultValue;
            if (definition.os && definition.os[brackets.platform]) {
                defaultValue = definition.os[brackets.platform].value;
            } else {
                defaultValue = definition.value;
            }
            obj[key] = defaultValue;
        });
        return obj;
    }

    function getType(key) {
        return defaultPreferences[key].type;
    }

    function getGlobal(key) {
        return PreferencesManager.get(key);
    }

    function save() {
        PreferencesManager.save();
        StateManager.save();
    }

    module.exports = {
        get: get,
        set: set,
        getAll: getAll,
        getDefaults: getDefaults,
        getType: getType,
        getGlobal: getGlobal,
        save: save
    };

});
