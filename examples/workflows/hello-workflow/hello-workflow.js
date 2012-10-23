// step1 -> step2 -> step3 -> terminate


if (just_started) {

   schedule('step1', {
      activityType: 'echo',
      input: workflow_input()
   });

}
else if( completed('step1') && !scheduled('step2')  ) {

   schedule('step2', {
      activityType: 'sum',
      input: results('step1')
   });

}
else if( completed('step2') && !scheduled('step3')  ) {

   schedule('step3', {
      activityType: 'hello-activity',
      input: {
            from: "Eric Abouaf <eric.abouaf@gmail.com>", // sender address
            to: "eric.abouaf@gmail.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world ✔", // plaintext body
            html: "<b>Hello world : </b>"+results('step2') // html body
         }
      });

}
else if( completed('step3')  ) {
   stop("finished !");
}
