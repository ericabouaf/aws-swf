var worker = require('./soap').worker;

worker({

    config: {
        input: JSON.stringify({
            wsdlURL: "http://www.ovh.com/soapi/soapi-re-1.36.wsdl",
            soapMethod: "login",
            soapParams: {
                nic: "XXXX-ovh",
                password: "XXXX",
                language: 'fr',
                multisession: false
            }
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);

        worker({

            config: {
                input: JSON.stringify({
                    wsdlURL: "http://www.ovh.com/soapi/soapi-re-1.36.wsdl",
                    soapMethod: "domainList",
                    soapParams: {
                        session: results["return"] // sessionId
                    }
                })
            },

            respondCompleted: function (results) {
                console.log("Done !");
                console.log(results);
            }

        });

    }

});

