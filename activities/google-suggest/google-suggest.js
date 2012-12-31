var http=require('http'),
   querystring = require('querystring');

/**
 * TODO: use request ?
 * TODO: implement lang (fr)
 */
 
// TODO: config
/*var HOST = '127.0.0.1',
    PORT = 8080,
    PATH = '/google/s?q=';*/
    var HOST = 'www.google.com',
        PORT = 80,
        PATH = '/s?';

suggest = exports.suggest = function(q, cb) {
   
   //console.log("Google suggest : "+q);
   
   var req = http.request({
      host: HOST,
      port: PORT,
      path: PATH+querystring.stringify({ q: q }), 
      method: 'GET'
    }, function(res) {
     res.setEncoding('utf8');
     var body = "";
     res.on('data', function (chunk) { body += chunk; });
     res.on('end', function() {
        body = body.substr(19, body.length-19-1); // remove the jsonp callback
        try {
           var items = JSON.parse(body)[1].map(function(k) { return k[0]; });
        }
        catch(ex) {
           // TODO;
        }
        
        cb(items, null);
     });
   });
   req.on('error', function(e) { cb(null, e); });
   req.end();
};

deep_suggest = exports.deep_suggest = function(q, cb) {
   var i = 0;
   var next = function(items, cb) {
      if(i == 26) cb(items);
      else suggest(q+"+"+String.fromCharCode(97+(i++)), function(r, err) {
         
         //console.log(r);
         
         next(items.concat(r), cb);
      });
   };
   next([], cb);
};





exports.worker = function (task) {

   var input = JSON.parse(task.config.input);


/*deep_suggest("roger%20federer", function(results, err) {
   
   console.log(results);
   
});*/

   var meth = input.deep ? deep_suggest : suggest;

   meth(input.q, function(results, err) {
      
      task.respondCompleted({
         results: results
      });

   });


}

