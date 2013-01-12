
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


// Sleep 10s
schedule({
   name: 'step2',
   activity: 'sleep',
   after: {
      step1: COMPLETED
   },
   input: {
      delay: 30000
   }
});


// Close the server
schedule({
   name: 'step3',
   activity: 'ec2_terminateInstances',
   after: {
      step2: COMPLETED
   },
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


