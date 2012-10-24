/*globals just_started,schedule,scheduled,completed,workflow_input,stop,results,waiting_for */

// step1 -> step2 -> step3 -> terminate

if (just_started) {

    schedule('step1', {
        activityType: 'echo',
        input: workflow_input()
    });

} else if (completed('step1') && !scheduled('step2')) {

    schedule('step2', {
        activityType: 'sum',
        input: results('step1')
    });

} else if (completed('step2') && !scheduled('step3')) {

    schedule('step3', {
        activityType: 'hello-activity',
        input: {}
    });

} else if (completed('step3')) {
    stop("finished !");
}
