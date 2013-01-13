
// Create a server
schedule({
   name: 'step1',
   activity: 'ec2_runInstances',
   input: {
      ImageId: "ami-de46b4b7",
      MinCount: 1,
      MaxCount: 1,
      UserData: "This is some cool user data\nOuyeah\n",
      InstanceType: "m1.small",
      KeyName: "quickflow",
      Monitoring: {
         Enabled: false
      }
   }
});

// Use a SWF Timer
start_timer({
   name: 'step2',
   delay: 60,
   after: 'step1'
});

// Close the server
schedule({
   name: 'step3',
   activity: 'ec2_terminateInstances',
   after: 'step2',
   input: function() {
      var instanceId = results('step1').instancesSet.item.instanceId;
      return { InstanceIds: [instanceId] };
   }
});

stop({
   after: {
      step3: COMPLETED
   },
   result: 'Everything is good !'
});

