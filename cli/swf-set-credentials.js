#!/usr/bin/env node

var colors = require('colors'),
    fs = require('fs'),
    path = require('path');

function ask(question, callback) {
    var stdin = process.stdin, stdout = process.stdout;
    stdin.resume();
    stdout.write(question + ": ");
    stdin.once('data', function (data) {
        data = data.toString().trim();
        callback(data);
    });
}

var configFilePath = path.join(__dirname, '..', 'config.js');

console.log("To simplify the use of aws-swf, please enter your credentials below.".blue);
console.log(("They will be stored in " + configFilePath + ", you can always edit them later by calling '[sudo] swf-set-credentials'").blue);

// ask for awsCredentials
ask("Enter your AWS accessKeyId", function (accessKeyId) {
    ask("Enter your AWS secretAccessKey", function (secretAccessKey) {
        ask("default domain [aws-swf-test-domain]", function (domain) {
            ask("default tasklist [aws-swf-tasklist]", function (tasklist) {

                var o = {
                    accessKeyId: accessKeyId,
                    secretAccessKey: secretAccessKey,
                    domain: domain || "aws-swf-test-domain",
                    tasklist: tasklist || "aws-swf-tasklist"
                };

                var content = "", k;
                for (k in o) {
                    if (o.hasOwnProperty(k)) {
                        content += "exports." + k + " = " + JSON.stringify(o[k]) + ";\n";
                    }
                }

                fs.writeFile(configFilePath, content, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("The config file was saved !".blue);
                    }

                    process.exit(0);
                });

            });
        });
    });
});

