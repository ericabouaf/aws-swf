var jsdom = require("jsdom");

var toStruct = function (node, relativepath, fullpath) {
    var h = {}, i;
    for (i = 0; i < node.attributes.length; i += 1) {
        var attrName = node.attributes[i].name,
            attrValue = node.attributes[i].value;
        // if href or src
        if (attrName === 'src' || attrName === 'href') {
            // fix relative or full paths
            if (attrValue[0] === '/') {
                attrValue = fullpath + attrValue;
            } else {
                attrValue = relativepath + attrValue;
            }
        }
        h[attrName] = attrValue;
    }

    for (i = 0; i < node.childNodes.length; i += 1) {
        if (node.childNodes[i].attributes) {
            h[node.childNodes[i].tagName.toLowerCase()] = toStruct(node.childNodes[i], relativepath, fullpath);
        }
    }

    return h;
};


exports.worker = function (task, config) {

    var input = JSON.parse(task.config.input);

    jsdom.env(
        input.URL,
        [],
        function (errors, window) {

            var result = window.document.evaluate(input.xpath, window.document, null, 7, null);

            var l = result.snapshotLength, i;

            var relativepath = String(window.document.location),
                fullpath = window.document.location.protocol + '//' + window.document.location.host;

            var results = [];
            for (i = 0; i < l; i += 1) {
                var r = result.snapshotItem(i);
                results.push(toStruct(r, relativepath, fullpath));
            }

            task.respondCompleted({
                results: results
            });

        }
    );

};
