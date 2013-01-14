
var template = "<h1>Default humantask template</h1>"+
                  "<ul>"+
                    "{{#data}}<li>{{label}}</li>{{/data}}"+
                  "</ul>"+
                  "<input type='text' name='samplefield' value='Complete !' />"+
                  "<input type='submit' class='btn btn-primary' value='Complete !' />";

schedule({
    name: 'step1',
    activity: 'humantask',
    input: {
        "email-notification": {
            to: "eric.abouaf@gmail.com",
            subject: "Ceci est un test !"
        },
        "this": "is",
        "data": [{label: "un"},{label: "deux"}, {label: "trois"}, {label: "quatre"}],

        template: template
    }
});



stop({
    after: 'step1',
    result: "finished !"
});
