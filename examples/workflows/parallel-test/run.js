// sum, sleep -> echo -> terminate

exports.workflow = function(dt) {

   if( dt.has_workflow_just_started() ) {
   
      // schedule step1(sum) and step2(sleep) in parallel
      dt.schedule([
         {
            "activityId": "step1",
            "activityType":{ "name":"sleep", "version":"1.0" },
            "input": "",
            "taskList":{ "name":"today19-tl" }
         },
         {
            "activityId": "step2",
            "activityType":{ "name":"sum", "version":"1.0" },
            "input": JSON.stringify({a: 4, b: 6}),
            "taskList":{ "name":"today19-tl" }
         }
      ], function(err, results) {
         if(err) { console.error(err, results); return; }
         console.log("Step1 and Step2 scheduled !");
      });
   
   }
   else if( !dt.has_activity_completed('step1') || !dt.has_activity_completed('step2') ) {
      dt.respondCompleted([], function(err, results) {
          if(err) { console.error(err, results); return; }
          console.log("No decision taken... waiting for step1 AND step2 to complete...");
      });
   }
   // When both step have completed, schedule step3
   else if( dt.has_activity_completed('step1') && dt.has_activity_completed('step2') && !dt.is_activity_scheduled('step3')  ) {
   
      dt.schedule({
         "activityId": "step3",
         "activityType":{ "name":"echo", "version":"1.0" },
         "input": "this will be echoed...",
         "taskList":{ "name":"today19-tl" }
      }, function(err, results) {
          if(err) { console.error(err, results); return; }
          console.log("Step 3 scheduled !");
      });
   
   }
   else if( dt.has_activity_completed('step3')  ) {
   
      dt.complete_workflow_execution("finished !", function(err, result) {
         if(err) { console.error(err); return; }
         console.log("Workflow marked as finished !");
      });
   
   }
   else {

      dt.fail_workflow_execution("Don't know what to do...", "more debug infos....", function(err) {
         if(err) { console.error(err); return; }
         console.log("Workflow marked as failed !");
      });

   }

};