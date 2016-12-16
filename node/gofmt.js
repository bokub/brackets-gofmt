/*global require, exports, $*/

(function () {
    "use strict";

    var child_process = require('child_process');
    
    function formatFile(filePath, gofmtPath, callback) {
        var command = gofmtPath + ' "' + filePath + '"';
        child_process.exec(command, function (err, stdout, stderr) {
            callback(null, stderr + stdout);
        });
    }

    exports.init = function (domainManager) {
        if (!domainManager.hasDomain("gofmt")) {
            domainManager.registerDomain("gofmt", {major: 1, minor: 0});
        }
        domainManager.registerCommand('gofmt', 'formatFile', formatFile, true);
    };
    
}());
