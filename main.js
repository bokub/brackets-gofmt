/*jslint vars: true, nomen: true, devel: false*/
/*global define, brackets, $*/

define(function (require, exports, module) {
    "use strict";

    // Brackets modules
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
        Mustache = brackets.getModule("thirdparty/mustache/mustache"),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        Commands = brackets.getModule("command/Commands"),
        FileUtils = brackets.getModule("file/FileUtils");

    // Local modules
    var SettingsDialog  = require("src/SettingsDialog"),
        Preferences     = require("src/Preferences"),
        Strings         = require("strings");

    // Start node
    var node = new NodeConnection();

    // Load CSS
    ExtensionUtils.loadStyleSheet(module, "styles/gofmt.less");

    var GFT_CMD_ID = "gofmt.runfmt",
        GFT_SETTINGS_CMD_ID = "gofmt.settings",
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

        var errorDialogTemplate = require("text!templates/error-dialog.html");
        var compiledTemplate = Mustache.render(errorDialogTemplate, {
            title: Strings.ERROR_TITLE,
            error: errorMessage,
            Strings: Strings
        });

        Dialogs.showModalDialogUsingTemplate(compiledTemplate).done(function (buttonId) {
            if (buttonId === "settings") {
                CommandManager.execute(GFT_SETTINGS_CMD_ID);
            }
        });

        endGoFmt();
    }

    /** Adds colors and <br> tags to a gofmt error message */
    function formatGoErrors(message) {
        var colorTheme = ThemeManager.getCurrentTheme().dark ? "dark" : "light";
        return ('<span class="go-errors ' + colorTheme + '">') +
            message.replace(/(\S+)\.f\.tmp\:(\d*?\:\d*?)\:/g,
                            '<span class="file-name">$1</span><span class="line-number">&nbsp;$2&nbsp; </span>')
            .replace(/\n/g, '<br>') + '</span>';
    }

    /** Calls gofmt to format file */
    function formatFile(tmpFile, tmpFilePath, fileBody, callback) {
        tmpFile.exists(function (err, exists) {
            if (!exists) {
                tmpFile.write(fileBody);
                node.domains.gofmt.formatFile(tmpFilePath, Preferences.get('gofmtPath')).done(function (data) {
                    var index = data.indexOf('gofmt');
                    if (index !== -1 && index < 15) {
                        tmpFile.unlink();
                    } else if (data.match(/\.f\.tmp\:\d*?\:\d*?\:/)) {
                        showErrorDialog(formatGoErrors(data));
                    } else {
                        callback(data);
                    }
                    tmpFile.unlink();
                });
            } else {
                tmpFile.unlink();
                endGoFmt();
            }
        });
    }

    /** Calls goimports to automatically add/remove imports */
    function autoImport(tmpFile, tmpFilePath, fileBody, callback) {
        tmpFile.exists(function (err, exists) {
            if (!exists) {
                tmpFile.write(fileBody);

                var goImports =  Preferences.get('goimportsPath');
                var goPath = Preferences.get('goPath');
                node.domains.goimports.autoImports(tmpFilePath, goImports, goPath).done(function (data) {
                    var index = data.indexOf('goimports');
                    if (index !== -1 && index < 30) {
                        showErrorDialog(data);
                    } else if (data.match(/\.i\.tmp\:\d*?\:\d*?\:/)) {
                        showErrorDialog(data);
                    } else {
                        callback(data);
                    }
                    tmpFile.unlink();
                });
            } else {
                tmpFile.unlink();
                endGoFmt();
            }
        });
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

        var extension = FileUtils.getFileExtension(currentDocument.file._path);
        if (extension !== "go") {
            showErrorDialog(Strings.ERROR_NOT_GO_FILE, {language: currentDocument.language._name});
            return;
        }

        if (!editor.document) {
            endGoFmt();
            return;
        }

        if (typeof node.domains.gofmt === "undefined" || typeof node.domains.goimports === "undefined") {
            // Happens sometimes (when brackets has a critical problem)
            endGoFmt();
            return;
        }

        var cursorPos = editor.getCursorPos(),
            fileBody = editor.document.getText(),
            useAutoImport = Preferences.get('useGoImports');

        var tmpFilePathFormat = currentDocument.file._path + '.f.tmp';
        var tmpFileFormat = FileSystem.getFileForPath(tmpFilePathFormat);
        var tmpFilePathImport = currentDocument.file._path + '.i.tmp';
        var tmpFileImport;

        if (useAutoImport) {
            tmpFileImport = FileSystem.getFileForPath(tmpFilePathImport);
        }

        formatFile(tmpFileFormat, tmpFilePathFormat, fileBody, function (formatted) {
            if (useAutoImport) {
                autoImport(tmpFileImport, tmpFilePathImport, formatted, function (imported) {
                    editor.selectAllNoScroll();
                    editor.document.setText(imported);
                    editor.setCursorPos(cursorPos.line, cursorPos.ch, true);
                    endGoFmt();
                });
            } else {
                editor.selectAllNoScroll();
                editor.document.setText(formatted);
                editor.setCursorPos(cursorPos.line, cursorPos.ch, true);
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
    }

    if (!node.domains.gofmt || !node.domains.goimports) {
        node.connect(true).done(function () {
            var gofmtPath = ExtensionUtils.getModulePath(module, 'node/gofmt.js');
            var goimportsPath = ExtensionUtils.getModulePath(module, 'node/goimports.js');

            node.loadDomains([gofmtPath, goimportsPath], true).done(function () {
                AppInit.appReady(initGoFmt);
            });
        });
    } else {
        AppInit.appReady(initGoFmt);
    }

    // Register commands and add them to the menu.
    CommandManager.register(Strings.FORMAT_THIS_FILE, GFT_CMD_ID, handleIconClick);
    CommandManager.register(Strings.SETTINGS_CMD, GFT_SETTINGS_CMD_ID, SettingsDialog.show);

    var editMenu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    var fileMenu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);

    fileMenu.addMenuItem(GFT_SETTINGS_CMD_ID, [], Menus.AFTER, Commands.FILE_PROJECT_SETTINGS);
    editMenu.addMenuItem(GFT_CMD_ID, [
        {key: Preferences.get('gofmtShortcut')}
    ]);

});
