/*jslint vars: true, nomen: true, devel: false*/
/*global define, brackets, $*/

define(function (require, exports) {
    "use strict";

    // Brackets modules
    var _                       = brackets.getModule("thirdparty/lodash"),
        CommandManager          = brackets.getModule("command/CommandManager"),
        Dialogs                 = brackets.getModule("widgets/Dialogs"),
        Mustache                = brackets.getModule("thirdparty/mustache/mustache"),
        Preferences             = require("./Preferences"),
        Strings                 = require("../strings"),
        settingsDialogTemplate  = require("text!templates/settings-dialog.html");

    var dialog,
        $dialog;

    function setValues(values) {
        $("*[settingsProperty]", $dialog).each(function () {
            var $this = $(this),
                type = $this.attr("type"),
                tag = $this.prop("tagName").toLowerCase(),
                property = $this.attr("settingsProperty");
            if (type === "checkbox") {
                $this.prop("checked", values[property]);
            } else if (tag === "select") {
                $("option[value=" + values[property] + "]", $this).prop("selected", true);
            } else {
                $this.val(values[property]);
            }
        });
    }

    function collectValues() {
        $("*[settingsProperty]", $dialog).each(function () {
            var $this = $(this),
                type = $this.attr("type"),
                property = $this.attr("settingsProperty"),
                prefType = Preferences.getType(property);
            if (type === "checkbox") {
                Preferences.set(property, $this.prop("checked"));
            } else if (prefType === "number") {
                var newValue = parseInt($this.val().trim(), 10);
                if (isNaN(newValue)) { newValue = Preferences.getDefaults()[property]; }
                Preferences.set(property, newValue);
            } else {
                Preferences.set(property, $this.val().trim() || null);
            }
        });
        Preferences.save();
    }

    function assignActions() {

        // Disable GOPATH field when goimports in not selected
        $("#use-goimports", $dialog).on("change", function () {
            var on = $(this).is(":checked");
            $("#gopath", $dialog).prop("disabled", !on);
        });
        $("#gopath", $dialog).prop("disabled", !$("#use-goimports", $dialog).is(":checked"));

        // Disable goimports path when goimports in not selected
        $("#use-goimports", $dialog).on("change", function () {
            var on = $(this).is(":checked");
            $("#goimports-path", $dialog).prop("disabled", !on);
        });
        $("#goimports-path", $dialog).prop("disabled", !$("#use-goimports", $dialog).is(":checked"));

        $("button[data-button-id='defaults']", $dialog).on("click", function (e) {
            e.stopPropagation();
            setValues(Preferences.getDefaults());
            assignActions();
        });

        $("button[data-button-id='ok']", $dialog).on("click", function (e) {
            if ($("#use-goimports", $dialog).is(":checked") && $("#gopath", $dialog).val().replace(/\s/g, '') === "") {
                e.stopPropagation();
                $("#gopath", $dialog).addClass("invalid");
            }
        });
    }

    function init() {
        setValues(Preferences.getAll());
        assignActions();
    }

    function showRestartDialog() {
        var questionDialogTemplate = require("text!templates/question-dialog.html");
        var compiledTemplate = Mustache.render(questionDialogTemplate, {
            title: Strings.RESTART,
            question: _.escape(Strings.Q_RESTART_BRACKETS),
            Strings: Strings
        });
        Dialogs.showModalDialogUsingTemplate(compiledTemplate).done(function (buttonId) {
            if (buttonId === "ok") {
                CommandManager.execute("debug.refreshWindow");
            }
        });
    }

    exports.show = function () {
        var compiledTemplate = Mustache.render(settingsDialogTemplate, Strings);

        dialog = Dialogs.showModalDialogUsingTemplate(compiledTemplate);
        $dialog = dialog.getElement();

        init();

        dialog.done(function (buttonId) {
            if (buttonId === "ok") {
                // Save everything to preferences
                collectValues();
                // Restart brackets to reload changes.
                showRestartDialog();
            }
        });
    };
});
