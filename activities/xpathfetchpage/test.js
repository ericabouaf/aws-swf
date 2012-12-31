var worker = require('./xpathfetchpage').worker;

worker({

    config: {
        input: JSON.stringify({
            URL: "http://pinterest.com/popular/",
            xpath: "//a[@class='PinImage ImgLink']"
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(JSON.stringify(results, null, 3));
    }

});

