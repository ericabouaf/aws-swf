
/**
 * Important: this code is just plain AWS SDK
 * No need for aws-swf to register domains/workflows/activities
 */

var awsswf = require('../index'),
    swf = awsswf.createClient();

swf.client.registerDomain({
    name: "test-domain",
    description: "this is a just a test domain",
    workflowExecutionRetentionPeriodInDays: "1"
}, function (err, results) {

    if (err && err.code != 'DomainAlreadyExistsFault') {
        console.log("Unable to register domain: ", err);
        return;
    }

    console.log("'test-domain' registered !")

    swf.client.registerWorkflowType({
        domain: "test-domain",
        name: "simple-workflow",
        version: "1.0"
    }, function (err, results) {

        if (err && err.code != 'TypeAlreadyExistsFault') {
            console.log("Unable to register workflow: ", err);
            return;
        }

        console.log("'simple-workflow' registered !")

        swf.client.registerActivityType({
            domain: "test-domain",
            name: "simple-activity",
            version: "1.0"
        }, function (err, results) {

            if (err && err.code != 'TypeAlreadyExistsFault') {
                console.log("Unable to register activity type: ", err);
                return;
            }
            
            console.log("'simple-activity' registered !");
        });
        
    });

});
