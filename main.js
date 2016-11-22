/*jslint vars: true, nomen: true, devel: false*/
/*global define, brackets, $*/

define(function (require, exports, module) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager"),
        FileSystem = brackets.getModule('filesystem/FileSystem'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        Widgets = brackets.getModule('widgets/Dialogs'),
        Menus = brackets.getModule("command/Menus"),
        AppInit = brackets.getModule("utils/AppInit"),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        NodeConnection = brackets.getModule('utils/NodeConnection'),
        ThemeManager = brackets.getModule('view/ThemeManager'),
        node = new NodeConnection(),
        Strings = require("strings"),
        GFT_CMD_ID = "gofmt.runfmt",
        running = false;

    /** Sets the icon to its original state */
    function endGoFmt() {
        var icon = $('#gofmt-icon');
        icon.addClass('easeOut');
        icon.removeClass('on');
        running = false;
    }

    /** Shows dialg with an error message */
    function showErrorDialog(errorMessage, args) {
        if (typeof args !== 'undefined') {
            var key;
            for (key in args) {
                if (args.hasOwnProperty(key)) {
                    errorMessage = errorMessage.replace("_" + key + "_", args[key]);
                }
            }
        }
        Widgets.showModalDialog(brackets.DIALOG_ID_SAVE_CLOSE, Strings.ERROR_TITLE, errorMessage);
        endGoFmt();
    }

    /** Adds colors and <br> tags to a gofmt error message */
    function formatGoErrors(message) {
        var colors = ThemeManager.getCurrentTheme().dark ? ['#c8c8c8', '#6bbeff', '#ff9d2a'] : ['#333333', '#0083e8', '#e27100'];
        return ('<span style="color:' + colors[0] + '">') +
            message.replace(/(\S+)\.tmp\:(\d*?\:\d*?)\:/g, '<span style="color:' + colors[1] + '">$1</span><span style="color:' + colors[2] + ';font-weight:bold">&nbsp;$2&nbsp; </span>')
            .replace(/\n/g, '<br>') + '</span>';
    }

    /** The main function, called when clicking the button or pressing the shortcut */
    function startGoFmt() {
        if (running) {
            return;
        }
        running = true;

        var editor = EditorManager.getFocusedEditor() || EditorManager.getActiveEditor(),
            currentDocument = DocumentManager.getCurrentDocument();
        if (currentDocument === null) {
            showErrorDialog(Strings.ERROR_NO_CURRENT_FILE);
            return;
        }
        if (currentDocument.language._name !== 'Golang') {
            showErrorDialog(Strings.ERROR_NOT_GO_FILE, {language: currentDocument.language._name});
            return;
        }

        if (!editor.document || typeof node.domains.gofmt === "undefined") {
            // Happens sometimes (when brackets has a critical problem)
            endGoFmt();
            return;
        }

        var cursorPos = editor.getCursorPos(),
            fileBody = editor.document.getText();

        var tmpFilePath = currentDocument.file._path + '.tmp';
        var tmpFile = FileSystem.getFileForPath(tmpFilePath);

        tmpFile.exists(function (err, exists) {
            if (!exists) {
                tmpFile.write(fileBody);
                node.domains.gofmt.formatFile(tmpFilePath).done(function (data) {
                    var index = data.indexOf('gofmt');
                    if (index === 0 || index === 1) {
                        showErrorDialog(data);
                    } else if (data.match(/\.tmp\:\d*?\:\d*?\:/)) {
                        showErrorDialog(formatGoErrors(data));
                    } else {
                        editor.selectAllNoScroll();
                        editor.document.setText(data);
                        editor.setCursorPos(cursorPos.line, cursorPos.ch, true);
                        endGoFmt();
                    }
                    tmpFile.unlink();
                });
            } else {
                tmpFile.unlink();
                endGoFmt();
            }
        });
    }

    /** Styles the gofmt icon */
    function handleIconClick() {
        var icon = $('#gofmt-icon');
        icon.removeClass('easeOut');
        if (!icon.hasClass('on')) {
            icon.addClass('on');
        }
        startGoFmt();
    }

    /** Adds the icon in the toolbar */
    function initGoFmt() {
        var icon = $("<a  href='#' id='gofmt-icon'> </a>");
        icon.attr("title", Strings.FORMAT_THIS_FILE);
        icon.on("click", handleIconClick);
        icon.appendTo($("#main-toolbar").find(".buttons"));
        ExtensionUtils.loadStyleSheet(module, "styles/gofmt.css");
    }

    if (!node.domains.gofmt) {
        node.connect(true).done(function () {
            var path = ExtensionUtils.getModulePath(module, 'node/gofmt.js');
            node.loadDomains([path], true).done(function () {
                AppInit.appReady(initGoFmt);
            });
        });
    } else {
        AppInit.appReady(initGoFmt);
    }

    CommandManager.register(Strings.FORMAT_THIS_FILE, GFT_CMD_ID, handleIconClick);

    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuItem(GFT_CMD_ID, [
        {key: "Ctrl-Alt-F", platform: "win"},
        {key: "Cmd-Alt-F", platform: "mac"}
    ]);

});
