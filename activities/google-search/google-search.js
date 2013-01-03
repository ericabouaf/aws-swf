var htmlparser = require('htmlparser'),
    request = require('request'),
    querystring = require('querystring');

// Generate a string from a structure as output by htmlparser
var domNodeToString = function(node) {
   
   if (node.type == "text") {
      return node.data;
   }
   else if(node.type == "tag") {
      
      var pre = "<"+node.name,
          post = "</"+node.name+">";
      
      for(var attribName in node.attribs) {
         if(attribName != "style") { // Hack to remove style="..."
            pre += " "+attribName+"=\""+node.attribs[attribName]+"\"";
         }
      }
      pre += ">";
      
      if(node.children) {
         node.children.forEach(function(c) {
            pre += domNodeToString(c);
         });
      }
      return pre+post;
   } 
};

// Generate the result set from the dom returned by htmlparser
formatGoogleResponse = function(dom) {
   
    var results = [], nResults;
    
    var walk = function(node_list, indent) {
       
       for(var i = 0 ; i < node_list.length ; i++) {
          var node = node_list[i];
             
          if(!!node.attribs && !!node.attribs.id) {
                  if(node.attribs.id == "resultStats") {
                       try {
                          nResults =  node.children[0].data;
                       }catch(ex) {}
                       // TODO: get # of results
                  }
                  
                  if(node.attribs.id == "ires") {
                       //console.log(indent+JSON.stringify(node.children[0].children));
                       try {
                          results = node.children[0].children;
                       }catch(ex) {}
                  }
          }
          
          // Recurse :
          if(node.children) {
             walk(node.children, indent+"  ");
          } 
       }
    };
    walk(dom, "");
    
    
    
    var formatted = [];
    
    results.forEach(function(r) {
       
       // Title
       var htmlTitle = domNodeToString({
          type: 'tag',
          name: 'h3',
          children: r.children[0].children[0].children
       });
       
       // Content & description
       var htmlSnippet, links;
       if(r.children.length > 1) {
          
          var node = r.children[1];
          
          // Parse the "classic" case
          if(node.type == "tag" && node.name == "div" && !!node.attribs && node.attribs["class"] == "s") {
             
             htmlSnippet = domNodeToString({
                type: 'tag',
                name: 'div',
                children: r.children[1].children.slice(0,-1)
             });
             
             links = domNodeToString({
                type: 'tag',
                name: 'div',
                children: [r.children[1].children[r.children[1].children.length - 1] ]
             });
             
          }
          else {
             htmlSnippet = domNodeToString(r.children[1]);
          }
          
       }
       
       // URL
       var titleLink = r.children[0].children[0].attribs.href; // /url?
       var par = {};
       if(titleLink) {
          par = querystring.parse(titleLink.substr(5));
       }
       
       // Push result
       formatted.push({
          
          link: par.q,
          
          htmlTitle: htmlTitle,
          title: htmlTitle.replace(/<(?:.|\n)*?>/gm, ''),
          
          htmlSnippet: htmlSnippet,
          snippet: htmlSnippet ? htmlSnippet.replace(/<(?:.|\n)*?>/gm, '') : '',
          links: links
          
          // TODO:  
          // "host": "ww.myhost.com",
          //"mime": "application/pdf",
          //"fileFormat": "PDF/Adobe Acrobat"
       });
       
    });
    
    var i;
    if(nResults) {
      i = parseInt(nResults.match(/ ([\d, ]+) /)[1].replace(/[ ,]/g,''),10);
   }
    
    return {
        nResults: nResults,
        i: i,
        results: formatted
     };
};






exports.worker = function (task) {

   var input = JSON.parse(task.config.input);
   
   var p = {
     //sourceid: 'chrome',
     //ie: 'UTF-8',
     q: input.q,
     hl: input.hl || 'en'
     //,start: 10
   };
   
   
   if(input.start) {
      p.start = input.start;
   }
   if(input.sourceid) {
      p.sourceid = input.sourceid;
   }

   var url = 'http://www.google.com/search?'+querystring.stringify(p);

   // TODO: don't use request, make HTTP request by hand
   request(url, function (error, response, body) {
      if (error) {
         console.log(error);
         // TODO: task fail !
      }
      else if (response.statusCode == 200) {

         var handler = new htmlparser.DefaultHandler(function (error, dom) {
             if (error) {
                console.log(error);
             }
             else {
                var results = formatGoogleResponse(dom);
                
                task.respondCompleted(results);
                
             }
         }, { 
            verbose: false, 
            ignoreWhitespace: true 
         });
         var parser = new htmlparser.Parser(handler);
         parser.parseComplete(body);

        
     }

   });
   
};
