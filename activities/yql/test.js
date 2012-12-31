var worker = require('./yql').worker;

worker({

    config: {
        input: JSON.stringify({
            yqlquery: "SELECT * FROM slideshare.slideshows WHERE user='jcleblanc'",
            diagnostics: "true",
            envURL: "http://datatables.org/alltables.env"
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(JSON.stringify(results, null, 3));
    }

});

