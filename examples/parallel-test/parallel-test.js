
schedule({
    name: 'step1',
    activity: 'sleep'
});

schedule({
    name: 'step2',
    activity: 'sum',
    input: {
        a: 4,
        b: 6
    }
});

schedule({
    name: 'step3',
    after: ['step1', 'step2'],
    activity: 'echo',
    input: 'this will be echoed...'
});

stop({
    after: 'step3',
    result: {
        "step1": results('step1'),
        "step2": results('step2'),
        "step3": results('step3')
    }
});

