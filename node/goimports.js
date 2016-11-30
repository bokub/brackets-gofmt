(function () {

    var child_process = require('child_process');

    exports.init = function (domainManager) {
        if (!domainManager.hasDomain("goimports")) {
            domainManager.registerDomain("goimports", {major: 1, minor: 0});
        }
        domainManager.registerCommand('goimports', 'autoImports', autoImports, true);
    };

    function autoImports(filePath, callback) {
        var command = 'goimports "' + filePath + '"';
        child_process.exec(command, function (err, stdout, stderr) {
            callback(null, stderr + stdout);
        });
    }

}());
