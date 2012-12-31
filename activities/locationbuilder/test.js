var worker = require('./locationbuilder').worker;

worker({

    config: {
        input: JSON.stringify({
            LOCATION: "Gangnam"
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }

});

