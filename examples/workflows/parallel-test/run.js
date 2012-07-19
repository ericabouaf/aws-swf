// sum, sleep -> echo -> terminate

exports.workflow = function(w) {

   if( w.just_started() ) {
      
      // schedule step1(sum) and step2(sleep) in parallel
      
      w.schedule('step1', {
         activityType: 'sleep',
         taskList: 'today19-tl'
      });
      
      // TODO: don't schedule the activity yet wait for the end of the process (in decider-worker) to see if there are multiple activities to send
      
      w.schedule('step2', {
         activityType: 'sum',
         input: {
            a: 4, 
            b: 6
         },
         taskList: 'today19-tl'
      });
      
   }
   else if( !w.completed('step1') || !w.completed('step2') ) {
      
      w.waiting_for('step1','step2'); // TODO: should throw an exception if any step cannot complete anywhere, and fail the workflow
      
   }
   
   // When both step have completed, schedule step3
   
   else if( w.completed('step1', 'step2') && !w.scheduled('step3') ) {
      
      w.schedule('step3', {
         activityType: 'echo',
         input: 'this will be echoed...',
         taskList: 'today19-tl'
      });
      
   }
   else if( w.completed('step3')  ) {
      
      w.stop("All done !");
      
   }
   else {
      w.fail("Don't know what to do...");
   }

};