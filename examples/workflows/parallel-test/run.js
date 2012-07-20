// sum, sleep -> echo -> terminate

exports.workflow = function(dt) {

   if( dt.just_started() ) {
      
      // schedule step1(sum) and step2(sleep) in parallel
      
      dt.schedule('step1', {
         activityType: 'sleep',
         taskList: 'today19-tl'
      });
      
      dt.schedule('step2', {
         activityType: 'sum',
         input: {
            a: 4, 
            b: 6
         },
         taskList: 'today19-tl'
      });
      
   }
   else if( !dt.completed('step1') || !dt.completed('step2') ) {
      
      dt.waiting_for('step1','step2');
      
   }
   
   // When both step have completed, schedule step3
   
   else if( dt.completed('step1', 'step2') && !dt.scheduled('step3') ) {
      
      dt.schedule('step3', {
         activityType: 'echo',
         input: 'this will be echoed...',
         taskList: 'today19-tl'
      });
      
   }
   else if( dt.completed('step3')  ) {
      
      dt.stop("All done !");
      
   }
   

};