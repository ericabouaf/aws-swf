// step1 -> step2 -> terminate

exports.workflow = function(dt) {

   if( dt.just_started() ) {
      
      dt.schedule('step1', {
         activityType: 'echo',
         input: dt.workflow_input()
      });
      
   }
   else if( dt.completed('step1') && !dt.scheduled('step2')  ) {
      
      dt.schedule('step2', {
         activityType: 'sum',
         input: dt.results('step1')
      });
      
   }
   else if( dt.completed('step2')  ) {
      dt.stop("finished !");
   }
   
};