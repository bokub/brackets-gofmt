/*global require, exports, $*/

(function () {
    "use strict";

    var child_process = require('child_process');

    function autoImports(filePath, goImportsPath, goPath, callback) {

        var command = goImportsPath + ' "' + filePath + '"';

        child_process.exec(command, {
            env: {
                GOPATH: goPath
            }
        }, function (err, stdout, stderr) {
            callback(null, stderr + stdout);
        });
    }

    exports.init = function (domainManager) {
        if (!domainManager.hasDomain("goimports")) {
            domainManager.registerDomain("goimports", {major: 1, minor: 0});
        }
        domainManager.registerCommand('goimports', 'autoImports', autoImports, true);
    };

}());
