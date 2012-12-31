
var worker = require('./xmlrpc').worker;

worker({

    config: {
        input: JSON.stringify({
            url: "http://my.wordpress-blog.com/xmlrpc.php",
            xmlrpcMethod: 'metaWeblog.newPost',
            xmlrpcParams: [0, 'my-user', 'my-p4ssword', {
                'title': "this is a test",
                'description': "content of the post",
                'mt_allow_comments': 0,  // 1 to allow comments
                'mt_allow_pings': 0,  // 1 to allow trackbacks
                'post_type': 'post',
                'mt_keywords': "cool, bada, boum",
                'categories': ["Node.js"]
            }, true]
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }
});
