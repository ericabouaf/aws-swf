
var worker = require('./temboo').worker;

var config = require('./config');

var task = {

    config: {
        input: JSON.stringify({
            choreo: "/Library/Twitter/Search/SearchFilter",
            inputs: {
                SearchString: "Elvis",
                Filter: "Costello",
                ResultsPerPage: 10
            }
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }
};

worker(task, config);

