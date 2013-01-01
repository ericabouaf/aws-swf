
// Create a server
ec2.runInstances({
   name: 'step1'
}, { 
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
     /*,"SecurityGroups": ["quick-start-1"]*/
   }
});

// Sleep
sleep({
   name: 'step2',
   after: {
      step1: COMPLETED
   }
}, { 
   input: {
      delay: 10000
   }
});

// Close the server
ec2.terminateInstances({
   name: 'step3',
   after: {
      step2: COMPLETED
   }
}, { 
   input: function() {
      var instanceId = results('step1').instancesSet.item.instanceId;
      return { InstanceIds: [instanceId] };
   }
});


stop({
   after: {
      step3: COMPLETED
   }
}, 'Everything is good !');
