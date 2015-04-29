(function () {

    var child_process = require('child_process');

    exports.init = function (domainManager) {
        if (!domainManager.hasDomain("gofmt")) {
            domainManager.registerDomain("gofmt", {major: 1, minor: 0});
        }
        domainManager.registerCommand('gofmt', 'formatFile', formatFile, true);
    };

    function formatFile(filePath, callback) {
        var command = 'gofmt "' + filePath + '"';
        child_process.exec(command, function (err, stdout, stderr) {
            callback(null, stderr + stdout);
        });
    }

}());
