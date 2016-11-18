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
        node = new NodeConnection(),
        Strings = require("strings"),
        GFT_CMD_ID = "gofmt.runfmt";

    function endGoFmt() {
        var icon = $('#gofmt-icon');
        icon.addClass('easeOut');
        icon.removeClass('on');
    }

    function initGoFmt() {
        var icon = $("<a  href='#' id='gofmt-icon'> </a>");
        icon.attr("title", Strings.FORMAT_THIS_FILE);
        icon.on("click", handleIconClick);
        icon.appendTo($("#main-toolbar").find(".buttons"));
        ExtensionUtils.loadStyleSheet(module, "styles/gofmt.css");
    }

    function startGoFmt() {
        var editor = EditorManager.getFocusedEditor(),
            currentDocument = DocumentManager.getCurrentDocument();

        if (currentDocument.language._name === 'Golang') {
            if (editor && editor.document) {
                var cursorPos = editor.getCursorPos(),
                    fileBody = editor.document.getText();

                var tmpFilePath = currentDocument.file._path + '.tmp';
                var tmpFile = FileSystem.getFileForPath(tmpFilePath);

                tmpFile.exists(function (err, exists) {
                    if (!exists) {
                        tmpFile.write(fileBody);
                        node.domains.gofmt.formatFile(tmpFilePath).done(function (data) {
                            if (data.match(/gofmt: command not found/)) {
                                Widgets.showModalDialog(
                                    brackets.DIALOG_ID_SAVE_CLOSE,
                                    Strings.MISSING_GOFMT_TITLE,
                                    Strings.MISSING_GOFMT_BODY_1 +
                                    Strings.MISSING_GOFMT_BODY_2 +
                                    "<br><br><input style='width:100%' value='sudo ln -s /usr/local/go/bin/gofmt /usr/bin/gofmt'><br><br>" +
                                    Strings.MISSING_GOFMT_BODY_3
                                );
                            } else if (data.match(/\.tmp\:\d*?\:\d*?\:/)) {
                                Widgets.showModalDialog(
                                    brackets.DIALOG_ID_SAVE_CLOSE,
                                    Strings.MISSING_GOFMT_ERROR,
                                    data
                                );
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
                    }
                });
            }
        }
    }

    function handleIconClick() {
        var icon = $('#gofmt-icon');
        icon.removeClass('easeOut');
        if (!icon.hasClass('on')) {
            icon.addClass('on');
        }
        startGoFmt();
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