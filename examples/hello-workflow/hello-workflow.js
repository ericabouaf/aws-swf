/*globals just_started,schedule,scheduled,completed,workflow_input,stop,results,waiting_for */

// step1 -> step2 -> terminate

if (just_started) {

    schedule('step1', {
        activityType: 'hello-activity',
        input: {}
    });

} else if (completed('step1') && !scheduled('step2')) {

    schedule('step2', {
        activityType: 'echo',
        input: results('step1')
    });
} else if (completed('step2')) {
    stop("finished !");
}
