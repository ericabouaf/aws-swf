var worker = require('./termextraction').worker;

worker({

    config: {
        input: JSON.stringify({
            // From http://www.wired.com/gadgetlab/2012/11/lost-apple-products/
            text: "ven with the somewhat muted (by Apple standards) demand for the iPad mini, Apple still had a fantastic weekend of iPad sales. It seems that even the company’s non-hits are hits. That’s not the case."+
                  "Apple’s breakthrough products are so massive that it seems everything the company does is destined to succeed. But it doesn’t take much digging to find a trail of failures and false starts. Even in recent years, there are examples of products that seemed great but never resonated with consumers, and some that seemed so destined for failure it’s hard to imagine why any company would have brought them to market."+
                  "Here are some examples of Apple veering a bit off course."
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }

});

