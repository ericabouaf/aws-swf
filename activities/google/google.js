var google = require('google-tools');

function makeFct(name) {
   return function (task, config) {
      var params = JSON.parse(task.config.input);

      google[name](params, function(err, r) {

         if(err) {
            console.log(err);
            // TODO: task failed
            task.respondFailed('Error in google.'+name, err);
            return;
         }

         task.respondCompleted(r);
      });
   };
}

[
   "pagerank",
   "search",
   "pagerankAvg",
   "position",
   "suggest",
   "deep_suggest"
].forEach(function(m) {
   exports[m] = makeFct(m);
});
