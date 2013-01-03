var PageRank = require('pagerank');


new PageRank("http://www.clicrdv.com", function(error, pageRank) {
    console.log(error, pageRank);
});