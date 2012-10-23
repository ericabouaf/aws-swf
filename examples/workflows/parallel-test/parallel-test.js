// sum, sleep -> echo -> terminate

if( just_started ) {

      // schedule step1(sum) and step2(sleep) in parallel
      
      schedule('step1', { activityType: 'sleep' });
      
      schedule('step2', {
         activityType: 'sum',
         input: {
            a: 4, 
            b: 6
         }
      });
      
   }
   else if( !completed('step1') || !completed('step2') ) {

      waiting_for('step1','step2');
      
   }
   
   // When both step have completed, schedule step3
   
   else if( completed('step1', 'step2') && !scheduled('step3') ) {

      schedule('step3', {
         activityType: 'echo',
         input: 'this will be echoed...'
      });
      
   }
   else if( completed('step3')  ) {

      stop("All done !");
      
   }
