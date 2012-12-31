var worker = require('./feedautodiscovery').worker;

worker({

    config: {
        input: JSON.stringify({
            URL: "http://www.lemonde.fr"
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }

});

