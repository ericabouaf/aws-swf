
schedule({
    name: 'step1',
    activity: 'humantask',
    //activity: 'mturk_createHit',

    input: {

          title : "Vote on Text Improvement",
          description : "Decide which two small paragraphs is closer to a goal.",
          reward : 0.01,
          duration: 3600, // 1 hour
          maxAssignments : 1,

          /*questionXML : '<ExternalQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2006-07-14/ExternalQuestion.xsd">'+
                        '<ExternalURL>https://s3.amazonaws.com/test-aws-swf/temp.html</ExternalURL>'+
                        '<FrameHeight>500</FrameHeight>'+
                        '</ExternalQuestion>',*/

            // or

          /*externalURL: 'https://s3.amazonaws.com/test-aws-swf/temp.html',
          frameHeight: 600*/

          // or template

        "email-notification": {
            to: "eric.abouaf@gmail.com",
            subject: "Ceci est un test !"
        },

        "data": [{label: "this"},{label: "list"}, {label: "is"}, {label: "templated"}],

        template: "<h1>Default humantask template</h1>"+
                "<ul>"+
                  "{{#data}}<li>{{label}}</li>{{/data}}"+
                "</ul>"+
                "<img src='http://groups.csail.mit.edu/uid/turkit/www/nut_people.jpg' alt='description not available'></img>"+
                "<fieldset>"+
                  "<legend>Legend</legend>"+
                  "<label>Label name</label>"+
                  "<input type='text' placeholder='Type something...' name='firstfield'>"+
                  "<span class='help-block'>Example block-level help text here.</span>"+
                  "<label class='checkbox'>"+
                  "<input type='checkbox' name='mybool'> Check me out"+
                  "</label>"+
                  "<button type='submit' class='btn btn-primary'>Submit</button>"+
                  "</fieldset>"
    }
}, {
      // No timeout
      heartbeatTimeout: "NONE",
      scheduleToCloseTimeout: "NONE",
      scheduleToStartTimeout: "NONE",
      startToCloseTimeout: "NONE"
   });

stop({
    after: 'step1',
    result: "finished !"
});
