// step1 -> step2 -> terminate

exports.workflow = function(dt) {

   if( dt.just_started() ) {
   
      dt.schedule('step1', {
         activityType: 'hello-activity',
         input: {
             from: "Eric Abouaf <eric.abouaf@gmail.com>",
             to: "Eric Abouaf <eric.abouaf@gmail.com>",
             subject: "two-step decider",
             text: "",
             html: "<b>Super !</b>"
         }
      });
   
   }
   else if( dt.completed('step1') && !dt.scheduled('step2')  ) {
      
      dt.schedule('step2', {
         activityType: 'sum',
         input: {
            a: 4, 
            b: 6
         }
      });
   
   }
   else if( dt.completed('step2')  ) {
      dt.stop("finished !");
   }
   
};