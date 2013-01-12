
// step1 -> step2 -> terminate

schedule({
    name: 'step1',
    activity: 'hello-activity'
});


schedule({
    name: 'step2',
    after: 'step1',
    activity: 'echo',
    input: results('step1')
});


stop({
    after: 'step2',
    result: "finished !"
});
