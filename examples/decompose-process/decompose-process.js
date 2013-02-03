/*global schedule,stop*/


 var tpl = '<h1>Task Identification</h1>'+

'<h3>Instructions</h3>'+

'<p>Here is a task we\'d like some info about it.</p>'+

'<p>Please answer the form for the task : <h2>{{data}}</h2></p>'+

'<fieldset>'+
'    <legend>Questions</legend>'+

'    <!-- Question 1 -->'+
'     <p>'+
'    <label>Can this task be completely automatized through software ?</label>'+
'    <label class="radio">'+
'      <input type="radio" name="automatizable" value="yes">'+
'      Yes, a software could do it'+
'   </label>'+

'   <label class="radio">'+
'      <input type="radio" name="automatizable" value="no">'+
'      no, it requires human skills'+
'   </label>'+

'   <label class="radio">'+
'      <input type="radio" name="automatizable" value="dontknow">'+
'      I don\'t know'+
'   </label>'+
'     </p>'+

//'    <span class="help-block">Example block-level help text here.</span>'+

'   <!-- Question 2 -->'+
'     <p>'+
'    <label>Can this task be split into multible sub-tasks?</label>'+
'    <label class="radio">'+
'      <input type="radio" name="splittable" value="yes">'+
'      Yes, I can express several steps to accomplish this task'+
'   </label>'+

'   <label class="radio">'+
'      <input type="radio" name="splittable" value="no">'+
'      no, this task is a 1-step process'+
'   </label>'+
'     </p>'+

'   <!-- Question 3 -->'+
'     <p>'+
'    <label>Could this task be proposed as a HIT on Amazon Mechanical Turk ?</label>'+
'    <label class="radio">'+
'      <input type="radio" name="mturkable" value="yes">'+
'      Yes, Mechanichal Turk is suitable for this task'+
'   </label>'+

'   <label class="radio">'+
'      <input type="radio" name="mturkable" value="no">'+
'      no, mechanichal Turk is not made for this kind of tasks'+
'   </label>'+
'     </p>'+

'   <!-- Question 4 -->'+
'     <p>'+
'    <label>Enter 3 keywords for this task</label>'+
'    <input type="text" name="keywords[]" placeholder="Type something..."><br />'+
'    <input type="text" name="keywords[]" placeholder="Type something..."><br />'+
'    <input type="text" name="keywords[]" placeholder="Type something..."><br />'+
'     </p>'+

/*'   <!--div class="input-prepend input-append">'+
'      <span class="add-on">$</span>'+
'      <input class="span2" id="appendedPrependedInput" type="text">'+
'   </div-->'+*/

'    <button type="submit" class="btn">Submit</button>'+

'  </fieldset>'
;




var tplSplit = '<h1>Task Identification</h1>'+

'<h3>Instructions</h3>'+

'<p>Here is a task we\'d like some info about it.</p>'+

'<p>Please answer the form for the task : <h2>{{data.taskDescription}}</h2></p>'+


'     <p>'+
'    <label>Enter steps for this task</label>'+
'    <input type="text" name="steps[]" placeholder="Type something..."><br />'+
'    <input type="text" name="steps[]" placeholder="Type something..."><br />'+
'    <input type="text" name="steps[]" placeholder="Type something..."><br />'+
'    <input type="text" name="steps[]" placeholder="Type something..."><br />'+
'    <input type="text" name="steps[]" placeholder="Type something..."><br />'+
'    <input type="text" name="steps[]" placeholder="Type something..."><br />'+
'    <input type="text" name="steps[]" placeholder="Type something..."><br />'+
'    <input type="text" name="steps[]" placeholder="Type something..."><br />'+
'     </p>'+

'<fieldset>'+

'    <button type="submit" class="btn">Submit</button>'+

'  </fieldset>'
;




var taskDescription = "Create a twitter account";


/**
 * Step 1. Task identification
 */
schedule({
    name: 'taskIdentification',
    activity: 'humantask', // 'mturk_createHit',
    input: {
      title : "Task identification",
      description : "Collect information about a task",
          
      "email-notification": {
        to: "eric.abouaf@gmail.com",
        subject: "A new task identification work is available"
      },

      "data": taskDescription,
      template: tpl
    }
}, {
  // No timeout
  heartbeatTimeout: "NONE",
  scheduleToCloseTimeout: "NONE",
  scheduleToStartTimeout: "NONE",
  startToCloseTimeout: "NONE"
});



/**
 * Step 2. Partition splittable tasks
 */

if( completed('taskIdentification') && !scheduled('split-tasks') ) {


  schedule({
      name: 'split-tasks',
      activity: 'humantask', // 'mturk_createHit',
      input: {
        title : "Split task",
        description : "Collect information about a task",
            
        "email-notification": {
          to: "eric.abouaf@gmail.com",
          subject: "A new task identification work is available"
        },

        "data": {
          taskDescription: taskDescription,
          'taskIdentification': results('taskIdentification')
        },

        template: tplSplit
      }
  }, {
    // No timeout
    heartbeatTimeout: "NONE",
    scheduleToCloseTimeout: "NONE",
    scheduleToStartTimeout: "NONE",
    startToCloseTimeout: "NONE"
  });


}






stop({
    after: 'split-tasks',
    result: "finished !"
});
