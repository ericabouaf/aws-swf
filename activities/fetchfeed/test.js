var worker = require('./fetchfeed').worker;

worker({

    config: {
        input: JSON.stringify({
            URL: "http://www.lemonde.fr/rss/une.xml"
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }

});

