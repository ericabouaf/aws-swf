
var request = require('request'),
    xml2js = require('xml2js-expat');


var Temboo = {

    _req: function (username, password, domain, method, url, body, cb) {
        console.log(url);
        var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
        request({
            method: method,
            url: url,
            body: body,
            headers: {
                "Host": domain + ".temboolive.com",
                "Accept": "application/json",
                "x-temboo-domain": "/" + domain + "/master",
                "Content-Type": "application/json",
                'Authorization': auth
            }
        }, function (err, r, body) {
            if (err) { return cb(err); }
            var res = JSON.parse(body);
            cb(err, res);
        });

    },

    list: function (username, password, domain, cb) {
        this._req(username, password, domain, "GET", "https://" + domain + ".temboolive.com/arcturus-web/api-1.0/choreos", undefined, cb);
    },

    run: function (username, password, domain, choreo, body, cb) {
        this._req(username, password, domain, "POST", "https://" + domain + ".temboolive.com/arcturus-web/api-1.0/choreos" + choreo + "?source_id=PHPSDK_1.70", body, cb);
    },

    details: function (username, password, domain, choreo, cb) {
        this._req(username, password, domain, "GET", "https://" + domain + ".temboolive.com/arcturus-web/api-1.0/choreos" + choreo, undefined, cb);
    },

    status: function (username, password, domain, id, cb) {
        var that = this;
        this._req(username, password, domain, "GET", "https://" + domain + ".temboolive.com/arcturus-web/api-1.0/choreo-executions/" + id, undefined, function (err, res) {

            if (!!res.execution && res.execution.status !== "RUNNING") {
                that._req(username, password, domain, "GET", "https://" + domain + ".temboolive.com/arcturus-web/api-1.0/choreo-executions/" + id + "?view=outputs", undefined, cb);
            } else {
                cb(err, res);
            }
        });
    }

};


exports.worker = function (task, config) {

    var input = JSON.parse(task.config.input);

    var inputs = [], k;
    for (k in input.inputs) {
        if (input.inputs.hasOwnProperty(k)) {
            inputs.push({
                name: k,
                value: input.inputs[k]
            });
        }
    }

    Temboo.run(config.username, config.password, config.domain, input.choreo, JSON.stringify({inputs: inputs}), function (err, res) {

        if (err) {
            console.log(err);
            return;
        }

        console.log(JSON.stringify(res, null, 3));

        var parser = new xml2js.Parser();
        parser.addListener('end', function (result) {
            //console.log( JSON.stringify(result, null, 3) );

            task.respondCompleted(result, function (err) {
                if (err) { console.error(err); return; }
                console.log("temboo: respondComplete");
            });

        });
        parser.parseString(res.output.Response);
    });

};

